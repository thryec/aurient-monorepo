"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Share2, X } from "lucide-react";

const Header = () => {
  const router = useRouter();
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    // Check if iOS Safari and not already installed
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

    if (isIOSDevice && isSafari && !isStandalone) {
      // Show hint after a delay
      const timer = setTimeout(() => {
        setShowIOSHint(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
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
              onClick={() => router.push("/overview")}
              className="hover:text-gray-900 transition-colors hover:cursor-pointer"
            >
              overview
            </button>
            <button
              onClick={() => router.push("/insights")}
              className="hover:text-gray-900 transition-colors hover:cursor-pointer"
            >
              insights
            </button>
            <button
              onClick={() => router.push("/marketplace")}
              className="hover:text-gray-900 transition-colors hover:cursor-pointer"
            >
              marketplace
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="hover:text-gray-900 transition-colors hover:cursor-pointer"
            >
              dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* iOS Installation Hint */}
      {showIOSHint && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-3 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <Share2 size={16} />
            <span>
              Tap <strong>Share</strong> then{" "}
              <strong>&quot;Add to Home Screen&quot;</strong> to install
            </span>
            <button
              onClick={() => setShowIOSHint(false)}
              className="ml-2 text-white/80 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
