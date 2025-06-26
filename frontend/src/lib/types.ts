// src/lib/types.ts

export interface HealthDataMetrics {
  averageSleepDuration: string;
  averageHRV: string;
  dataPoints: number;
  qualityScore: number;
}

export interface HealthData {
  id: string;
  dataType: string;
  metrics: HealthDataMetrics;
  timeRange: string;
  anonymized: boolean;
  ipfsHash?: string;
}

export interface IPAsset {
  id: string;
  ipId: string;
  tokenId: string;
  owner: string;
  dataType: string;
  price: string;
  qualityScore: number;
  listedDate: string;
  isActive: boolean;
  earnings?: string;
  healthData: HealthData;
}

export interface MarketplaceListing {
  id: string;
  ipId: string;
  dataType: string;
  price: string;
  qualityScore: number;
  seller: string;
  listedDate: string;
  description: string;
}

export interface UserEarnings {
  totalEarned: string;
  claimableBalance: string;
  recentSales: Sale[];
}

export interface Sale {
  id: string;
  buyerAddress: string;
  amount: string;
  date: string;
  ipId: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
}

export interface TransactionState {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  txHash?: string;
  error?: string;
}

export type UserType = "provider" | "licenser" | null;
