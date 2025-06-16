// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {HealthDataMarketplace} from "../src/HealthDataMarketplace.sol";
import {RoyaltyDistributor} from "../src/RoyaltyDistributor.sol";
import {IIPAssetRegistry} from "@storyprotocol/core/interfaces/registries/IIPAssetRegistry.sol";
import {ILicensingModule} from "@storyprotocol/core/interfaces/modules/licensing/ILicensingModule.sol";
import {IPILicenseTemplate} from "@storyprotocol/core/interfaces/modules/licensing/IPILicenseTemplate.sol";
import {IRegistrationWorkflows} from "@storyprotocol/periphery/contracts/interfaces/workflows/IRegistrationWorkflows.sol";
import {WorkflowStructs} from "@storyprotocol/periphery/contracts/lib/WorkflowStructs.sol";
import {ISPGNFT} from "@storyprotocol/periphery/contracts/interfaces/ISPGNFT.sol";

/**
 * @title BaseState
 * @dev Base test setup for HealthDataMarketplace contract with infrastructure setup
 */
abstract contract BaseState is Test {
    // Mock addresses
    address mockRegistrationWorkflows;
    address mockLicensingModule;
    address mockPILTemplate;
    address mockNFTCollectionAddress;
    address platformAddress;

    // Test addresses
    address owner;
    address user1;
    address user2;
    address aiCompany1;
    address aiCompany2;

    // Contract instances
    HealthDataMarketplace marketplace;
    RoyaltyDistributor royaltyDistributor;

    // Test parameters
    uint256 platformFeePercent = 5; // 5%
    uint256 defaultLicenseTermsId = 1;

    // Mock IPs
    address mockIPId1;
    address mockIPId2;
    uint256 mockTokenId1 = 1;
    uint256 mockTokenId2 = 2;

    // Test data
    string dataType1 = "sleep";
    string dataType2 = "hrv";
    string ipfsHash1 = "QmTest1Hash";
    string ipfsHash2 = "QmTest2Hash";
    string qualityMetrics1 = "high-quality-7days";
    string qualityMetrics2 = "medium-quality-30days";
    uint256 priceIP1 = 1 ether;
    uint256 priceIP2 = 2 ether;

    /**
     * @dev Set up mock contracts and test environment
     */
    function setUp() public virtual {
        // Set up addresses
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        aiCompany1 = makeAddr("aiCompany1");
        aiCompany2 = makeAddr("aiCompany2");
        platformAddress = makeAddr("platform");
        mockIPId1 = makeAddr("IPId1");
        mockIPId2 = makeAddr("IPId2");

        // Create mock contract addresses
        mockRegistrationWorkflows = makeAddr("RegistrationWorkflows");
        mockLicensingModule = makeAddr("LicensingModule");
        mockPILTemplate = makeAddr("PILTemplate");
        mockNFTCollectionAddress = makeAddr("NFTCollection");

        // Give test users some ETH
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(aiCompany1, 100 ether);
        vm.deal(aiCompany2, 100 ether);

        // Deploy RoyaltyDistributor
        royaltyDistributor = new RoyaltyDistributor(
            platformAddress,
            platformFeePercent
        );

        // Deploy HealthDataMarketplace
        marketplace = new HealthDataMarketplace(
            mockRegistrationWorkflows,
            mockLicensingModule,
            mockPILTemplate,
            address(royaltyDistributor),
            platformFeePercent
        );

        // Set default license terms
        marketplace.setDefaultLicenseTerms(defaultLicenseTermsId);
    }
}

/**
 * @title BaseStateTest
 * @dev Tests for initial HealthDataMarketplace state before any collection setup
 */
contract BaseStateTest is BaseState {
    /**
     * @dev Test that initialization worked correctly
     */
    function testInitialize() public view {
        assertEq(marketplace.owner(), owner);
        assertEq(
            address(marketplace.registrationWorkflows()),
            mockRegistrationWorkflows
        );
        assertEq(address(marketplace.licensingModule()), mockLicensingModule);
        assertEq(address(marketplace.pilTemplate()), mockPILTemplate);
        assertEq(
            address(marketplace.royaltyDistributor()),
            address(royaltyDistributor)
        );
        assertEq(marketplace.platformFeePercent(), platformFeePercent);
        assertEq(marketplace.defaultLicenseTermsId(), defaultLicenseTermsId);
        assertFalse(marketplace.isCollectionSetup());
        assertEq(marketplace.nextListingId(), 1);
    }

    /**
     * @dev Test constructor reverts with zero address
     */
    function testConstructorRevertZeroAddress() public {
        vm.expectRevert(HealthDataMarketplace.ZeroAddress.selector);
        new HealthDataMarketplace(
            address(0), // zero registration workflows
            mockLicensingModule,
            mockPILTemplate,
            address(royaltyDistributor),
            platformFeePercent
        );

        vm.expectRevert(HealthDataMarketplace.ZeroAddress.selector);
        new HealthDataMarketplace(
            mockRegistrationWorkflows,
            address(0), // zero licensing module
            mockPILTemplate,
            address(royaltyDistributor),
            platformFeePercent
        );

        vm.expectRevert(HealthDataMarketplace.ZeroAddress.selector);
        new HealthDataMarketplace(
            mockRegistrationWorkflows,
            mockLicensingModule,
            address(0), // zero PIL template
            address(royaltyDistributor),
            platformFeePercent
        );

        vm.expectRevert(HealthDataMarketplace.ZeroAddress.selector);
        new HealthDataMarketplace(
            mockRegistrationWorkflows,
            mockLicensingModule,
            mockPILTemplate,
            address(0), // zero royalty distributor
            platformFeePercent
        );
    }

    /**
     * @dev Test that only owner can initialize collection
     */
    function testOnlyOwnerCanInitializeCollection() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                user1
            )
        );
        marketplace.initializeHealthDataCollection();
    }

    /**
     * @dev Test cannot register health data before collection setup
     */
    function testCannotRegisterHealthDataBeforeSetup() public {
        vm.prank(user1);
        vm.expectRevert(
            HealthDataMarketplace.CollectionNotInitialized.selector
        );
        marketplace.registerHealthDataIP(
            dataType1,
            ipfsHash1,
            priceIP1,
            qualityMetrics1
        );
    }

    /**
     * @dev Test only owner can set platform fee
     */
    function testOnlyOwnerCanSetPlatformFee() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                user1
            )
        );
        marketplace.setPlatformFee(10);
    }

    /**
     * @dev Test only owner can set default license terms
     */
    function testOnlyOwnerCanSetDefaultLicenseTerms() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                user1
            )
        );
        marketplace.setDefaultLicenseTerms(2);
    }

    /**
     * @dev Test get active listings returns empty array initially
     */
    function testGetActiveListingsInitiallyEmpty() public view {
        HealthDataMarketplace.Listing[] memory listings = marketplace
            .getActiveListings();
        assertEq(listings.length, 0);
    }
}

/**
 * @title CollectionSetupState
 * @dev State with NFT collection created
 */
abstract contract CollectionSetupState is BaseState {
    function setUp() public virtual override {
        super.setUp();

        // Mock collection creation
        vm.mockCall(
            mockRegistrationWorkflows,
            abi.encodeWithSelector(
                IRegistrationWorkflows.createCollection.selector
            ),
            abi.encode(mockNFTCollectionAddress)
        );

        // Initialize collection
        marketplace.initializeHealthDataCollection();
    }
}

/**
 * @title CollectionSetupStateTest
 * @dev Tests specific to the collection setup state
 */
contract CollectionSetupStateTest is CollectionSetupState {
    /**
     * @dev Test collection is properly set up
     */
    function testCollectionIsSetupCorrectly() public view {
        assertTrue(marketplace.isCollectionSetup());
        assertEq(
            address(marketplace.healthDataCollection()),
            mockNFTCollectionAddress
        );
    }

    /**
     * @dev Test cannot initialize collection twice
     */
    function testCannotInitializeCollectionTwice() public {
        vm.expectRevert(
            HealthDataMarketplace.CollectionAlreadyInitialized.selector
        );
        marketplace.initializeHealthDataCollection();
    }

    /**
     * @dev Test register health data with invalid parameters
     */
    function testRegisterHealthDataInvalidParameters() public {
        vm.startPrank(user1);

        // Test invalid data type
        vm.expectRevert(HealthDataMarketplace.InvalidDataType.selector);
        marketplace.registerHealthDataIP(
            "",
            ipfsHash1,
            priceIP1,
            qualityMetrics1
        );

        // Test invalid price
        vm.expectRevert(HealthDataMarketplace.InvalidPrice.selector);
        marketplace.registerHealthDataIP(
            dataType1,
            ipfsHash1,
            0,
            qualityMetrics1
        );

        vm.stopPrank();
    }

    /**
     * @dev Test set platform fee
     */
    function testSetPlatformFee() public {
        uint256 newFee = 10;

        vm.expectEmit(true, true, true, true);
        emit HealthDataMarketplace.PlatformFeeUpdated(
            platformFeePercent,
            newFee
        );

        marketplace.setPlatformFee(newFee);
        assertEq(marketplace.platformFeePercent(), newFee);
    }

    /**
     * @dev Test set default license terms
     */
    function testSetDefaultLicenseTerms() public {
        uint256 newTermsId = 5;
        marketplace.setDefaultLicenseTerms(newTermsId);
        assertEq(marketplace.defaultLicenseTermsId(), newTermsId);
    }
}

/**
 * @title SingleHealthDataRegisteredState
 * @dev State with a single health data IP registered
 */
abstract contract SingleHealthDataRegisteredState is CollectionSetupState {
    address registeredIpId;
    uint256 registeredTokenId;
    uint256 listingId;

    function setUp() public virtual override {
        super.setUp();

        // Mock IP registration
        vm.mockCall(
            mockRegistrationWorkflows,
            abi.encodeWithSelector(
                IRegistrationWorkflows.mintAndRegisterIp.selector
            ),
            abi.encode(mockIPId1, mockTokenId1)
        );

        // Register health data as user1
        vm.prank(user1);
        (registeredIpId, registeredTokenId) = marketplace.registerHealthDataIP(
            dataType1,
            ipfsHash1,
            priceIP1,
            qualityMetrics1
        );
        listingId = 1; // First listing ID
    }
}

/**
 * @title SingleHealthDataRegisteredStateTest
 * @dev Tests for state with a single health data IP registered
 */
contract SingleHealthDataRegisteredStateTest is
    SingleHealthDataRegisteredState
{
    /**
     * @dev Test health data registration was successful
     */
    function testHealthDataRegistrationSuccessful() public view {
        // Verify returned IP ID
        assertEq(registeredIpId, mockIPId1);

        // Verify listing was created
        (
            uint256 id,
            address seller,
            address ipId,
            uint256 price,
            string memory dataType,
            bool active,
            uint256 createdAt
        ) = marketplace.listings(listingId);
        assertEq(id, listingId);
        assertEq(seller, user1);
        assertEq(ipId, registeredIpId);
        assertEq(price, priceIP1);
        assertEq(dataType, dataType1);
        assertTrue(active);
        assertGt(createdAt, 0);

        // Verify metadata storage
        (
            string memory ipMetadataURI,
            bytes32 ipMetadataHash,
            string memory nftMetadataURI,
            bytes32 nftMetadataHash,
            string memory storedDataType,
            string memory storedQualityMetrics
        ) = marketplace.healthDataMetadata(registeredIpId);
        assertEq(storedDataType, dataType1);
        assertEq(storedQualityMetrics, qualityMetrics1);
        assertTrue(bytes(ipMetadataURI).length > 0);
        assertTrue(bytes(nftMetadataURI).length > 0);
    }

    /**
     * @dev Test get active listings
     */
    function testGetActiveListings() public view {
        HealthDataMarketplace.Listing[] memory listings = marketplace
            .getActiveListings();
        assertEq(listings.length, 1);
        assertEq(listings[0].listingId, listingId);
        assertEq(listings[0].seller, user1);
        assertEq(listings[0].ipId, registeredIpId);
    }

    /**
     * @dev Test get listings by data type
     */
    function testGetListingsByDataType() public view {
        HealthDataMarketplace.Listing[] memory listings = marketplace
            .getListingsByDataType(dataType1);
        assertEq(listings.length, 1);
        assertEq(listings[0].listingId, listingId);

        // Test non-existent data type
        HealthDataMarketplace.Listing[] memory emptyListings = marketplace
            .getListingsByDataType("nonexistent");
        assertEq(emptyListings.length, 0);
    }

    /**
     * @dev Test get user listings
     */
    function testGetUserListings() public view {
        HealthDataMarketplace.Listing[] memory listings = marketplace
            .getUserListings(user1);
        assertEq(listings.length, 1);
        assertEq(listings[0].listingId, listingId);

        // Test user with no listings
        HealthDataMarketplace.Listing[] memory emptyListings = marketplace
            .getUserListings(user2);
        assertEq(emptyListings.length, 1); // Array is initialized with default values
    }

    /**
     * @dev Test remove listing
     */
    function testRemoveListing() public {
        vm.expectEmit(true, true, true, true);
        emit HealthDataMarketplace.ListingRemoved(listingId, user1);

        vm.prank(user1);
        marketplace.removeListing(listingId);

        // Verify listing is deactivated
        (, , , , , bool active, ) = marketplace.listings(listingId);
        assertFalse(active);

        // Verify active listings is empty
        HealthDataMarketplace.Listing[] memory listings = marketplace
            .getActiveListings();
        assertEq(listings.length, 0);
    }

    /**
     * @dev Test only listing owner can remove listing
     */
    function testOnlyListingOwnerCanRemoveListing() public {
        vm.prank(user2);
        vm.expectRevert(HealthDataMarketplace.NotListingOwner.selector);
        marketplace.removeListing(listingId);
    }

    /**
     * @dev Test remove non-existent listing
     */
    function testRemoveNonExistentListing() public {
        vm.prank(user1);
        vm.expectRevert(HealthDataMarketplace.ListingNotFound.selector);
        marketplace.removeListing(999);
    }

    /**
     * @dev Test purchase license
     */
    function testPurchaseLicense() public {
        // Mock license minting
        vm.mockCall(
            mockLicensingModule,
            abi.encodeWithSelector(ILicensingModule.mintLicenseTokens.selector),
            abi.encode()
        );

        // Mock royalty distribution
        vm.mockCall(
            address(royaltyDistributor),
            abi.encodeWithSelector(
                RoyaltyDistributor.distributePayment.selector
            ),
            abi.encode()
        );

        vm.expectEmit(true, true, true, true);
        emit HealthDataMarketplace.LicensePurchased(
            aiCompany1,
            registeredIpId,
            listingId,
            priceIP1
        );

        vm.prank(aiCompany1);
        marketplace.purchaseLicense{value: priceIP1}(listingId);

        // Verify listing is deactivated after purchase
        (, , , , , bool active, ) = marketplace.listings(listingId);
        assertFalse(active);
    }

    /**
     * @dev Test purchase license with insufficient payment
     */
    function testPurchaseLicenseInsufficientPayment() public {
        vm.prank(aiCompany1);
        vm.expectRevert(HealthDataMarketplace.InsufficientPayment.selector);
        marketplace.purchaseLicense{value: priceIP1 - 1}(listingId);
    }

    /**
     * @dev Test purchase non-existent listing
     */
    function testPurchaseNonExistentListing() public {
        vm.prank(aiCompany1);
        vm.expectRevert(HealthDataMarketplace.ListingNotFound.selector);
        marketplace.purchaseLicense{value: priceIP1}(999);
    }
}

/**
 * @title MultiHealthDataRegisteredState
 * @dev State with multiple health data IPs registered
 */
abstract contract MultiHealthDataRegisteredState is
    SingleHealthDataRegisteredState
{
    address secondRegisteredIpId;
    uint256 secondRegisteredTokenId;
    uint256 secondListingId;

    function setUp() public virtual override {
        super.setUp();

        // Clear previous mock
        vm.clearMockedCalls();

        // Mock second IP registration
        vm.mockCall(
            mockRegistrationWorkflows,
            abi.encodeWithSelector(
                IRegistrationWorkflows.mintAndRegisterIp.selector
            ),
            abi.encode(mockIPId2, mockTokenId2)
        );

        // Register second health data as user2
        vm.prank(user2);
        (secondRegisteredIpId, secondRegisteredTokenId) = marketplace
            .registerHealthDataIP(
                dataType2,
                ipfsHash2,
                priceIP2,
                qualityMetrics2
            );
        secondListingId = 2; // Second listing ID
    }
}

/**
 * @title MultiHealthDataRegisteredStateTest
 * @dev Tests for state with multiple health data IPs registered
 */
contract MultiHealthDataRegisteredStateTest is MultiHealthDataRegisteredState {
    /**
     * @dev Test multiple health data registration was successful
     */
    function testMultipleHealthDataRegistration() public view {
        // Get all active listings
        HealthDataMarketplace.Listing[] memory listings = marketplace
            .getActiveListings();
        assertEq(listings.length, 2);
        assertEq(listings[0].listingId, listingId);
        assertEq(listings[1].listingId, secondListingId);

        // Verify second registration details
        (
            uint256 id,
            address seller,
            address ipId,
            uint256 price,
            string memory dataType,
            bool active,

        ) = marketplace.listings(secondListingId);
        assertEq(id, secondListingId);
        assertEq(seller, user2);
        assertEq(ipId, secondRegisteredIpId);
        assertEq(price, priceIP2);
        assertEq(dataType, dataType2);
        assertTrue(active);
    }

    /**
     * @dev Test get listings by data type with multiple types
     */
    function testGetListingsByDataTypeMultiple() public view {
        // Get listings for first data type
        HealthDataMarketplace.Listing[] memory sleepListings = marketplace
            .getListingsByDataType(dataType1);
        assertEq(sleepListings.length, 1);
        assertEq(sleepListings[0].listingId, listingId);

        // Get listings for second data type
        HealthDataMarketplace.Listing[] memory hrvListings = marketplace
            .getListingsByDataType(dataType2);
        assertEq(hrvListings.length, 1);
        assertEq(hrvListings[0].listingId, secondListingId);
    }

    /**
     * @dev Test get user listings for different users
     */
    function testGetUserListingsMultipleUsers() public view {
        // Get user1 listings
        HealthDataMarketplace.Listing[] memory user1Listings = marketplace
            .getUserListings(user1);
        assertEq(user1Listings.length, 1);
        assertEq(user1Listings[0].listingId, listingId);

        // Get user2 listings
        HealthDataMarketplace.Listing[] memory user2Listings = marketplace
            .getUserListings(user2);
        assertEq(user2Listings.length, 1);
        assertEq(user2Listings[0].listingId, secondListingId);
    }

    /**
     * @dev Test purchase multiple licenses
     */
    function testPurchaseMultipleLicenses() public {
        // Mock license minting and royalty distribution
        vm.mockCall(
            mockLicensingModule,
            abi.encodeWithSelector(ILicensingModule.mintLicenseTokens.selector),
            abi.encode()
        );
        vm.mockCall(
            address(royaltyDistributor),
            abi.encodeWithSelector(
                RoyaltyDistributor.distributePayment.selector
            ),
            abi.encode()
        );

        // Purchase first license
        vm.prank(aiCompany1);
        marketplace.purchaseLicense{value: priceIP1}(listingId);

        // Purchase second license
        vm.prank(aiCompany2);
        marketplace.purchaseLicense{value: priceIP2}(secondListingId);

        // Verify both listings are deactivated
        (, , , , , bool active1, ) = marketplace.listings(listingId);
        (, , , , , bool active2, ) = marketplace.listings(secondListingId);
        assertFalse(active1);
        assertFalse(active2);

        // Verify no active listings remain
        HealthDataMarketplace.Listing[] memory activeListings = marketplace
            .getActiveListings();
        assertEq(activeListings.length, 0);
    }
}

/**
 * @title PartiallyPurchasedState
 * @dev State with multiple registrations and one license purchased
 */
abstract contract PartiallyPurchasedState is MultiHealthDataRegisteredState {
    function setUp() public virtual override {
        super.setUp();

        // Mock license minting and royalty distribution
        vm.mockCall(
            mockLicensingModule,
            abi.encodeWithSelector(ILicensingModule.mintLicenseTokens.selector),
            abi.encode()
        );
        vm.mockCall(
            address(royaltyDistributor),
            abi.encodeWithSelector(
                RoyaltyDistributor.distributePayment.selector
            ),
            abi.encode()
        );

        // Purchase first license
        vm.prank(aiCompany1);
        marketplace.purchaseLicense{value: priceIP1}(listingId);
    }
}

/**
 * @title PartiallyPurchasedStateTest
 * @dev Tests for state with partially purchased licenses
 */
contract PartiallyPurchasedStateTest is PartiallyPurchasedState {
    /**
     * @dev Test purchase status after partial purchase
     */
    function testPartialPurchaseStatus() public view {
        // Check status of first listing (should be inactive)
        (, , , , , bool active1, ) = marketplace.listings(listingId);
        assertFalse(active1);

        // Check status of second listing (should be active)
        (, , , , , bool active2, ) = marketplace.listings(secondListingId);
        assertTrue(active2);

        // Verify only one active listing remains
        HealthDataMarketplace.Listing[] memory activeListings = marketplace
            .getActiveListings();
        assertEq(activeListings.length, 1);
        assertEq(activeListings[0].listingId, secondListingId);
    }

    /**
     * @dev Test cannot purchase already purchased license
     */
    function testCannotPurchaseAlreadyPurchasedLicense() public {
        vm.prank(aiCompany2);
        vm.expectRevert(HealthDataMarketplace.ListingNotActive.selector);
        marketplace.purchaseLicense{value: priceIP1}(listingId);
    }

    /**
     * @dev Test purchase remaining license
     */
    function testPurchaseRemainingLicense() public {
        // Mock license minting and royalty distribution
        vm.mockCall(
            mockLicensingModule,
            abi.encodeWithSelector(ILicensingModule.mintLicenseTokens.selector),
            abi.encode()
        );
        vm.mockCall(
            address(royaltyDistributor),
            abi.encodeWithSelector(
                RoyaltyDistributor.distributePayment.selector
            ),
            abi.encode()
        );

        // Purchase remaining license
        vm.prank(aiCompany2);
        marketplace.purchaseLicense{value: priceIP2}(secondListingId);

        // Verify no active listings remain
        HealthDataMarketplace.Listing[] memory activeListings = marketplace
            .getActiveListings();
        assertEq(activeListings.length, 0);
    }
}
