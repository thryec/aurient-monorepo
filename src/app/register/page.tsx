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
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import WalletConnect from "@/components/wallet/WalletConnect";
import { MOCK_HEALTH_DATA } from "@/lib/constants";
import { TransactionState } from "@/lib/types";

const SHOW_WHOOP = false; // Toggle to true to enable Whoop step

const RegistrationFlow = () => {
  const router = useRouter();
  const { isConnected } = useWallet();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDataIndex, setSelectedDataIndex] = useState(0);
  const [price, setPrice] = useState("50");
  const [transaction, setTransaction] = useState<TransactionState>({
    isPending: false,
    isSuccess: false,
    isError: false,
  });
  const [whoopConnected, setWhoopConnected] = useState(false);

  const steps = [
    { number: 1, title: "Connect Wallet", icon: Wallet },
    ...(SHOW_WHOOP
      ? [{ number: 2, title: "Connect Whoop", icon: Loader2 }]
      : []),
    { number: SHOW_WHOOP ? 3 : 2, title: "Preview Data", icon: Database },
    { number: SHOW_WHOOP ? 4 : 3, title: "Set Price", icon: DollarSign },
    { number: SHOW_WHOOP ? 5 : 4, title: "Register IP", icon: CheckCircle },
  ];

  const selectedHealthData = MOCK_HEALTH_DATA[selectedDataIndex];

  const maxStep = SHOW_WHOOP ? 5 : 4;

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

  const handleRegisterIP = async () => {
    setTransaction({ isPending: true, isSuccess: false, isError: false });

    try {
      // Simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setTransaction({
        isPending: false,
        isSuccess: true,
        isError: false,
        txHash: "0x123...abc",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      setTransaction({
        isPending: false,
        isSuccess: false,
        isError: true,
        error: "Transaction failed. Please try again.",
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

            {/* Step 3: Preview Data */}
            {currentStep === (SHOW_WHOOP ? 3 : 2) && (
              <div>
                <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 text-center">
                  Preview Your Health Data
                </h2>
                <p className="text-lg text-gray-700 mb-8 text-center max-w-2xl mx-auto">
                  This is a preview of the processed, anonymized data that will
                  be protected on Story
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {MOCK_HEALTH_DATA.map((data, index) => (
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
                    </button>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                  <h3 className="text-xl font-medium text-gray-900 mb-4">
                    {selectedHealthData.dataType}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Time Range</p>
                      <p className="font-medium">
                        {selectedHealthData.timeRange}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data Points</p>
                      <p className="font-medium">
                        {selectedHealthData.metrics.dataPoints}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quality Score</p>
                      <p className="font-medium">
                        {selectedHealthData.metrics.qualityScore}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Anonymized</p>
                      <p className="font-medium text-green-600">✓ Yes</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Key Metrics:
                    </h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>
                        • Average Sleep Duration:{" "}
                        {selectedHealthData.metrics.averageSleepDuration}
                      </p>
                      <p>
                        • Average HRV: {selectedHealthData.metrics.averageHRV}
                      </p>
                      <p>
                        • Data Collection Period: {selectedHealthData.timeRange}
                      </p>
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
                    Set Price
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Set Price */}
            {currentStep === (SHOW_WHOOP ? 4 : 3) && (
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

            {/* Step 5: Register IP */}
            {currentStep === (SHOW_WHOOP ? 5 : 4) && (
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
                            <span>Data Type:</span>
                            <span>{selectedHealthData.dataType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>License Price:</span>
                            <span>{price} IP</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Quality Score:</span>
                            <span>
                              {selectedHealthData.metrics.qualityScore}/10
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
