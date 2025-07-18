"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="mb-6">
          <WifiOff className="mx-auto h-16 w-16 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          You&apos;re Offline
        </h1>
        <p className="text-gray-600 mb-6 max-w-md">
          It looks like you&apos;ve lost your internet connection. Some features
          may not be available while offline.
        </p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Aurient works offline for basic features
        </p>
      </div>
    </div>
  );
}
