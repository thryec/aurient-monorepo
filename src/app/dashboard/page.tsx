"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  TrendingUp,
  DollarSign,
  Database,
  ExternalLink,
  Eye,
  Copy,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import WalletConnect from "@/components/wallet/WalletConnect";
import { MOCK_USER_ASSETS } from "@/lib/constants";
import { IPAsset, UserEarnings } from "@/lib/types";

const Dashboard = () => {
  const router = useRouter();
  const { isConnected } = useWallet();
  const [assets, setAssets] = useState<IPAsset[]>(MOCK_USER_ASSETS);
  const [isLoading, setIsLoading] = useState(false);

  const mockEarnings: UserEarnings = {
    totalEarned: "375 IP",
    claimableBalance: "150 IP",
    recentSales: [
      {
        id: "1",
        buyerAddress: "0xabc...123",
        amount: "50 IP",
        date: "2025-06-10",
        ipId: "0x123...abc",
      },
      {
        id: "2",
        buyerAddress: "0xdef...456",
        amount: "75 IP",
        date: "2025-06-09",
        ipId: "0x456...def",
      },
      {
        id: "3",
        buyerAddress: "0xghi...789",
        amount: "50 IP",
        date: "2025-06-08",
        ipId: "0x123...abc",
      },
    ],
  };

  //   useEffect(() => {
  //     if (!isConnected) {
  //       router.push("/");
  //     }
  //   }, [isConnected, router]);

  const handleClaimEarnings = async () => {
    setIsLoading(true);
    try {
      // Simulate claiming earnings
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // In real implementation, this would call the smart contract
      alert("Earnings claimed successfully!");
    } catch (error) {
      console.error("Failed to claim earnings:", error);
    } finally {
      setIsLoading(false);
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
            className="text-gray-900 font-light text-xl tracking-wide hover:text-gray-700 transition-colors"
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
              <p className="text-3xl font-light text-gray-900 mb-1">
                {assets.length}
              </p>
              <p className="text-sm text-gray-600">Registered data sets</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Total Earned
                </h3>
              </div>
              <p className="text-3xl font-light text-gray-900 mb-1">
                {mockEarnings.totalEarned}
              </p>
              <p className="text-sm text-gray-600">
                From {mockEarnings.recentSales.length} license sales
              </p>
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
                  disabled={isLoading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-light hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Claiming..." : "Claim"}
                </button>
              </div>
              <p className="text-3xl font-light text-gray-900 mb-1">
                {mockEarnings.claimableBalance}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assets.map((asset) => (
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
                      <p className="text-lg font-medium text-green-600">
                        {asset.earnings}
                      </p>
                      <p className="text-sm text-gray-600">earned</p>
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
                          {asset.healthData.metrics.dataPoints}
                        </p>
                      </div>
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
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h2 className="text-2xl font-light text-gray-900 mb-6">
              Recent License Sales
            </h2>

            {mockEarnings.recentSales.length > 0 ? (
              <div className="space-y-4">
                {mockEarnings.recentSales.map((sale) => (
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
