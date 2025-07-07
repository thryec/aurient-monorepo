import { useState, useEffect, useCallback } from "react";
import { formatEther, parseEther } from "viem";
import { useWallet } from "./useWallet";
import {
  CONTRACT_CONFIG,
  HEALTH_DATA_MARKETPLACE_ABI,
} from "@/contracts/config";
import type {
  Listing,
  HealthDataMetadata,
  RegisterHealthDataParams,
  PurchaseLicenseParams,
} from "@/contracts/config";

// Loading states for different operations
interface LoadingStates {
  [key: string]: boolean;
}

// Health data registration result
interface HealthDataRegistration {
  ipId: string;
  tokenId: string;
  licenseTermsId: string;
  transactionHash: string;
}

// Marketplace data
interface MarketplaceData {
  totalListings: number;
  activeListings: number;
  userListings: number;
  platformFee: string;
  isCollectionInitialized: boolean;
}

// User's health data
interface UserHealthData {
  listings: Listing[];
  totalEarnings: string;
  claimableEarnings: string;
}

export function useAurient() {
  const { address, isConnected, publicClient, walletClient } = useWallet();
  const [loading, setLoading] = useState<LoadingStates>({});
  const [marketplaceData, setMarketplaceData] =
    useState<MarketplaceData | null>(null);
  const [userHealthData, setUserHealthData] = useState<UserHealthData | null>(
    null
  );
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [wipBalance, setWipBalance] = useState<string>("0");
  const [ipBalance, setIpBalance] = useState<string>("0");
  const [statusMessage, setStatusMessage] = useState<string>("");

  const showStatus = (message: string) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(""), 5000);
  };

  const setLoadingState = (key: string, value: boolean) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (isConnected && address && publicClient) {
      loadMarketplaceData();
      loadUserHealthData();
      loadActiveListings();
      loadBalances();
    }
  }, [isConnected, address, publicClient]);

  const loadBalances = async () => {
    if (!publicClient || !address) return;

    try {
      // Get native $IP token balance
      const ipBalance = await publicClient.getBalance({
        address,
      });
      setIpBalance(formatEther(ipBalance));

      // Get WIP token balance
      const wipBalance = await publicClient.readContract({
        address: CONTRACT_CONFIG.WIP_TOKEN,
        abi: [
          {
            type: "function",
            name: "balanceOf",
            inputs: [{ name: "account", type: "address" }],
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
          },
        ],
        functionName: "balanceOf",
        args: [address],
      });
      setWipBalance(formatEther(wipBalance as bigint));
    } catch (error) {
      console.error("Failed to load balances:", error);
    }
  };

  const loadMarketplaceData = async () => {
    if (!publicClient) return;

    try {
      const [platformFeePercent, isCollectionInitialized, nextListingId] =
        await Promise.all([
          publicClient.readContract({
            address: CONTRACT_CONFIG.HEALTH_DATA_MARKETPLACE_ADDRESS,
            abi: HEALTH_DATA_MARKETPLACE_ABI,
            functionName: "platformFeePercent",
          }) as Promise<bigint>,
          publicClient.readContract({
            address: CONTRACT_CONFIG.HEALTH_DATA_MARKETPLACE_ADDRESS,
            abi: HEALTH_DATA_MARKETPLACE_ABI,
            functionName: "isCollectionInitialized",
          }) as Promise<boolean>,
          publicClient.readContract({
            address: CONTRACT_CONFIG.HEALTH_DATA_MARKETPLACE_ADDRESS,
            abi: HEALTH_DATA_MARKETPLACE_ABI,
            functionName: "nextListingId",
          }) as Promise<bigint>,
        ]);

      setMarketplaceData({
        totalListings: Number(nextListingId) - 1,
        activeListings: 0, // Will be calculated from activeListings
        userListings: 0, // Will be calculated from userHealthData
        platformFee: formatEther(platformFeePercent),
        isCollectionInitialized,
      });
    } catch (error) {
      console.error("Failed to load marketplace data:", error);
    }
  };

  const loadUserHealthData = async () => {
    if (!publicClient || !address) return;

    try {
      const userListings = (await publicClient.readContract({
        address: CONTRACT_CONFIG.HEALTH_DATA_MARKETPLACE_ADDRESS,
        abi: HEALTH_DATA_MARKETPLACE_ABI,
        functionName: "getUserListings",
        args: [address],
      })) as Listing[];

      // Calculate claimable earnings for all user's IPs
      let totalClaimableEarnings = "0";
      if (userListings.length > 0) {
        const ipIds = userListings.map((listing) => listing.ipId);
        const claimableAmounts = await getClaimableEarningsBatch(ipIds);
        const totalAmount = claimableAmounts.reduce((sum, amount) => {
          return sum + parseFloat(amount);
        }, 0);
        totalClaimableEarnings = totalAmount.toString();
      }

      // Calculate total earnings (this would need to be implemented based on royalty claims)
      const totalEarnings = "0"; // TODO: Implement royalty calculation

      setUserHealthData({
        listings: userListings,
        totalEarnings,
        claimableEarnings: totalClaimableEarnings,
      });

      // Update marketplace data with user listings count
      setMarketplaceData((prev) =>
        prev ? { ...prev, userListings: userListings.length } : null
      );
    } catch (error) {
      console.error("Failed to load user health data:", error);
    }
  };

  const loadActiveListings = useCallback(async () => {
    if (!publicClient) return;

    try {
      const listings = (await publicClient.readContract({
        address: CONTRACT_CONFIG.HEALTH_DATA_MARKETPLACE_ADDRESS,
        abi: HEALTH_DATA_MARKETPLACE_ABI,
        functionName: "getActiveListings",
      })) as Listing[];

      setActiveListings(listings);

      // Update marketplace data with active listings count
      setMarketplaceData((prev) =>
        prev ? { ...prev, activeListings: listings.length } : null
      );
    } catch (error) {
      console.error("Failed to load active listings:", error);
    }
  }, [publicClient]);

  const registerHealthData = async (
    params: RegisterHealthDataParams
  ): Promise<HealthDataRegistration> => {
    if (!walletClient || !address) {
      throw new Error("Wallet not connected");
    }

    setLoadingState("register", true);
    try {
      const hash = await walletClient.writeContract({
        account: address,
        address: CONTRACT_CONFIG.HEALTH_DATA_MARKETPLACE_ADDRESS,
        abi: HEALTH_DATA_MARKETPLACE_ABI,
        functionName: "registerHealthDataIP",
        args: [
          params.dataType,
          params.ipfsHash,
          parseEther(params.priceIP),
          params.qualityMetrics,
        ],
      });

      console.log("Health data registration hash:", hash);
      showStatus(
        "Health data registration transaction sent! Waiting for confirmation..."
      );

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction confirmed:", receipt);

      // Parse the logs to get the registration details
      const logs = receipt.logs;
      let ipId = "";
      let tokenId = "";
      let licenseTermsId = "";

      // Find the HealthDataRegistered event
      for (const log of logs) {
        try {
          const decodedLog = publicClient.decodeEventLog({
            abi: HEALTH_DATA_MARKETPLACE_ABI,
            data: log.data,
            topics: log.topics,
          });

          if (decodedLog.eventName === "HealthDataRegistered") {
            ipId = decodedLog.args.ipId;
            tokenId = decodedLog.args.tokenId.toString();
            licenseTermsId = decodedLog.args.licenseTermsId?.toString() || "";
            break;
          }
        } catch (error) {
          // Skip logs that can't be decoded
          continue;
        }
      }

      showStatus("Health data registered successfully!");

      // Refresh data
      await Promise.all([
        loadUserHealthData(),
        loadActiveListings(),
        loadMarketplaceData(),
      ]);

      return {
        ipId,
        tokenId,
        licenseTermsId,
        transactionHash: hash,
      };
    } catch (error: any) {
      console.error("Failed to register health data:", error);
      showStatus(
        `Failed to register health data: ${error.message || "Unknown error"}`
      );
      throw error;
    } finally {
      setLoadingState("register", false);
    }
  };

  const purchaseLicense = async (params: PurchaseLicenseParams) => {
    if (!walletClient || !address) {
      throw new Error("Wallet not connected");
    }

    setLoadingState("purchase", true);
    try {
      const hash = await walletClient.writeContract({
        account: address,
        address: CONTRACT_CONFIG.HEALTH_DATA_MARKETPLACE_ADDRESS,
        abi: HEALTH_DATA_MARKETPLACE_ABI,
        functionName: "purchaseLicense",
        args: [BigInt(params.listingId)],
        value: BigInt(params.value),
      });

      console.log("License purchase hash:", hash);
      showStatus(
        "License purchase transaction sent! Waiting for confirmation..."
      );

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction confirmed:", receipt);

      showStatus("License purchased successfully!");

      // Refresh data
      await Promise.all([loadActiveListings(), loadBalances()]);

      return receipt;
    } catch (error: any) {
      console.error("Failed to purchase license:", error);
      showStatus(
        `Failed to purchase license: ${error.message || "Unknown error"}`
      );
      throw error;
    } finally {
      setLoadingState("purchase", false);
    }
  };

  const removeListing = async (listingId: number) => {
    if (!walletClient || !address) {
      throw new Error("Wallet not connected");
    }

    setLoadingState("remove", true);
    try {
      const hash = await walletClient.writeContract({
        account: address,
        address: CONTRACT_CONFIG.HEALTH_DATA_MARKETPLACE_ADDRESS,
        abi: HEALTH_DATA_MARKETPLACE_ABI,
        functionName: "removeListing",
        args: [BigInt(listingId)],
      });

      console.log("Remove listing hash:", hash);
      showStatus(
        "Listing removal transaction sent! Waiting for confirmation..."
      );

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction confirmed:", receipt);

      showStatus("Listing removed successfully!");

      // Refresh data
      await Promise.all([
        loadUserHealthData(),
        loadActiveListings(),
        loadMarketplaceData(),
      ]);

      return receipt;
    } catch (error: any) {
      console.error("Failed to remove listing:", error);
      showStatus(
        `Failed to remove listing: ${error.message || "Unknown error"}`
      );
      throw error;
    } finally {
      setLoadingState("remove", false);
    }
  };

  const claimEarnings = async (ipId: string) => {
    if (!walletClient || !address) {
      throw new Error("Wallet not connected");
    }

    setLoadingState("claim", true);
    try {
      const hash = await walletClient.writeContract({
        account: address,
        address: CONTRACT_CONFIG.HEALTH_DATA_MARKETPLACE_ADDRESS,
        abi: HEALTH_DATA_MARKETPLACE_ABI,
        functionName: "claimEarnings",
        args: [ipId],
      });

      console.log("Claim earnings hash:", hash);
      showStatus(
        "Earnings claim transaction sent! Waiting for confirmation..."
      );

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction confirmed:", receipt);

      showStatus("Earnings claimed successfully!");

      // Refresh data
      await Promise.all([loadUserHealthData(), loadBalances()]);

      return receipt;
    } catch (error: any) {
      console.error("Failed to claim earnings:", error);
      showStatus(
        `Failed to claim earnings: ${error.message || "Unknown error"}`
      );
      throw error;
    } finally {
      setLoadingState("claim", false);
    }
  };

  const getListingsByDataType = async (
    dataType: string
  ): Promise<Listing[]> => {
    if (!publicClient) return [];

    try {
      const listings = (await publicClient.readContract({
        address: CONTRACT_CONFIG.HEALTH_DATA_MARKETPLACE_ADDRESS,
        abi: HEALTH_DATA_MARKETPLACE_ABI,
        functionName: "getListingsByDataType",
        args: [dataType],
      })) as Listing[];

      return listings;
    } catch (error) {
      console.error("Failed to get listings by data type:", error);
      return [];
    }
  };

  const getHealthDataMetadata = async (
    ipId: string
  ): Promise<HealthDataMetadata | null> => {
    if (!publicClient) return null;

    try {
      const metadata = (await publicClient.readContract({
        address: CONTRACT_CONFIG.HEALTH_DATA_MARKETPLACE_ADDRESS,
        abi: HEALTH_DATA_MARKETPLACE_ABI,
        functionName: "healthDataMetadata",
        args: [ipId],
      })) as HealthDataMetadata;

      return metadata;
    } catch (error) {
      console.error("Failed to get health data metadata:", error);
      return null;
    }
  };

  const getLicensePrice = async (ipId: string): Promise<string> => {
    if (!publicClient) return "0";

    try {
      const price = (await publicClient.readContract({
        address: CONTRACT_CONFIG.HEALTH_DATA_MARKETPLACE_ADDRESS,
        abi: HEALTH_DATA_MARKETPLACE_ABI,
        functionName: "getLicensePrice",
        args: [ipId],
      })) as bigint;

      return formatEther(price);
    } catch (error) {
      console.error("Failed to get license price:", error);
      return "0";
    }
  };

  const getClaimableEarnings = async (ipId: string): Promise<string> => {
    if (!publicClient) return "0";

    try {
      const earnings = (await publicClient.readContract({
        address: CONTRACT_CONFIG.HEALTH_DATA_MARKETPLACE_ADDRESS,
        abi: HEALTH_DATA_MARKETPLACE_ABI,
        functionName: "getClaimableEarnings",
        args: [ipId],
      })) as bigint;

      return formatEther(earnings);
    } catch (error) {
      console.error("Failed to get claimable earnings:", error);
      return "0";
    }
  };

  const getClaimableEarningsBatch = async (
    ipIds: string[]
  ): Promise<string[]> => {
    if (!publicClient || ipIds.length === 0) return [];

    try {
      const earnings = (await publicClient.readContract({
        address: CONTRACT_CONFIG.HEALTH_DATA_MARKETPLACE_ADDRESS,
        abi: HEALTH_DATA_MARKETPLACE_ABI,
        functionName: "getClaimableEarningsBatch",
        args: [ipIds],
      })) as bigint[];

      return earnings.map((earning) => formatEther(earning));
    } catch (error) {
      console.error("Failed to get claimable earnings batch:", error);
      return ipIds.map(() => "0");
    }
  };

  return {
    // State
    loading,
    marketplaceData,
    userHealthData,
    activeListings,
    wipBalance,
    ipBalance,
    statusMessage,

    // Actions
    registerHealthData,
    purchaseLicense,
    removeListing,
    claimEarnings,
    getListingsByDataType,
    getHealthDataMetadata,
    getLicensePrice,
    getClaimableEarnings,
    getClaimableEarningsBatch,

    // Data loading
    loadMarketplaceData,
    loadUserHealthData,
    loadActiveListings,
    loadBalances,

    // Utility
    showStatus,
  };
}
