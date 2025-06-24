"use client";

import React from "react";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  return (
    <nav className="relative z-10 p-6 md:p-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div
          className="text-gray-900 font-light text-xl tracking-wide hover:cursor-pointer"
          onClick={() => router.push("/")}
        >
          Aurient
        </div>
        <div className="hidden md:flex space-x-8 text-gray-700 font-light">
          <a
            href="#how-it-works"
            className="hover:text-gray-900 transition-colors"
          >
            how it works
          </a>
          <button
            onClick={() => router.push("/marketplace")}
            className="hover:text-gray-900 transition-colors"
          >
            marketplace
          </button>
          <a href="#about" className="hover:text-gray-900 transition-colors">
            about
          </a>
          <button
            onClick={() => router.push("/insights")}
            className="hover:text-gray-900 transition-colors"
          >
            insights
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
