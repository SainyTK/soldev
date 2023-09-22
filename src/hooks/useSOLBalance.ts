import { getAccountInfo, lamportsToSOL } from "@/lib/solana";
import { Connection } from "@solana/web3.js";
import { useEffect, useState } from "react";

export const useSOLBalance = (connection: Connection, publicKey: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (connection && publicKey) {
      loadBalanceData(connection, publicKey);
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  const loadBalanceData = async (connection: Connection, publicKey: string) => {
    if (publicKey) {
      const accountInfo = await getAccountInfo(publicKey, connection);
      if (accountInfo) {
        setBalance(lamportsToSOL(accountInfo.lamports));
      }
    }
  };

  return {
    isLoading,
    value: balance,
  };
};
