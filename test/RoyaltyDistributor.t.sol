// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {RoyaltyDistributor} from "../src/RoyaltyDistributor.sol";

/**
 * @title BaseState
 * @dev Base test setup for RoyaltyDistributor contract
 */
abstract contract BaseState is Test {
    // Test addresses
    address owner;
    address platformAddress;
    address user1;
    address user2;
    address user3;

    // Contract instance
    RoyaltyDistributor royaltyDistributor;

    // Test parameters
    uint256 platformFeePercent = 5; // 5%

    /**
     * @dev Set up test environment
     */
    function setUp() public virtual {
        // Set up addresses
        owner = address(this);
        platformAddress = makeAddr("platform");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");

        // Give test users some ETH
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);
        vm.deal(address(this), 100 ether);

        // Deploy RoyaltyDistributor
        royaltyDistributor = new RoyaltyDistributor(
            platformAddress,
            platformFeePercent
        );
    }
}

/**
 * @title BaseStateTest
 * @dev Tests for initial RoyaltyDistributor state
 */
contract BaseStateTest is BaseState {
    /**
     * @dev Test that initialization worked correctly
     */
    function testInitialize() public view {
        assertEq(royaltyDistributor.owner(), owner);
        assertEq(royaltyDistributor.platformAddress(), platformAddress);
        assertEq(royaltyDistributor.platformFeePercent(), platformFeePercent);
        assertEq(royaltyDistributor.totalPlatformFees(), 0);
        assertEq(royaltyDistributor.totalPlatformFeesWithdrawn(), 0);
        assertEq(royaltyDistributor.getBalance(), 0);
    }

    /**
     * @dev Test constructor reverts with zero address
     */
    function testConstructorRevertZeroAddress() public {
        vm.expectRevert(RoyaltyDistributor.ZeroAddress.selector);
        new RoyaltyDistributor(address(0), platformFeePercent);
    }

    /**
     * @dev Test constructor reverts with invalid fee percent
     */
    function testConstructorRevertInvalidFeePercent() public {
        vm.expectRevert(RoyaltyDistributor.InvalidFeePercent.selector);
        new RoyaltyDistributor(platformAddress, 101); // > 100%
    }

    /**
     * @dev Test get earnings for user with no earnings
     */
    function testGetEarningsInitiallyZero() public view {
        assertEq(royaltyDistributor.getEarnings(user1), 0);
        assertEq(royaltyDistributor.getTotalEarned(user1), 0);
    }

    /**
     * @dev Test get available platform fees initially zero
     */
    function testGetAvailablePlatformFeesInitiallyZero() public view {
        assertEq(royaltyDistributor.getAvailablePlatformFees(), 0);
    }

    /**
     * @dev Test distribute payment with zero address reverts
     */
    function testDistributePaymentZeroAddress() public {
        vm.expectRevert(RoyaltyDistributor.ZeroAddress.selector);
        royaltyDistributor.distributePayment{value: 1 ether}(address(0));
    }

    /**
     * @dev Test withdraw earnings with no earnings
     */
    function testWithdrawEarningsWithNoEarnings() public {
        vm.prank(user1);
        vm.expectRevert(RoyaltyDistributor.NoEarningsToWithdraw.selector);
        royaltyDistributor.withdrawEarnings();
    }

    /**
     * @dev Test withdraw platform fees with no fees
     */
    function testWithdrawPlatformFeesWithNoFees() public {
        vm.expectRevert(RoyaltyDistributor.NoEarningsToWithdraw.selector);
        royaltyDistributor.withdrawPlatformFees();
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
        royaltyDistributor.setPlatformFee(10);
    }

    /**
     * @dev Test only owner can set platform address
     */
    function testOnlyOwnerCanSetPlatformAddress() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                user1
            )
        );
        royaltyDistributor.setPlatformAddress(makeAddr("newPlatform"));
    }

    /**
     * @dev Test only owner can withdraw platform fees
     */
    function testOnlyOwnerCanWithdrawPlatformFees() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                user1
            )
        );
        royaltyDistributor.withdrawPlatformFees();
    }

    /**
     * @dev Test only owner can emergency withdraw
     */
    function testOnlyOwnerCanEmergencyWithdraw() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                user1
            )
        );
        royaltyDistributor.emergencyWithdraw();
    }
}

/**
 * @title SinglePaymentState
 * @dev State with a single payment distributed
 */
abstract contract SinglePaymentState is BaseState {
    uint256 paymentAmount = 10 ether;
    uint256 expectedPlatformFee;
    uint256 expectedUserEarnings;

    function setUp() public virtual override {
        super.setUp();

        expectedPlatformFee = (paymentAmount * platformFeePercent) / 100; // 0.5 ether
        expectedUserEarnings = paymentAmount - expectedPlatformFee; // 9.5 ether

        // Distribute payment to user1
        royaltyDistributor.distributePayment{value: paymentAmount}(user1);
    }
}

/**
 * @title SinglePaymentStateTest
 * @dev Tests for state with a single payment distributed
 */
contract SinglePaymentStateTest is SinglePaymentState {
    /**
     * @dev Test payment distribution was successful
     */
    function testPaymentDistributionSuccessful() public view {
        // Check user earnings
        assertEq(royaltyDistributor.getEarnings(user1), expectedUserEarnings);
        assertEq(
            royaltyDistributor.getTotalEarned(user1),
            expectedUserEarnings
        );

        // Check platform fees
        assertEq(royaltyDistributor.totalPlatformFees(), expectedPlatformFee);
        assertEq(
            royaltyDistributor.getAvailablePlatformFees(),
            expectedPlatformFee
        );

        // Check contract balance
        assertEq(royaltyDistributor.getBalance(), paymentAmount);
    }

    /**
     * @dev Test user can withdraw earnings
     */
    function testUserWithdrawEarnings() public {
        uint256 initialBalance = user1.balance;

        vm.expectEmit(true, true, true, true);
        emit RoyaltyDistributor.EarningsWithdrawn(user1, expectedUserEarnings);

        vm.prank(user1);
        royaltyDistributor.withdrawEarnings();

        // Check user balance increased
        assertEq(user1.balance, initialBalance + expectedUserEarnings);

        // Check user earnings reset to zero
        assertEq(royaltyDistributor.getEarnings(user1), 0);

        // Check total earned unchanged
        assertEq(
            royaltyDistributor.getTotalEarned(user1),
            expectedUserEarnings
        );

        // Check contract balance decreased
        assertEq(royaltyDistributor.getBalance(), expectedPlatformFee);
    }

    /**
     * @dev Test platform can withdraw fees
     */
    function testPlatformWithdrawFees() public {
        uint256 initialBalance = platformAddress.balance;

        vm.expectEmit(true, true, true, true);
        emit RoyaltyDistributor.PlatformFeesWithdrawn(
            platformAddress,
            expectedPlatformFee
        );

        royaltyDistributor.withdrawPlatformFees();

        // Check platform balance increased
        assertEq(platformAddress.balance, initialBalance + expectedPlatformFee);

        // Check platform fees withdrawn updated
        assertEq(
            royaltyDistributor.totalPlatformFeesWithdrawn(),
            expectedPlatformFee
        );

        // Check available platform fees is zero
        assertEq(royaltyDistributor.getAvailablePlatformFees(), 0);

        // Check contract balance decreased
        assertEq(royaltyDistributor.getBalance(), expectedUserEarnings);
    }

    /**
     * @dev Test withdraw platform fees to specific address
     */
    function testWithdrawPlatformFeesToSpecificAddress() public {
        address recipient = makeAddr("recipient");
        uint256 initialBalance = recipient.balance;

        vm.expectEmit(true, true, true, true);
        emit RoyaltyDistributor.PlatformFeesWithdrawn(
            recipient,
            expectedPlatformFee
        );

        royaltyDistributor.withdrawPlatformFeesTo(recipient);

        // Check recipient balance increased
        assertEq(recipient.balance, initialBalance + expectedPlatformFee);
    }

    /**
     * @dev Test cannot withdraw platform fees to zero address
     */
    function testCannotWithdrawPlatformFeesToZeroAddress() public {
        vm.expectRevert(RoyaltyDistributor.ZeroAddress.selector);
        royaltyDistributor.withdrawPlatformFeesTo(address(0));
    }

    /**
     * @dev Test set platform fee
     */
    function testSetPlatformFee() public {
        uint256 newFee = 10;

        vm.expectEmit(true, true, true, true);
        emit RoyaltyDistributor.PlatformFeeUpdated(platformFeePercent, newFee);

        royaltyDistributor.setPlatformFee(newFee);
        assertEq(royaltyDistributor.platformFeePercent(), newFee);
    }

    /**
     * @dev Test cannot set invalid platform fee
     */
    function testCannotSetInvalidPlatformFee() public {
        vm.expectRevert(RoyaltyDistributor.InvalidFeePercent.selector);
        royaltyDistributor.setPlatformFee(101);
    }

    /**
     * @dev Test set platform address
     */
    function testSetPlatformAddress() public {
        address newPlatform = makeAddr("newPlatform");

        vm.expectEmit(true, true, true, true);
        emit RoyaltyDistributor.PlatformAddressUpdated(
            platformAddress,
            newPlatform
        );

        royaltyDistributor.setPlatformAddress(newPlatform);
        assertEq(royaltyDistributor.platformAddress(), newPlatform);
    }

    /**
     * @dev Test cannot set zero platform address
     */
    function testCannotSetZeroPlatformAddress() public {
        vm.expectRevert(RoyaltyDistributor.ZeroAddress.selector);
        royaltyDistributor.setPlatformAddress(address(0));
    }

    /**
     * @dev Test user cannot withdraw twice
     */
    function testUserCannotWithdrawTwice() public {
        // First withdrawal
        vm.prank(user1);
        royaltyDistributor.withdrawEarnings();

        // Second withdrawal should fail
        vm.prank(user1);
        vm.expectRevert(RoyaltyDistributor.NoEarningsToWithdraw.selector);
        royaltyDistributor.withdrawEarnings();
    }

    /**
     * @dev Test emergency withdraw
     */
    function testEmergencyWithdraw() public {
        uint256 initialOwnerBalance = owner.balance;
        uint256 contractBalance = royaltyDistributor.getBalance();

        royaltyDistributor.emergencyWithdraw();

        // Check owner received all contract funds
        assertEq(owner.balance, initialOwnerBalance + contractBalance);

        // Check contract balance is zero
        assertEq(royaltyDistributor.getBalance(), 0);
    }
}

/**
 * @title MultiplePaymentsState
 * @dev State with multiple payments to different users
 */
abstract contract MultiplePaymentsState is BaseState {
    uint256 payment1 = 10 ether;
    uint256 payment2 = 20 ether;
    uint256 payment3 = 5 ether;

    uint256 expectedFee1;
    uint256 expectedFee2;
    uint256 expectedFee3;
    uint256 expectedEarnings1;
    uint256 expectedEarnings2;
    uint256 expectedEarnings3;

    function setUp() public virtual override {
        super.setUp();

        expectedFee1 = (payment1 * platformFeePercent) / 100;
        expectedFee2 = (payment2 * platformFeePercent) / 100;
        expectedFee3 = (payment3 * platformFeePercent) / 100;
        expectedEarnings1 = payment1 - expectedFee1;
        expectedEarnings2 = payment2 - expectedFee2;
        expectedEarnings3 = payment3 - expectedFee3;

        // Distribute payments to different users
        royaltyDistributor.distributePayment{value: payment1}(user1);
        royaltyDistributor.distributePayment{value: payment2}(user2);
        royaltyDistributor.distributePayment{value: payment3}(user1); // Second payment to user1
    }
}

/**
 * @title MultiplePaymentsStateTest
 * @dev Tests for state with multiple payments
 */
contract MultiplePaymentsStateTest is MultiplePaymentsState {
    /**
     * @dev Test multiple payments distribution
     */
    function testMultiplePaymentsDistribution() public view {
        // Check user1 earnings (2 payments)
        assertEq(
            royaltyDistributor.getEarnings(user1),
            expectedEarnings1 + expectedEarnings3
        );
        assertEq(
            royaltyDistributor.getTotalEarned(user1),
            expectedEarnings1 + expectedEarnings3
        );

        // Check user2 earnings (1 payment)
        assertEq(royaltyDistributor.getEarnings(user2), expectedEarnings2);
        assertEq(royaltyDistributor.getTotalEarned(user2), expectedEarnings2);

        // Check user3 earnings (no payments)
        assertEq(royaltyDistributor.getEarnings(user3), 0);
        assertEq(royaltyDistributor.getTotalEarned(user3), 0);

        // Check total platform fees
        uint256 totalExpectedFees = expectedFee1 + expectedFee2 + expectedFee3;
        assertEq(royaltyDistributor.totalPlatformFees(), totalExpectedFees);
        assertEq(
            royaltyDistributor.getAvailablePlatformFees(),
            totalExpectedFees
        );

        // Check contract balance
        uint256 totalPayments = payment1 + payment2 + payment3;
        assertEq(royaltyDistributor.getBalance(), totalPayments);
    }

    /**
     * @dev Test multiple users withdraw earnings
     */
    function testMultipleUsersWithdrawEarnings() public {
        uint256 initialBalance1 = user1.balance;
        uint256 initialBalance2 = user2.balance;

        // User1 withdraws
        vm.prank(user1);
        royaltyDistributor.withdrawEarnings();

        // User2 withdraws
        vm.prank(user2);
        royaltyDistributor.withdrawEarnings();

        // Check balances
        assertEq(
            user1.balance,
            initialBalance1 + expectedEarnings1 + expectedEarnings3
        );
        assertEq(user2.balance, initialBalance2 + expectedEarnings2);

        // Check earnings reset
        assertEq(royaltyDistributor.getEarnings(user1), 0);
        assertEq(royaltyDistributor.getEarnings(user2), 0);

        // Check total earned unchanged
        assertEq(
            royaltyDistributor.getTotalEarned(user1),
            expectedEarnings1 + expectedEarnings3
        );
        assertEq(royaltyDistributor.getTotalEarned(user2), expectedEarnings2);
    }

    /**
     * @dev Test platform fees withdrawal after multiple payments
     */
    function testPlatformFeesWithdrawalMultiplePayments() public {
        uint256 initialPlatformBalance = platformAddress.balance;
        uint256 totalExpectedFees = expectedFee1 + expectedFee2 + expectedFee3;

        royaltyDistributor.withdrawPlatformFees();

        // Check platform received all fees
        assertEq(
            platformAddress.balance,
            initialPlatformBalance + totalExpectedFees
        );

        // Check fees tracking
        assertEq(
            royaltyDistributor.totalPlatformFeesWithdrawn(),
            totalExpectedFees
        );
        assertEq(royaltyDistributor.getAvailablePlatformFees(), 0);
    }

    /**
     * @dev Test receive function adds to platform fees
     */
    function testReceiveFunctionAddsToPlatformFees() public {
        uint256 directPayment = 1 ether;
        uint256 initialPlatformFees = royaltyDistributor.totalPlatformFees();

        // Send direct payment to contract
        (bool success, ) = address(royaltyDistributor).call{
            value: directPayment
        }("");
        assertTrue(success);

        // Check platform fees increased
        assertEq(
            royaltyDistributor.totalPlatformFees(),
            initialPlatformFees + directPayment
        );
    }

    /**
     * @dev Test fallback function adds to platform fees
     */
    function testFallbackFunctionAddsToPlatformFees() public {
        uint256 directPayment = 2 ether;
        uint256 initialPlatformFees = royaltyDistributor.totalPlatformFees();

        // Send direct payment with data to trigger fallback
        (bool success, ) = address(royaltyDistributor).call{
            value: directPayment
        }("0x1234");
        assertTrue(success);

        // Check platform fees increased
        assertEq(
            royaltyDistributor.totalPlatformFees(),
            initialPlatformFees + directPayment
        );
    }
}

/**
 * @title PartialWithdrawalState
 * @dev State with payments made and some withdrawals completed
 */
abstract contract PartialWithdrawalState is MultiplePaymentsState {
    function setUp() public virtual override {
        super.setUp();

        // User1 withdraws earnings
        vm.prank(user1);
        royaltyDistributor.withdrawEarnings();

        // Withdraw some platform fees
        royaltyDistributor.withdrawPlatformFees();
    }
}

/**
 * @title PartialWithdrawalStateTest
 * @dev Tests for state with partial withdrawals completed
 */
contract PartialWithdrawalStateTest is PartialWithdrawalState {
    /**
     * @dev Test state after partial withdrawals
     */
    function testStateAfterPartialWithdrawals() public view {
        // Check user1 earnings reset but total earned unchanged
        assertEq(royaltyDistributor.getEarnings(user1), 0);
        assertEq(
            royaltyDistributor.getTotalEarned(user1),
            expectedEarnings1 + expectedEarnings3
        );

        // Check user2 earnings unchanged
        assertEq(royaltyDistributor.getEarnings(user2), expectedEarnings2);
        assertEq(royaltyDistributor.getTotalEarned(user2), expectedEarnings2);

        // Check platform fees withdrawn
        uint256 totalExpectedFees = expectedFee1 + expectedFee2 + expectedFee3;
        assertEq(
            royaltyDistributor.totalPlatformFeesWithdrawn(),
            totalExpectedFees
        );
        assertEq(royaltyDistributor.getAvailablePlatformFees(), 0);

        // Check remaining contract balance
        assertEq(royaltyDistributor.getBalance(), expectedEarnings2);
    }

    /**
     * @dev Test cannot withdraw platform fees again
     */
    function testCannotWithdrawPlatformFeesAgain() public {
        vm.expectRevert(RoyaltyDistributor.NoEarningsToWithdraw.selector);
        royaltyDistributor.withdrawPlatformFees();
    }

    /**
     * @dev Test user1 cannot withdraw again
     */
    function testUser1CannotWithdrawAgain() public {
        vm.prank(user1);
        vm.expectRevert(RoyaltyDistributor.NoEarningsToWithdraw.selector);
        royaltyDistributor.withdrawEarnings();
    }

    /**
     * @dev Test user2 can still withdraw
     */
    function testUser2CanStillWithdraw() public {
        uint256 initialBalance = user2.balance;

        vm.prank(user2);
        royaltyDistributor.withdrawEarnings();

        assertEq(user2.balance, initialBalance + expectedEarnings2);
        assertEq(royaltyDistributor.getBalance(), 0);
    }

    /**
     * @dev Test additional payments after withdrawals
     */
    function testAdditionalPaymentsAfterWithdrawals() public {
        uint256 newPayment = 15 ether;
        uint256 expectedNewFee = (newPayment * platformFeePercent) / 100;
        uint256 expectedNewEarnings = newPayment - expectedNewFee;

        // Make new payment to user1
        royaltyDistributor.distributePayment{value: newPayment}(user1);

        // Check user1 has new earnings
        assertEq(royaltyDistributor.getEarnings(user1), expectedNewEarnings);
        assertEq(
            royaltyDistributor.getTotalEarned(user1),
            expectedEarnings1 + expectedEarnings3 + expectedNewEarnings
        );

        // Check new platform fees available
        assertEq(royaltyDistributor.getAvailablePlatformFees(), expectedNewFee);
    }
}
