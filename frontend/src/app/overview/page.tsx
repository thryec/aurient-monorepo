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

  // Emma's hardcoded personalized health advice
  const emmaAdvice: StructuredAdvice = {
    title: "Emma's Personalized Health Advice",
    user_profile: {
      name: "Emma",
      age: 26,
      focus_areas: [
        "sleep consistency and quality",
        "cycle-based training intensity",
        "recovery optimization",
        "nutrition timing",
      ],
    },
    sections: {
      behavioral: {
        title: "Behavioral Recommendations",
        icon: "🧠",
        recommendations: [
          {
            title: "Optimize Sleep Timing",
            description:
              "Your sleep score (83.55) is good, but your HRV data suggests room for improvement. Aim for consistent 7-8 hour sleep periods, especially during your luteal phase when sleep quality naturally declines.",
            reasoning:
              "Consistent sleep supports hormonal balance and recovery, especially during the luteal phase.",
            actionable_steps: [
              "Set a regular bedtime and wake time.",
              "Use blackout curtains to improve sleep quality.",
              "Track sleep duration and quality each night.",
            ],
          },
          {
            title: "Stress Management",
            description:
              "Your stress data shows high periods of stress (mean stress_high = 4606.74). Implement: Morning HRV-guided breathing (6 breaths/minute) during follicular phase, evening cool-down routine during luteal phase, and regular mindfulness sessions timed with your cycle (more frequent during luteal phase).",
            reasoning:
              "HRV-guided breathing and mindfulness reduce stress and improve resilience, especially when timed with your cycle.",
            actionable_steps: [
              "Practice HRV breathing each morning.",
              "Add a 10-minute mindfulness session in the evening.",
              "Increase mindfulness frequency during luteal phase.",
            ],
          },
        ],
      },
      exercise: {
        title: "Exercise Recommendations",
        icon: "💪",
        recommendations: [
          {
            title: "Cycle-Based Training",
            description:
              "Follicular Phase: Leverage your higher HRV (78.06 average) for high-intensity training (3-4 strength sessions, 2 HIIT sessions, progressive overload focus). Luteal Phase: Modify for reduced recovery capacity (2-3 strength sessions at moderate intensity, replace HIIT with steady-state cardio, focus on technique and maintenance).",
            reasoning:
              "Training intensity should match hormonal fluctuations for optimal results and recovery.",
            actionable_steps: [
              "Plan high-intensity workouts during follicular phase.",
              "Switch to moderate intensity and steady-state cardio during luteal phase.",
              "Track HRV and readiness to guide daily intensity.",
            ],
          },
          {
            title: "Recovery Protocol",
            description:
              "Your active calorie burn (776.74 mean) suggests good activity levels. Implement: 24-hour recovery between high-intensity sessions, extended recovery (48 hours) during luteal phase, and use readiness score (80.84 mean) to guide daily intensity.",
            reasoning:
              "Proper recovery prevents overtraining and supports adaptation, especially during hormonal shifts.",
            actionable_steps: [
              "Schedule at least 24 hours between intense sessions.",
              "Allow 48 hours recovery during luteal phase.",
              "Monitor readiness score before each workout.",
            ],
          },
        ],
      },
      nutrition: {
        title: "Nutrition Recommendations",
        icon: "🥗",
        recommendations: [
          {
            title: "Cycle-Synced Nutrition",
            description:
              "Follicular Phase: Higher protein (1.8-2.0g/kg) for muscle development, complex carbs to support increased training volume. Luteal Phase: Increase calories by 5-10% to support higher BMR, focus on magnesium-rich foods for sleep support, increase iron-rich foods during menstruation.",
            reasoning:
              "Nutritional needs change with cycle phase; syncing intake supports performance and recovery.",
            actionable_steps: [
              "Increase protein and carbs during follicular phase.",
              "Add magnesium and iron-rich foods during luteal phase.",
              "Increase calories slightly during luteal phase.",
            ],
          },
          {
            title: "Hydration",
            description:
              "Base: 2.7L daily, add 500ml per hour of exercise, increase by 10% during luteal phase.",
            reasoning:
              "Proper hydration supports metabolism and recovery, especially with increased BMR during luteal phase.",
            actionable_steps: [
              "Drink at least 2.7L water daily.",
              "Add 500ml for each hour of exercise.",
              "Increase intake by 10% during luteal phase.",
            ],
          },
        ],
      },
      supplementation: {
        title: "Supplementation Recommendations",
        icon: "💊",
        recommendations: [
          {
            title: "Core Supplements",
            description:
              "Magnesium (200-400mg) - supports sleep quality and HRV; Iron (18mg) - particularly important during menstruation; Vitamin D3 (2000-4000 IU) - supports recovery and performance.",
            reasoning:
              "These supplements are evidence-based for women's health and performance.",
            actionable_steps: [
              "Take magnesium in the evening.",
              "Supplement iron during menstruation.",
              "Take vitamin D3 daily.",
            ],
          },
          {
            title: "Cycle-Specific Supplements",
            description:
              "Follicular Phase: BCAAs during training, creatine monohydrate (5g daily). Luteal Phase: Omega-3s (2-3g daily) for inflammation management, B-complex for energy support.",
            reasoning:
              "Cycle-specific supplements support training adaptation and recovery.",
            actionable_steps: [
              "Add BCAAs and creatine during follicular phase.",
              "Take omega-3s and B-complex during luteal phase.",
            ],
          },
        ],
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 via-orange-200 to-yellow-300 relative overflow-hidden">
      <Header />

      <div className="w-full flex flex-col items-center justify-start py-16 px-4">
        <div className="max-w-2xl w-full text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-4 tracking-tight">
            Health Overview
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light mb-8">
            comprehensive AI-powered health insights
          </p>
        </div>
        <div className="w-full max-w-5xl">
          {renderStructuredAdviceCards(emmaAdvice)}
        </div>
      </div>
    </div>
  );
}
