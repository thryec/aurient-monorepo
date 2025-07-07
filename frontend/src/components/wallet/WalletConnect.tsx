"use client";

import React from "react";
import {
  Wallet,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

interface WalletConnectProps {
  /** Size variant for different use cases */
  variant?: "default" | "compact" | "hero";
  /** Show balance if connected */
  showBalance?: boolean;
  /** Show network status */
  showNetwork?: boolean;
  /** Custom class names */
  className?: string;
  /** What happens after successful connection */
  onConnected?: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  variant = "default",
  showBalance = false,
  showNetwork = true,
  className = "",
  onConnected,
}) => {
  const {
    address,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    isOnStoryNetwork,
    switchToStoryNetwork,
    getBalance,
  } = useWallet();

  const [balance, setBalance] = React.useState<string>("0");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Load balance when connected
  React.useEffect(() => {
    if (isConnected && showBalance) {
      const loadBalance = async () => {
        try {
          const bal = await getBalance();
          if (bal) {
            setBalance((Number(bal) / 1e18).toFixed(2));
          }
        } catch (error) {
          console.error("Failed to load balance:", error);
        }
      };
      loadBalance();
    }
  }, [isConnected, showBalance, getBalance]);

  // Call onConnected when wallet connects
  React.useEffect(() => {
    if (isConnected && onConnected) {
      onConnected();
    }
  }, [isConnected, onConnected]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".wallet-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleDisconnect = () => {
    disconnectWallet();
    setIsDropdownOpen(false);
  };

  // Styling variants
  const getButtonStyles = () => {
    const base =
      "font-light transition-all duration-300 flex items-center gap-3 rounded-full";

    switch (variant) {
      case "hero":
        return `${base} bg-gray-900 text-white px-8 py-4 text-lg hover:bg-gray-800 justify-center`;
      case "compact":
        return `${base} bg-gray-900 text-white px-4 py-2 text-sm hover:bg-gray-800`;
      default:
        return `${base} bg-gray-900 text-white px-6 py-3 hover:bg-gray-800`;
    }
  };

  const getContainerStyles = () => {
    if (variant === "hero") {
      return "text-center max-w-md mx-auto";
    }
    return "flex items-center gap-4";
  };

  if (!isConnected) {
    return (
      <div className={`${getContainerStyles()} ${className}`}>
        {variant === "hero" && (
          <div className="mb-6">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-700">
              Connect your wallet to access the platform and manage your health
              data IP assets.
            </p>
          </div>
        )}

        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className={getButtonStyles()}
        >
          <Wallet className="w-5 h-5" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      </div>
    );
  }

  return (
    <div className={`${getContainerStyles()} ${className}`}>
      {/* Wallet Dropdown */}
      <div className="relative wallet-dropdown">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200 hover:bg-white transition-colors"
        >
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-gray-900 font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-[200px] z-50">
            {/* Wallet Address */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Connected Wallet</p>
              <p className="text-sm font-mono text-gray-900 break-all">
                {address}
              </p>
            </div>

            {/* Balance (if enabled) */}
            {showBalance && (
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Balance</p>
                <p className="text-sm font-medium text-gray-900">
                  {balance} IP
                </p>
              </div>
            )}

            {/* Disconnect Button */}
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>

      {/* Balance Display (for non-dropdown variants) */}
      {showBalance && variant !== "default" && (
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
          <span className="text-sm text-gray-600">Balance: </span>
          <span className="font-medium text-gray-900">{balance} IP</span>
        </div>
      )}

      {/* Network Warning */}
      {showNetwork && !isOnStoryNetwork && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div className="flex-1">
              <p className="font-medium text-orange-900 text-sm">
                Wrong Network
              </p>
              <p className="text-xs text-orange-700">
                Please switch to Story Protocol testnet to continue.
              </p>
            </div>
            <button
              onClick={switchToStoryNetwork}
              className="bg-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-light hover:bg-orange-700 transition-colors"
            >
              Switch Network
            </button>
          </div>
        </div>
      )}

      {/* Hero variant shows disconnect option */}
      {variant === "hero" && (
        <div className="mt-6">
          <button
            onClick={disconnectWallet}
            className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
