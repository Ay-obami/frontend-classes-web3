import { useCallback } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import { useWalletConnection } from "./useWalletConnection";
import { rpc_url } from "../constants";
import { InterfaceAbi } from "ethers";

export const jsonRpcProvider = new JsonRpcProvider(rpc_url);

export const useContract = () => {
  const { signer } = useWalletConnection();

  const getContract = useCallback(
    (address: string, abi: InterfaceAbi, withSigner = false) => {
      if(!address || !abi) return;
      let contract;
      if (withSigner) {
        if (!signer) return;
        contract = new Contract(
          address,
          abi,
          signer
        );
      } else {
        contract = new Contract(
          address,
          abi,
          jsonRpcProvider
        );
      }
      return contract;
    },
    [signer]
  );
  return {
    getContract,
  };
};
