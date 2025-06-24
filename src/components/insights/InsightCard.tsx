"use client";

import React, { useState } from "react";

interface InsightCardProps {
  items: string[];
  description: string;
  sources: string[];
}

const InsightCard: React.FC<InsightCardProps> = ({
  items,
  description,
  sources,
}) => {
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
          <ol className="space-y-2">
            {items.map((item, idx) => (
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
            {sources.map((src, idx) => (
              <li key={idx}>{src}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
