# Aurient Health Data Marketplace - Smart Contracts

This directory contains the smart contracts for the Aurient Health Data Marketplace, a decentralized platform for trading health data as intellectual property using Story Protocol.

## Overview

The Aurient Health Data Marketplace enables users to:

- Register health data as IP assets on Story Protocol
- Create marketplace listings for health data licenses
- Purchase licenses for health data using WIP tokens
- Earn royalties from data licensing
- Manage health data collections as NFTs

## Architecture

### Core Contract: `HealthDataMarketplace.sol`

The main contract that handles:

- Health data IP registration and NFT minting
- Marketplace listings and license sales
- Royalty distribution and earnings claims
- Platform fee management
- Collection management

### Key Features

- **IP Registration**: Health data is registered as IP assets using Story Protocol
- **NFT Collection**: Each health data becomes an NFT in the "Aurient Health Data" collection
- **License Marketplace**: Users can list and purchase licenses for health data
- **Royalty System**: Automatic royalty distribution to IP owners
- **WIP Integration**: Native integration with Aeneid's WIP token
- **Quality Metrics**: Support for health data quality assessment

## Prerequisites

- [Foundry](https://getfoundry.sh/) (latest version)
- Node.js and Yarn
- Access to Story Protocol testnet/mainnet

## Installation

1. **Install Foundry** (if not already installed):

   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Install Dependencies**:

   ```bash
   cd contracts
   forge install
   yarn install
   ```

3. **Build Contracts**:
   ```bash
   forge build
   ```

## Configuration

### Environment Variables

Create a `.env` file in the contracts directory:

```bash
# Deployer wallet
ETH_FROM=0xYourDeployerAddress

# RPC URLs
STORY_TEST_RPC=https://your-testnet-rpc-url
STORY_MAINNET_RPC=https://your-mainnet-rpc-url

# Verification URLs
VERIFIER_TEST_URL=https://your-testnet-explorer/api
VERIFIER_MAINNET_URL=https://your-mainnet-explorer/api
```

### Story Protocol Addresses

Update the following addresses in the deployment script:

- `LICENSING_MODULE`
- `PIL_TEMPLATE`
- `ROYALTY_MODULE`
- `LICENSE_ATTACHMENT_WORKFLOWS`

## Development

### Compilation

```bash
# Build all contracts
forge build

# Build with optimization
forge build --optimize --optimizer-runs 20000
```

### Testing

```bash
# Run all tests
forge test

# Run tests with gas reporting
forge test --gas-report

# Run specific test
forge test --match-test testFunctionName

# Run tests with verbose output
forge test -vvv
```

### Code Quality

```bash
# Format code
forge fmt

# Lint code
forge lint

# Check for security issues
forge build --sizes
```

## Deployment

### Prerequisites

1. **Import Deployer Wallet**:

   ```bash
   cast wallet import deployer --interactive
   ```

2. **Update Story Protocol Addresses**: Edit the deployment script with correct addresses

3. **Set Environment Variables**: Configure your `.env` file

### Deploy to Testnet

```bash
forge script script/DeployHealthDataMarketplace.s.sol:DeployHealthDataMarketplace \
    --account deployer --sender $ETH_FROM \
    --rpc-url $STORY_TEST_RPC --broadcast \
    --verify --verifier blockscout \
    --verifier-url $VERIFIER_TEST_URL \
    -vvvv --optimize --optimizer-runs 20000
```

### Deploy to Mainnet

```bash
forge script script/DeployHealthDataMarketplace.s.sol:DeployHealthDataMarketplace \
    --account deployer --sender $ETH_FROM \
    --rpc-url $STORY_MAINNET_RPC --broadcast \
    --verify --verifier blockscout \
    --verifier-url $VERIFIER_MAINNET_URL \
    -vvvv --optimize --optimizer-runs 20000
```

For detailed deployment instructions, see [script/README.md](./script/README.md).

## Contract Functions

### Owner Functions

- `initializeHealthDataCollection()`: Initialize the NFT collection
- `setPlatformFee(uint256)`: Update platform fee percentage
- `withdrawPlatformFees()`: Withdraw accumulated platform fees
- `emergencyWithdraw()`: Emergency withdrawal of all tokens

### User Functions

- `registerHealthDataIP()`: Register health data as IP and create listing
- `purchaseLicense()`: Purchase a license for health data
- `claimEarnings()`: Claim earnings from IP royalties
- `removeListing()`: Remove a listing from marketplace

### View Functions

- `getActiveListings()`: Get all active marketplace listings
- `getListingsByDataType()`: Get listings filtered by data type
- `getUserListings()`: Get listings by specific user
- `getLicensePrice()`: Get license price for specific IP
- `isCollectionSetup()`: Check if collection is initialized

## Contract Structure

```
HealthDataMarketplace
├── State Variables
│   ├── Story Protocol contracts
│   ├── WIP token
│   ├── Collection management
│   └── Marketplace data
├── Mappings
│   ├── listings
│   ├── userListings
│   ├── listingsByDataType
│   └── healthDataMetadata
└── Events
    ├── HealthDataRegistered
    ├── ListingCreated
    ├── LicensePurchased
    └── EarningsClaimed
```

## Security Features

- **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
- **Access Control**: Owner-only functions for administrative tasks
- **Input Validation**: Comprehensive parameter validation
- **Emergency Functions**: Emergency withdrawal capabilities
- **Safe Math**: Built-in overflow protection (Solidity 0.8+)

## Gas Optimization

- **Optimizer Runs**: 20,000 for optimal gas efficiency
- **Efficient Storage**: Packed structs and optimized mappings
- **Batch Operations**: Support for batch operations where possible
- **Minimal External Calls**: Reduced external contract interactions

## Testing Strategy

### Unit Tests

- Contract deployment and initialization
- Health data registration
- Marketplace operations
- Royalty distribution
- Access control
- Error handling

### Integration Tests

- Story Protocol integration
- WIP token interactions
- End-to-end workflows

### Gas Tests

- Gas consumption for key operations
- Optimization verification

## Monitoring and Maintenance

### Key Metrics to Monitor

- Total health data registrations
- Marketplace transaction volume
- Royalty distribution amounts
- Platform fee accumulation
- Collection growth

### Maintenance Tasks

- Regular platform fee withdrawals
- Monitor for potential upgrades
- Address whitelist management (if needed)
- Emergency response procedures

## Troubleshooting

### Common Issues

1. **Compilation Errors**: Check Solidity version and import paths
2. **Deployment Failures**: Verify Story Protocol addresses and gas limits
3. **Test Failures**: Ensure proper test environment setup
4. **Gas Issues**: Optimize contract or increase gas limits

### Debug Commands

```bash
# Debug specific test
forge test --match-test testName -vvvv

# Check contract size
forge build --sizes

# Verify deployment
forge verify-contract --chain-id <id> <address> src/HealthDataMarketplace.sol:HealthDataMarketplace
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Support

For questions and support:

- Create an issue in the repository
- Check the [documentation](./script/README.md)
- Review the test files for usage examples
