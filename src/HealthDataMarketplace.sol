// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IIPAssetRegistry} from "@storyprotocol/core/interfaces/registries/IIPAssetRegistry.sol";
import {ILicensingModule} from "@storyprotocol/core/interfaces/modules/licensing/ILicensingModule.sol";
import {IPILicenseTemplate} from "@storyprotocol/core/interfaces/modules/licensing/IPILicenseTemplate.sol";
import {IRegistrationWorkflows} from "@storyprotocol/periphery/contracts/interfaces/workflows/IRegistrationWorkflows.sol";
import {WorkflowStructs} from "@storyprotocol/periphery/contracts/lib/WorkflowStructs.sol";
import {ISPGNFT} from "@storyprotocol/periphery/contracts/interfaces/ISPGNFT.sol";
import {PILFlavors} from "@storyprotocol/core/lib/PILFlavors.sol";
import {RoyaltyDistributor} from "./RoyaltyDistributor.sol";

/**
 * @title HealthDataMarketplace
 * @dev Combined contract for health data IP registration and marketplace functionality
 */
contract HealthDataMarketplace is Ownable, ReentrancyGuard {
    // Custom Errors
    error CollectionAlreadyInitialized();
    error CollectionNotInitialized();
    error ListingNotFound();
    error ListingNotActive();
    error InsufficientPayment();
    error NotListingOwner();
    error InvalidPrice();
    error InvalidDataType();
    error ZeroAddress();

    // Structs
    struct Listing {
        uint256 listingId;
        address seller;
        address ipId;
        uint256 priceIP;
        string dataType;
        bool active;
        uint256 createdAt;
    }

    struct HealthDataMetadata {
        string ipMetadataURI;
        bytes32 ipMetadataHash;
        string nftMetadataURI;
        bytes32 nftMetadataHash;
        string dataType;
        string qualityMetrics;
    }

    // State Variables
    ISPGNFT public healthDataCollection;
    IRegistrationWorkflows public immutable registrationWorkflows;
    ILicensingModule public immutable licensingModule;
    IPILicenseTemplate public immutable pilTemplate;
    RoyaltyDistributor public immutable royaltyDistributor;
    address public immutable royaltyPolicyLAP;
    address public immutable currencyToken;

    bool public isCollectionInitialized;
    uint256 public platformFeePercent;
    uint256 public nextListingId = 1;
    uint256 public defaultLicenseTermsId;

    // Collection parameters
    string public constant COLLECTION_NAME = "Aurient Health Data";
    string public constant COLLECTION_SYMBOL = "AURIENT";
    uint32 public constant MAX_SUPPLY = 10000;

    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public userListings;
    mapping(string => uint256[]) public listingsByDataType;
    mapping(address => HealthDataMetadata) public healthDataMetadata;
    mapping(address => uint256) public ipToLicenseTermsId; // New mapping to track license terms for each IP

    // Events
    event CollectionInitialized(address indexed collectionAddress);
    event HealthDataRegistered(
        address indexed owner,
        address indexed ipId,
        uint256 indexed tokenId,
        string dataType,
        uint256 priceIP
    );
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address indexed ipId,
        uint256 priceIP,
        string dataType
    );
    event LicensePurchased(
        address indexed buyer,
        address indexed ipId,
        uint256 indexed listingId,
        uint256 amount
    );
    event ListingRemoved(uint256 indexed listingId, address indexed seller);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    /**
     * @dev Constructor
     * @param _registrationWorkflows Story Protocol registration workflows contract
     * @param _licensingModule Story Protocol licensing module contract
     * @param _pilTemplate Story Protocol PIL template contract
     * @param _royaltyDistributor Royalty distributor contract for payments
     * @param _royaltyPolicyLAP Story Protocol royalty policy LAP contract
     * @param _currencyToken Currency token for royalty payments (use address(0) for native $IP)
     * @param _platformFeePercent Platform fee percentage (e.g., 5 for 5%)
     */
    constructor(
        address _registrationWorkflows,
        address _licensingModule,
        address _pilTemplate,
        address _royaltyDistributor,
        address _royaltyPolicyLAP,
        address _currencyToken,
        uint256 _platformFeePercent
    ) Ownable(msg.sender) {
        if (_registrationWorkflows == address(0)) revert ZeroAddress();
        if (_licensingModule == address(0)) revert ZeroAddress();
        if (_pilTemplate == address(0)) revert ZeroAddress();
        if (_royaltyDistributor == address(0)) revert ZeroAddress();
        if (_royaltyPolicyLAP == address(0)) revert ZeroAddress();

        registrationWorkflows = IRegistrationWorkflows(_registrationWorkflows);
        licensingModule = ILicensingModule(_licensingModule);
        pilTemplate = IPILicenseTemplate(_pilTemplate);
        royaltyDistributor = RoyaltyDistributor(payable(_royaltyDistributor));
        royaltyPolicyLAP = _royaltyPolicyLAP;
        currencyToken = _currencyToken;
        platformFeePercent = _platformFeePercent;
    }

    /**
     * @dev Initialize the health data collection (must be called by owner after deployment)
     */
    function initializeHealthDataCollection() external onlyOwner {
        if (isCollectionInitialized) revert CollectionAlreadyInitialized();

        healthDataCollection = ISPGNFT(
            registrationWorkflows.createCollection(
                ISPGNFT.InitParams({
                    name: COLLECTION_NAME,
                    symbol: COLLECTION_SYMBOL,
                    baseURI: "",
                    contractURI: "",
                    maxSupply: MAX_SUPPLY,
                    mintFee: 0,
                    mintFeeToken: address(0),
                    mintFeeRecipient: address(this),
                    owner: address(this),
                    mintOpen: true,
                    isPublicMinting: false
                })
            )
        );

        isCollectionInitialized = true;
        emit CollectionInitialized(address(healthDataCollection));
    }

    /**
     * @dev Register health data as IP and create marketplace listing
     * @param dataType Type of health data (e.g., "sleep", "hrv", "activity")
     * @param ipfsHash IPFS hash containing the health data
     * @param priceIP Price in native $IP for licensing
     * @param qualityMetrics Quality metrics for the data
     * @return ipId The IP asset ID
     * @return tokenId The NFT token ID
     */
    function registerHealthDataIP(
        string memory dataType,
        string memory ipfsHash,
        uint256 priceIP,
        string memory qualityMetrics
    ) external returns (address ipId, uint256 tokenId) {
        ensureCollectionSetup();

        if (bytes(dataType).length == 0) revert InvalidDataType();
        if (priceIP == 0) revert InvalidPrice();

        // Build metadata for both NFT and IP
        WorkflowStructs.IPMetadata memory metadata = buildHealthDataMetadata(
            dataType,
            ipfsHash,
            qualityMetrics
        );

        // Single call: mint NFT + register as IP
        (ipId, tokenId) = registrationWorkflows.mintAndRegisterIp(
            address(healthDataCollection),
            msg.sender,
            metadata,
            true
        );

        // Register license terms for this IP
        uint256 licenseTermsId = pilTemplate.registerLicenseTerms(
            PILFlavors.commercialUse({
                mintingFee: 0,
                royaltyPolicy: royaltyPolicyLAP,
                currencyToken: currencyToken
            })
        );

        // Attach license terms to the IP
        licensingModule.attachLicenseTerms(
            ipId,
            address(pilTemplate),
            licenseTermsId
        );

        // Store the license terms ID for this IP
        ipToLicenseTermsId[ipId] = licenseTermsId;

        // Store metadata for future reference
        healthDataMetadata[ipId] = HealthDataMetadata({
            ipMetadataURI: metadata.ipMetadataURI,
            ipMetadataHash: metadata.ipMetadataHash,
            nftMetadataURI: metadata.nftMetadataURI,
            nftMetadataHash: metadata.nftMetadataHash,
            dataType: dataType,
            qualityMetrics: qualityMetrics
        });

        // Immediately create marketplace listing
        _createListing(ipId, priceIP, dataType, msg.sender);

        emit HealthDataRegistered(msg.sender, ipId, tokenId, dataType, priceIP);

        return (ipId, tokenId);
    }

    /**
     * @dev Purchase a license for health data
     * @param listingId The listing ID to purchase
     */
    function purchaseLicense(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        if (listing.listingId == 0) revert ListingNotFound();
        if (!listing.active) revert ListingNotActive();
        if (msg.value < listing.priceIP) revert InsufficientPayment();

        // Get the license terms ID for this IP
        uint256 licenseTermsId = ipToLicenseTermsId[listing.ipId];
        require(licenseTermsId != 0, "License terms not found for this IP");

        // Mint license token through Story Protocol
        licensingModule.mintLicenseTokens({
            licensorIpId: listing.ipId,
            licenseTemplate: address(pilTemplate),
            licenseTermsId: licenseTermsId,
            amount: 1,
            receiver: msg.sender,
            royaltyContext: "", // for PIL, royaltyContext is empty string
            maxMintingFee: 0,
            maxRevenueShare: 0
        });

        // Distribute payment to data owner through royalty distributor
        royaltyDistributor.distributePayment{value: msg.value}(listing.seller);

        // Mark listing as purchased (could allow multiple purchases in the future)
        listing.active = false;

        emit LicensePurchased(msg.sender, listing.ipId, listingId, msg.value);
    }

    /**
     * @dev Remove a listing from the marketplace
     * @param listingId The listing ID to remove
     */
    function removeListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        if (listing.listingId == 0) revert ListingNotFound();
        if (listing.seller != msg.sender) revert NotListingOwner();

        listing.active = false;
        emit ListingRemoved(listingId, msg.sender);
    }

    /**
     * @dev Get all active listings
     * @return Array of active listings
     */
    function getActiveListings() external view returns (Listing[] memory) {
        uint256 activeCount = 0;

        // Count active listings
        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }

        // Create array of active listings
        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].active) {
                activeListings[currentIndex] = listings[i];
                currentIndex++;
            }
        }

        return activeListings;
    }

    /**
     * @dev Get listings by data type
     * @param dataType The data type to filter by
     * @return Array of listings with the specified data type
     */
    function getListingsByDataType(
        string memory dataType
    ) external view returns (Listing[] memory) {
        uint256[] memory listingIds = listingsByDataType[dataType];
        uint256 activeCount = 0;

        // Count active listings for this data type
        for (uint256 i = 0; i < listingIds.length; i++) {
            if (listings[listingIds[i]].active) {
                activeCount++;
            }
        }

        // Create array of active listings
        Listing[] memory filteredListings = new Listing[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < listingIds.length; i++) {
            if (listings[listingIds[i]].active) {
                filteredListings[currentIndex] = listings[listingIds[i]];
                currentIndex++;
            }
        }

        return filteredListings;
    }

    /**
     * @dev Get user's listings
     * @param user The user address
     * @return Array of user's listings
     */
    function getUserListings(
        address user
    ) external view returns (Listing[] memory) {
        uint256[] memory listingIds = userListings[user];
        Listing[] memory userListingsArray = new Listing[](listingIds.length);

        for (uint256 i = 0; i < listingIds.length; i++) {
            userListingsArray[i] = listings[listingIds[i]];
        }

        return userListingsArray;
    }

    /**
     * @dev Set platform fee percentage (only owner)
     * @param feePercent New fee percentage
     */
    function setPlatformFee(uint256 feePercent) external onlyOwner {
        uint256 oldFee = platformFeePercent;
        platformFeePercent = feePercent;
        emit PlatformFeeUpdated(oldFee, feePercent);
    }

    /**
     * @dev Get license terms ID for a specific IP
     * @param ipId The IP asset ID
     * @return License terms ID
     */
    function getLicenseTermsId(address ipId) external view returns (uint256) {
        return ipToLicenseTermsId[ipId];
    }

    /**
     * @dev Check if collection is set up
     * @return True if collection is initialized
     */
    function isCollectionSetup() external view returns (bool) {
        return isCollectionInitialized;
    }

    // Internal Functions

    /**
     * @dev Ensure collection is set up
     */
    function ensureCollectionSetup() internal view {
        if (!isCollectionInitialized) revert CollectionNotInitialized();
    }

    /**
     * @dev Create a marketplace listing
     * @param ipId The IP asset ID
     * @param priceIP Price in native $IP
     * @param dataType Type of health data
     * @param seller The seller address
     */
    function _createListing(
        address ipId,
        uint256 priceIP,
        string memory dataType,
        address seller
    ) internal {
        uint256 listingId = nextListingId++;

        listings[listingId] = Listing({
            listingId: listingId,
            seller: seller,
            ipId: ipId,
            priceIP: priceIP,
            dataType: dataType,
            active: true,
            createdAt: block.timestamp
        });

        userListings[seller].push(listingId);
        listingsByDataType[dataType].push(listingId);

        emit ListingCreated(listingId, seller, ipId, priceIP, dataType);
    }

    /**
     * @dev Build metadata for health data IP
     * @param dataType Type of health data
     * @param ipfsHash IPFS hash
     * @param qualityMetrics Quality metrics
     * @return IPMetadata struct
     */
    function buildHealthDataMetadata(
        string memory dataType,
        string memory ipfsHash,
        string memory qualityMetrics
    ) internal view returns (WorkflowStructs.IPMetadata memory) {
        string memory ipMetadataURI = string(
            abi.encodePacked("ipfs://", ipfsHash, "/ip-metadata.json")
        );
        string memory nftMetadataURI = string(
            abi.encodePacked("ipfs://", ipfsHash, "/nft-metadata.json")
        );

        return
            WorkflowStructs.IPMetadata({
                ipMetadataURI: ipMetadataURI,
                ipMetadataHash: keccak256(
                    abi.encodePacked(dataType, qualityMetrics)
                ),
                nftMetadataURI: nftMetadataURI,
                nftMetadataHash: keccak256(
                    abi.encodePacked(dataType, block.timestamp)
                )
            });
    }
}
