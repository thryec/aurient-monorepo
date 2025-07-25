export interface User {
  id: string;
  address: string;
  username?: string;
  avatar?: string;
}

export interface Wallet {
  address: string;
  balance: string;
  chainId: number;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface ScreenProps {
  navigation: any;
  route: any;
}
