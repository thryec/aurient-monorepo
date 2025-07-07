"use client";

import { useState, useEffect } from "react";
import {
  healthDataService,
  HealthAnalysisResponse,
  StructuredAdvice,
  Recommendation,
} from "@/lib/healthDataService";
import Header from "../../components/navigation/Header";

const OVERVIEW_CACHE_KEY = "aurient_health_overview_cache";

export default function OverviewPage() {
  const [analysisData, setAnalysisData] =
    useState<HealthAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  // Load cached data on component mount
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cached = localStorage.getItem(OVERVIEW_CACHE_KEY);
        if (cached) {
          const cachedData = JSON.parse(cached);
          // Check if cache is less than 24 hours old
          const cacheAge = Date.now() - cachedData.timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours

          if (cacheAge < maxAge) {
            setAnalysisData(cachedData.data);
            setShowResults(true);
            setIsFromCache(true);
            console.log("Loaded cached health overview");
          } else {
            // Clear expired cache
            localStorage.removeItem(OVERVIEW_CACHE_KEY);
          }
        }
      } catch (error) {
        console.error("Error loading cached data:", error);
        localStorage.removeItem(OVERVIEW_CACHE_KEY);
      }
    };

    loadCachedData();
  }, []);

  // Save data to cache when analysis completes
  const saveToCache = (data: HealthAnalysisResponse) => {
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
      };
      localStorage.setItem(OVERVIEW_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };

  const generateOverviewRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await healthDataService.generateOverviewRecommendations();
      setAnalysisData(response);

      if (response.success) {
        setShowResults(true);
        setIsFromCache(false);
        saveToCache(response); // Cache the successful response
      } else {
        setError(response.error || "Failed to generate recommendations");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearCacheAndRegenerate = () => {
    localStorage.removeItem(OVERVIEW_CACHE_KEY);
    setAnalysisData(null);
    setShowResults(false);
    setError(null);
    setIsFromCache(false);
  };

  const renderRecommendation = (rec: Recommendation, index: number) => (
    <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">{rec.title}</h4>
      <p className="text-gray-700 font-light mb-3">{rec.description}</p>
      <p className="text-sm text-gray-600 font-light italic mb-3">
        {rec.reasoning}
      </p>
      {rec.actionable_steps && rec.actionable_steps.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">
            Action Steps:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {rec.actionable_steps.map((step, stepIndex) => (
              <li key={stepIndex} className="text-sm text-gray-700 font-light">
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderStructuredAdviceCards = (structuredAdvice: StructuredAdvice) => {
    const sections = [
      { key: "behavioral", data: structuredAdvice.sections.behavioral },
      { key: "exercise", data: structuredAdvice.sections.exercise },
      { key: "nutrition", data: structuredAdvice.sections.nutrition },
      {
        key: "supplementation",
        data: structuredAdvice.sections.supplementation,
      },
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map(({ key, data }) => (
          <div
            key={key}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-2xl font-light text-gray-900">
                {data.title}
              </h3>
            </div>
            <div className="space-y-4">
              {data.recommendations.map((rec, index) =>
                renderRecommendation(rec, index)
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 via-orange-200 to-yellow-300 relative overflow-hidden">
      <Header />

      <div className="w-full flex flex-col items-center justify-start py-16 px-4">
        {!showResults ? (
          // Initial state - similar to insights page
          <div className="max-w-2xl w-full text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-4 tracking-tight">
              Health Overview
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-light mb-8">
              comprehensive AI-powered health insights
            </p>

            <button
              onClick={generateOverviewRecommendations}
              disabled={loading}
              className="relative bg-black text-white px-10 py-4 rounded-full font-light text-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center mx-auto min-w-[200px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                  Analyzing...
                </span>
              ) : (
                "Generate Health Overview"
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="max-w-2xl w-full mt-8 p-4 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-red-700 text-center font-light">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mt-12 max-w-lg mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <div className="text-center">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Analyzing Your Health Data
                      </h3>
                      <p className="text-gray-600 font-light">
                        AI is processing your Oura Ring data to generate
                        personalized recommendations...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Results state
          <div className="w-full max-w-5xl">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 tracking-tight">
                Emma&apos;s Personalized Health Advice
              </h1>
            </div>

            {analysisData?.success && analysisData.data && (
              <div className="space-y-8">
                {/* AI Recommendations */}
                {analysisData.data.structured_advice &&
                "sections" in analysisData.data.structured_advice ? (
                  <>
                    {renderStructuredAdviceCards(
                      analysisData.data.structured_advice as StructuredAdvice
                    )}
                  </>
                ) : (
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg">
                    <h2 className="text-2xl font-light text-gray-900 mb-6">
                      Health Recommendations
                    </h2>
                    <div className="text-gray-700">
                      {analysisData.data.structured_advice?.error ? (
                        <p>
                          Error: {analysisData.data.structured_advice.error}
                        </p>
                      ) : (
                        <p>
                          Unable to load structured recommendations. Please try
                          again.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
