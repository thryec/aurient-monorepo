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
contract HealthDataMarketplaceTest is Test {
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

    // WIP token on Aeneid
    IWIP internal WIP_TOKEN = IWIP(0x1514000000000000000000000000000000000000);

    // Test contracts
    HealthDataMarketplace public marketplace;

    // Test parameters
    uint256 public platformFeePercent = 5; // 5%

    // Test data
    string constant DATA_TYPE_SLEEP = "sleep";
    string constant DATA_TYPE_HRV = "hrv";
    string constant IPFS_HASH_1 = "QmTest1Hash";
    string constant IPFS_HASH_2 = "QmTest2Hash";
    string constant QUALITY_METRICS_1 = "high-quality-30days";
    string constant QUALITY_METRICS_2 = "medium-quality-14days";
    uint256 constant PRICE_50_IP = 50 ether;
    uint256 constant PRICE_100_IP = 100 ether;

    function setUp() public {
        // Mock IPGraph for testing (required by Story Protocol)
        vm.etch(address(0x0101), address(new MockIPGraph()).code);

        // Give test accounts native $IP
        vm.deal(alice, 1000 ether);
        vm.deal(bob, 1000 ether);
        vm.deal(charlie, 1000 ether);

        // Deploy HealthDataMarketplace
        marketplace = new HealthDataMarketplace(
            address(REGISTRATION_WORKFLOWS),
            address(LICENSING_MODULE),
            address(PIL_TEMPLATE),
            address(ROYALTY_MODULE),
            address(ROYALTY_POLICY_LAP),
            address(WIP_TOKEN),
            platformFeePercent
        );

        // Initialize collection
        marketplace.initializeHealthDataCollection();
    }

    function testInitialState() public view {
        assertEq(marketplace.platformFeePercent(), platformFeePercent);
        assertTrue(marketplace.isCollectionSetup());
        assertEq(marketplace.nextListingId(), 1);
        assertEq(address(marketplace.WIP_TOKEN()), address(WIP_TOKEN));
    }

    function testRegisterHealthDataIP() public {
        vm.startPrank(alice);

        // Register health data IP (without attachLicenseTerms)
        (address ipId, uint256 tokenId) = marketplace.registerHealthDataIP(
            DATA_TYPE_SLEEP,
            IPFS_HASH_1,
            PRICE_50_IP,
            QUALITY_METRICS_1
        );

        // Get the license terms ID that was stored
        uint256 licenseTermsId = marketplace.ipToLicenseTermsId(ipId);

        // Alice calls attachLicenseTerms directly
        LICENSING_MODULE.attachLicenseTerms(
            ipId,
            address(PIL_TEMPLATE),
            licenseTermsId
        );

        vm.stopPrank();

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

        // Verify license terms were created and stored
        assertGt(licenseTermsId, 0);
    }

    function testRegisterMultipleHealthDataIPs() public {
        // Alice registers sleep data
        vm.startPrank(alice);
        (address ipId1, ) = marketplace.registerHealthDataIP(
            DATA_TYPE_SLEEP,
            IPFS_HASH_1,
            PRICE_50_IP,
            QUALITY_METRICS_1
        );
        uint256 licenseTermsId1 = marketplace.ipToLicenseTermsId(ipId1);
        LICENSING_MODULE.attachLicenseTerms(
            ipId1,
            address(PIL_TEMPLATE),
            licenseTermsId1
        );
        vm.stopPrank();

        // Bob registers HRV data
        vm.startPrank(bob);
        (address ipId2, ) = marketplace.registerHealthDataIP(
            DATA_TYPE_HRV,
            IPFS_HASH_2,
            PRICE_100_IP,
            QUALITY_METRICS_2
        );
        uint256 licenseTermsId2 = marketplace.ipToLicenseTermsId(ipId2);
        LICENSING_MODULE.attachLicenseTerms(
            ipId2,
            address(PIL_TEMPLATE),
            licenseTermsId2
        );
        vm.stopPrank();

        // Verify both are registered
        assertTrue(IP_ASSET_REGISTRY.isRegistered(ipId1));
        assertTrue(IP_ASSET_REGISTRY.isRegistered(ipId2));

        // Check active listings
        HealthDataMarketplace.Listing[] memory activeListings = marketplace
            .getActiveListings();
        assertEq(activeListings.length, 2);

        // Check listings by data type
        HealthDataMarketplace.Listing[] memory sleepListings = marketplace
            .getListingsByDataType(DATA_TYPE_SLEEP);
        assertEq(sleepListings.length, 1);
        assertEq(sleepListings[0].seller, alice);

        HealthDataMarketplace.Listing[] memory hrvListings = marketplace
            .getListingsByDataType(DATA_TYPE_HRV);
        assertEq(hrvListings.length, 1);
        assertEq(hrvListings[0].seller, bob);
    }

    function testPurchaseLicense() public {
        // Alice registers health data
        vm.startPrank(alice);
        (address ipId, ) = marketplace.registerHealthDataIP(
            DATA_TYPE_SLEEP,
            IPFS_HASH_1,
            PRICE_50_IP,
            QUALITY_METRICS_1
        );
        uint256 licenseTermsId = marketplace.ipToLicenseTermsId(ipId);
        LICENSING_MODULE.attachLicenseTerms(
            ipId,
            address(PIL_TEMPLATE),
            licenseTermsId
        );
        vm.stopPrank();

        uint256 listingId = 1;

        // Check initial balances
        uint256 charlieInitialBalance = charlie.balance;
        uint256 marketplaceInitialWIP = WIP_TOKEN.balanceOf(
            address(marketplace)
        );

        // Charlie purchases license
        vm.prank(charlie);

        // check charlie's balance before purchase
        marketplace.purchaseLicense{value: PRICE_50_IP}(listingId);

        // Verify payment was processed
        assertEq(charlie.balance, charlieInitialBalance - PRICE_50_IP);

        // Verify license token was transferred to Charlie
        uint256 licenseTokenId = marketplace.getLicenseTokenId(ipId);
        assertEq(LICENSE_TOKEN.balanceOf(charlie), 1);

        // Verify royalty was paid to Alice (IP owner)
        address vault = ROYALTY_MODULE.ipRoyaltyVaults(ipId);
        assertTrue(vault != address(0), "Royalty vault should be deployed");

        uint256 aliceEarnings = IIpRoyaltyVault(vault).claimableRevenue(
            alice,
            address(WIP_TOKEN)
        );
        console.log("aliceEarnings", aliceEarnings);

        // Verify listing was deactivated
        (, , , , , bool active, ) = marketplace.listings(listingId);
        assertFalse(active);
    }

    function testPurchaseLicenseWithOverpayment() public {
        // Alice registers health data
        vm.startPrank(alice);
        (address ipId, ) = marketplace.registerHealthDataIP(
            DATA_TYPE_SLEEP,
            IPFS_HASH_1,
            PRICE_50_IP,
            QUALITY_METRICS_1
        );
        uint256 licenseTermsId = marketplace.ipToLicenseTermsId(ipId);
        LICENSING_MODULE.attachLicenseTerms(
            ipId,
            address(PIL_TEMPLATE),
            licenseTermsId
        );
        vm.stopPrank();

        uint256 listingId = 1;
        uint256 overpayment = 10 ether;
        uint256 totalSent = PRICE_50_IP + overpayment;

        uint256 charlieInitialBalance = charlie.balance;

        // Charlie overpays
        vm.prank(charlie);
        marketplace.purchaseLicense{value: totalSent}(listingId);

        // Verify correct amount was charged (overpayment refunded)
        assertEq(charlie.balance, charlieInitialBalance - PRICE_50_IP);
    }

    function testPurchaseLicenseInsufficientPayment() public {
        // Alice registers health data
        vm.startPrank(alice);
        (address ipId, ) = marketplace.registerHealthDataIP(
            DATA_TYPE_SLEEP,
            IPFS_HASH_1,
            PRICE_50_IP,
            QUALITY_METRICS_1
        );
        uint256 licenseTermsId = marketplace.ipToLicenseTermsId(ipId);
        LICENSING_MODULE.attachLicenseTerms(
            ipId,
            address(PIL_TEMPLATE),
            licenseTermsId
        );
        vm.stopPrank();

        uint256 listingId = 1;
        uint256 insufficientAmount = PRICE_50_IP - 1 ether;

        // Charlie tries to underpay
        vm.prank(charlie);
        vm.expectRevert(HealthDataMarketplace.InsufficientPayment.selector);
        marketplace.purchaseLicense{value: insufficientAmount}(listingId);
    }

    function testClaimEarnings() public {
        // Alice registers and someone purchases
        vm.startPrank(alice);
        (address ipId, ) = marketplace.registerHealthDataIP(
            DATA_TYPE_SLEEP,
            IPFS_HASH_1,
            PRICE_50_IP,
            QUALITY_METRICS_1
        );
        uint256 licenseTermsId = marketplace.ipToLicenseTermsId(ipId);
        LICENSING_MODULE.attachLicenseTerms(
            ipId,
            address(PIL_TEMPLATE),
            licenseTermsId
        );
        vm.stopPrank();

        vm.prank(charlie);
        marketplace.purchaseLicense{value: PRICE_50_IP}(1);

        // Check if royalty vault was created
        address vault = ROYALTY_MODULE.ipRoyaltyVaults(ipId);
        console.log("Royalty vault address:", vault);

        // Check vault balance
        uint256 vaultBalance = WIP_TOKEN.balanceOf(vault);
        console.log("Vault balance:", vaultBalance);

        // Check Alice's initial balance
        uint256 aliceInitialBalance = WIP_TOKEN.balanceOf(alice);
        console.log("Alice initial balance:", aliceInitialBalance);

        // check alice's claimable revenue
        uint256 aliceClaimableRevenue = IIpRoyaltyVault(vault).claimableRevenue(
            alice,
            address(WIP_TOKEN)
        );
        console.log("Alice claimable revenue:", aliceClaimableRevenue);

        // Try to claim earnings - this should succeed
        vm.prank(alice);
        marketplace.claimEarnings(ipId);

        // Verify Alice received the earnings
        uint256 aliceFinalBalance = WIP_TOKEN.balanceOf(alice);
        uint256 aliceEarnings = aliceFinalBalance - aliceInitialBalance;
        console.log("Alice final balance:", aliceFinalBalance);
        console.log("Alice earnings:", aliceEarnings);

        // Assert that Alice received some earnings
        assertGt(aliceEarnings, 0, "Alice should have received earnings");
    }

    // function testClaimEarningsNotOwner() public {
    //     // Alice registers health data
    //     vm.startPrank(alice);
    //     (address ipId, ) = marketplace.registerHealthDataIP(
    //         DATA_TYPE_SLEEP,
    //         IPFS_HASH_1,
    //         PRICE_50_IP,
    //         QUALITY_METRICS_1
    //     );
    //     uint256 licenseTermsId = marketplace.ipToLicenseTermsId(ipId);
    //     LICENSING_MODULE.attachLicenseTerms(
    //         ipId,
    //         address(PIL_TEMPLATE),
    //         licenseTermsId
    //     );
    //     vm.stopPrank();

    //     // Bob tries to claim Alice's earnings
    //     vm.prank(bob);
    //     vm.expectRevert(HealthDataMarketplace.NotIPOwner.selector);
    //     marketplace.claimEarnings(ipId);
    // }

    // function testRemoveListing() public {
    //     // Alice registers health data
    //     vm.startPrank(alice);
    //     (address ipId, ) = marketplace.registerHealthDataIP(
    //         DATA_TYPE_SLEEP,
    //         IPFS_HASH_1,
    //         PRICE_50_IP,
    //         QUALITY_METRICS_1
    //     );
    //     uint256 licenseTermsId = marketplace.ipToLicenseTermsId(ipId);
    //     LICENSING_MODULE.attachLicenseTerms(
    //         ipId,
    //         address(PIL_TEMPLATE),
    //         licenseTermsId
    //     );
    //     vm.stopPrank();

    //     uint256 listingId = 1;

    //     // Alice removes her listing
    //     vm.prank(alice);
    //     marketplace.removeListing(listingId);

    //     // Verify listing is deactivated
    //     (, , , , , bool active, ) = marketplace.listings(listingId);
    //     assertFalse(active);

    //     // Verify no active listings
    //     HealthDataMarketplace.Listing[] memory activeListings = marketplace
    //         .getActiveListings();
    //     assertEq(activeListings.length, 0);
    // }

    // function testRemoveListingNotOwner() public {
    //     // Alice registers health data
    //     vm.startPrank(alice);
    //     (address ipId, ) = marketplace.registerHealthDataIP(
    //         DATA_TYPE_SLEEP,
    //         IPFS_HASH_1,
    //         PRICE_50_IP,
    //         QUALITY_METRICS_1
    //     );
    //     uint256 licenseTermsId = marketplace.ipToLicenseTermsId(ipId);
    //     LICENSING_MODULE.attachLicenseTerms(
    //         ipId,
    //         address(PIL_TEMPLATE),
    //         licenseTermsId
    //     );
    //     vm.stopPrank();

    //     uint256 listingId = 1;

    //     // Bob tries to remove Alice's listing
    //     vm.prank(bob);
    //     vm.expectRevert(HealthDataMarketplace.NotListingOwner.selector);
    //     marketplace.removeListing(listingId);
    // }

    // function testWithdrawPlatformFeesAsWIP() public {
    //     // Generate platform fees through purchases
    //     vm.startPrank(alice);
    //     (address ipId, ) = marketplace.registerHealthDataIP(
    //         DATA_TYPE_SLEEP,
    //         IPFS_HASH_1,
    //         PRICE_50_IP,
    //         QUALITY_METRICS_1
    //     );
    //     uint256 licenseTermsId = marketplace.ipToLicenseTermsId(ipId);
    //     LICENSING_MODULE.attachLicenseTerms(
    //         ipId,
    //         address(PIL_TEMPLATE),
    //         licenseTermsId
    //     );
    //     vm.stopPrank();

    //     vm.prank(charlie);
    //     marketplace.purchaseLicense{value: PRICE_50_IP}(1);

    //     uint256 expectedFee = (PRICE_50_IP * platformFeePercent) / 100;
    //     address owner = marketplace.owner();
    //     uint256 ownerInitialWIP = WIP_TOKEN.balanceOf(owner);

    //     // Owner withdraws as WIP tokens
    //     marketplace.withdrawPlatformFees(false);

    //     assertEq(WIP_TOKEN.balanceOf(owner), ownerInitialWIP + expectedFee);
    //     assertEq(WIP_TOKEN.balanceOf(address(marketplace)), 0);
    // }

    // function testWithdrawPlatformFeesAsNative() public {
    //     // Generate platform fees through purchases
    //     vm.startPrank(alice);
    //     (address ipId, ) = marketplace.registerHealthDataIP(
    //         DATA_TYPE_SLEEP,
    //         IPFS_HASH_1,
    //         PRICE_50_IP,
    //         QUALITY_METRICS_1
    //     );
    //     uint256 licenseTermsId = marketplace.ipToLicenseTermsId(ipId);
    //     LICENSING_MODULE.attachLicenseTerms(
    //         ipId,
    //         address(PIL_TEMPLATE),
    //         licenseTermsId
    //     );
    //     vm.stopPrank();

    //     vm.prank(charlie);
    //     marketplace.purchaseLicense{value: PRICE_50_IP}(1);

    //     uint256 expectedFee = (PRICE_50_IP * platformFeePercent) / 100;
    //     address owner = marketplace.owner();
    //     uint256 ownerInitialBalance = owner.balance;

    //     // Owner withdraws as native $IP
    //     marketplace.withdrawPlatformFees(true);

    //     assertEq(owner.balance, ownerInitialBalance + expectedFee);
    //     assertEq(WIP_TOKEN.balanceOf(address(marketplace)), 0);
    // }

    // function testSetPlatformFee() public {
    //     uint256 newFee = 10;

    //     vm.expectEmit(true, true, true, true);
    //     emit HealthDataMarketplace.PlatformFeeUpdated(
    //         platformFeePercent,
    //         newFee
    //     );

    //     marketplace.setPlatformFee(newFee);
    //     assertEq(marketplace.platformFeePercent(), newFee);
    // }

    // function testOnlyOwnerFunctions() public {
    //     // Test setPlatformFee
    //     vm.prank(alice);
    //     vm.expectRevert(
    //         abi.encodeWithSignature(
    //             "OwnableUnauthorizedAccount(address)",
    //             alice
    //         )
    //     );
    //     marketplace.setPlatformFee(10);

    //     // Test withdrawPlatformFees
    //     vm.prank(alice);
    //     vm.expectRevert(
    //         abi.encodeWithSignature(
    //             "OwnableUnauthorizedAccount(address)",
    //             alice
    //         )
    //     );
    //     marketplace.withdrawPlatformFees(false);

    //     // Test emergencyWithdraw
    //     vm.prank(alice);
    //     vm.expectRevert(
    //         abi.encodeWithSignature(
    //             "OwnableUnauthorizedAccount(address)",
    //             alice
    //         )
    //     );
    //     marketplace.emergencyWithdraw();
    // }

    // function testInvalidRegistrationParameters() public {
    //     vm.startPrank(alice);

    //     // Test invalid data type
    //     vm.expectRevert(HealthDataMarketplace.InvalidDataType.selector);
    //     marketplace.registerHealthDataIP(
    //         "",
    //         IPFS_HASH_1,
    //         PRICE_50_IP,
    //         QUALITY_METRICS_1
    //     );

    //     // Test invalid price
    //     vm.expectRevert(HealthDataMarketplace.InvalidPrice.selector);
    //     marketplace.registerHealthDataIP(
    //         DATA_TYPE_SLEEP,
    //         IPFS_HASH_1,
    //         0,
    //         QUALITY_METRICS_1
    //     );

    //     vm.stopPrank();
    // }

    // function testGetUserListings() public {
    //     // Alice registers two different data types
    //     vm.startPrank(alice);

    //     (address ipId1, ) = marketplace.registerHealthDataIP(
    //         DATA_TYPE_SLEEP,
    //         IPFS_HASH_1,
    //         PRICE_50_IP,
    //         QUALITY_METRICS_1
    //     );
    //     uint256 licenseTermsId1 = marketplace.ipToLicenseTermsId(ipId1);
    //     LICENSING_MODULE.attachLicenseTerms(
    //         ipId1,
    //         address(PIL_TEMPLATE),
    //         licenseTermsId1
    //     );

    //     (address ipId2, ) = marketplace.registerHealthDataIP(
    //         DATA_TYPE_HRV,
    //         IPFS_HASH_2,
    //         PRICE_100_IP,
    //         QUALITY_METRICS_2
    //     );
    //     uint256 licenseTermsId2 = marketplace.ipToLicenseTermsId(ipId2);
    //     LICENSING_MODULE.attachLicenseTerms(
    //         ipId2,
    //         address(PIL_TEMPLATE),
    //         licenseTermsId2
    //     );

    //     vm.stopPrank();

    //     // Check Alice's listings
    //     HealthDataMarketplace.Listing[] memory aliceListings = marketplace
    //         .getUserListings(alice);
    //     assertEq(aliceListings.length, 2);
    //     assertEq(aliceListings[0].seller, alice);
    //     assertEq(aliceListings[1].seller, alice);

    //     // Check Bob has no listings
    //     HealthDataMarketplace.Listing[] memory bobListings = marketplace
    //         .getUserListings(bob);
    //     assertEq(bobListings.length, 0);
    // }

    // function testEmergencyWithdraw() public {
    //     // Generate some platform fees
    //     vm.startPrank(alice);
    //     (address ipId, ) = marketplace.registerHealthDataIP(
    //         DATA_TYPE_SLEEP,
    //         IPFS_HASH_1,
    //         PRICE_50_IP,
    //         QUALITY_METRICS_1
    //     );
    //     uint256 licenseTermsId = marketplace.ipToLicenseTermsId(ipId);
    //     LICENSING_MODULE.attachLicenseTerms(
    //         ipId,
    //         address(PIL_TEMPLATE),
    //         licenseTermsId
    //     );
    //     vm.stopPrank();

    //     vm.prank(charlie);
    //     marketplace.purchaseLicense{value: PRICE_50_IP}(1);

    //     // Send some native $IP to contract
    //     vm.deal(address(marketplace), 1 ether);

    //     address owner = marketplace.owner();
    //     uint256 ownerInitialWIP = WIP_TOKEN.balanceOf(owner);
    //     uint256 ownerInitialBalance = owner.balance;
    //     uint256 marketplaceWIP = WIP_TOKEN.balanceOf(address(marketplace));
    //     uint256 marketplaceBalance = address(marketplace).balance;

    //     // Emergency withdraw
    //     marketplace.emergencyWithdraw();

    //     // Verify all funds transferred to owner
    //     assertEq(WIP_TOKEN.balanceOf(owner), ownerInitialWIP + marketplaceWIP);
    //     assertEq(owner.balance, ownerInitialBalance + marketplaceBalance);
    //     assertEq(WIP_TOKEN.balanceOf(address(marketplace)), 0);
    //     assertEq(address(marketplace).balance, 0);
    // }

    // function testWIPIntegration() public {
    //     uint256 depositAmount = 10 ether;
    //     uint256 aliceInitialBalance = alice.balance;
    //     uint256 aliceInitialWIP = WIP_TOKEN.balanceOf(alice);

    //     // Test WIP deposit
    //     vm.prank(alice);
    //     WIP_TOKEN.deposit{value: depositAmount}();

    //     assertEq(alice.balance, aliceInitialBalance - depositAmount);
    //     assertEq(WIP_TOKEN.balanceOf(alice), aliceInitialWIP + depositAmount);

    //     // Test WIP withdraw
    //     vm.prank(alice);
    //     WIP_TOKEN.withdraw(depositAmount);

    //     assertEq(alice.balance, aliceInitialBalance);
    //     assertEq(WIP_TOKEN.balanceOf(alice), aliceInitialWIP);
    // }

    // function testCompleteUserJourney() public {
    //     console.log("=== Starting Complete User Journey Test ===");

    //     // 1. Alice registers health data
    //     console.log("1. Alice registering health data...");
    //     vm.startPrank(alice);
    //     (address ipId, uint256 tokenId) = marketplace.registerHealthDataIP(
    //         DATA_TYPE_SLEEP,
    //         IPFS_HASH_1,
    //         PRICE_50_IP,
    //         QUALITY_METRICS_1
    //     );
    //     uint256 licenseTermsId = marketplace.ipToLicenseTermsId(ipId);
    //     LICENSING_MODULE.attachLicenseTerms(
    //         ipId,
    //         address(PIL_TEMPLATE),
    //         licenseTermsId
    //     );
    //     vm.stopPrank();

    //     console.log("   IP ID:", ipId);
    //     console.log("   Token ID:", tokenId);

    //     // 2. Verify marketplace listing
    //     console.log("2. Verifying marketplace listing...");
    //     HealthDataMarketplace.Listing[] memory activeListings = marketplace
    //         .getActiveListings();
    //     assertEq(activeListings.length, 1);
    //     console.log("   Active listings:", activeListings.length);

    //     // 3. Charlie purchases license
    //     console.log("3. Charlie purchasing license...");
    //     uint256 charlieInitialBalance = charlie.balance;
    //     vm.prank(charlie);
    //     marketplace.purchaseLicense{value: PRICE_50_IP}(1);
    //     console.log("   Charlie paid:", PRICE_50_IP);
    //     console.log(
    //         "   Charlie balance change:",
    //         charlieInitialBalance - charlie.balance
    //     );

    //     // 4. Verify platform fees collected
    //     console.log("4. Verifying platform fees...");
    //     uint256 expectedPlatformFee = (PRICE_50_IP * platformFeePercent) / 100;
    //     uint256 actualPlatformFee = WIP_TOKEN.balanceOf(address(marketplace));
    //     assertEq(actualPlatformFee, expectedPlatformFee);
    //     console.log("   Expected platform fee:", expectedPlatformFee);
    //     console.log("   Actual platform fee:", actualPlatformFee);

    //     // 5. Check royalty vault creation
    //     console.log("5. Checking royalty vault...");
    //     address vault = ROYALTY_MODULE.ipRoyaltyVaults(ipId);
    //     console.log("   Royalty vault:", vault);

    //     // 6. Owner withdraws platform fees
    //     console.log("6. Owner withdrawing platform fees...");
    //     address owner = marketplace.owner();
    //     uint256 ownerInitialBalance = owner.balance;
    //     marketplace.withdrawPlatformFees(true); // Withdraw as native $IP
    //     console.log(
    //         "   Owner balance increase:",
    //         owner.balance - ownerInitialBalance
    //     );

    //     console.log("=== Complete User Journey Test Passed ===");
    // }
}
