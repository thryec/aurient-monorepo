# Aurient Monorepo Guide

## 🏗️ Project Overview

**Aurient** is a decentralized health data marketplace that transforms health data into monetizable intellectual property assets. Built for the Story Protocol Hackathon, it specifically targets women's health data and positions itself as an AI-powered wellness insights platform that addresses gaps in traditional medical systems and wearable technology.

### Core Mission
Transform health data into IP assets using blockchain technology, allowing users to maintain ownership while monetizing their health information for AI model training and research.

---

## 📁 Monorepo Structure

```
aurient-monorepo/
├── contracts/          # Smart contracts (Solidity + Foundry)
├── frontend/           # Next.js web application
├── aurient_data/       # Python data analysis toolkit
├── .gitignore         # Comprehensive ignore rules
└── README.md          # Project documentation
```

---

## 🔗 Smart Contracts (`/contracts/`)

### Technology Stack
- **Solidity 0.8.26** with Foundry framework
- **Story Protocol** integration for IP management
- **OpenZeppelin** contracts for security standards
- **WIP Token** (Wrapped IP) for payments

### Key Files
- `src/HealthDataMarketplace.sol` - Main marketplace contract
- `test/HealthDataMarketplace.t.sol` - Contract tests
- `script/Deploy.s.sol` - Deployment scripts
- `foundry.toml` - Foundry configuration

### Core Features

#### IP Asset Management
- Register health data as NFTs in the "Aurient Health Data" collection
- Integrate with Story Protocol for IP registration workflows
- Automatic IP asset creation with metadata

#### Marketplace Operations
- List IP assets with custom pricing
- Purchase licenses using WIP tokens
- Automatic token wrapping (ETH → WIP)
- Quality metrics tracking for data assets

#### Royalty System
- Automated royalty distribution to IP owners
- Platform fee collection (configurable percentage)
- Earnings tracking and withdrawal system
- Multiple revenue streams per asset

#### Security Features
- ReentrancyGuard protection
- Access control mechanisms
- Input validation and sanitization
- Emergency withdrawal capabilities

---

## 🌐 Frontend (`/frontend/`)

### Technology Stack
- **Next.js 15** with React 19 and TypeScript
- **Tailwind CSS** for responsive styling
- **Helia** for IPFS integration
- **Viem** for Ethereum blockchain interactions
- **Pinata** for IPFS file storage

### Application Structure

#### Core Pages
- `/` - Landing page with platform overview
- `/register` - Health data upload and IP registration
- `/dashboard` - User asset management and earnings
- `/marketplace` - Browse and purchase health data licenses
- `/insights` - AI-powered health recommendations

#### Component Architecture
```
src/components/
├── health-data/       # Data upload and preview components
├── navigation/        # Header and navigation
├── insights/          # AI insights display
├── ui/               # Reusable UI components
└── wallet/           # Wallet connection components
```

### Key Features

#### Data Upload System
- Support for PDF, JSON, CSV, TXT files (up to 50MB)
- IPFS storage with Pinata integration
- Metadata extraction and validation
- Preview functionality for uploaded data

#### Wallet Integration
- MetaMask connection
- Multi-wallet support via hooks
- Transaction handling and status tracking
- Automatic network switching

#### Marketplace Experience
- Browse available health data licenses
- Filter by data type, quality, and price
- Purchase flow with WIP token integration
- License token receipt for purchased data

#### User Dashboard
- View owned IP assets and performance metrics
- Track earnings and royalty payments
- Claim accumulated royalties
- Asset management tools

---

## 🧠 Story Protocol Integration

### IP Asset Creation
- Health data files become registered IP assets
- NFT minting with comprehensive metadata
- Integration with Story Protocol's registration workflows
- Automatic IP asset ID generation

### Licensing System
- PIL (Programmable IP License) templates
- Customizable license terms and pricing
- Automated license token distribution
- License attachment workflows

### Royalty Distribution
- Automated royalty payments to IP owners
- Multi-tiered revenue sharing
- Platform fee collection
- Transparent earnings tracking

---

## 🏛️ Technical Architecture

### Smart Contract Flow
```
User Upload → IPFS Storage → Contract Registration → IP Asset Creation → Marketplace Listing → License Purchase → Royalty Distribution
```

### Frontend Data Flow
```
Wallet Connection → File Upload → IPFS Storage → Contract Interaction → Transaction Confirmation → Dashboard Update
```

### Integration Points
- **IPFS**: Decentralized file storage
- **Story Protocol**: IP management infrastructure
- **Ethereum**: Blockchain settlement layer
- **WIP Token**: Payment and royalty currency

---

## 💰 Revenue Model

### For Data Providers
- Upload health data securely to IPFS
- Register data as IP assets with quality metrics
- Set licensing prices and terms
- Earn ongoing royalties from data licensing

### For Data Licensers
- Browse comprehensive health data marketplace
- Purchase licenses with WIP tokens
- Access licensed data through IPFS
- Receive license tokens as proof of purchase

### For Platform
- Configurable platform fees on transactions
- Emergency withdrawal capabilities
- Collection management and curation
- Analytics and insights generation

---

## 🔒 Security & Privacy

### Decentralized Storage
- Health data stored on IPFS, not centralized servers
- Content addressing for data integrity
- Distributed availability and redundancy

### Blockchain Ownership
- Clear ownership through NFTs and IP registration
- Immutable ownership records
- Transparent transaction history

### Smart Contract Security
- ReentrancyGuard protection
- Access controls and permissions
- Input validation and sanitization
- Emergency pause mechanisms

### Privacy Preservation
- Data can be anonymized while maintaining utility
- Selective disclosure mechanisms
- User-controlled privacy settings

---

## 🚀 Development Status

### Completed Features
- Smart contract marketplace implementation
- Frontend registration and marketplace flows
- IPFS integration for file storage
- Story Protocol IP asset integration
- Wallet connection and transaction handling

### In Progress
- AI insights generation and display
- Advanced marketplace filtering and search
- Royalty claim user interface
- Data quality assessment tools

### Future Enhancements
- Multi-chain support
- Enhanced AI analytics
- Data marketplace recommendations
- Advanced licensing models

---

## 📊 Data Types Supported

### Core Health Metrics
- Daily activity and movement data
- Sleep patterns and quality metrics
- Readiness and recovery scores
- Heart rate and cardiovascular data

### Advanced Metrics
- VO2 max and fitness assessments
- Stress and resilience tracking
- SpO2 and respiratory data
- Workout and session analytics

### Metadata
- Data quality scores
- Collection timeframes
- Device information
- User demographics (anonymized)

---

## 🎯 Target Market

### Primary Users
- Women seeking to monetize health data
- AI companies training health models
- Researchers studying women's health
- Healthcare providers and insurers

### Use Cases
- Personalized health recommendations
- Medical research and clinical trials
- AI model training and validation
- Population health studies

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ for frontend development
- Foundry for smart contract development
- MetaMask wallet for testing
- Git for version control

### Development Setup
1. Clone the repository
2. Install dependencies in each directory
3. Configure environment variables
4. Run local development servers
5. Deploy contracts to testnet

### Testing
- Smart contract tests with Foundry
- Frontend testing with Jest/React Testing Library
- Integration testing with testnet deployment
- User acceptance testing on staging

---

This monorepo represents a comprehensive platform for the emerging health data economy, combining cutting-edge blockchain technology with practical health data applications to create value for all stakeholders in the ecosystem.