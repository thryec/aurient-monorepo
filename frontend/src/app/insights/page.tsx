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

// Hardcoded dailyAnalysis data for production fallback
const HARDCODED_DAILY_ANALYSIS = {
  success: true,
  data: {
    structured_advice: {
      title: "Emma's Daily Health Programs",
      date: "2024-06-18",
      cycle_phase: "Early Follicular",
      cards: [
        {
          title: "Movement",
          items: [
            "Burpees 60 seconds",
            "Shoulder taps 60 seconds",
            "V Ups 60 seconds",
            "30 Second rest",
            "Repeat x5",
          ],
          description:
            "This movement program is tailored for Emma's early follicular phase, when HRV and recovery capacity are highest. High-intensity intervals like burpees and V-ups maximize cardiovascular and muscular adaptation, leveraging Emma's optimal readiness and performance window as indicated by her Oura data.",
          sources: [
            {
              name: "Effects of menstrual cycle phase on exercise performance in women: a systematic review and meta-analysis",
              url: "https://pubmed.ncbi.nlm.nih.gov/32030931/",
            },
            {
              name: "Heart rate variability-guided training in female athletes",
              url: "https://doi.org/10.1136/bjsports-2017-098418",
            },
          ],
        },
        {
          title: "Mindfulness",
          items: [
            "The 4-2-8 Breathing Method",
            "Inhale: Breathe in slowly and deeply through your nose for a count of four.",
            "Hold: Hold your breath for a count of two.",
            "Exhale: Exhale slowly and completely through your mouth for a count of eight.",
            "Repeat: Repeat this cycle for 5-10 minutes or until you feel calmer.",
          ],
          description:
            "Emma's HRV data suggests mild stress in the late luteal phase. The 4-2-8 breathing method is proven to increase parasympathetic activity, lower stress, and improve sleep quality, making it ideal for her current physiological state.",
          sources: [
            {
              name: "Resonance breathing to reduce stress: A randomized controlled trial",
              url: "https://pubmed.ncbi.nlm.nih.gov/31298712/",
            },
            {
              name: "Heart rate variability biofeedback increases cardiac vagal tone in healthy adults",
              url: "https://doi.org/10.1016/j.ijpsycho.2017.11.009",
            },
          ],
        },
        {
          title: "Nutrition",
          items: [
            "Breakfast: Granola with Greek Yogurt and blueberries and honey",
            "Lunch: Salmon and quinoa salad with kale",
            "Dinner: Paprika chicken with brown rice and broccoli",
            "Snack: Mixed nuts and apple slices",
          ],
          description:
            "This meal plan supports Emma's high activity and recovery needs, providing optimal protein, omega-3s, and micronutrients. The focus on whole foods and balanced macros aligns with her Oura data patterns and supports hormonal balance during the early follicular phase.",
          sources: [
            {
              name: "Nutritional strategies to optimize recovery in female athletes",
              url: "https://pubmed.ncbi.nlm.nih.gov/29562368/",
            },
            {
              name: "Dietary protein intake and menstrual cycle phase: implications for female athletes",
              url: "https://doi.org/10.3390/nu12082236",
            },
          ],
        },
      ],
    },
    userMetadata: {
      name: "Emma",
      age: 26,
      goals: "performance",
      activity_level: "active",
      focus_areas: ["sleep optimization", "recovery", "cardiovascular health"],
    },
    dataSummary: {
      datasets: [
        "daily_activity",
        "cardiovascular_age",
        "daily_readiness",
        "daily_resilience",
        "daily_sleep",
        "daily_spo2",
        "daily_stress",
        "heart_rate",
        "ring_config",
        "sessions",
        "sleep_detailed",
        "tags",
        "vo2_max",
        "workouts",
      ],
      total_records: 337241,
    },
  },
};

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

    // Use hardcoded data instead of fetching from backend
    setDailyAnalysis(HARDCODED_DAILY_ANALYSIS);
    setShowDailyInsights(true);
    setLoading(false);
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

  // If showDailyInsights is true and dailyAnalysis is null, use hardcoded data
  const analysisToShow =
    showDailyInsights && !dailyAnalysis
      ? HARDCODED_DAILY_ANALYSIS
      : dailyAnalysis;

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
        {showDailyInsights && analysisToShow?.success && analysisToShow.data ? (
          // AI-Generated Daily Insights
          <div className="w-full max-w-4xl">
            <div className="space-y-6">
              {analysisToShow.data.structured_advice &&
              "cards" in analysisToShow.data.structured_advice ? (
                renderAIGeneratedCards(
                  analysisToShow.data.structured_advice as StructuredDailyAdvice
                )
              ) : (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg text-center">
                  <p className="text-gray-700">
                    {analysisToShow.data.structured_advice?.error
                      ? `Error: ${analysisToShow.data.structured_advice.error}`
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
