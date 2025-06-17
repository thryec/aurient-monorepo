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
    address mockRoyaltyPolicyLAP;
    address mockCurrencyToken;
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
    uint256 mockLicenseTermsId = 123;

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
        mockRoyaltyPolicyLAP = makeAddr("RoyaltyPolicyLAP");
        mockCurrencyToken = makeAddr("CurrencyToken"); // Use address(0) for native $IP
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

        // Deploy HealthDataMarketplace with new constructor parameters
        marketplace = new HealthDataMarketplace(
            mockRegistrationWorkflows,
            mockLicensingModule,
            mockPILTemplate,
            address(royaltyDistributor),
            mockRoyaltyPolicyLAP,
            address(0), // Use native $IP
            platformFeePercent
        );
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
        assertEq(marketplace.royaltyPolicyLAP(), mockRoyaltyPolicyLAP);
        assertEq(marketplace.currencyToken(), address(0)); // Native $IP
        assertEq(marketplace.platformFeePercent(), platformFeePercent);
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
            mockRoyaltyPolicyLAP,
            address(0),
            platformFeePercent
        );

        vm.expectRevert(HealthDataMarketplace.ZeroAddress.selector);
        new HealthDataMarketplace(
            mockRegistrationWorkflows,
            address(0), // zero licensing module
            mockPILTemplate,
            address(royaltyDistributor),
            mockRoyaltyPolicyLAP,
            address(0),
            platformFeePercent
        );

        vm.expectRevert(HealthDataMarketplace.ZeroAddress.selector);
        new HealthDataMarketplace(
            mockRegistrationWorkflows,
            mockLicensingModule,
            address(0), // zero PIL template
            address(royaltyDistributor),
            mockRoyaltyPolicyLAP,
            address(0),
            platformFeePercent
        );

        vm.expectRevert(HealthDataMarketplace.ZeroAddress.selector);
        new HealthDataMarketplace(
            mockRegistrationWorkflows,
            mockLicensingModule,
            mockPILTemplate,
            address(0), // zero royalty distributor
            mockRoyaltyPolicyLAP,
            address(0),
            platformFeePercent
        );

        vm.expectRevert(HealthDataMarketplace.ZeroAddress.selector);
        new HealthDataMarketplace(
            mockRegistrationWorkflows,
            mockLicensingModule,
            mockPILTemplate,
            address(royaltyDistributor),
            address(0), // zero royalty policy LAP
            address(0),
            platformFeePercent
        );
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

        // Mock license terms registration
        vm.mockCall(
            mockPILTemplate,
            abi.encodeWithSelector(
                IPILicenseTemplate.registerLicenseTerms.selector
            ),
            abi.encode(mockLicenseTermsId)
        );

        // Mock license terms attachment
        vm.mockCall(
            mockLicensingModule,
            abi.encodeWithSelector(
                ILicensingModule.attachLicenseTerms.selector
            ),
            abi.encode()
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

        // Verify license terms mapping
        assertEq(
            marketplace.getLicenseTermsId(registeredIpId),
            mockLicenseTermsId
        );

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
     * @dev Test purchase license with new license terms lookup
     */
    function testPurchaseLicenseWithLicenseTermsLookup() public {
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
     * @dev Test get license terms ID for non-existent IP
     */
    function testGetLicenseTermsIdForNonExistentIP() public {
        address nonExistentIP = makeAddr("nonExistentIP");
        assertEq(marketplace.getLicenseTermsId(nonExistentIP), 0);
    }
}
