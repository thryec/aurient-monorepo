// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {HealthDataMarketplace} from "../src/HealthDataMarketplace.sol";
// for testing purposes only
import {MockIPGraph} from "@storyprotocol/test/mocks/MockIPGraph.sol";
import {IPAssetRegistry} from "@storyprotocol/core/registries/IPAssetRegistry.sol";
import {LicenseRegistry} from "@storyprotocol/core/registries/LicenseRegistry.sol";
import {PILicenseTemplate} from "@storyprotocol/core/modules/licensing/PILicenseTemplate.sol";
import {RoyaltyPolicyLAP} from "@storyprotocol/core/modules/royalty/policies/LAP/RoyaltyPolicyLAP.sol";
import {PILFlavors} from "@storyprotocol/core/lib/PILFlavors.sol";
import {LicensingModule} from "@storyprotocol/core/modules/licensing/LicensingModule.sol";
import {LicenseToken} from "@storyprotocol/core/LicenseToken.sol";
import {RoyaltyModule} from "@storyprotocol/core/modules/royalty/RoyaltyModule.sol";
import {IIpRoyaltyVault} from "@storyprotocol/core/interfaces/modules/royalty/policies/IIpRoyaltyVault.sol";
import {IIPAccount} from "@storyprotocol/core/interfaces/IIPAccount.sol";
import {IRegistrationWorkflows} from "@storyprotocol/periphery/contracts/interfaces/workflows/IRegistrationWorkflows.sol";
import {ISPGNFT} from "@storyprotocol/periphery/contracts/interfaces/ISPGNFT.sol";
import {ILicenseAttachmentWorkflows} from "@storyprotocol/periphery/contracts/interfaces/workflows/ILicenseAttachmentWorkflows.sol";

// Interface for WIP token on Aeneid
interface IWIP {
    function deposit() external payable;
    function withdraw(uint256 value) external;
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

// Run this test with:
// forge test --fork-url https://aeneid.storyrpc.io/ --match-path test/HealthDataMarketplace.t.sol

// ============================================================================
// STATE ZERO: Basic Setup (Contract Deployed, Collection Initialized)
// ============================================================================

abstract contract StateZero is Test {
    // Test addresses
    address internal alice = address(0xa11ce);
    address internal bob = address(0xb0b);
    address internal charlie = address(0xcc);

    // Story Protocol contracts on Aeneid
    IPAssetRegistry internal IP_ASSET_REGISTRY =
        IPAssetRegistry(0x77319B4031e6eF1250907aa00018B8B1c67a244b);
    LicenseRegistry internal LICENSE_REGISTRY =
        LicenseRegistry(0x529a750E02d8E2f15649c13D69a465286a780e24);
    LicensingModule internal LICENSING_MODULE =
        LicensingModule(0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f);
    PILicenseTemplate internal PIL_TEMPLATE =
        PILicenseTemplate(0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316);
    RoyaltyPolicyLAP internal ROYALTY_POLICY_LAP =
        RoyaltyPolicyLAP(0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E);
    LicenseToken internal LICENSE_TOKEN =
        LicenseToken(0xFe3838BFb30B34170F00030B52eA4893d8aAC6bC);
    RoyaltyModule internal ROYALTY_MODULE =
        RoyaltyModule(0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086);
    IRegistrationWorkflows internal REGISTRATION_WORKFLOWS =
        IRegistrationWorkflows(0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424);
    ILicenseAttachmentWorkflows internal LICENSE_ATTACHMENT_WORKFLOWS =
        ILicenseAttachmentWorkflows(0xcC2E862bCee5B6036Db0de6E06Ae87e524a79fd8);

    // WIP token on Aeneid
    IWIP internal WIP_TOKEN = IWIP(0x1514000000000000000000000000000000000000);

    // Test contracts
    HealthDataMarketplace public marketplace;

    // Test parameters
    uint256 public platformFeePercent = 10; // 10%

    // Test data
    string constant DATA_TYPE_SLEEP = "sleep";
    string constant DATA_TYPE_HRV = "hrv";
    string constant IPFS_HASH_1 = "QmTest1Hash";
    string constant IPFS_HASH_2 = "QmTest2Hash";
    string constant QUALITY_METRICS_1 = "high-quality-30days";
    string constant QUALITY_METRICS_2 = "medium-quality-14days";
    uint256 constant PRICE_50_IP = 50 ether;
    uint256 constant PRICE_100_IP = 100 ether;

    function setUp() public virtual {
        // Mock IPGraph for testing (required by Story Protocol)
        vm.etch(address(0x0101), address(new MockIPGraph()).code);

        // Give test accounts native $IP
        vm.deal(alice, 1000 ether);
        vm.deal(bob, 1000 ether);
        vm.deal(charlie, 1000 ether);

        // Label addresses for better debugging
        vm.label(alice, "alice");
        vm.label(bob, "bob");
        vm.label(charlie, "charlie");

        // Deploy HealthDataMarketplace
        marketplace = new HealthDataMarketplace(
            address(REGISTRATION_WORKFLOWS),
            address(LICENSING_MODULE),
            address(PIL_TEMPLATE),
            address(ROYALTY_MODULE),
            address(ROYALTY_POLICY_LAP),
            address(LICENSE_ATTACHMENT_WORKFLOWS),
            address(WIP_TOKEN),
            platformFeePercent
        );

        // Initialize collection
        marketplace.initializeHealthDataCollection();
    }
}

contract StateZeroTest is StateZero {
    function testInitialState() public view {
        assertEq(marketplace.platformFeePercent(), platformFeePercent);
        assertTrue(marketplace.isCollectionSetup());
        assertEq(marketplace.nextListingId(), 1);
        assertEq(address(marketplace.WIP_TOKEN()), address(WIP_TOKEN));
    }

    function testInvalidRegistrationParameters() public {
        vm.startPrank(alice);

        // Test invalid data type
        vm.expectRevert(HealthDataMarketplace.InvalidDataType.selector);
        marketplace.registerHealthDataIP(
            "",
            IPFS_HASH_1,
            PRICE_50_IP,
            QUALITY_METRICS_1
        );

        // Test invalid price
        vm.expectRevert(HealthDataMarketplace.InvalidPrice.selector);
        marketplace.registerHealthDataIP(
            DATA_TYPE_SLEEP,
            IPFS_HASH_1,
            0,
            QUALITY_METRICS_1
        );

        vm.stopPrank();
    }

    function testOnlyOwnerFunctions() public {
        // Test setPlatformFee
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                alice
            )
        );
        marketplace.setPlatformFee(10);

        // Test withdrawPlatformFees
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                alice
            )
        );
        marketplace.withdrawPlatformFees();

        // Test emergencyWithdraw
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                alice
            )
        );
        marketplace.emergencyWithdraw();
    }

    function testSetPlatformFee() public {
        uint256 newFee = 15;

        vm.expectEmit(true, true, true, true);
        emit HealthDataMarketplace.PlatformFeeUpdated(
            platformFeePercent,
            newFee
        );

        marketplace.setPlatformFee(newFee);
        assertEq(marketplace.platformFeePercent(), newFee);
    }

    function testWIPIntegration() public {
        uint256 depositAmount = 10 ether;
        uint256 aliceInitialBalance = alice.balance;
        uint256 aliceInitialWIP = WIP_TOKEN.balanceOf(alice);

        // Test WIP deposit
        vm.prank(alice);
        WIP_TOKEN.deposit{value: depositAmount}();

        assertEq(alice.balance, aliceInitialBalance - depositAmount);
        assertEq(WIP_TOKEN.balanceOf(alice), aliceInitialWIP + depositAmount);

        // Test WIP withdraw
        vm.prank(alice);
        WIP_TOKEN.withdraw(depositAmount);

        assertEq(alice.balance, aliceInitialBalance);
        assertEq(WIP_TOKEN.balanceOf(alice), aliceInitialWIP);
    }

    // Allow test contract to receive ether
    receive() external payable {}

    fallback() external payable {}
}

// ============================================================================
// STATE ONE: Health Data Registered (IP Created, Listing Active)
// ============================================================================

abstract contract StateOne is StateZero {
    address internal ipId;
    uint256 internal listingId = 1;

    function setUp() public virtual override {
        super.setUp();

        // Register health data IP
        vm.startPrank(alice);
        (ipId, , ) = marketplace.registerHealthDataIP(
            DATA_TYPE_SLEEP,
            IPFS_HASH_1,
            PRICE_50_IP,
            QUALITY_METRICS_1
        );
        vm.stopPrank();
    }
}

contract StateOneTest is StateOne {
    function testHealthDataRegistration() public view {
        // Verify IP was registered
        assertTrue(IP_ASSET_REGISTRY.isRegistered(ipId));

        // Verify listing was created
        (
            uint256 listingId,
            address seller,
            address listedIpId,
            uint256 price,
            string memory dataType,
            bool active,
            uint256 createdAt
        ) = marketplace.listings(1);

        assertEq(listingId, 1);
        assertEq(seller, alice);
        assertEq(listedIpId, ipId);
        assertEq(price, PRICE_50_IP);
        assertEq(dataType, DATA_TYPE_SLEEP);
        assertTrue(active);
        assertGt(createdAt, 0);
    }

    function testGetActiveListings() public view {
        HealthDataMarketplace.Listing[] memory activeListings = marketplace
            .getActiveListings();
        assertEq(activeListings.length, 1);
        assertEq(activeListings[0].seller, alice);
        assertEq(activeListings[0].ipId, ipId);
    }

    function testGetListingsByDataType() public view {
        HealthDataMarketplace.Listing[] memory sleepListings = marketplace
            .getListingsByDataType(DATA_TYPE_SLEEP);
        assertEq(sleepListings.length, 1);
        assertEq(sleepListings[0].seller, alice);

        HealthDataMarketplace.Listing[] memory hrvListings = marketplace
            .getListingsByDataType(DATA_TYPE_HRV);
        assertEq(hrvListings.length, 0);
    }

    function testGetUserListings() public view {
        HealthDataMarketplace.Listing[] memory aliceListings = marketplace
            .getUserListings(alice);
        assertEq(aliceListings.length, 1);
        assertEq(aliceListings[0].seller, alice);

        HealthDataMarketplace.Listing[] memory bobListings = marketplace
            .getUserListings(bob);
        assertEq(bobListings.length, 0);
    }

    function testRemoveListing() public {
        // Alice removes her listing
        vm.prank(alice);
        marketplace.removeListing(listingId);

        // Verify listing is deactivated
        (, , , , , bool active, ) = marketplace.listings(listingId);
        assertFalse(active);

        // Verify no active listings
        HealthDataMarketplace.Listing[] memory activeListings = marketplace
            .getActiveListings();
        assertEq(activeListings.length, 0);
    }

    function testRemoveListingNotOwner() public {
        // Bob tries to remove Alice's listing
        vm.prank(bob);
        vm.expectRevert(HealthDataMarketplace.NotListingOwner.selector);
        marketplace.removeListing(listingId);
    }

    function testPurchaseLicenseInsufficientPayment() public {
        uint256 insufficientAmount = PRICE_50_IP - 1 ether;

        // Charlie tries to underpay
        vm.prank(charlie);
        vm.expectRevert(HealthDataMarketplace.InsufficientPayment.selector);
        marketplace.purchaseLicense{value: insufficientAmount}(listingId);
    }

    function testPurchaseLicenseListingNotFound() public {
        vm.prank(charlie);
        vm.expectRevert(HealthDataMarketplace.ListingNotFound.selector);
        marketplace.purchaseLicense{value: PRICE_50_IP}(999); // Non-existent listing
    }

    function testPurchaseLicenseListingNotActive() public {
        // First remove the listing
        vm.prank(alice);
        marketplace.removeListing(listingId);

        // Then try to purchase
        vm.prank(charlie);
        vm.expectRevert(HealthDataMarketplace.ListingNotActive.selector);
        marketplace.purchaseLicense{value: PRICE_50_IP}(listingId);
    }

    // Allow test contract to receive ether
    receive() external payable {}

    fallback() external payable {}
}

// ============================================================================
// STATE TWO: License Purchased (Listing Inactive, Royalty Paid)
// ============================================================================

abstract contract StateTwo is StateOne {
    uint256 internal expectedPlatformFee;
    uint256 internal expectedRoyaltyAmount;

    function setUp() public virtual override {
        super.setUp();

        // Calculate expected amounts
        expectedPlatformFee = (PRICE_50_IP * platformFeePercent) / 100;
        expectedRoyaltyAmount = PRICE_50_IP - expectedPlatformFee;

        // Purchase license
        vm.prank(charlie);
        marketplace.purchaseLicense{value: PRICE_50_IP}(listingId);
    }
}

contract StateTwoTest is StateTwo {
    function testLicensePurchase() public view {
        // Verify Charlie paid the full amount
        assertEq(charlie.balance, 1000 ether - PRICE_50_IP);

        // Verify platform fee is kept as native tokens
        assertEq(address(marketplace).balance, expectedPlatformFee);

        // Verify license token was transferred to Charlie
        assertEq(LICENSE_TOKEN.balanceOf(charlie), 1);

        // Verify royalty was paid to Alice's ipId (only the royalty amount)
        address vault = ROYALTY_MODULE.ipRoyaltyVaults(ipId);
        assertTrue(vault != address(0), "Royalty vault should be deployed");

        uint256 aliceEarnings = IIpRoyaltyVault(vault).claimableRevenue(
            ipId,
            address(WIP_TOKEN)
        );
        assertEq(aliceEarnings, expectedRoyaltyAmount);

        // Verify listing remains active for multiple purchases
        (, , , , , bool active, ) = marketplace.listings(listingId);
        assertTrue(active);
    }

    function testPurchaseLicenseWithOverpayment() public {
        // Reset to StateOne for this test
        vm.startPrank(alice);
        (address ipId2, , ) = marketplace.registerHealthDataIP(
            DATA_TYPE_HRV,
            IPFS_HASH_2,
            PRICE_50_IP,
            QUALITY_METRICS_2
        );
        vm.stopPrank();

        uint256 listingId2 = 2;
        uint256 overpayment = 10 ether;
        uint256 totalSent = PRICE_50_IP + overpayment;

        uint256 charlieInitialBalance = charlie.balance;

        // Charlie overpays
        vm.prank(charlie);
        marketplace.purchaseLicense{value: totalSent}(listingId2);

        // Verify correct amount was charged (overpayment refunded)
        assertEq(charlie.balance, charlieInitialBalance - PRICE_50_IP);
    }

    function testClaimEarnings() public {
        // Check vault balance before claiming
        address vault = ROYALTY_MODULE.ipRoyaltyVaults(ipId);
        uint256 ipAccountBalanceBefore = WIP_TOKEN.balanceOf(ipId);

        vm.prank(alice);
        marketplace.claimEarnings(ipId);

        // Check that earnings were claimed to IPAccount (only royalty amount)
        uint256 ipAccountBalanceAfter = WIP_TOKEN.balanceOf(ipId);
        uint256 claimedAmount = ipAccountBalanceAfter - ipAccountBalanceBefore;
        assertEq(
            claimedAmount,
            expectedRoyaltyAmount,
            "IPAccount should have received royalty amount"
        );
    }

    function testClaimEarningsNotOwner() public {
        // Bob tries to claim Alice's earnings
        vm.prank(bob);
        vm.expectRevert(HealthDataMarketplace.NotIPOwner.selector);
        marketplace.claimEarnings(ipId);
    }

    function testCannotPurchaseOwnListing() public {
        // Alice tries to purchase her own listing
        vm.prank(alice);
        vm.expectRevert(
            HealthDataMarketplace.CannotPurchaseOwnListing.selector
        );
        marketplace.purchaseLicense{value: PRICE_50_IP}(listingId);
    }

    function testClaimEarningsBatch() public {
        // Setup: Create multiple IPs for Alice
        vm.startPrank(alice);
        (address ipId1, , ) = marketplace.registerHealthDataIP(
            DATA_TYPE_SLEEP,
            IPFS_HASH_1,
            PRICE_50_IP,
            QUALITY_METRICS_1
        );
        (address ipId2, , ) = marketplace.registerHealthDataIP(
            DATA_TYPE_HRV,
            IPFS_HASH_2,
            PRICE_100_IP,
            QUALITY_METRICS_2
        );
        vm.stopPrank();

        // Purchase licenses to generate earnings
        vm.prank(charlie);
        marketplace.purchaseLicense{value: PRICE_50_IP}(1);
        vm.prank(bob);
        marketplace.purchaseLicense{value: PRICE_100_IP}(2);

        // Verify vaults are deployed
        address vault1 = ROYALTY_MODULE.ipRoyaltyVaults(ipId1);
        address vault2 = ROYALTY_MODULE.ipRoyaltyVaults(ipId2);
        assertTrue(vault1 != address(0), "Vault1 should be deployed");
        assertTrue(vault2 != address(0), "Vault2 should be deployed");

        // Check balances before claiming
        uint256 balanceBefore1 = WIP_TOKEN.balanceOf(ipId1);
        uint256 balanceBefore2 = WIP_TOKEN.balanceOf(ipId2);

        // Claim earnings for both IPs in batch
        vm.prank(alice);
        address[] memory ipIds = new address[](2);
        ipIds[0] = ipId1;
        ipIds[1] = ipId2;
        marketplace.claimEarningsBatch(ipIds);

        // Verify earnings were claimed
        uint256 balanceAfter1 = WIP_TOKEN.balanceOf(ipId1);
        uint256 balanceAfter2 = WIP_TOKEN.balanceOf(ipId2);
        assertGt(
            balanceAfter1 - balanceBefore1,
            0,
            "Should have claimed earnings for IP1"
        );
        assertGt(
            balanceAfter2 - balanceBefore2,
            0,
            "Should have claimed earnings for IP2"
        );
    }

    function testClaimEarningsBatchNotOwner() public {
        // Bob tries to claim Alice's earnings in batch
        vm.prank(bob);
        address[] memory ipIds = new address[](1);
        ipIds[0] = ipId;
        vm.expectRevert(HealthDataMarketplace.NotIPOwner.selector);
        marketplace.claimEarningsBatch(ipIds);
    }

    function testWithdrawPlatformFees() public {
        address owner = marketplace.owner();
        uint256 ownerInitialBalance = owner.balance;

        // Owner withdraws platform fees as native tokens
        marketplace.withdrawPlatformFees();

        // Verify platform fees were withdrawn
        assertEq(owner.balance, ownerInitialBalance + expectedPlatformFee);
        assertEq(address(marketplace).balance, 0);
    }

    function testWithdrawPlatformFeesNotOwner() public {
        // Non-owner tries to withdraw platform fees
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                alice
            )
        );
        marketplace.withdrawPlatformFees();
    }

    function testWithdrawPlatformFeesNoFees() public {
        // First withdraw all fees
        marketplace.withdrawPlatformFees();

        // Try to withdraw again - should revert
        vm.expectRevert("No fees to withdraw");
        marketplace.withdrawPlatformFees();
    }

    // Allow test contract to receive ether
    receive() external payable {}

    fallback() external payable {}
}

// ============================================================================
// STATE THREE: Multiple Transactions (Complex Scenarios)
// ============================================================================

abstract contract StateThree is StateTwo {
    address internal ipId2;
    uint256 internal listingId2 = 2;

    function setUp() public virtual override {
        super.setUp();

        // Register second health data IP
        vm.startPrank(bob);
        (ipId2, , ) = marketplace.registerHealthDataIP(
            DATA_TYPE_HRV,
            IPFS_HASH_2,
            PRICE_100_IP,
            QUALITY_METRICS_2
        );
        vm.stopPrank();
    }
}

contract StateThreeTest is StateThree {
    function testMultipleHealthDataIPs() public view {
        // Verify both are registered
        assertTrue(IP_ASSET_REGISTRY.isRegistered(ipId));
        assertTrue(IP_ASSET_REGISTRY.isRegistered(ipId2));

        // Check active listings (should be 2 since both remain active after purchase)
        HealthDataMarketplace.Listing[] memory activeListings = marketplace
            .getActiveListings();
        assertEq(activeListings.length, 2);

        // Check listings by data type
        HealthDataMarketplace.Listing[] memory sleepListings = marketplace
            .getListingsByDataType(DATA_TYPE_SLEEP);
        assertEq(sleepListings.length, 1); // Alice's remains active

        HealthDataMarketplace.Listing[] memory hrvListings = marketplace
            .getListingsByDataType(DATA_TYPE_HRV);
        assertEq(hrvListings.length, 1);
        assertEq(hrvListings[0].seller, bob);
    }

    function testMultiplePurchases() public {
        // Purchase second license
        vm.prank(alice); // Alice buys Bob's data
        marketplace.purchaseLicense{value: PRICE_100_IP}(listingId2);

        // Verify both listings remain active for multiple purchases
        (, , , , , bool active1, ) = marketplace.listings(listingId);
        (, , , , , bool active2, ) = marketplace.listings(listingId2);
        assertTrue(active1);
        assertTrue(active2);

        // Verify both listings are still active
        HealthDataMarketplace.Listing[] memory activeListings = marketplace
            .getActiveListings();
        assertEq(activeListings.length, 2);
    }

    function testMultiplePurchasesOfSameLicense() public {
        // Charlie already purchased the license in StateTwo setup, so he has 1 token
        assertEq(LICENSE_TOKEN.balanceOf(charlie), 1);

        // Bob purchases the same license second time
        vm.prank(bob);
        marketplace.purchaseLicense{value: PRICE_50_IP}(listingId);

        // Verify Bob received a license token
        assertEq(LICENSE_TOKEN.balanceOf(bob), 1);

        // Verify listing is still active for more purchases
        (, , , , , bool activeAfterSecondPurchase, ) = marketplace.listings(
            listingId
        );
        assertTrue(activeAfterSecondPurchase);

        // Verify both users have license tokens
        assertEq(LICENSE_TOKEN.balanceOf(charlie), 1);
        assertEq(LICENSE_TOKEN.balanceOf(bob), 1);
    }

    function testEmergencyWithdraw() public {
        // Purchase second license to generate more fees
        vm.prank(alice);
        marketplace.purchaseLicense{value: PRICE_100_IP}(listingId2);

        // Send some native $IP to contract
        vm.deal(address(marketplace), 1 ether);

        address owner = marketplace.owner();
        uint256 ownerInitialWIP = WIP_TOKEN.balanceOf(owner);
        uint256 ownerInitialBalance = owner.balance;
        uint256 marketplaceWIP = WIP_TOKEN.balanceOf(address(marketplace));
        uint256 marketplaceBalance = address(marketplace).balance;

        // Emergency withdraw
        marketplace.emergencyWithdraw();

        // Verify all funds transferred to owner
        assertEq(WIP_TOKEN.balanceOf(address(marketplace)), 0);
        assertEq(address(marketplace).balance, 0);
    }

    // Allow test contract to receive ether
    receive() external payable {}

    fallback() external payable {}
}

// ============================================================================
// STATE TRANSITION TESTS
// ============================================================================

contract StateTransitionTest is StateZero {
    function testStateZeroToStateOne() public {
        // Test transition from basic setup to health data registration
        vm.startPrank(alice);
        (address ipId, , ) = marketplace.registerHealthDataIP(
            DATA_TYPE_SLEEP,
            IPFS_HASH_1,
            PRICE_50_IP,
            QUALITY_METRICS_1
        );
        vm.stopPrank();

        // Verify state transition
        assertTrue(IP_ASSET_REGISTRY.isRegistered(ipId));
        assertEq(marketplace.nextListingId(), 2);

        HealthDataMarketplace.Listing[] memory activeListings = marketplace
            .getActiveListings();
        assertEq(activeListings.length, 1);
    }

    function testStateOneToStateTwo() public {
        // Setup StateOne
        vm.startPrank(alice);
        (address ipId, , ) = marketplace.registerHealthDataIP(
            DATA_TYPE_SLEEP,
            IPFS_HASH_1,
            PRICE_50_IP,
            QUALITY_METRICS_1
        );
        vm.stopPrank();

        uint256 listingId = 1;
        uint256 charlieInitialBalance = charlie.balance;

        // Test transition from listing to purchase
        vm.prank(charlie);
        marketplace.purchaseLicense{value: PRICE_50_IP}(listingId);

        // Verify state transition
        assertEq(charlie.balance, charlieInitialBalance - PRICE_50_IP);
        assertEq(LICENSE_TOKEN.balanceOf(charlie), 1);

        // Verify listing remains active for multiple purchases
        (, , , , , bool active, ) = marketplace.listings(listingId);
        assertTrue(active);
    }

    function testStateTwoToStateThree() public {
        // Setup StateTwo
        vm.startPrank(alice);
        (address ipId1, , ) = marketplace.registerHealthDataIP(
            DATA_TYPE_SLEEP,
            IPFS_HASH_1,
            PRICE_50_IP,
            QUALITY_METRICS_1
        );
        vm.stopPrank();

        vm.prank(charlie);
        marketplace.purchaseLicense{value: PRICE_50_IP}(1);

        // Test transition to multiple IPs
        vm.startPrank(bob);
        (address ipId2, , ) = marketplace.registerHealthDataIP(
            DATA_TYPE_HRV,
            IPFS_HASH_2,
            PRICE_100_IP,
            QUALITY_METRICS_2
        );
        vm.stopPrank();

        // Verify state transition
        assertTrue(IP_ASSET_REGISTRY.isRegistered(ipId1));
        assertTrue(IP_ASSET_REGISTRY.isRegistered(ipId2));
        assertEq(marketplace.nextListingId(), 3);

        HealthDataMarketplace.Listing[] memory activeListings = marketplace
            .getActiveListings();
        assertEq(activeListings.length, 2); // Both listings remain active
    }

    // Allow test contract to receive ether
    receive() external payable {}

    fallback() external payable {}
}
