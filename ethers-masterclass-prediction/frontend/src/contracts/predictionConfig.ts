// PredictionMarketOracleHub ABI & Addresses
export const PREDICTION_HUB_ADDRESS = "0x2b76e3270698c75c2f1bc46C6190Fb5565ED278b";

export const PREDICTION_HUB_ABI = [
  "function nextMarketId() view returns (uint256)",
  "function markets(uint256) view returns (uint256 id, string title, string category, uint256 endTime, uint8 outcome, uint256 totalYesPool, uint256 totalNoPool, bool resolved)",
  "function userBets(uint256, address) view returns (uint256 yesAmount, uint256 noAmount, bool claimed)",
  "function calculateWinnings(uint256 _marketId, address _user) view returns (uint256)",
  "function getAllMarkets() view returns (tuple(uint256 id, string title, string category, uint256 endTime, uint8 outcome, uint256 totalYesPool, uint256 totalNoPool, bool resolved)[])",
  "function placeBet(uint256 _marketId, bool _isYes) payable",
  "function claimWinnings(uint256 _marketId)",
  "function createMarket(string _title, string _category, uint256 _durationSeconds) returns (uint256)",
  "function resolveMarket(uint256 _marketId, uint8 _outcome)",
  "event MarketCreated(uint256 indexed marketId, string title, string category, uint256 endTime)",
  "event BetPlaced(uint256 indexed marketId, address indexed user, bool isYes, uint256 amount)",
  "event MarketResolved(uint256 indexed marketId, uint8 outcome)",
  "event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount)"
];


export const CONTRACTS = {
  predictionHub: {
    address: PREDICTION_HUB_ADDRESS,
    abi: PREDICTION_HUB_ABI,
  },}