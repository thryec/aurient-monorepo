// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {HealthDataMarketplace} from "../src/HealthDataMarketplace.sol";

/**
 * @title DeployHealthDataMarketplace
 * @dev Deployment script for HealthDataMarketplace contract

 *
 * @dev forge script script/DeployHealthDataMarketplace.s.sol:DeployHealthDataMarketplace \
 *           --account deployer --sender $ETH_FROM \
 *           --rpc-url $STORY_TEST_RPC --broadcast \
 *           --verify --verifier blockscout \
 *           --verifier-url $VERIFIER_TEST_URL \
 *           -vvvv --optimize --optimizer-runs 20000
 */
contract Deploy is Script {
    // Story Protocol contract addresses (testnet)
    // These should be updated based on the actual deployed addresses
    address constant REGISTRATION_WORKFLOWS =
        0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424;
    address constant LICENSING_MODULE =
        0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f;
    address constant PIL_TEMPLATE = 0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316; // TODO: Update with actual address
    address constant ROYALTY_MODULE =
        0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086; // TODO: Update with actual address
    address constant ROYALTY_POLICY_LAP =
        0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E;
    address constant LICENSE_ATTACHMENT_WORKFLOWS =
        0xcC2E862bCee5B6036Db0de6E06Ae87e524a79fd8; // TODO: Update with actual address

    // WIP token address on Aeneid
    address constant WIP_TOKEN = 0x1514000000000000000000000000000000000000;

    // Platform fee percentage (5%)
    uint256 constant PLATFORM_FEE_PERCENT = 5;

    // Deployed contract address (will be set during deployment)
    HealthDataMarketplace healthDataMarketplace;

    function run() external {
        _run();
    }

    function _run() public {
        address deployer = vm.envAddress("ETH_FROM");

        console.log(
            "Deploying HealthDataMarketplace contract with deployer:",
            deployer
        );
        console.log("Deployer balance:", deployer.balance);

        // Validate required addresses
        _validateAddresses();

        vm.startBroadcast();

        // Deploy HealthDataMarketplace
        healthDataMarketplace = new HealthDataMarketplace(
            REGISTRATION_WORKFLOWS,
            LICENSING_MODULE,
            PIL_TEMPLATE,
            ROYALTY_MODULE,
            ROYALTY_POLICY_LAP,
            LICENSE_ATTACHMENT_WORKFLOWS,
            WIP_TOKEN,
            PLATFORM_FEE_PERCENT
        );
        console.log(
            "HealthDataMarketplace deployed at:",
            address(healthDataMarketplace)
        );

        // Initialize the health data collection
        healthDataMarketplace.initializeHealthDataCollection();
        console.log("Health data collection initialized");

        vm.stopBroadcast();

        // Log deployment summary
        logDeploymentSummary();

        // Save deployment addresses to file
        saveDeploymentAddresses();
    }

    /**
     * @dev Validate that all required addresses are set
     */
    function _validateAddresses() internal view {
        require(
            REGISTRATION_WORKFLOWS != address(0),
            "REGISTRATION_WORKFLOWS not set"
        );
        require(LICENSING_MODULE != address(0), "LICENSING_MODULE not set");
        require(PIL_TEMPLATE != address(0), "PIL_TEMPLATE not set");
        require(ROYALTY_MODULE != address(0), "ROYALTY_MODULE not set");
        require(ROYALTY_POLICY_LAP != address(0), "ROYALTY_POLICY_LAP not set");
        require(
            LICENSE_ATTACHMENT_WORKFLOWS != address(0),
            "LICENSE_ATTACHMENT_WORKFLOWS not set"
        );
        require(WIP_TOKEN != address(0), "WIP_TOKEN not set");
    }

    function logDeploymentSummary() internal view {
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("HealthDataMarketplace:", address(healthDataMarketplace));

        console.log("\n=== STORY PROTOCOL ADDRESSES ===");
        console.log("Registration Workflows:", REGISTRATION_WORKFLOWS);
        console.log("Licensing Module:", LICENSING_MODULE);
        console.log("PIL Template:", PIL_TEMPLATE);
        console.log("Royalty Module:", ROYALTY_MODULE);
        console.log("Royalty Policy LAP:", ROYALTY_POLICY_LAP);
        console.log(
            "License Attachment Workflows:",
            LICENSE_ATTACHMENT_WORKFLOWS
        );

        console.log("\n=== TOKEN ADDRESSES ===");
        console.log("WIP Token:", WIP_TOKEN);

        console.log("\n=== CONFIGURATION ===");
        console.log("Platform Fee Percent:", PLATFORM_FEE_PERCENT, "%");
        console.log("Collection Name:", "Aurient Health Data");
        console.log("Collection Symbol:", "AURIENT");
        // console.log("Max Supply:", 10000);
    }

    function saveDeploymentAddresses() internal {
        string memory json = string.concat(
            "{\n",
            '  "HealthDataMarketplace": "',
            vm.toString(address(healthDataMarketplace)),
            '",\n',
            '  "RegistrationWorkflows": "',
            vm.toString(REGISTRATION_WORKFLOWS),
            '",\n',
            '  "LicensingModule": "',
            vm.toString(LICENSING_MODULE),
            '",\n',
            '  "PILTemplate": "',
            vm.toString(PIL_TEMPLATE),
            '",\n',
            '  "RoyaltyModule": "',
            vm.toString(ROYALTY_MODULE),
            '",\n',
            '  "RoyaltyPolicyLAP": "',
            vm.toString(ROYALTY_POLICY_LAP),
            '",\n',
            '  "LicenseAttachmentWorkflows": "',
            vm.toString(LICENSE_ATTACHMENT_WORKFLOWS),
            '",\n',
            '  "WIPToken": "',
            vm.toString(WIP_TOKEN),
            '",\n',
            '  "PlatformFeePercent": ',
            vm.toString(PLATFORM_FEE_PERCENT),
            "\n}"
        );

        vm.writeFile(
            "./deployments/health-data-marketplace-addresses.json",
            json
        );
        console.log(
            "\nDeployment addresses saved to ./deployments/health-data-marketplace-addresses.json"
        );
    }
}
