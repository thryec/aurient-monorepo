"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Wallet,
  Database,
  DollarSign,
  CheckCircle,
  Loader2,
  Upload,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useAurient } from "@/hooks/useAurient";
import WalletConnect from "@/components/wallet/WalletConnect";
import FileUpload from "@/components/health-data/FileUpload";
import { TransactionState, UploadedFile } from "@/lib/types";

const SHOW_WHOOP = false; // Toggle to true to enable Whoop step

const RegistrationFlow = () => {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { registerHealthData } = useAurient();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDataIndex, setSelectedDataIndex] = useState(0);
  const [price, setPrice] = useState("50");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [transaction, setTransaction] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    isError: false,
  });
  const [whoopConnected, setWhoopConnected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    currentFileName: string;
  }>({ current: 0, total: 0, currentFileName: "" });

  const steps = [
    { number: 1, title: "Connect Wallet", icon: Wallet },
    ...(SHOW_WHOOP
      ? [{ number: 2, title: "Connect Whoop", icon: Loader2 }]
      : []),
    { number: SHOW_WHOOP ? 3 : 2, title: "Upload Files", icon: Upload },
    { number: SHOW_WHOOP ? 4 : 3, title: "Preview Data", icon: Database },
    { number: SHOW_WHOOP ? 5 : 4, title: "Set Price", icon: DollarSign },
    { number: SHOW_WHOOP ? 6 : 5, title: "Register IP", icon: CheckCircle },
  ];

  // Convert uploaded files to health data format
  const uploadedHealthData = uploadedFiles
    .filter((file) => file.uploadStatus === "success")
    .map((file, index) => {
      const fileType = file.type;
      let dataType = "Health Data";

      if (fileType === "application/json") {
        dataType = "JSON Health Records";
      } else if (fileType === "text/csv") {
        dataType = "CSV Health Metrics";
      } else if (fileType === "application/pdf") {
        dataType = "PDF Health Report";
      } else if (fileType.includes("image")) {
        dataType = "Health Imaging Data";
      }

      // Generate mock metrics based on file size and type
      const fileSizeMB = file.size / (1024 * 1024);
      const qualityScore = Math.min(
        10,
        Math.max(5, Math.floor(fileSizeMB * 2) + 5)
      );
      const dataPoints = Math.floor(fileSizeMB * 1000);

      return {
        id: file.id,
        dataType,
        metrics: {
          averageSleepDuration: "7.5 hours",
          averageHRV: "45ms",
          dataPoints,
          qualityScore,
        },
        timeRange: "Last 30 days",
        anonymized: true,
        ipfsHash: file.ipfsHash,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };
    });

  const selectedHealthData =
    uploadedHealthData[selectedDataIndex] || uploadedHealthData[0];

  const maxStep = SHOW_WHOOP ? 6 : 5;

  const handleNextStep = () => {
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const handleUploadStart = (totalFiles: number) => {
    setIsUploading(true);
    setUploadProgress({ current: 0, total: totalFiles, currentFileName: "" });
  };

  const handleUploadProgress = (current: number, fileName: string) => {
    setUploadProgress({
      current,
      total: uploadProgress.total,
      currentFileName: fileName,
    });
  };

  const handleUploadComplete = () => {
    setIsUploading(false);
    setUploadProgress({ current: 0, total: 0, currentFileName: "" });
  };

  const handleRegisterIP = async () => {
    setTransaction({ isPending: true, isSuccess: false, isError: false });

    try {
      if (!selectedHealthData) {
        throw new Error("No health data selected");
      }

      const result = await registerHealthData({
        dataType: selectedHealthData.dataType,
        ipfsHash: selectedHealthData.ipfsHash || "",
        priceIP: price,
        qualityMetrics: JSON.stringify(selectedHealthData.metrics),
      });

      setTransaction({
        isPending: false,
        isSuccess: true,
        isError: false,
        txHash: result.transactionHash,
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: any) {
      setTransaction({
        isPending: false,
        isSuccess: false,
        isError: true,
        error: error.message || "Transaction failed. Please try again.",
      });
    }
  };

  useEffect(() => {
    // Detect Whoop OAuth callback (e.g., ?whoop=connected or token in localStorage/session)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("whoop") === "connected") {
        setWhoopConnected(true);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500 text-gray-600">
      {/* Loading Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl border border-gray-200">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                Uploading Files to IPFS
              </h3>
              <p className="text-gray-600 mb-6">
                Securely uploading your health data files to decentralized
                storage...
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      uploadProgress.total > 0
                        ? (uploadProgress.current / uploadProgress.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>

              {/* Progress Text */}
              <div className="text-sm text-gray-600 mb-2">
                {uploadProgress.current} of {uploadProgress.total} files
                uploaded
              </div>

              {uploadProgress.currentFileName && (
                <div className="text-xs text-gray-500">
                  Currently uploading: {uploadProgress.currentFileName}
                </div>
              )}

              <div className="mt-6 text-xs text-gray-400">
                This may take a few moments depending on file sizes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-900 font-light text-xl tracking-wide hover:text-gray-700 transition-colors"
          >
            Aurient
          </button>
          <div className="text-gray-700 font-light">
            Step {currentStep} of {maxStep}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 md:px-8 mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                    ${
                      isActive
                        ? "bg-gray-900 border-gray-900 text-white"
                        : isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                    }
                  `}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`
                      h-0.5 w-24 mx-4 transition-all duration-300
                      ${isCompleted ? "bg-green-500" : "bg-gray-300"}
                    `}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-sm text-gray-600 font-light">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                {step.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg">
            {/* Step 1: Connect Wallet */}
            {currentStep === 1 && (
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
                  Connect Your Wallet
                </h2>
                <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
                  Connect your wallet to start registering your health data as
                  intellectual property on Story Protocol.
                </p>

                <WalletConnect
                  variant="hero"
                  showNetwork={true}
                  onConnected={handleNextStep}
                />
              </div>
            )}

            {/* Step 2: Connect Whoop */}
            {SHOW_WHOOP && currentStep === 2 && (
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
                  Connect Your Whoop App
                </h2>
                <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
                  Connect your Whoop account to import your health data.
                </p>
                {whoopConnected ? (
                  <>
                    <div className="mb-8 text-green-600 font-medium">
                      Whoop Connected!
                    </div>
                    <button
                      className="bg-gray-900 text-white px-8 py-4 rounded-full font-light text-lg hover:bg-gray-800 transition-all duration-300"
                      onClick={handleNextStep}
                    >
                      Continue
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-black text-white px-8 py-4 rounded-full font-light text-lg hover:bg-gray-800 transition-all duration-300"
                    onClick={async () => {
                      const res = await fetch("/api/whoop/auth/start");
                      const { url } = await res.json();
                      window.location.href = url;
                    }}
                  >
                    Connect Whoop
                  </button>
                )}
              </div>
            )}

            {/* Step 3: Upload Files */}
            {currentStep === (SHOW_WHOOP ? 3 : 2) && (
              <div>
                <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 text-center">
                  Upload Your Health Data Files
                </h2>
                <p className="text-lg text-gray-700 mb-8 text-center max-w-2xl mx-auto">
                  Upload your health data files to IPFS. These files will be
                  stored securely and used to create your intellectual property.
                </p>

                <FileUpload
                  onFilesUploaded={handleFilesUploaded}
                  uploadedFiles={uploadedFiles}
                  onUploadStart={handleUploadStart}
                  onUploadProgress={handleUploadProgress}
                  onUploadComplete={handleUploadComplete}
                />

                <div className="flex justify-between mt-8">
                  <button
                    onClick={handlePrevStep}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={
                      uploadedFiles.filter((f) => f.uploadStatus === "success")
                        .length === 0
                    }
                    className="bg-gray-900 text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Preview Data */}
            {currentStep === (SHOW_WHOOP ? 4 : 3) && (
              <div>
                <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 text-center">
                  Preview Your Health Data
                </h2>
                <p className="text-lg text-gray-700 mb-8 text-center max-w-2xl mx-auto">
                  This is a preview of the processed, anonymized data that will
                  be protected on Story Protocol.
                </p>

                {uploadedHealthData.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No files uploaded yet.</p>
                    <button
                      onClick={handlePrevStep}
                      className="bg-gray-900 text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-300"
                    >
                      Go Back to Upload Files
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Uploaded Files Section */}
                    <div className="mb-8">
                      <h3 className="text-xl font-medium text-gray-900 mb-4">
                        Uploaded Files
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {uploadedFiles
                          .filter((file) => file.uploadStatus === "success")
                          .map((file) => (
                            <div
                              key={file.id}
                              className="p-4 border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">
                                  {file.type === "application/pdf"
                                    ? "📄"
                                    : file.type === "application/json"
                                      ? "📋"
                                      : file.type === "text/csv"
                                        ? "📊"
                                        : "📁"}
                                </span>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {file.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    IPFS: {file.ipfsHash?.substring(0, 12)}...
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      {uploadedHealthData.map((data, index) => (
                        <button
                          key={data.id}
                          onClick={() => setSelectedDataIndex(index)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            selectedDataIndex === index
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <h3 className="font-medium text-gray-900 mb-2">
                            {data.dataType}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Quality: {data.metrics.qualityScore}/10
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {data.fileName}
                          </p>
                        </button>
                      ))}
                    </div>

                    {selectedHealthData && (
                      <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                        <h3 className="text-xl font-medium text-gray-900 mb-4">
                          {selectedHealthData.dataType}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">File Name</p>
                            <p className="font-medium">
                              {selectedHealthData.fileName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">File Size</p>
                            <p className="font-medium">
                              {(
                                selectedHealthData.fileSize /
                                (1024 * 1024)
                              ).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Data Points</p>
                            <p className="font-medium">
                              {selectedHealthData.metrics.dataPoints.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Quality Score
                            </p>
                            <p className="font-medium">
                              {selectedHealthData.metrics.qualityScore}/10
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Time Range</p>
                            <p className="font-medium">
                              {selectedHealthData.timeRange}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Anonymized</p>
                            <p className="font-medium text-green-600">✓ Yes</p>
                          </div>
                        </div>
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            File Details:
                          </h4>
                          <div className="space-y-1 text-sm text-gray-700">
                            <p>• File Type: {selectedHealthData.fileType}</p>
                            <p>
                              • IPFS Hash:{" "}
                              {selectedHealthData.ipfsHash?.substring(0, 20)}...
                            </p>
                            <p>
                              • Data Collection Period:{" "}
                              {selectedHealthData.timeRange}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <button
                        onClick={handlePrevStep}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="bg-gray-900 text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
                      >
                        Set Price
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 5: Set Price */}
            {currentStep === (SHOW_WHOOP ? 5 : 4) && (
              <div>
                <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 text-center">
                  Set Your License Price
                </h2>
                <p className="text-lg text-gray-700 mb-8 text-center max-w-2xl mx-auto">
                  Set the price for AI companies to license your health data.
                  You&apos;ll earn this amount each time someone licenses your
                  data.
                </p>

                <div className="max-w-md mx-auto mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Price (in $IP tokens)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="50"
                    />
                    <span className="absolute right-4 top-3 text-gray-500">
                      IP
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Recommended range: 25-100 IP based on data quality
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 mb-8">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Pricing Summary:
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>License Price:</span>
                      <span className="font-medium">{price} IP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee (5%):</span>
                      <span>{(parseFloat(price) * 0.05).toFixed(2)} IP</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span>You Earn Per License:</span>
                      <span>{(parseFloat(price) * 0.95).toFixed(2)} IP</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="bg-gray-900 text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
                  >
                    Protect your health data
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Register IP */}
            {currentStep === (SHOW_WHOOP ? 6 : 5) && (
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
                  Protect your health data
                </h2>

                {!transaction.isPending &&
                  !transaction.isSuccess &&
                  !transaction.isError && (
                    <div>
                      <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                        Register your health data on Story. This will protect
                        your insights so that you can choose how your data is
                        shared and monetized.
                      </p>

                      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
                        <h3 className="font-medium text-gray-900 mb-3">
                          Transaction Summary:
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>File Name:</span>
                            <span>{selectedHealthData?.fileName || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Data Type:</span>
                            <span>{selectedHealthData?.dataType || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>License Price:</span>
                            <span>{price} IP</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Quality Score:</span>
                            <span>
                              {selectedHealthData?.metrics.qualityScore || 0}/10
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Files Uploaded:</span>
                            <span>
                              {
                                uploadedFiles.filter(
                                  (f) => f.uploadStatus === "success"
                                ).length
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleRegisterIP}
                        className="bg-gray-900 text-white px-8 py-4 rounded-full font-light text-lg hover:bg-gray-800 transition-all duration-300 flex items-center gap-3 mx-auto"
                      >
                        Confirm
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                {transaction.isPending && (
                  <div>
                    <div className="flex justify-center mb-6">
                      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">
                      Processing Transaction...
                    </h3>
                    <p className="text-gray-600">
                      Your health data is being registered as an IP asset on
                      Story Protocol. This may take a few moments.
                    </p>
                  </div>
                )}

                {transaction.isSuccess && (
                  <div>
                    <div className="flex justify-center mb-6">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">
                      Registration Successful!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Your health data has been successfully protected,
                      anonymized, and listed for monetization opportunities.
                    </p>
                    {transaction.txHash && (
                      <div className="bg-green-50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-600 mb-1">
                          Transaction Hash:
                        </p>
                        <p className="text-sm font-mono text-green-700">
                          {transaction.txHash}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      Redirecting to dashboard...
                    </p>
                  </div>
                )}

                {transaction.isError && (
                  <div>
                    <h3 className="text-xl font-medium text-red-600 mb-3">
                      Registration Failed
                    </h3>
                    <p className="text-gray-600 mb-6">{transaction.error}</p>
                    <button
                      onClick={handleRegisterIP}
                      className="bg-gray-900 text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 transition-all duration-300"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {!transaction.isPending && !transaction.isSuccess && (
                  <div className="mt-8">
                    <button
                      onClick={handlePrevStep}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationFlow;
