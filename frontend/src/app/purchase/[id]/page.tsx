"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  Loader2,
  ExternalLink,
  Download,
  AlertTriangle,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import WalletConnect from "@/components/wallet/WalletConnect";
import { MarketplaceListing, TransactionState } from "@/lib/types";
import { useAurient } from "@/hooks/useAurient";
import { formatEther } from "viem";

// Helper to transform contract Listing to MarketplaceListing
function transformListing(listing: any): MarketplaceListing {
  return {
    id: listing.listingId?.toString?.() ?? listing.id?.toString?.() ?? "",
    ipId: listing.ipId,
    dataType: listing.dataType,
    price: `${formatEther(BigInt(listing.priceIP))} IP`,
    qualityScore: 8.5, // Default or fetch from metadata if available
    seller: listing.seller,
    listedDate: new Date(Number(listing.createdAt) * 1000)
      .toISOString()
      .split("T")[0],
    description: `High-quality ${listing.dataType?.toLowerCase?.()} data available for licensing. This dataset includes comprehensive health metrics and insights.`,
  };
}

const PurchaseFlow = () => {
  const router = useRouter();
  const params = useParams();
  const { isConnected, isOnStoryNetwork, getBalance, address } = useWallet();
  const {
    activeListings,
    loadActiveListings,
    purchaseLicense,
    loading,
    statusMessage,
    getHealthDataMetadata,
  } = useAurient();

  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [transaction, setTransaction] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    isError: false,
  });
  const [licenseTokenId, setLicenseTokenId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);

  // Function to extract IPFS hash from metadata URI
  const extractIpfsHash = (metadataUri: string): string | null => {
    if (!metadataUri || !metadataUri.startsWith("ipfs://")) {
      return null;
    }
    // Extract hash from ipfs://{hash}/path format
    const match = metadataUri.match(/^ipfs:\/\/([^\/]+)/);
    return match ? match[1] : null;
  };

  // Load listings and find the one by ID
  useEffect(() => {
    if (!activeListings || activeListings.length === 0) {
      setIsLoading(true);
      loadActiveListings();
      return;
    }
    const found = activeListings.find(
      (l) => l.listingId?.toString?.() === params.id
    );
    const transformedListing = found ? transformListing(found) : null;
    setListing(transformedListing);
    setIsLoading(false);
  }, [activeListings, params.id, loadActiveListings]);

  // Fetch IPFS hash when listing changes
  useEffect(() => {
    if (listing?.ipId) {
      const fetchIpfsHash = async () => {
        try {
          const metadata = await getHealthDataMetadata(listing.ipId);
          if (metadata?.ipMetadataURI) {
            const hash = extractIpfsHash(metadata.ipMetadataURI);
            setIpfsHash(hash);
          }
        } catch (error) {
          console.error("Failed to fetch IPFS hash:", error);
        }
      };
      fetchIpfsHash();
    }
  }, [listing?.ipId]);

  useEffect(() => {
    const loadBalance = async () => {
      if (isConnected) {
        try {
          const bal = await getBalance();
          if (bal) {
            setBalance((Number(bal) / 1e18).toFixed(2));
          }
        } catch (error) {
          console.error("Failed to load balance:", error);
        }
      }
    };
    loadBalance();
  }, [isConnected, getBalance]);

  const handlePurchase = async () => {
    if (!listing || !isConnected) return;
    setTransaction({ isPending: true, isSuccess: false, isError: false });
    try {
      const tx = await purchaseLicense({
        listingId: Number(listing.id),
        value: BigInt(
          parseFloat(listing.price.split(" ")[0]) * 1e18
        ).toString(),
      });
      setLicenseTokenId(tx?.licenseTokenId || `LT${Date.now()}`);
      setTransaction({
        isPending: false,
        isSuccess: true,
        isError: false,
        txHash: tx?.transactionHash || tx?.hash || "",
      });
    } catch (error: any) {
      setTransaction({
        isPending: false,
        isSuccess: false,
        isError: true,
        error: error?.message || "Transaction failed. Please try again.",
      });
    }
  };

  const priceInIP = listing ? parseFloat(listing.price.split(" ")[0]) : 0;
  const hasEnoughBalance = parseFloat(balance) >= priceInIP;

  // Check if the current user is the seller
  const isOwnListing = Boolean(
    isConnected &&
      address &&
      listing?.seller &&
      address.toLowerCase() === listing.seller.toLowerCase()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-700" />
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Loading listing...
          </h2>
        </div>
      </div>
    );
  }

  // Show transaction result if completed, even if listing is gone
  if ((transaction.isSuccess || transaction.isError) && !listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg max-w-lg w-full">
          {transaction.isSuccess ? (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                License Purchased Successfully!
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Your purchase was successful. You can view the transaction
                below.
              </p>
              {transaction.txHash && (
                <div className="mb-6">
                  <span className="text-gray-700">Transaction Hash: </span>
                  <a
                    href={`https://aeneid.storyscan.io/tx/${transaction.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline break-all"
                  >
                    {transaction.txHash}
                  </a>
                </div>
              )}
              <button
                onClick={() => router.push("/marketplace")}
                className="bg-gray-900 text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-300"
              >
                Back to Marketplace
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <AlertTriangle className="w-16 h-16 text-red-500" />
              </div>
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                Purchase Failed
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                {transaction.error || "Transaction failed. Please try again."}
              </p>
              {transaction.txHash && (
                <div className="mb-6">
                  <span className="text-gray-700">Transaction Hash: </span>
                  <a
                    href={`https://aeneid.storyscan.io/tx/${transaction.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline break-all"
                  >
                    {transaction.txHash}
                  </a>
                </div>
              )}
              <button
                onClick={() => router.push("/marketplace")}
                className="bg-gray-900 text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-300"
              >
                Back to Marketplace
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg">
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Listing not found
          </h2>
          <button
            onClick={() => router.push("/marketplace")}
            className="bg-gray-900 text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-300"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500">
      {/* Header */}
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push("/marketplace")}
            className="flex items-center gap-2 text-gray-900 font-light text-xl tracking-wide hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Marketplace
          </button>
          {isConnected && (
            <WalletConnect showBalance={true} variant="compact" />
          )}
        </div>
      </div>

      <div className="px-6 md:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg">
            {!transaction.isSuccess ? (
              <>
                {/* Seller Alert */}
                {isOwnListing && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-900">
                          Cannot Purchase Your Own Listing
                        </p>
                        <p className="text-sm text-red-700">
                          You cannot purchase a license for your own listing.
                          This listing was created by your wallet address.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Listing Details */}
                <div className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
                    Purchase health data license
                  </h1>
                  <p className="text-lg text-gray-700 mb-6">
                    You&apos;re about the purchase a license for these health
                    insights on Story.
                  </p>

                  <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">
                      {listing.dataType}
                    </h2>
                    <p className="text-gray-700 mb-4">{listing.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Quality Score</p>
                        <p className="font-medium text-gray-900">
                          {listing.qualityScore}/10
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">License Price</p>
                        <p className="font-medium text-gray-900">
                          {listing.price}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Listed Date</p>
                        <p className="font-medium text-gray-900">
                          {listing.listedDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">IP ID</p>
                        <p className="font-mono text-gray-900">
                          {listing.ipId.slice(0, 10)}...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* License Terms */}
                <div className="mb-8">
                  <h3 className="text-xl font-medium text-gray-900 mb-4">
                    License Terms
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Commercial Use License
                        </h4>
                        <p className="text-sm text-gray-700">
                          This license grants you the right to use this health
                          data for AI model training and commercial
                          applications. The data is fully anonymized and HIPAA
                          compliant.
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Use for AI/ML model training and development</p>
                      <p>• Commercial applications permitted</p>
                      <p>• Data is fully anonymized and de-identified</p>
                      <p>• No re-distribution of raw data allowed</p>
                      <p>• Attribution to original data provider required</p>
                    </div>
                  </div>
                </div>

                {/* Wallet Connection */}
                {!isConnected ? (
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-medium text-gray-900 mb-4">
                      Connect Your Wallet
                    </h3>
                    <p className="text-gray-700 mb-6">
                      Connect your wallet to purchase this license with $IP
                      tokens.
                    </p>
                    <WalletConnect variant="hero" showNetwork={true} />
                  </div>
                ) : (
                  <>
                    {/* Network Check */}
                    <WalletConnect showNetwork={true} className="mb-6" />

                    {/* Balance Check */}
                    {!hasEnoughBalance && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="font-medium text-red-900">
                              Insufficient Balance
                            </p>
                            <p className="text-sm text-red-700">
                              You need {priceInIP} IP but only have {balance} IP
                              in your wallet.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Purchase Summary */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Purchase Summary
                      </h3>
                      <div className="space-y-3 text-sm text-gray-900">
                        <div className="flex justify-between">
                          <span>License Price:</span>
                          <span className="font-medium">{listing.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Network Fee:</span>
                          <span className="font-medium">~0.001 IP</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-medium">
                          <span>Total:</span>
                          <span>{listing.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Purchase Button */}
                    <div className="text-center">
                      {transaction.isPending ? (
                        <div className="flex items-center justify-center gap-3 text-gray-600">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Processing purchase...</span>
                        </div>
                      ) : (
                        <button
                          onClick={handlePurchase}
                          disabled={
                            !hasEnoughBalance ||
                            !isOnStoryNetwork ||
                            transaction.isPending ||
                            isOwnListing
                          }
                          className="bg-gray-900 text-white px-8 py-4 rounded-full font-light text-lg hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Purchase License for {listing.price}
                        </button>
                      )}

                      {transaction.isError && (
                        <p className="text-red-600 mt-4">{transaction.error}</p>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Success State */
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>

                <h2 className="text-3xl font-light text-gray-900 mb-4">
                  License Purchased Successfully!
                </h2>

                <p className="text-lg text-gray-700 mb-8">
                  You now have a license to use this health data for AI model
                  training.
                </p>

                {/* License Details */}
                <div className="bg-green-50 rounded-xl p-6 mb-8 text-left">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Your License Details
                  </h3>
                  <div className="space-y-3 text-sm text-gray-900">
                    <div className="flex justify-between">
                      <span>License Token ID:</span>
                      <span className="font-mono">{licenseTokenId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IP Asset:</span>
                      <span className="font-mono">{listing.ipId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Type:</span>
                      <span>{listing.dataType}</span>
                    </div>
                    {transaction.txHash && (
                      <div className="flex justify-between">
                        <span>Transaction:</span>
                        <span className="font-mono">{transaction.txHash}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
                  <h3 className="font-medium text-gray-900 mb-4">Next Steps</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>1. Your license token has been minted to your wallet</p>
                    <p>
                      2. Access the data using the IPFS hash:{" "}
                      {ipfsHash ? (
                        <code className="bg-white px-2 py-1 rounded">
                          {ipfsHash}
                        </code>
                      ) : (
                        <span className="text-gray-500 italic">
                          Loading IPFS hash...
                        </span>
                      )}
                    </p>
                    <p>
                      3. Review the license terms for proper attribution
                      requirements
                    </p>
                    <p>
                      4. Start training your AI models with this premium health
                      data
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-gray-900 text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-300 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Data Access Guide
                  </button>
                  <button
                    onClick={() => router.push("/marketplace")}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-light hover:bg-gray-200 transition-all duration-300"
                  >
                    Browse More Data
                  </button>
                  <button
                    onClick={() => {
                      if (transaction.txHash) {
                        window.open(
                          `https://aeneid.storyscan.io/tx/${transaction.txHash}`,
                          "_blank"
                        );
                      }
                    }}
                    disabled={!transaction.txHash}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-light hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Story Explorer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseFlow;
