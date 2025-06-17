// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {HealthDataMarketplace} from "../src/HealthDataMarketplace.sol";
import {IIPAssetRegistry} from "@storyprotocol/core/interfaces/registries/IIPAssetRegistry.sol";
import {ILicensingModule} from "@storyprotocol/core/interfaces/modules/licensing/ILicensingModule.sol";
import {IPILicenseTemplate} from "@storyprotocol/core/interfaces/modules/licensing/IPILicenseTemplate.sol";
import {IRegistrationWorkflows} from "@storyprotocol/periphery/contracts/interfaces/workflows/IRegistrationWorkflows.sol";
import {WorkflowStructs} from "@storyprotocol/periphery/contracts/lib/WorkflowStructs.sol";
import {ISPGNFT} from "@storyprotocol/periphery/contracts/interfaces/ISPGNFT.sol";
import {IRoyaltyModule} from "@storyprotocol/core/interfaces/modules/royalty/IRoyaltyModule.sol";
import {MockERC20} from "@storyprotocol/test/mocks/token/MockERC20.sol";

/**
 * @title MockWIP
 * @dev Mock Wrapped IP contract for testing
 */
contract MockWIP is MockERC20 {
    event DepositIP(address indexed from, uint amount);
    event Withdrawal(address indexed to, uint amount);

    constructor() {
        name = "Wrapped IP";
        symbol = "WIP";
        decimals = 18;
    }

    function deposit() external payable {
        _mint(msg.sender, msg.value);
        emit DepositIP(msg.sender, msg.value);
    }

    function withdraw(uint256 value) external {
        _burn(msg.sender, value);
        (bool success, ) = msg.sender.call{value: value}("");
        require(success, "Transfer failed");
        emit Withdrawal(msg.sender, value);
    }

    receive() external payable {
        deposit();
    }
}

/**
 * @title BaseState
 * @dev Base test setup for HealthDataMarketplace contract with infrastructure setup
 */
abstract contract BaseState is Test {
    // Mock addresses
    address mockRegistrationWorkflows;
    address mockLicensingModule;
    address mockPILTemplate;
    address mockRoyaltyModule;
    address mockRoyaltyPolicyLAP;
    address mockNFTCollectionAddress;

    // Test addresses
    address owner;
    address user1;
    address user2;
    address aiCompany1;
    address aiCompany2;

    // Contract instances
    HealthDataMarketplace marketplace;
    MockERC20 testToken;
    MockWIP wipToken;

    // Test parameters
    uint256 platformFeePercent = 5; // 5%
    uint256 mockLicenseTermsId = 123;
    bool useWIP = false; // Default to ERC20 for most tests

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
        mockIPId1 = makeAddr("IPId1");
        mockIPId2 = makeAddr("IPId2");

        // Create mock contract addresses
        mockRegistrationWorkflows = makeAddr("RegistrationWorkflows");
        mockLicensingModule = makeAddr("LicensingModule");
        mockPILTemplate = makeAddr("PILTemplate");
        mockRoyaltyModule = makeAddr("RoyaltyModule");
        mockRoyaltyPolicyLAP = makeAddr("RoyaltyPolicyLAP");
        mockNFTCollectionAddress = makeAddr("NFTCollection");

        // Give test users some ETH
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(aiCompany1, 100 ether);
        vm.deal(aiCompany2, 100 ether);
        vm.deal(address(this), 100 ether);

        // Deploy test tokens
        testToken = new MockERC20();
        testToken.initialize("Test Token", "TEST", 18);

        wipToken = new MockWIP();
        vm.deal(address(wipToken), 1000 ether); // Give WIP contract some ETH for withdrawals

        // Determine which token to use
        address paymentToken = useWIP ? address(wipToken) : address(testToken);

        // Deploy HealthDataMarketplace
        marketplace = new HealthDataMarketplace(
            mockRegistrationWorkflows,
            mockLicensingModule,
            mockPILTemplate,
            mockRoyaltyModule,
            mockRoyaltyPolicyLAP,
            paymentToken,
            platformFeePercent
        );

        // Set up test tokens
        if (useWIP) {
            // For WIP tests, users need ETH to wrap
            // ETH already distributed above
        } else {
            // For ERC20 tests, mint tokens to users
            testToken.mint(user1, 1000 ether);
            testToken.mint(user2, 1000 ether);
            testToken.mint(aiCompany1, 1000 ether);
            testToken.mint(aiCompany2, 1000 ether);
        }
    }
}

/**
 * @title BaseStateTest
 * @dev Tests for initial HealthDataMarketplace state
 */
contract BaseStateTest is BaseState {
    function testInitialize() public view {
        assertEq(marketplace.owner(), owner);
        assertEq(
            address(marketplace.registrationWorkflows()),
            mockRegistrationWorkflows
        );
        assertEq(address(marketplace.licensingModule()), mockLicensingModule);
        assertEq(address(marketplace.pilTemplate()), mockPILTemplate);
        assertEq(address(marketplace.royaltyModule()), mockRoyaltyModule);
        assertEq(marketplace.royaltyPolicyLAP(), mockRoyaltyPolicyLAP);
        assertEq(marketplace.platformFeePercent(), platformFeePercent);
        assertEq(marketplace.commercialRevShare(), 10 * 10 ** 6);
        assertFalse(marketplace.isCollectionSetup());
        assertEq(marketplace.nextListingId(), 1);

        (address token, bool isWIP, string memory symbol) = marketplace
            .getPaymentTokenInfo();
        assertEq(token, address(testToken));
        assertFalse(isWIP);
        assertEq(symbol, "MERC20");
    }

    function testConstructorRevertZeroAddress() public {
        vm.expectRevert(HealthDataMarketplace.ZeroAddress.selector);
        new HealthDataMarketplace(
            address(0), // zero registration workflows
            mockLicensingModule,
            mockPILTemplate,
            mockRoyaltyModule,
            mockRoyaltyPolicyLAP,
            address(testToken),
            platformFeePercent
        );
    }

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

    function testGetActiveListingsInitiallyEmpty() public view {
        HealthDataMarketplace.Listing[] memory listings = marketplace
            .getActiveListings();
        assertEq(listings.length, 0);
    }
}

/**
 * @title WIPBaseState
 * @dev State configured to use WIP token
 */
abstract contract WIPBaseState is BaseState {
    function setUp() public virtual override {
        useWIP = true;
        super.setUp();
    }
}

/**
 * @title WIPBaseStateTest
 * @dev Tests specific to WIP token configuration
 */
contract WIPBaseStateTest is WIPBaseState {
    function testWIPConfiguration() public view {
        (address token, bool isWIP, string memory symbol) = marketplace
            .getPaymentTokenInfo();
        assertEq(token, address(wipToken));
        assertTrue(isWIP);
        assertEq(symbol, "WIP");
    }

    function testContractCanReceiveETH() public {
        uint256 initialBalance = address(marketplace).balance;
        (bool success, ) = address(marketplace).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(address(marketplace).balance, initialBalance + 1 ether);
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
    function testCollectionIsSetupCorrectly() public view {
        assertTrue(marketplace.isCollectionSetup());
        assertEq(
            address(marketplace.healthDataCollection()),
            mockNFTCollectionAddress
        );
    }

    function testCannotInitializeCollectionTwice() public {
        vm.expectRevert(
            HealthDataMarketplace.CollectionAlreadyInitialized.selector
        );
        marketplace.initializeHealthDataCollection();
    }

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

    function testSetCommercialRevShare() public {
        uint256 newRevShare = 15 * 10 ** 6; // 15%
        marketplace.setCommercialRevShare(newRevShare);
        assertEq(marketplace.commercialRevShare(), newRevShare);
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

    function testGetActiveListings() public view {
        HealthDataMarketplace.Listing[] memory listings = marketplace
            .getActiveListings();
        assertEq(listings.length, 1);
        assertEq(listings[0].listingId, listingId);
        assertEq(listings[0].seller, user1);
        assertEq(listings[0].ipId, registeredIpId);
    }

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

    function testGetUserListings() public view {
        HealthDataMarketplace.Listing[] memory listings = marketplace
            .getUserListings(user1);
        assertEq(listings.length, 1);
        assertEq(listings[0].listingId, listingId);

        // Test user with no listings
        HealthDataMarketplace.Listing[] memory emptyListings = marketplace
            .getUserListings(user2);
        assertEq(emptyListings.length, 0);
    }

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

    function testOnlyListingOwnerCanRemoveListing() public {
        vm.prank(user2);
        vm.expectRevert(HealthDataMarketplace.NotListingOwner.selector);
        marketplace.removeListing(listingId);
    }

    function testRemoveNonExistentListing() public {
        vm.prank(user1);
        vm.expectRevert(HealthDataMarketplace.ListingNotFound.selector);
        marketplace.removeListing(999);
    }

    function testPurchaseLicenseERC20() public {
        // Mock license minting
        vm.mockCall(
            mockLicensingModule,
            abi.encodeWithSelector(ILicensingModule.mintLicenseTokens.selector),
            abi.encode()
        );

        // User approves marketplace
        vm.prank(aiCompany1);
        testToken.approve(address(marketplace), priceIP1);

        vm.expectEmit(true, true, true, true);
        emit HealthDataMarketplace.LicensePurchased(
            aiCompany1,
            registeredIpId,
            listingId,
            priceIP1
        );

        vm.prank(aiCompany1);
        marketplace.purchaseLicense(listingId);

        // Verify listing is deactivated after purchase
        (, , , , , bool active, ) = marketplace.listings(listingId);
        assertFalse(active);

        // Verify platform fee was collected
        uint256 expectedPlatformFee = (priceIP1 * platformFeePercent) / 100;
        assertEq(
            testToken.balanceOf(address(marketplace)),
            expectedPlatformFee
        );
    }

    function testPurchaseLicenseInsufficientPayment() public {
        vm.prank(aiCompany1);
        vm.expectRevert(HealthDataMarketplace.InsufficientPayment.selector);
        marketplace.purchaseLicense{value: priceIP1 - 1}(listingId);
    }

    function testPurchaseNonExistentListing() public {
        vm.prank(aiCompany1);
        vm.expectRevert(HealthDataMarketplace.ListingNotFound.selector);
        marketplace.purchaseLicense{value: priceIP1}(999);
    }

    function testEthNotAllowedForERC20() public {
        vm.prank(aiCompany1);
        vm.expectRevert(HealthDataMarketplace.EthNotAllowedForERC20.selector);
        marketplace.purchaseLicense{value: priceIP1}(listingId);
    }
}

/**
 * @title WIPPurchaseTest
 * @dev Test WIP-specific purchase functionality
 */
contract WIPPurchaseTest is WIPBaseState {
    uint256 listingId;
    address registeredIpId;

    function setUp() public override {
        super.setUp();

        // Initialize collection
        vm.mockCall(
            mockRegistrationWorkflows,
            abi.encodeWithSelector(
                IRegistrationWorkflows.createCollection.selector
            ),
            abi.encode(mockNFTCollectionAddress)
        );
        marketplace.initializeHealthDataCollection();

        // Register IP
        vm.mockCall(
            mockRegistrationWorkflows,
            abi.encodeWithSelector(
                IRegistrationWorkflows.mintAndRegisterIp.selector
            ),
            abi.encode(mockIPId1, mockTokenId1)
        );
        vm.mockCall(
            mockPILTemplate,
            abi.encodeWithSelector(
                IPILicenseTemplate.registerLicenseTerms.selector
            ),
            abi.encode(mockLicenseTermsId)
        );
        vm.mockCall(
            mockLicensingModule,
            abi.encodeWithSelector(
                ILicensingModule.attachLicenseTerms.selector
            ),
            abi.encode()
        );

        vm.prank(user1);
        (registeredIpId, ) = marketplace.registerHealthDataIP(
            dataType1,
            ipfsHash1,
            priceIP1,
            qualityMetrics1
        );
        listingId = 1;
    }

    function testPurchaseLicenseWithWIP() public {
        // Mock license minting
        vm.mockCall(
            mockLicensingModule,
            abi.encodeWithSelector(ILicensingModule.mintLicenseTokens.selector),
            abi.encode()
        );

        uint256 initialBalance = aiCompany1.balance;
        uint256 overpayment = 0.1 ether;

        vm.expectEmit(true, true, true, true);
        emit HealthDataMarketplace.LicensePurchased(
            aiCompany1,
            registeredIpId,
            listingId,
            priceIP1
        );

        vm.prank(aiCompany1);
        marketplace.purchaseLicense{value: priceIP1 + overpayment}(listingId);

        // Verify refund was processed
        assertEq(aiCompany1.balance, initialBalance - priceIP1);

        // Verify WIP was minted to marketplace
        uint256 expectedPlatformFee = (priceIP1 * platformFeePercent) / 100;
        assertEq(wipToken.balanceOf(address(marketplace)), expectedPlatformFee);

        // Verify listing is deactivated
        (, , , , , bool active, ) = marketplace.listings(listingId);
        assertFalse(active);
    }

    function testWithdrawPlatformFeesAsWIP() public {
        // First make a purchase to generate fees
        vm.mockCall(
            mockLicensingModule,
            abi.encodeWithSelector(ILicensingModule.mintLicenseTokens.selector),
            abi.encode()
        );

        vm.prank(aiCompany1);
        marketplace.purchaseLicense{value: priceIP1}(listingId);

        uint256 expectedFee = (priceIP1 * platformFeePercent) / 100;
        uint256 initialBalance = wipToken.balanceOf(owner);

        vm.expectEmit(true, true, true, true);
        emit HealthDataMarketplace.PlatformFeesWithdrawn(
            owner,
            expectedFee,
            false
        );

        marketplace.withdrawPlatformFees(false);

        assertEq(wipToken.balanceOf(owner), initialBalance + expectedFee);
        assertEq(wipToken.balanceOf(address(marketplace)), 0);
    }

    function testWithdrawPlatformFeesAsNative() public {
        // First make a purchase to generate fees
        vm.mockCall(
            mockLicensingModule,
            abi.encodeWithSelector(ILicensingModule.mintLicenseTokens.selector),
            abi.encode()
        );

        vm.prank(aiCompany1);
        marketplace.purchaseLicense{value: priceIP1}(listingId);

        uint256 expectedFee = (priceIP1 * platformFeePercent) / 100;
        uint256 initialBalance = owner.balance;

        vm.expectEmit(true, true, true, true);
        emit HealthDataMarketplace.PlatformFeesWithdrawn(
            owner,
            expectedFee,
            true
        );

        marketplace.withdrawPlatformFees(true);

        assertEq(owner.balance, initialBalance + expectedFee);
        assertEq(wipToken.balanceOf(address(marketplace)), 0);
    }
}

/**
 * @title ClaimEarningsTest
 * @dev Test earnings claim functionality
 */
contract ClaimEarningsTest is SingleHealthDataRegisteredState {
    function testClaimEarningsSuccess() public {
        address mockVault = makeAddr("mockVault");
        uint256 claimAmount = 10 ether;

        // Mock IP Account owner
        vm.mockCall(
            registeredIpId,
            abi.encodeWithSelector(IIPAccount.owner.selector),
            abi.encode(user1)
        );

        // Mock royalty vault exists
        vm.mockCall(
            mockRoyaltyModule,
            abi.encodeWithSelector(
                IRoyaltyModule.ipRoyaltyVaults.selector,
                registeredIpId
            ),
            abi.encode(mockVault)
        );

        // Mock claim revenue
        vm.mockCall(
            mockVault,
            abi.encodeWithSignature(
                "claimRevenueOnBehalf(address,address)",
                user1,
                address(testToken)
            ),
            abi.encode(claimAmount)
        );

        vm.expectEmit(true, true, true, true);
        emit HealthDataMarketplace.EarningsClaimed(
            registeredIpId,
            user1,
            address(testToken),
            claimAmount
        );

        vm.prank(user1);
        marketplace.claimEarnings(registeredIpId, false);
    }

    function testClaimEarningsNotOwner() public {
        // Mock IP Account owner
        vm.mockCall(
            registeredIpId,
            abi.encodeWithSelector(IIPAccount.owner.selector),
            abi.encode(user1)
        );

        vm.prank(user2);
        vm.expectRevert(HealthDataMarketplace.NotIPOwner.selector);
        marketplace.claimEarnings(registeredIpId, false);
    }

    function testClaimEarningsNoEarnings() public {
        address mockVault = makeAddr("mockVault");

        // Mock IP Account owner
        vm.mockCall(
            registeredIpId,
            abi.encodeWithSelector(IIPAccount.owner.selector),
            abi.encode(user1)
        );

        // Mock royalty vault exists
        vm.mockCall(
            mockRoyaltyModule,
            abi.encodeWithSelector(
                IRoyaltyModule.ipRoyaltyVaults.selector,
                registeredIpId
            ),
            abi.encode(mockVault)
        );

        // Mock no earnings to claim
        vm.mockCall(
            mockVault,
            abi.encodeWithSignature(
                "claimRevenueOnBehalf(address,address)",
                user1,
                address(testToken)
            ),
            abi.encode(0)
        );

        vm.prank(user1);
        vm.expectRevert(HealthDataMarketplace.NoEarningsToClaim.selector);
        marketplace.claimEarnings(registeredIpId, false);
    }
}

/**
 * @title EmergencyTest
 * @dev Test emergency functions
 */
contract EmergencyTest is SingleHealthDataRegisteredState {
    function testEmergencyWithdraw() public {
        // Add some tokens to contract
        testToken.mint(address(marketplace), 100 ether);
        vm.deal(address(marketplace), 1 ether);

        uint256 initialTokenBalance = testToken.balanceOf(owner);
        uint256 initialEthBalance = owner.balance;

        marketplace.emergencyWithdraw();

        assertEq(testToken.balanceOf(owner), initialTokenBalance + 100 ether);
        assertEq(owner.balance, initialEthBalance + 1 ether);
        assertEq(testToken.balanceOf(address(marketplace)), 0);
        assertEq(address(marketplace).balance, 0);
    }

    function testOnlyOwnerCanEmergencyWithdraw() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                user1
            )
        );
        marketplace.emergencyWithdraw();
    }
}
