# HealthDataMarketplace Deployment

This directory contains deployment scripts for the HealthDataMarketplace contract.

## Prerequisites

1. **Foundry Setup**: Make sure you have Foundry installed and configured
2. **Environment Variables**: Set up your deployment environment
3. **Story Protocol Addresses**: Update the contract addresses in the deployment script

## Environment Setup

Create a `.env` file in the contracts directory with the following variables:

```bash
# Deployer wallet private key (will be imported via cast)
ETH_FROM=0xYourDeployerAddress

# RPC URLs
STORY_TEST_RPC=https://your-testnet-rpc-url
STORY_MAINNET_RPC=https://your-mainnet-rpc-url

# Verification URLs (for Blockscout)
VERIFIER_TEST_URL=https://your-testnet-explorer/api
VERIFIER_MAINNET_URL=https://your-mainnet-explorer/api
```

## Story Protocol Contract Addresses

Before deploying, you need to update the following addresses in `DeployHealthDataMarketplace.s.sol`:

```solidity
// Current placeholder addresses - UPDATE THESE
address constant LICENSING_MODULE = 0x0000000000000000000000000000000000000000;
address constant PIL_TEMPLATE = 0x0000000000000000000000000000000000000000;
address constant ROYALTY_MODULE = 0x0000000000000000000000000000000000000000;
address constant LICENSE_ATTACHMENT_WORKFLOWS = 0x0000000000000000000000000000000000000000;
```

### How to Find Story Protocol Addresses

1. **Testnet**: Check the Story Protocol documentation for testnet addresses
2. **Mainnet**: Use the official Story Protocol mainnet addresses
3. **Local Development**: Deploy Story Protocol contracts locally for testing

## Deployment Steps

### 1. Import Deployer Wallet

```bash
cast wallet import deployer --interactive
```

### 2. Deploy to Testnet

```bash
forge script script/DeployHealthDataMarketplace.s.sol:DeployHealthDataMarketplace \
    --account deployer --sender $ETH_FROM \
    --rpc-url $STORY_TEST_RPC --broadcast \
    --verify --verifier blockscout \
    --verifier-url $VERIFIER_TEST_URL \
    -vvvv --optimize --optimizer-runs 20000
```

### 3. Deploy to Mainnet

```bash
forge script script/DeployHealthDataMarketplace.s.sol:DeployHealthDataMarketplace \
    --account deployer --sender $ETH_FROM \
    --rpc-url $STORY_MAINNET_RPC --broadcast \
    --verify --verifier blockscout \
    --verifier-url $VERIFIER_MAINNET_URL \
    -vvvv --optimize --optimizer-runs 20000
```

## Configuration

The deployment script configures the following parameters:

- **Platform Fee**: 5% (configurable in the script)
- **Collection Name**: "Aurient Health Data"
- **Collection Symbol**: "AURIENT"
- **Max Supply**: 10,000 NFTs
- **WIP Token**: Aeneid's wrapped IP token

## Post-Deployment

After successful deployment:

1. **Addresses Saved**: Deployment addresses are automatically saved to `./deployments/health-data-marketplace-addresses.json`
2. **Collection Initialized**: The health data collection is automatically initialized
3. **Owner Setup**: The deployer becomes the contract owner

## Contract Functions

### Owner Functions

- `initializeHealthDataCollection()`: Initialize the NFT collection (called automatically)
- `setPlatformFee(uint256)`: Update platform fee percentage
- `withdrawPlatformFees()`: Withdraw accumulated platform fees
- `emergencyWithdraw()`: Emergency withdrawal of all tokens

### User Functions

- `registerHealthDataIP()`: Register health data as IP and create listing
- `purchaseLicense()`: Purchase a license for health data
- `claimEarnings()`: Claim earnings from IP royalties
- `removeListing()`: Remove a listing from marketplace

## Verification

The deployment script includes automatic contract verification. If verification fails, you can manually verify:

```bash
forge verify-contract \
    --chain-id <chain-id> \
    --compiler-version <version> \
    --constructor-args <args> \
    <contract-address> \
    src/HealthDataMarketplace.sol:HealthDataMarketplace
```

## Troubleshooting

### Common Issues

1. **Insufficient Gas**: Ensure deployer has enough native tokens for gas
2. **Invalid Addresses**: Verify all Story Protocol addresses are correct
3. **Verification Failures**: Check that compiler settings match deployment
4. **Permission Errors**: Ensure deployer is the contract owner for initialization

### Testing

Before mainnet deployment, test thoroughly on testnet:

```bash
# Run tests
forge test

# Run with gas reporting
forge test --gas-report
```
