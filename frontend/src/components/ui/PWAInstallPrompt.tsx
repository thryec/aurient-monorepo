"use client";

import { useState, useEffect } from "react";
import { X, Download, Share2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
      return; // Don't show prompt if already installed
    }

    // Detect iOS Safari
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    setIsIOS(isIOSDevice && isSafari);

    // Handle Chrome/Edge installation prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show iOS prompt after a delay if no Chrome prompt
    if (isIOSDevice && isSafari) {
      const timer = setTimeout(() => {
        if (!showPrompt) {
          setShowPrompt(true);
        }
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, [showPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  // Don't show if already running as PWA
  if (isStandalone) return null;

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm mx-auto">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Install Aurient
          </h3>

          {isIOS ? (
            <div>
              <p className="text-xs text-gray-600 mb-3">
                Add Aurient to your home screen for quick access and offline
                use.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 size={14} className="text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">
                    How to install:
                  </span>
                </div>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>
                    1. Tap the <strong>Share</strong> button
                  </li>
                  <li>
                    2. Scroll down and tap{" "}
                    <strong>&quot;Add to Home Screen&quot;</strong>
                  </li>
                  <li>
                    3. Tap <strong>&quot;Add&quot;</strong> to confirm
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-600 mb-3">
              Add Aurient to your home screen for quick access and offline use.
            </p>
          )}

          <div className="flex gap-2">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-blue-600 text-white text-xs px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download size={14} />
                Install
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isIOS ? "Got it" : "Not now"}
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
