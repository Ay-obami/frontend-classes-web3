import { PredictionMarketData } from '../types/prediction';
import { useEffect, useState, useMemo, useCallback } from "react";
import { useContract } from "./useContract";
import { CONTRACTS } from '../contracts/predictionConfig';
import { formatEther, parseEther } from 'ethers';


export const usePredictionMarket = (walletAddress: string | null) => {

  const [markets, setMarkets] = useState<PredictionMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const { predictionHub } = CONTRACTS;
  const { getContract } = useContract();

  const predictionHubContract = useMemo(
    () => getContract(predictionHub.address, predictionHub.abi),
    [getContract]
  );

  const predictionHubWriteContract = useMemo(
    () => getContract(predictionHub.address, predictionHub.abi, true),
    [getContract]
  );

  const getAllMarkets = useCallback(async () => {
    console.log("Fetching all markets...");

    if (!predictionHubContract) {
      throw new Error("Prediction market contract is not available.");
    }

    const markets = await predictionHubContract.getAllMarkets();

    console.log("RAW MARKETS:", markets);
    console.log("FIRST MARKET:", markets[0]);

    const marketData: PredictionMarketData[] = await Promise.all(
      markets.map(async (market: any) => {
        const id = Number(market[0]);

        let userBets: any = [0n, 0n, false];
        let userWinnings = 0n;

        if (walletAddress) {
          userBets = await predictionHubContract.userBets(id, walletAddress);
          userWinnings = await predictionHubContract.calculateWinnings(id, walletAddress);
        }

        const title = market[1];
        const category = market[2];
        const endTime = Number(market[3]);
        const outcome = Number(market[4]);
        const totalYesPool = formatEther(market[5]);
        const totalNoPool = formatEther(market[6]);
        const resolved = market[7];

        const isExpired =
          endTime <= Math.floor(Date.now() / 1000);

        return {
          id,
          title,
          category,
          endTime,
          outcome,
          totalYesPool,
          totalNoPool,
          resolved,

          userYesBet: userBets[0] === 0n ? '0' : formatEther(userBets[0]),
          userNoBet: userBets[1] === 0n ? '0' : formatEther(userBets[1]),
          userClaimed: userBets[2],
          userEstimatedWinnings: userWinnings === 0n ? '0' : formatEther(userWinnings),

          isExpired,
        };
      })
    );

    console.log("PROCESSED MARKETS:", marketData);

    return marketData;
  }, [
    predictionHubContract,
    walletAddress,
  ]);

  const updateMarkets = useCallback(async () => {
    try {
      const allMarkets = await getAllMarkets();
      setMarkets(allMarkets);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  }, [getAllMarkets]);

  const claimWinnings = async (marketId: number) => {
    console.log("claim winnings");

    if (!predictionHubWriteContract || !walletAddress) {
      throw new Error("Please connect your wallet first.");
    }

    try {
      const claimTx = await predictionHubWriteContract.claimWinnings(marketId);
      await claimTx.wait();

      await updateMarkets();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
      throw err;
    }
  };

  const placeBet = async (marketId: number, isYes: boolean, amountEth: string) => {
    console.log("place bet");

    if (!predictionHubWriteContract || !walletAddress) {
      throw new Error("Please connect your wallet first.");
    }

    try {
      const placeBetTx = await predictionHubWriteContract.placeBet(marketId, isYes, {
        value: parseEther(amountEth),
      });

      await placeBetTx.wait();

      await updateMarkets();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
      throw err;
    }
  };

  const createMarket = async (title: string, category: string, durationSeconds: number) => {
    console.log("create market");

    if (!predictionHubWriteContract || !walletAddress) {
      throw new Error("Please connect your wallet first.");
    }

    try {
      const createTx = await predictionHubWriteContract.createMarket(
        title,
        category,
        durationSeconds
      );
      await createTx.wait();

      await updateMarkets();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
      throw err;
    }
  };

  useEffect(() => {
    const fetchMarkets = async () => {
      setIsLoading(true);
      await updateMarkets();
      setIsLoading(false);
    };

    fetchMarkets();
  }, [updateMarkets]);

  useEffect(() => {
    if (!predictionHubContract) {
      return;
    }

    const handleMarketUpdate = () => {
      updateMarkets();
    };

    predictionHubContract.on("MarketCreated", handleMarketUpdate);
    predictionHubContract.on("BetPlaced", handleMarketUpdate);
    predictionHubContract.on("MarketResolved", handleMarketUpdate);
    predictionHubContract.on("WinningsClaimed", handleMarketUpdate);

    return () => {
      predictionHubContract.off("MarketCreated", handleMarketUpdate);
      predictionHubContract.off("BetPlaced", handleMarketUpdate);
      predictionHubContract.off("MarketResolved", handleMarketUpdate);
      predictionHubContract.off("WinningsClaimed", handleMarketUpdate);
    };
  }, [predictionHubContract, updateMarkets]);

  return { markets, isLoading, error, placeBet, claimWinnings, createMarket };
};
