# Aurient Frontend

A Next.js frontend for the Aurient health data marketplace, built with TypeScript and Tailwind CSS.

## Features

- **Wallet Connection**: Connect to Web3 wallets (MetaMask, etc.)
- **File Upload**: Upload health data files (PDF, JSON, CSV) to IPFS using Helia
- **Data Preview**: Preview uploaded health data and metadata
- **IP Registration**: Register health data as intellectual property on Story Protocol
- **Marketplace**: Browse and purchase health data licenses

## File Upload with IPFS

The application now includes a file upload step in the registration flow that allows users to:

- Upload health data files (PDF, JSON, CSV) from their local computer
- Store files securely on IPFS using Helia
- Preview uploaded files before proceeding with IP registration
- Track upload progress and status

### Supported File Types

- **PDF** (.pdf) - Health reports, medical documents
- **JSON** (.json) - Structured health data, API responses
- **CSV** (.csv) - Tabular health data, sensor readings
- **Text** (.txt) - Plain text health data

### File Size Limits

- Maximum file size: 50MB per file
- Multiple files can be uploaded in a single session

### IPFS Integration

Files are uploaded to IPFS using Helia, a modern IPFS client for JavaScript:

- **Secure Storage**: Files are distributed across the IPFS network
- **Content Addressing**: Files are identified by their content hash
- **Decentralized**: No single point of failure
- **Immutable**: Files cannot be modified once uploaded

### Usage

1. Navigate to the registration flow (`/register`)
2. Connect your wallet
3. Upload your health data files using the drag-and-drop interface
4. Wait for files to be uploaded to IPFS
5. Preview your data and set pricing
6. Register your health data as intellectual property

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
npm run build
npm start
```

## Dependencies

### Core

- **Next.js 15**: React framework
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling

### Web3 & Blockchain

- **viem**: Ethereum client
- **Story Protocol**: IP registration and licensing

### IPFS

- **Helia**: Modern IPFS client
- **@helia/unixfs**: File system interface
- **@helia/dag-json**: JSON data storage

### UI Components

- **lucide-react**: Icons
- **axios**: HTTP client

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── register/          # Registration flow
│   ├── dashboard/         # User dashboard
│   └── marketplace/       # Data marketplace
├── components/            # React components
│   ├── health-data/       # Health data components
│   ├── wallet/           # Wallet connection
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and services
│   ├── ipfs.ts          # IPFS integration
│   ├── constants.ts     # App constants
│   └── types.ts         # TypeScript types
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
