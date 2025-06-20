// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IIPAssetRegistry} from "@storyprotocol/core/interfaces/registries/IIPAssetRegistry.sol";
import {ILicensingModule} from "@storyprotocol/core/interfaces/modules/licensing/ILicensingModule.sol";
import {IPILicenseTemplate} from "@storyprotocol/core/interfaces/modules/licensing/IPILicenseTemplate.sol";
import {IRegistrationWorkflows} from "@storyprotocol/periphery/contracts/interfaces/workflows/IRegistrationWorkflows.sol";
import {WorkflowStructs} from "@storyprotocol/periphery/contracts/lib/WorkflowStructs.sol";
import {ISPGNFT} from "@storyprotocol/periphery/contracts/interfaces/ISPGNFT.sol";
import {PILFlavors} from "@storyprotocol/core/lib/PILFlavors.sol";
import {IRoyaltyModule} from "@storyprotocol/core/interfaces/modules/royalty/IRoyaltyModule.sol";
import {IIpRoyaltyVault} from "@storyprotocol/core/interfaces/modules/royalty/policies/IIpRoyaltyVault.sol";
import {IIPAccount} from "@storyprotocol/core/interfaces/IIPAccount.sol";
import {LicenseToken} from "@storyprotocol/core/LicenseToken.sol";
import {RoyaltyWorkflows} from "@storyprotocol/periphery/contracts/workflows/RoyaltyWorkflows.sol";
import {console} from "forge-std/console.sol";

/**
 * @title IWIP
 * @dev Interface for Wrapped IP token
 */
interface IWIP is IERC20 {
    function deposit() external payable;
    function withdraw(uint256 value) external;
}

/**
 * @title HealthDataMarketplace
 * @dev Health data IP registration and marketplace with WIP auto-wrapping
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
    error NoEarningsToClaim();
    error NotIPOwner();

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
    IRoyaltyModule public immutable royaltyModule;
    address public immutable royaltyPolicyLAP;
    IWIP public immutable WIP_TOKEN;
    RoyaltyWorkflows public immutable royaltyWorkflows;

    bool public isCollectionInitialized;
    uint256 public platformFeePercent;
    uint256 public nextListingId = 1;

    // Collection parameters
    string public constant COLLECTION_NAME = "Aurient Health Data";
    string public constant COLLECTION_SYMBOL = "AURIENT";
    uint32 public constant MAX_SUPPLY = 10000;

    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public userListings;
    mapping(string => uint256[]) public listingsByDataType;
    mapping(address => HealthDataMetadata) public healthDataMetadata;
    mapping(address => uint256) public ipToLicenseTermsId;
    mapping(address => uint256) public ipToLicenseTokenId;

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
    event EarningsClaimed(
        address indexed ipId,
        address indexed owner,
        uint256 amount
    );
    event PlatformFeesWithdrawn(
        address indexed owner,
        uint256 amount,
        bool asNative
    );

    /**
     * @dev Constructor
     * @param _registrationWorkflows Story Protocol registration workflows contract
     * @param _licensingModule Story Protocol licensing module contract
     * @param _pilTemplate Story Protocol PIL template contract
     * @param _royaltyModule Story Protocol royalty module contract
     * @param _royaltyPolicyLAP Story Protocol royalty policy LAP contract
     * @param _wipToken WIP token address on Aeneid (0x1514000000000000000000000000000000000000)
     * @param _platformFeePercent Platform fee percentage (e.g., 5 for 5%)
     */
    constructor(
        address _registrationWorkflows,
        address _licensingModule,
        address _pilTemplate,
        address _royaltyModule,
        address _royaltyPolicyLAP,
        address _wipToken,
        uint256 _platformFeePercent
    ) Ownable(msg.sender) {
        if (_registrationWorkflows == address(0)) revert ZeroAddress();
        if (_licensingModule == address(0)) revert ZeroAddress();
        if (_pilTemplate == address(0)) revert ZeroAddress();
        if (_royaltyModule == address(0)) revert ZeroAddress();
        if (_royaltyPolicyLAP == address(0)) revert ZeroAddress();
        if (_wipToken == address(0)) revert ZeroAddress();

        registrationWorkflows = IRegistrationWorkflows(_registrationWorkflows);
        licensingModule = ILicensingModule(_licensingModule);
        pilTemplate = IPILicenseTemplate(_pilTemplate);
        royaltyModule = IRoyaltyModule(_royaltyModule);
        royaltyPolicyLAP = _royaltyPolicyLAP;
        WIP_TOKEN = IWIP(_wipToken);
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
     * @param priceIP Price in $IP tokens for licensing
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

        // mint NFT + register as IP
        (ipId, tokenId) = registrationWorkflows.mintAndRegisterIp(
            address(healthDataCollection),
            msg.sender,
            metadata,
            true // makeIPDerivative
        );

        // Register license terms with user-set price as minting fee
        uint256 licenseTermsId = pilTemplate.registerLicenseTerms(
            PILFlavors.commercialUse({
                mintingFee: 0,
                royaltyPolicy: royaltyPolicyLAP,
                currencyToken: address(WIP_TOKEN)
            })
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

        // Create marketplace listing
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

        uint256 totalAmount = listing.priceIP;
        if (msg.value < totalAmount) revert InsufficientPayment();

        // Auto-wrap native $IP to WIP
        WIP_TOKEN.deposit{value: totalAmount}();

        // Get license terms ID
        uint256 licenseTermsId = ipToLicenseTermsId[listing.ipId];
        require(licenseTermsId != 0, "License terms not found for this IP");

        // Approve Story Protocol to spend WIP for the royalty payment
        WIP_TOKEN.approve(address(royaltyModule), totalAmount);

        // Mint license token through Story Protocol and transfer to buyer
        uint256 licenseTokenId = licensingModule.mintLicenseTokens({
            licensorIpId: listing.ipId,
            licenseTemplate: address(pilTemplate),
            licenseTermsId: licenseTermsId,
            amount: 1,
            receiver: msg.sender, // Mint directly to buyer
            royaltyContext: "",
            maxMintingFee: 0,
            maxRevenueShare: 0
        });

        // Store the license token ID for this IP (for future reference)
        ipToLicenseTokenId[listing.ipId] = licenseTokenId;

        console.log("total amount:", totalAmount);

        // Pay royalties to the IP owner (after vault is created by mintLicenseTokens)
        royaltyModule.payRoyaltyOnBehalf({
            receiverIpId: listing.ipId,
            payerIpId: address(0),
            token: address(WIP_TOKEN),
            amount: totalAmount
        });

        // Refund excess native $IP
        if (msg.value > totalAmount) {
            payable(msg.sender).transfer(msg.value - totalAmount);
        }

        // Mark listing as purchased
        listing.active = false;

        emit LicensePurchased(msg.sender, listing.ipId, listingId, totalAmount);
    }

    /**
     * @dev Claim earnings for an IP owner
     * @param ipId The IP asset ID
     */
    function claimEarnings(address ipId) external nonReentrant {
        // Verify caller is IP owner
        address owner = IIPAccount(payable(ipId)).owner();
        if (msg.sender != owner) revert NotIPOwner();

        // Get royalty vault
        address vault = royaltyModule.ipRoyaltyVaults(ipId);
        require(vault != address(0), "No vault deployed");

        // Claim WIP tokens directly from vault
        uint256 amount = IIpRoyaltyVault(vault).claimRevenueOnBehalf(
            owner,
            address(WIP_TOKEN)
        );
        if (amount == 0) revert NoEarningsToClaim();

        emit EarningsClaimed(ipId, owner, amount);
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
     * @dev Withdraw platform fees (only owner)
     * @param asNative Whether to unwrap WIP to native $IP
     */
    function withdrawPlatformFees(
        bool asNative
    ) external onlyOwner nonReentrant {
        uint256 balance = WIP_TOKEN.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");

        if (asNative) {
            // Unwrap WIP to native $IP
            WIP_TOKEN.withdraw(balance);
            payable(owner()).transfer(balance);
        } else {
            // Transfer WIP tokens directly
            WIP_TOKEN.transfer(owner(), balance);
        }

        emit PlatformFeesWithdrawn(owner(), balance, asNative);
    }

    /**
     * @dev Get all active listings
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
     */
    function setPlatformFee(uint256 feePercent) external onlyOwner {
        uint256 oldFee = platformFeePercent;
        platformFeePercent = feePercent;
        emit PlatformFeeUpdated(oldFee, feePercent);
    }

    /**
     * @dev Get license terms ID for a specific IP
     */
    function getLicenseTermsId(address ipId) external view returns (uint256) {
        return ipToLicenseTermsId[ipId];
    }

    /**
     * @dev Get license token ID for a specific IP
     */
    function getLicenseTokenId(address ipId) external view returns (uint256) {
        return ipToLicenseTokenId[ipId];
    }

    /**
     * @dev Get the license price for a specific IP
     */
    function getLicensePrice(address ipId) external view returns (uint256) {
        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].ipId == ipId && listings[i].active) {
                return listings[i].priceIP;
            }
        }
        return 0;
    }

    /**
     * @dev Check if collection is set up
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

    /**
     * @dev Emergency withdrawal function (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 wipBalance = WIP_TOKEN.balanceOf(address(this));
        if (wipBalance > 0) {
            WIP_TOKEN.transfer(owner(), wipBalance);
        }

        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            payable(owner()).transfer(ethBalance);
        }
    }

    /**
     * @dev Receive function to accept native $IP payments
     */
    receive() external payable {
        // Contract can receive native $IP for WIP wrapping
    }
}
