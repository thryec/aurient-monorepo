"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Star,
  Database,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useAurient } from "@/hooks/useAurient";
import WalletConnect from "@/components/wallet/WalletConnect";
import { DATA_TYPES } from "@/lib/constants";
import { MarketplaceListing } from "@/lib/types";
import { formatEther } from "viem";

const Marketplace = () => {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { activeListings, loadActiveListings, loading, statusMessage } =
    useAurient();

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<
    MarketplaceListing[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDataType, setSelectedDataType] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform contract listings to marketplace format
  const transformContractListings = (
    contractListings: any[]
  ): MarketplaceListing[] => {
    return contractListings.map((listing) => ({
      id: listing.listingId.toString(),
      ipId: listing.ipId,
      dataType: listing.dataType,
      price: `${formatEther(BigInt(listing.priceIP))} IP`,
      qualityScore: 8.5, // Default quality score - could be enhanced with metadata
      seller: listing.seller,
      listedDate: new Date(Number(listing.createdAt) * 1000)
        .toISOString()
        .split("T")[0],
      description: `High-quality ${listing.dataType.toLowerCase()} data available for licensing. This dataset includes comprehensive health metrics and insights.`,
    }));
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    if (isConnected) {
      try {
        await loadActiveListings();
      } catch (err) {
        setError("Failed to load marketplace data. Please try again.");
        console.error("Error loading listings:", err);
      }
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadActiveListings().catch((err) => {
        setError("Failed to load marketplace data. Please try again.");
        console.error("Error loading listings:", err);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [isConnected, loadActiveListings]);

  useEffect(() => {
    if (activeListings) {
      try {
        const transformedListings = transformContractListings(activeListings);
        setListings(transformedListings);
        setError(null);
      } catch (err) {
        setError("Failed to process marketplace data. Please try again.");
        console.error("Error transforming listings:", err);
      }
      setIsLoading(false);
    }
  }, [activeListings]);

  useEffect(() => {
    let filtered = [...listings];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (listing) =>
          listing.dataType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by data type
    if (selectedDataType !== "All") {
      filtered = filtered.filter(
        (listing) => listing.dataType === selectedDataType
      );
    }

    // Sort listings
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime()
        );
        break;
      case "price-low":
        filtered.sort(
          (a, b) =>
            parseFloat(a.price.split(" ")[0]) -
            parseFloat(b.price.split(" ")[0])
        );
        break;
      case "price-high":
        filtered.sort(
          (a, b) =>
            parseFloat(b.price.split(" ")[0]) -
            parseFloat(a.price.split(" ")[0])
        );
        break;
      case "quality":
        filtered.sort((a, b) => b.qualityScore - a.qualityScore);
        break;
      default:
        break;
    }

    setFilteredListings(filtered);
  }, [listings, searchQuery, selectedDataType, sortBy]);

  const handlePurchase = (listingId: string) => {
    router.push(`/purchase/${listingId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500 text-gray-600">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-700">Loading marketplace data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500 text-gray-600">
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
            <WalletConnect variant="compact" />
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Health Data Marketplace
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              License premium health insights for research and AI model
              training. All data is anonymized and protected on Story.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 text-center">
              <p className="text-2xl font-light text-gray-900">
                {listings.length}
              </p>
              <p className="text-sm text-gray-600">Available Datasets</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 text-center">
              <p className="text-2xl font-light text-gray-900">18.3k</p>
              <p className="text-sm text-gray-600">Total Licenses Sold</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 text-center">
              <p className="text-2xl font-light text-gray-900">8.7</p>
              <p className="text-sm text-gray-600">Avg Quality Score</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 text-center">
              <p className="text-2xl font-light text-gray-900">$127k</p>
              <p className="text-sm text-gray-600">Total Volume</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search health data types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Data Type Filter */}
              <select
                value={selectedDataType}
                onChange={(e) => setSelectedDataType(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="All">All Data Types</option>
                {DATA_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="quality">Highest Quality</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading.loadActiveListings}
                className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading.loadActiveListings ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {statusMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
              <p className="text-green-800 text-center">{statusMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
              <div className="flex items-center gap-2 justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Wallet Connection Notice */}
          {!isConnected && !error && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
              <p className="text-blue-800 text-center">
                Connect your wallet to view the latest marketplace listings and
                make purchases.
              </p>
            </div>
          )}

          {/* Listings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-1">
                      {listing.dataType}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">
                        {listing.qualityScore}/10
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light text-gray-900">
                      {listing.price}
                    </p>
                    <p className="text-sm text-gray-600">per license</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {listing.description}
                </p>

                {/* Metadata */}
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">Seller</p>
                      <p className="font-mono text-gray-900">
                        {listing.seller.slice(0, 6)}...
                        {listing.seller.slice(-4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Listed</p>
                      <p className="text-gray-900">{listing.listedDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">IP ID</p>
                      <p className="font-mono text-gray-900">
                        {listing.ipId.slice(0, 8)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Quality</p>
                      <p className="text-gray-900">{listing.qualityScore}/10</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePurchase(listing.id)}
                    disabled={!isConnected}
                    className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-300 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnected ? "Purchase License" : "Connect Wallet"}
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-3 rounded-full hover:bg-gray-200 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredListings.length === 0 && !error && (
            <div className="text-center py-16">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No datasets found
              </h3>
              <p className="text-gray-600">
                {!isConnected
                  ? "Connect your wallet to view marketplace listings."
                  : listings.length === 0
                    ? "No health data is currently available in the marketplace. Check back later for new listings."
                    : "Try adjusting your search criteria or filters."}
              </p>
            </div>
          )}

          {/* Load More */}
          {filteredListings.length > 0 && (
            <div className="text-center mt-12">
              <button className="bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 px-8 py-3 rounded-full font-light hover:bg-white transition-all duration-300">
                Load More Datasets
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
