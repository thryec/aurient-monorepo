import { defineChain } from "viem";
import { AURIENT_ABI } from "./abis/aurient";

export const CONTRACTS = {
  Aurient: "0x0A5F8a4c1aa7Efb41219918cbb63e7DB02dE1437" as const,
} as const;

// Contract configuration
export const CONTRACT_CONFIG = {
  HEALTH_DATA_MARKETPLACE_ADDRESS: CONTRACTS.Aurient,
  WIP_TOKEN: "0x0000000000000000000000000000000000000000", // TODO: Replace with actual WIP token address
} as const;

export const HEALTH_DATA_MARKETPLACE_ABI = AURIENT_ABI;

export const storyTestnet = defineChain({
  id: 1315,
  name: "Story Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "IP",
    symbol: "IP",
  },
  rpcUrls: {
    default: { http: ["https://aeneid.storyrpc.io"] },
  },
  blockExplorers: {
    default: {
      name: "Story Testnet Explorer",
      url: "https://aeneid.storyscan.io",
    },
  },
  testnet: true,
});

// Type definitions for contract interactions
export interface Listing {
  listingId: number;
  seller: string;
  ipId: string;
  priceIP: string;
  dataType: string;
  active: boolean;
  createdAt: number;
}

export interface HealthDataMetadata {
  ipMetadataURI: string;
  ipMetadataHash: string;
  nftMetadataURI: string;
  nftMetadataHash: string;
  dataType: string;
  qualityMetrics: string;
}

// Contract function parameter types
export interface RegisterHealthDataParams {
  dataType: string;
  ipfsHash: string;
  priceIP: string;
  qualityMetrics: string;
}

export interface PurchaseLicenseParams {
  listingId: number;
  value: string; // Amount in wei
}
