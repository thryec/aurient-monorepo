"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/navigation/Header";
import InsightCard from "../../components/insights/InsightCard";
import {
  healthDataService,
  HealthAnalysisResponse,
  StructuredDailyAdvice,
  DailyCard,
} from "@/lib/healthDataService";

export default function InsightsPage() {
  const [loading, setLoading] = useState(false);
  const [dailyAnalysis, setDailyAnalysis] =
    useState<HealthAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDailyInsights, setShowDailyInsights] = useState(false);

  useEffect(() => {
    // Apply background to body when component mounts
    document.body.style.background =
      "linear-gradient(to bottom right, rgb(254 240 138), rgb(251 207 232), rgb(255 237 213), rgb(252 165 165))";
    document.body.style.minHeight = "100vh";

    // Clean up when component unmounts
    return () => {
      document.body.style.background = "";
      document.body.style.minHeight = "";
    };
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await healthDataService.generateDailyRecommendations();
      setDailyAnalysis(response);

      if (response.success) {
        setShowDailyInsights(true);
      } else {
        setError(response.error || "Failed to generate daily recommendations");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderAIGeneratedCards = (structuredAdvice: StructuredDailyAdvice) => {
    return (
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center items-start">
        {structuredAdvice.cards.map((card, index) => (
          <div
            key={index}
            className="flex flex-col items-center w-full max-w-sm flex-1"
          >
            <div className="mb-3 text-xl font-bold text-gray-900 text-center">
              {card.title}
            </div>
            <InsightCard
              items={card.items}
              description={card.description}
              sources={card.sources}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="w-full flex flex-col items-center justify-start py-8 px-4 pb-20">
        <div className="max-w-2xl w-full text-center mb-8">
          <h1 className="text-4xl font-light text-gray-900 mb-6 tracking-tight">
            Your Daily Health Recommendations
          </h1>
          {!showDailyInsights && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="relative bg-black text-white px-8 py-3 rounded-full font-light text-base shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center mx-auto min-w-[160px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  Generating...
                </span>
              ) : (
                "Generate AI Insights"
              )}
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl w-full mb-8 p-6 bg-red-100 border border-red-200 rounded-2xl">
            <p className="text-red-700 text-center font-light">{error}</p>
          </div>
        )}

        {/* Content Area */}
        {showDailyInsights && dailyAnalysis?.success && dailyAnalysis.data ? (
          // AI-Generated Daily Insights
          <div className="w-full max-w-4xl">
            <div className="space-y-6">
              {dailyAnalysis.data.structured_advice &&
              "cards" in dailyAnalysis.data.structured_advice ? (
                renderAIGeneratedCards(
                  dailyAnalysis.data.structured_advice as StructuredDailyAdvice
                )
              ) : (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg text-center">
                  <p className="text-gray-700">
                    {dailyAnalysis.data.structured_advice?.error
                      ? `Error: ${dailyAnalysis.data.structured_advice.error}`
                      : "Unable to load daily programs. Please try again."}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
