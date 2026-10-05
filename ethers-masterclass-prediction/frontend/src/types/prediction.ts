// Types for Ethers.js Prediction Market dApp

export enum MarketOutcome {
  PENDING = 0,
  YES = 1,
  NO = 2,
  CANCELED = 3
}

export interface PredictionMarketData {
  id: number;
  title: string;
  category: string;
  endTime: number;
  outcome: MarketOutcome;
  totalYesPool: string;
  totalNoPool: string;
  resolved: boolean;
  userYesBet: string;
  userNoBet: string;
  userClaimed: boolean;
  userEstimatedWinnings: string;
  isExpired: boolean;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface PredictionEventLog {
  id: string;
  type: 'MarketCreated' | 'BetPlaced' | 'MarketResolved' | 'WinningsClaimed';
  marketId: number;
  user?: string;
  amount?: string;
  outcome?: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: string;
}


