// src/lib/constants.ts

import { HealthData, MarketplaceListing, IPAsset } from "./types";

export const STORY_PROTOCOL_CONTRACTS = {
  IP_ASSET_REGISTRY: "0x77319B4031e6eF1250907aa00018B8B1c67a244b",
  LICENSING_MODULE: "0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f",
  PIL_TEMPLATE: "0x2E896b0b2Fdb7457499B56AAaA4E55BCB4Cd316",
  REGISTRATION_WORKFLOWS: "0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424",
};

export const MOCK_HEALTH_DATA: HealthData[] = [
  {
    id: "1",
    dataType: "Sleep & HRV",
    metrics: {
      averageSleepDuration: "7.2 hours",
      averageHRV: "45ms",
      dataPoints: 180,
      qualityScore: 8.7,
    },
    timeRange: "6 months",
    anonymized: true,
    ipfsHash: "QmXXX123sleep",
  },
  {
    id: "2",
    dataType: "Activity & Recovery",
    metrics: {
      averageSleepDuration: "7.5 hours",
      averageHRV: "52ms",
      dataPoints: 220,
      qualityScore: 9.1,
    },
    timeRange: "8 months",
    anonymized: true,
    ipfsHash: "QmXXX456activity",
  },
  {
    id: "3",
    dataType: "Stress & Nutrition",
    metrics: {
      averageSleepDuration: "6.8 hours",
      averageHRV: "38ms",
      dataPoints: 150,
      qualityScore: 7.9,
    },
    timeRange: "5 months",
    anonymized: true,
    ipfsHash: "QmXXX789stress",
  },
];

export const MOCK_MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  {
    id: "1",
    ipId: "0x123...abc",
    dataType: "Sleep & HRV",
    price: "5 IP",
    qualityScore: 8.7,
    seller: "0xabc...123",
    listedDate: "2025-06-01",
    description:
      "High-quality sleep and HRV data from 6-month tracking period. Includes detailed sleep stages, recovery metrics, and stress indicators.",
  },
  {
    id: "2",
    ipId: "0x456...def",
    dataType: "Activity & Recovery",
    price: "10 IP",
    qualityScore: 9.1,
    seller: "0xdef...456",
    listedDate: "2025-06-02",
    description:
      "Comprehensive activity and recovery dataset with workout performance, recovery protocols, and adaptation metrics.",
  },
  {
    id: "3",
    ipId: "0x789...ghi",
    dataType: "Nutrition & Metabolics",
    price: "6 IP",
    qualityScore: 8.3,
    seller: "0xghi...789",
    listedDate: "2025-06-03",
    description:
      "Detailed nutrition tracking with metabolic responses, meal timing, and biomarker correlations.",
  },
  {
    id: "4",
    ipId: "0xabc...jkl",
    dataType: "Stress & Mental Health",
    price: "6.5 IP",
    qualityScore: 8.9,
    seller: "0xjkl...abc",
    listedDate: "2025-06-04",
    description:
      "Mental health and stress tracking data including cortisol patterns, mood correlations, and intervention responses.",
  },
  {
    id: "5",
    ipId: "0xdef...mno",
    dataType: "Hormonal Cycles",
    price: "8 IP",
    qualityScore: 9.3,
    seller: "0xmno...def",
    listedDate: "2025-06-05",
    description:
      "Comprehensive hormonal cycle data with biomarker tracking, symptom correlations, and phase-specific insights.",
  },
  {
    id: "6",
    ipId: "0xghi...pqr",
    dataType: "Performance Analytics",
    price: "7 IP",
    qualityScore: 8.6,
    seller: "0xpqr...ghi",
    listedDate: "2025-06-06",
    description:
      "Athletic performance data including training load, recovery metrics, and performance optimization protocols.",
  },
];

export const MOCK_USER_ASSETS: IPAsset[] = [
  {
    id: "1",
    ipId: "0x123...abc",
    tokenId: "001",
    owner: "0xuser...address",
    dataType: "Sleep & HRV",
    price: "50 IP",
    qualityScore: 8.7,
    listedDate: "2025-06-01",
    isActive: true,
    earnings: "150 IP",
    healthData: MOCK_HEALTH_DATA[0],
  },
  {
    id: "2",
    ipId: "0x456...def",
    tokenId: "002",
    owner: "0xuser...address",
    dataType: "Activity & Recovery",
    price: "75 IP",
    qualityScore: 9.1,
    listedDate: "2025-06-02",
    isActive: true,
    earnings: "225 IP",
    healthData: MOCK_HEALTH_DATA[1],
  },
];

export const DATA_TYPES = [
  "Sleep & HRV",
  "Activity & Recovery",
  "Nutrition & Metabolics",
  "Stress & Mental Health",
  "Hormonal Cycles",
  "Performance Analytics",
];
