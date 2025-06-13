// src/hooks/useWallet.ts

import { useState, useEffect } from "react";
import { createWalletClient, custom, createPublicClient, http } from "viem";
import { storyTestnet } from "viem/chains";
import { WalletState } from "@/lib/types";

// Story Protocol testnet configuration
const storyTestnetConfig = {
  id: 1315,
  name: "Story Protocol Testnet",
  network: "story-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "IP",
    symbol: "IP",
  },
  rpcUrls: {
    default: {
      http: ["https://aeneid.storyrpc.io/"],
    },
    public: {
      http: ["https://aeneid.storyrpc.io/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Story Explorer",
      url: "https://aeneid.story.foundation/",
    },
  },
} as const;

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
  });

  const [walletClient, setWalletClient] = useState<any>(null);
  const [publicClient, setPublicClient] = useState<any>(null);

  // Initialize clients when wallet is connected
  useEffect(() => {
    if (walletState.isConnected && window.ethereum) {
      const client = createWalletClient({
        chain: storyTestnetConfig,
        transport: custom(window.ethereum),
      });

      const pubClient = createPublicClient({
        chain: storyTestnetConfig,
        transport: http("https://aeneid.storyrpc.io/"),
      });

      setWalletClient(client);
      setPublicClient(pubClient);
    }
  }, [walletState.isConnected]);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask to connect your wallet");
      return;
    }

    setWalletState((prev) => ({ ...prev, isConnecting: true }));

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Get current chain ID
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      setWalletState({
        address: accounts[0] as `0x${string}`,
        isConnected: true,
        isConnecting: false,
        chainId: parseInt(chainId, 16),
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setWalletState((prev) => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      address: null,
      isConnected: false,
      isConnecting: false,
      chainId: null,
    });
    setWalletClient(null);
    setPublicClient(null);
  };

  const switchToStoryNetwork = async () => {
    if (typeof window.ethereum === "undefined") return;

    try {
      // Try to switch to Story Protocol testnet
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x523" }], // 1315 in hex
      });

      setWalletState((prev) => ({ ...prev, chainId: 1315 }));
    } catch (switchError: any) {
      // Network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x523",
                chainName: "Story Protocol Testnet",
                rpcUrls: ["https://aeneid.storyrpc.io/"],
                nativeCurrency: {
                  name: "IP",
                  symbol: "IP",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://aeneid.story.foundation/"],
              },
            ],
          });
          setWalletState((prev) => ({ ...prev, chainId: 1315 }));
        } catch (addError) {
          console.error("Failed to add Story Protocol network:", addError);
        }
      }
    }
  };

  const getBalance = async () => {
    if (!publicClient || !walletState.address) return null;

    try {
      const balance = await publicClient.getBalance({
        address: walletState.address,
      });
      return balance;
    } catch (error) {
      console.error("Failed to get balance:", error);
      return null;
    }
  };

  const sendTransaction = async (
    to: `0x${string}`,
    value: bigint,
    data?: `0x${string}`
  ) => {
    if (!walletClient || !walletState.address) {
      throw new Error("Wallet not connected");
    }

    try {
      const hash = await walletClient.sendTransaction({
        account: walletState.address,
        to,
        value,
        data,
        chain: storyTestnetConfig,
      });
      return hash;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  const writeContract = async (contractConfig: any) => {
    if (!walletClient || !walletState.address) {
      throw new Error("Wallet not connected");
    }

    try {
      const hash = await walletClient.writeContract({
        account: walletState.address,
        chain: storyTestnetConfig,
        ...contractConfig,
      });
      return hash;
    } catch (error) {
      console.error("Contract write failed:", error);
      throw error;
    }
  };

  const readContract = async (contractConfig: any) => {
    if (!publicClient) {
      throw new Error("Public client not initialized");
    }

    try {
      const result = await publicClient.readContract(contractConfig);
      return result;
    } catch (error) {
      console.error("Contract read failed:", error);
      throw error;
    }
  };

  const waitForTransaction = async (hash: `0x${string}`) => {
    if (!publicClient) {
      throw new Error("Public client not initialized");
    }

    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 60_000, // 60 seconds
      });
      return receipt;
    } catch (error) {
      console.error("Failed to wait for transaction:", error);
      throw error;
    }
  };

  // Check for existing connection on mount
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      // Check if already connected
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            window.ethereum
              .request({ method: "eth_chainId" })
              .then((chainId: string) => {
                setWalletState({
                  address: accounts[0] as `0x${string}`,
                  isConnected: true,
                  isConnecting: false,
                  chainId: parseInt(chainId, 16),
                });
              });
          }
        });

      // Listen for account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletState((prev) => ({
            ...prev,
            address: accounts[0] as `0x${string}`,
          }));
        }
      };

      // Listen for chain changes
      const handleChainChanged = (chainId: string) => {
        setWalletState((prev) => ({
          ...prev,
          chainId: parseInt(chainId, 16),
        }));
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Cleanup
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  return {
    ...walletState,
    walletClient,
    publicClient,
    connectWallet,
    disconnectWallet,
    switchToStoryNetwork,
    getBalance,
    sendTransaction,
    writeContract,
    readContract,
    waitForTransaction,
    isOnStoryNetwork: walletState.chainId === 1315,
  };
};
