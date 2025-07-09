# Aurient - Decentralized Health Data Marketplace

[![Live Site](https://img.shields.io/badge/Live%20Site-Aurient-blue?style=for-the-badge&logo=vercel)](https://aurient.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Aurient** is a decentralized health data marketplace that transforms health data into monetizable intellectual property assets. Built for the Story Protocol ecosystem, it specifically targets women's health data and positions itself as an AI-powered wellness insights platform that addresses gaps in traditional medical systems and wearable technology.

## 🎯 Project Overview

Aurient enables users to:

- **Upload and Register**: Upload health data files and register them as IP assets on Story Protocol
- **Monetize Data**: Set pricing and earn royalties from data licensing
- **Browse Marketplace**: Discover and purchase health data licenses
- **AI Insights**: Get personalized health recommendations powered by AI
- **Secure Storage**: Store data on IPFS with blockchain ownership verification

## 🏗️ Architecture

This monorepo contains three main components:

```
aurient-monorepo/
├── contracts/          # Smart contracts (Solidity + Foundry)
├── frontend/           # Next.js web application
├── aurient_data/       # Python data analysis toolkit
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm/yarn
- **Python 3.8+** and pip
- **Foundry** (for smart contracts)
- **MetaMask** or other Web3 wallet

### 1. Frontend (Next.js Application)

The main web application with wallet connection, file upload, and marketplace features.

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

**Features:**

- Wallet connection (MetaMask, etc.)
- File upload to IPFS (PDF, JSON, CSV, TXT up to 50MB)
- Health data preview and metadata extraction
- IP registration on Story Protocol
- Marketplace for browsing and purchasing licenses
- User dashboard with earnings tracking

### 2. Smart Contracts (Foundry)

The blockchain infrastructure for IP registration, marketplace operations, and royalty distribution.

```bash
# Navigate to contracts directory
cd contracts

# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test
```

**Key Features:**

- Health data IP registration and NFT minting
- Marketplace listings and license sales
- Automated royalty distribution
- WIP token integration for payments
- Quality metrics tracking

### 3. Data Analysis Toolkit (Python)

AI-powered health data analysis with Oura Ring integration and personalized insights.

```bash
# Navigate to aurient_data directory
cd aurient_data

# Install dependencies
pip install -r requirements.txt

# Run demo analysis
python oura_demo.py

# Launch interactive dashboard
streamlit run oura_streamlit_app.py
```

**Features:**

- Comprehensive Oura Ring data analysis (14 datasets)
- AI-powered health insights using Claude 3.5 Sonnet
- Interactive visualizations and statistics
- Personalized recommendations based on age and goals
- Data quality assessment and missing value analysis

## 📱 Live Application

**🌐 Live Site:** [https://aurient.vercel.app/](https://aurient.vercel.app/)

The live application includes:

- **Landing Page**: Platform overview and features
- **Registration Flow**: Upload health data and register as IP
- **Dashboard**: Manage assets and track earnings
- **Marketplace**: Browse and purchase health data licenses
- **Insights**: AI-powered health recommendations

### Content Guidelines

- **Registration Flow**: Show complete user onboarding, wallet connection, file upload, and IP registration
- **Licensing Flow**: Demonstrate browsing marketplace, purchasing licenses, and license token receipt
- **Reward Earning Flow**: Show royalty distribution, earnings tracking, and withdrawal process

```markdown
## Demo Videos

### Registration Flow

![Registration Demo](videos/demo/aurient-registration-flow.mp4)

### Licensing Flow

![Licensing Demo](videos/demo/aurient-licensing-flow.mp4)

### Reward Earning Flow

![Reward Demo](videos/demo/aurient-reward-earning-flow.mp4)
```

## 🔧 Development

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/aurient-monorepo.git
   cd aurient-monorepo
   ```

2. **Install all dependencies**

   ```bash
   # Frontend
   cd frontend && npm install

   # Smart contracts
   cd ../contracts && forge install

   # Data analysis
   cd ../aurient_data && pip install -r requirements.txt
   ```

3. **Configure environment variables**

   ```bash
   # Frontend (.env.local)
   NEXT_PUBLIC_STORY_PROTOCOL_ADDRESS=your_story_protocol_address
   NEXT_PUBLIC_WIP_TOKEN_ADDRESS=your_wip_token_address

   # Contracts (.env)
   ETH_FROM=your_deployer_address
   STORY_TEST_RPC=your_testnet_rpc_url
   ```

### Running All Components

```bash
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: Data Analysis (optional)
cd aurient_data && streamlit run oura_streamlit_app.py

# Terminal 3: Contract Development
cd contracts && forge test
```

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm run test
npm run test:e2e
```

### Smart Contract Tests

```bash
cd contracts
forge test
forge test --gas-report
```

### Data Analysis Tests

```bash
cd aurient_data
python test_integration.py
```

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Deploy to Vercel via GitHub integration
```

### Smart Contracts

```bash
cd contracts
forge script script/Deploy.s.sol:DeployHealthDataMarketplace \
    --rpc-url $STORY_MAINNET_RPC --broadcast --verify
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
