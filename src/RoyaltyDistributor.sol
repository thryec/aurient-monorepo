// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RoyaltyDistributor
 * @dev Handle native $IP payment distribution and user earnings
 */
contract RoyaltyDistributor is Ownable, ReentrancyGuard {
    // Custom Errors
    error NoEarningsToWithdraw();
    error WithdrawalFailed();
    error ZeroAddress();
    error InvalidFeePercent();

    // State Variables
    mapping(address => uint256) public earnings;
    mapping(address => uint256) public totalEarned;
    uint256 public platformFeePercent;
    uint256 public totalPlatformFees;
    uint256 public totalPlatformFeesWithdrawn;
    address public platformAddress;

    // Events
    event PaymentDistributed(
        address indexed dataOwner,
        uint256 userEarnings,
        uint256 platformFee,
        uint256 totalAmount
    );
    event EarningsWithdrawn(address indexed user, uint256 amount);
    event PlatformFeesWithdrawn(address indexed platform, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event PlatformAddressUpdated(
        address indexed oldAddress,
        address indexed newAddress
    );

    /**
     * @dev Constructor
     * @param _platformAddress Address to receive platform fees
     * @param _platformFeePercent Platform fee percentage (e.g., 5 for 5%)
     */
    constructor(
        address _platformAddress,
        uint256 _platformFeePercent
    ) Ownable(msg.sender) {
        if (_platformAddress == address(0)) revert ZeroAddress();
        if (_platformFeePercent > 100) revert InvalidFeePercent();

        platformAddress = _platformAddress;
        platformFeePercent = _platformFeePercent;
    }

    /**
     * @dev Distribute payment between data owner and platform
     * @param dataOwner Address of the data owner who should receive payment
     */
    function distributePayment(
        address dataOwner
    ) external payable nonReentrant {
        if (dataOwner == address(0)) revert ZeroAddress();

        uint256 totalAmount = msg.value;
        uint256 platformFee = (totalAmount * platformFeePercent) / 100;
        uint256 userEarnings = totalAmount - platformFee;

        // Update earnings tracking
        earnings[dataOwner] += userEarnings;
        totalEarned[dataOwner] += userEarnings;
        totalPlatformFees += platformFee;

        emit PaymentDistributed(
            dataOwner,
            userEarnings,
            platformFee,
            totalAmount
        );
    }

    /**
     * @dev Withdraw earnings for the caller
     */
    function withdrawEarnings() external nonReentrant {
        uint256 amount = earnings[msg.sender];
        if (amount == 0) revert NoEarningsToWithdraw();

        earnings[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert WithdrawalFailed();

        emit EarningsWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Withdraw platform fees (only owner)
     */
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 availableFees = totalPlatformFees - totalPlatformFeesWithdrawn;
        if (availableFees == 0) revert NoEarningsToWithdraw();

        totalPlatformFeesWithdrawn += availableFees;

        (bool success, ) = payable(platformAddress).call{value: availableFees}(
            ""
        );
        if (!success) revert WithdrawalFailed();

        emit PlatformFeesWithdrawn(platformAddress, availableFees);
    }

    /**
     * @dev Withdraw platform fees to a specific address (only owner)
     * @param recipient Address to receive the platform fees
     */
    function withdrawPlatformFeesTo(
        address recipient
    ) external onlyOwner nonReentrant {
        if (recipient == address(0)) revert ZeroAddress();

        uint256 availableFees = totalPlatformFees - totalPlatformFeesWithdrawn;
        if (availableFees == 0) revert NoEarningsToWithdraw();

        totalPlatformFeesWithdrawn += availableFees;

        (bool success, ) = payable(recipient).call{value: availableFees}("");
        if (!success) revert WithdrawalFailed();

        emit PlatformFeesWithdrawn(recipient, availableFees);
    }

    /**
     * @dev Set platform fee percentage (only owner)
     * @param feePercent New fee percentage (0-100)
     */
    function setPlatformFee(uint256 feePercent) external onlyOwner {
        if (feePercent > 100) revert InvalidFeePercent();

        uint256 oldFee = platformFeePercent;
        platformFeePercent = feePercent;

        emit PlatformFeeUpdated(oldFee, feePercent);
    }

    /**
     * @dev Set platform address (only owner)
     * @param _platformAddress New platform address
     */
    function setPlatformAddress(address _platformAddress) external onlyOwner {
        if (_platformAddress == address(0)) revert ZeroAddress();

        address oldAddress = platformAddress;
        platformAddress = _platformAddress;

        emit PlatformAddressUpdated(oldAddress, _platformAddress);
    }

    /**
     * @dev Get earnings for a specific user
     * @param user Address to check earnings for
     * @return Current withdrawable earnings
     */
    function getEarnings(address user) external view returns (uint256) {
        return earnings[user];
    }

    /**
     * @dev Get total earnings ever earned by a user
     * @param user Address to check total earnings for
     * @return Total earnings ever earned (including withdrawn)
     */
    function getTotalEarned(address user) external view returns (uint256) {
        return totalEarned[user];
    }

    /**
     * @dev Get available platform fees to withdraw
     * @return Available platform fees
     */
    function getAvailablePlatformFees() external view returns (uint256) {
        return totalPlatformFees - totalPlatformFeesWithdrawn;
    }

    /**
     * @dev Get total platform fees collected
     * @return Total platform fees collected
     */
    function getTotalPlatformFees() external view returns (uint256) {
        return totalPlatformFees;
    }

    /**
     * @dev Get total platform fees withdrawn
     * @return Total platform fees withdrawn
     */
    function getTotalPlatformFeesWithdrawn() external view returns (uint256) {
        return totalPlatformFeesWithdrawn;
    }

    /**
     * @dev Get contract balance
     * @return Current contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Emergency withdrawal function (only owner)
     * @dev Should only be used in case of emergency
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) revert WithdrawalFailed();
    }

    /**
     * @dev Receive function to accept direct payments
     */
    receive() external payable {
        // Contract can receive payments directly
        // These will be counted as platform fees if no specific distribution is called
        totalPlatformFees += msg.value;
    }

    /**
     * @dev Fallback function
     */
    fallback() external payable {
        // Fallback to receive function behavior
        totalPlatformFees += msg.value;
    }
}
