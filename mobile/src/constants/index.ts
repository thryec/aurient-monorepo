export const APP_CONFIG = {
  name: "Aurient",
  version: "1.0.0",
  description: "Aurient Mobile App",
};

export const NETWORKS = {
  mainnet: {
    id: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
  },
  sepolia: {
    id: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
  },
};

export const COLORS = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  background: "#ffffff",
  text: "#1f2937",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
};

export const STORAGE_KEYS = {
  USER_PREFERENCES: "user_preferences",
  WALLET_CONNECTION: "wallet_connection",
  AUTH_TOKEN: "auth_token",
};
