"use client";

import React, { useState } from "react";
import Header from "../../components/navigation/Header";
import InsightCard from "../../components/insights/InsightCard";
import CARD_CONTENT from "../../components/insights/insightCardContent";

function Card({ title, items, description, sources }: any) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={`relative w-full max-w-sm h-72 perspective cursor-pointer`}
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        className={`transition-transform duration-500 w-full h-full absolute [transform-style:preserve-3d] ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute w-full h-full rounded-2xl shadow-xl flex flex-col justify-center items-start px-10 py-8 [backface-visibility:hidden] border border-white/60 bg-gradient-to-br from-pink-100 via-yellow-100 to-purple-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
          <ol className="space-y-2">
            {items.map((item: string, idx: number) => (
              <li key={idx} className="flex items-start">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold mr-3 text-lg">
                  {idx + 1}
                </span>
                <span className="text-lg text-gray-900 font-light">{item}</span>
              </li>
            ))}
          </ol>
        </div>
        {/* Back */}
        <div className="absolute w-full h-full rounded-2xl flex flex-col justify-center items-start px-10 py-8 border border-white/60 bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 text-gray-900 rotate-y-180 [backface-visibility:hidden]">
          <h4 className="text-lg font-semibold mb-2">Why this matters</h4>
          <p className="mb-4 font-light">{description}</p>
          <h5 className="text-sm font-semibold mb-1">Sources:</h5>
          <ul className="list-disc list-inside text-sm font-light">
            {sources.map((src: string, idx: number) => (
              <li key={idx}>{src}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 via-orange-200 to-red-300 relative overflow-hidden">
        <Header />
        <div className="w-full flex flex-col items-center justify-start py-16 px-4">
          <div className="max-w-2xl w-full text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-4 tracking-tight">
              Today's Programs
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-light mb-8">
              to support your health goals
            </p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="relative bg-black text-white px-10 py-4 rounded-full font-light text-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center mx-auto min-w-[180px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                  Generating...
                </span>
              ) : (
                "Generate"
              )}
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center items-stretch">
            {CARD_CONTENT.map((card, idx) => (
              <div
                key={card.title}
                className="flex flex-col items-center w-full max-w-sm"
              >
                <div className="mb-3 text-2xl font-bold text-gray-900 text-center">
                  {card.title}
                </div>
                <InsightCard {...card} />
              </div>
            ))}
          </div>
          <p className="mt-10 text-gray-500 text-center text-base font-light max-w-xl">
            Click a card to flip and see more details, including why it matters
            and sources.
          </p>
        </div>
      </div>
    </>
  );
}
