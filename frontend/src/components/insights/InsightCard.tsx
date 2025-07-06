"use client";

import React, { useState } from "react";

interface Source {
  name: string;
  url: string;
}

interface InsightCardProps {
  items: string[];
  description: string;
  sources: Source[] | string[];
}

const InsightCard: React.FC<InsightCardProps> = ({
  items,
  description,
  sources,
}) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={`relative w-full max-w-sm min-h-72 perspective cursor-pointer`}
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        className={`transition-transform duration-500 w-full h-full absolute [transform-style:preserve-3d] ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute w-full min-h-full rounded-2xl shadow-xl flex flex-col justify-center items-start px-10 py-8 [backface-visibility:hidden] border border-white/60 bg-gradient-to-br from-pink-100 via-yellow-100 to-purple-100">
          <ul className="space-y-2">
            {items.map((item, idx) => {
              // Check if this is a nutrition item with meal type
              const mealMatch = item.match(/^(BREAKFAST|LUNCH|DINNER|SNACK):\s*(.+)$/);
              if (mealMatch) {
                const [, mealType, mealContent] = mealMatch;
                return (
                  <li key={idx} className="text-sm text-gray-900 font-light">
                    <span className="font-semibold text-gray-800">{mealType}:</span> {mealContent}
                  </li>
                );
              }
              return (
                <li key={idx} className="text-sm text-gray-900 font-light">
                  {item}
                </li>
              );
            })}
          </ul>
        </div>
        {/* Back */}
        <div className="absolute w-full min-h-full rounded-2xl flex flex-col justify-center items-start px-10 py-8 border border-white/60 bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 text-gray-900 rotate-y-180 [backface-visibility:hidden]">
          <h4 className="text-sm font-semibold mb-2">Why this matters</h4>
          <p className="mb-4 font-light text-xs">{description}</p>
          <h5 className="text-xs font-semibold mb-1">Sources:</h5>
          <ul className="list-disc list-inside text-xs font-light break-words">
            {sources.map((src, idx) => (
              <li key={idx} className="mb-1">
                {typeof src === 'object' && src.url ? (
                  <a 
                    href={src.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 break-words"
                  >
                    {src.name}
                  </a>
                ) : typeof src === 'string' && src.startsWith('http') ? (
                  <a 
                    href={src} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 break-all"
                  >
                    {`Research Study ${idx + 1}`}
                  </a>
                ) : (
                  <span className="break-words">{typeof src === 'string' ? src : src.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
