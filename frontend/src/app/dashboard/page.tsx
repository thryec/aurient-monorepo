"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  TrendingUp,
  DollarSign,
  Database,
  ExternalLink,
  Eye,
  Copy,
  Loader2,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useAurient } from "@/hooks/useAurient";
import WalletConnect from "@/components/wallet/WalletConnect";
import { IPAsset, UserEarnings } from "@/lib/types";
import { formatEther } from "viem";

const Dashboard = () => {
  const router = useRouter();
  const { isConnected } = useWallet();
  const {
    userHealthData,
    marketplaceData,
    loading,
    claimEarnings,
    loadUserHealthData,
    loadMarketplaceData,
    getHealthDataMetadata,
    getClaimableEarnings,
  } = useAurient();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimingAssetId, setClaimingAssetId] = useState<string | null>(null);
  const [assetsWithMetadata, setAssetsWithMetadata] = useState<IPAsset[]>([]);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [assetEarnings, setAssetEarnings] = useState<Record<string, string>>(
    {}
  );
  const [earningsLoading, setEarningsLoading] = useState(false);

  // Convert user listings to IPAsset format for display
  const userAssets: IPAsset[] = useMemo(() => {
    return (
      userHealthData?.listings?.map((listing, index) => ({
        id: listing.listingId.toString(),
        ipId: listing.ipId,
        tokenId: listing.listingId.toString(),
        owner: listing.seller,
        dataType: listing.dataType,
        price: `${formatEther(BigInt(listing.priceIP))} IP`,
        qualityScore: 8.5, // This will be updated with real metadata
        listedDate: new Date(
          Number(listing.createdAt) * 1000
        ).toLocaleDateString(),
        isActive: listing.active,
        earnings: assetEarnings[listing.ipId] || "0 IP",
        healthData: {
          id: listing.listingId.toString(),
          dataType: listing.dataType,
          metrics: {
            averageSleepDuration: "7.5 hours",
            averageHRV: "45ms",
            dataPoints: 1000,
            qualityScore: 8.5,
          },
          timeRange: "Last 30 days",
          anonymized: true,
          ipfsHash: "", // Will be updated with real metadata
        },
      })) || []
    );
  }, [userHealthData]);

  const userEarnings: UserEarnings = {
    totalEarned: userHealthData?.totalEarnings || "0 IP",
    claimableBalance: userHealthData?.claimableEarnings || "0 IP",
    recentSales: [], // TODO: Implement recent sales tracking
  };

  // Fetch earnings for all user assets
  const fetchAssetsEarnings = async () => {
    if (!userAssets.length) return;

    setEarningsLoading(true);
    try {
      const earningsMap: Record<string, string> = {};

      await Promise.all(
        userAssets.map(async (asset) => {
          try {
            const earnings = await getClaimableEarnings(asset.ipId);
            earningsMap[asset.ipId] = `${earnings} IP`;
          } catch (error) {
            console.error(
              "Failed to fetch earnings for asset",
              asset.ipId,
              error
            );
            earningsMap[asset.ipId] = "0 IP";
          }
        })
      );

      setAssetEarnings(earningsMap);
    } catch (error) {
      console.error("Failed to fetch assets earnings:", error);
    } finally {
      setEarningsLoading(false);
    }
  };

  // Fetch metadata for all user assets
  const fetchAssetsMetadata = async () => {
    if (!userAssets.length) return;

    setMetadataLoading(true);
    try {
      const assetsWithMetadata = await Promise.all(
        userAssets.map(async (asset) => {
          try {
            const metadata = await getHealthDataMetadata(asset.ipId);

            // If metadata itself is the array
            if (Array.isArray(metadata)) {
              // Example: [ipfsUri, ipfsHash, nftUri, nftHash, dataType, metricsJson]
              const ipfsHash = metadata[1] || "";
              const dataType = metadata[4] || asset.dataType;
              let qualityMetrics = {
                averageSleepDuration: "7.5 hours",
                averageHRV: "45ms",
                dataPoints: 1000,
                qualityScore: 8.5,
              };
              try {
                const parsedMetrics = JSON.parse(metadata[5]);
                qualityMetrics = {
                  ...qualityMetrics,
                  ...parsedMetrics,
                };
              } catch (e) {
                console.warn(
                  "Failed to parse quality metrics for",
                  asset.ipId,
                  "value:",
                  metadata[5],
                  "error:",
                  e
                );
              }
              return {
                ...asset,
                dataType,
                qualityScore: qualityMetrics.qualityScore || 8.5,
                healthData: {
                  ...asset.healthData,
                  dataType,
                  metrics: qualityMetrics,
                  ipfsHash: ipfsHash,
                },
              };
            }

            // Fallback: handle old object format
            if (metadata && typeof metadata === "object") {
              let qualityMetrics = {
                averageSleepDuration: "7.5 hours",
                averageHRV: "45ms",
                dataPoints: 1000,
                qualityScore: 8.5,
              };
              if (typeof metadata.qualityMetrics === "string") {
                try {
                  const parsedMetrics = JSON.parse(metadata.qualityMetrics);
                  qualityMetrics = {
                    ...qualityMetrics,
                    ...parsedMetrics,
                  };
                } catch (e) {
                  console.warn(
                    "Failed to parse quality metrics for",
                    asset.ipId,
                    "value:",
                    metadata.qualityMetrics,
                    "error:",
                    e
                  );
                }
              }
              return {
                ...asset,
                qualityScore: qualityMetrics.qualityScore || 8.5,
                healthData: {
                  ...asset.healthData,
                  metrics: qualityMetrics,
                  ipfsHash: metadata.ipMetadataHash || "",
                },
              };
            }

            return asset;
          } catch (error) {
            console.error(
              "Failed to fetch metadata for asset",
              asset.ipId,
              error
            );
            return asset;
          }
        })
      );

      setAssetsWithMetadata(assetsWithMetadata);
    } catch (error) {
      console.error("Failed to fetch assets metadata:", error);
      setAssetsWithMetadata(userAssets);
    } finally {
      setMetadataLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadUserHealthData();
      loadMarketplaceData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  useEffect(() => {
    if (userAssets.length > 0) {
      fetchAssetsMetadata();
      fetchAssetsEarnings();
    } else {
      setAssetsWithMetadata([]);
      setAssetEarnings({});
    }
  }, [userAssets]);

  const handleClaimEarnings = async () => {
    setIsClaiming(true);
    try {
      // For now, we'll claim earnings for the first IP asset
      // In a real implementation, you'd want to claim for specific IPs or all at once
      if (assetsWithMetadata.length > 0) {
        await claimEarnings(assetsWithMetadata[0].ipId);
      }
    } catch (error) {
      console.error("Failed to claim earnings:", error);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClaimAssetEarnings = async (ipId: string) => {
    setClaimingAssetId(ipId);
    try {
      await claimEarnings(ipId);
      // Refresh earnings after successful claim
      await fetchAssetsEarnings();
    } catch (error) {
      console.error("Failed to claim earnings for asset", ipId, error);
    } finally {
      setClaimingAssetId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg">
          <h2 className="text-2xl font-light text-gray-900 mb-6">
            Connect Wallet to Access Dashboard
          </h2>
          <WalletConnect variant="hero" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500">
      {/* Header */}
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-900 font-light text-xl tracking-wide hover:text-gray-700 transition-colors cursor-pointer"
          >
            Aurient
          </button>
          <div className="flex items-center gap-4">
            <WalletConnect showBalance={true} variant="compact" />
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Your Health Portfolio
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl">
              Manage your health data and track your earnings.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Database className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">IP Assets</h3>
              </div>
              {loading.userHealthData ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="text-gray-400">Loading...</span>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-light text-gray-900 mb-1">
                    {assetsWithMetadata.length}
                  </p>
                  <p className="text-sm text-gray-600">Registered data sets</p>
                </>
              )}
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Total Earned
                </h3>
              </div>
              <p className="text-3xl font-light text-gray-900 mb-1">
                {userEarnings.totalEarned}
              </p>
              <p className="text-sm text-gray-600">From license sales</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Claimable
                  </h3>
                </div>
                <button
                  onClick={handleClaimEarnings}
                  disabled={isClaiming || assetsWithMetadata.length === 0}
                  className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-light hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    "Claim"
                  )}
                </button>
              </div>
              <p className="text-3xl font-light text-gray-900 mb-1">
                {userEarnings.claimableBalance}
              </p>
              <p className="text-sm text-gray-600">Ready to withdraw</p>
            </div>
          </div>

          {/* IP Assets Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-gray-900">
                Your IP Assets
              </h2>
              <button
                onClick={() => router.push("/register")}
                className="bg-gray-900 text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Register New Data
              </button>
            </div>

            {loading.userHealthData ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 border border-gray-200 shadow-lg text-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Loading your IP assets...</p>
              </div>
            ) : assetsWithMetadata.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 border border-gray-200 shadow-lg text-center">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No IP Assets Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by registering your health data to create your first IP
                  asset.
                </p>
                <button
                  onClick={() => router.push("/register")}
                  className="bg-gray-900 text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-300"
                >
                  Register Your First Data
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assetsWithMetadata.map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                          {asset.dataType}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Quality: {asset.qualityScore}/10</span>
                          <span>Price: {asset.price}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              asset.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {asset.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {earningsLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            <span className="text-sm text-gray-400">
                              Loading...
                            </span>
                          </div>
                        ) : (
                          <>
                            <p className="text-lg font-medium text-green-600">
                              {asset.earnings}
                            </p>
                            <p className="text-sm text-gray-600">earned</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">IP ID</p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-gray-900">
                              {asset.ipId.slice(0, 8)}...
                            </p>
                            <button
                              onClick={() => copyToClipboard(asset.ipId)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600">Token ID</p>
                          <p className="font-mono text-gray-900">
                            {asset.tokenId}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Listed Date</p>
                          <p className="text-gray-900">{asset.listedDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Data Points</p>
                          <p className="text-gray-900">
                            {asset.healthData.metrics.dataPoints.toLocaleString()}
                          </p>
                        </div>
                        {asset.healthData.ipfsHash && (
                          <div className="col-span-2">
                            <p className="text-gray-600">IPFS Hash</p>
                            <div className="flex items-center gap-2">
                              <p className="font-mono text-gray-900 text-xs">
                                {asset.healthData.ipfsHash.slice(0, 20)}...
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    asset.healthData.ipfsHash || ""
                                  )
                                }
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-light hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-light hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Story Explorer
                      </button>
                    </div>

                    {/* Claim Earnings Button */}
                    {asset.earnings !== "0 IP" && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleClaimAssetEarnings(asset.ipId)}
                          disabled={claimingAssetId === asset.ipId}
                          className="w-full bg-green-600 text-white px-4 py-2 rounded-full text-sm font-light hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {claimingAssetId === asset.ipId ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Claiming...
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4" />
                              Claim {asset.earnings}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Sales */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h2 className="text-2xl font-light text-gray-900 mb-6">
              Recent License Sales
            </h2>

            {userEarnings.recentSales.length > 0 ? (
              <div className="space-y-4">
                {userEarnings.recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-gray-900">License Sold</p>
                      <p className="text-sm text-gray-600">
                        To {sale.buyerAddress.slice(0, 6)}...
                        {sale.buyerAddress.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {sale.amount}
                      </p>
                      <p className="text-sm text-gray-600">{sale.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No sales yet. Share your IP assets to start earning!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
