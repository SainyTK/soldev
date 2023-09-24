import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { secretKeyToKeypair, solanaEndpoint } from "./solana";

export const getIncrementTransaction = () => {
  const counterProgramID = "ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa";
  const counterAccountID = "Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod";

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey(counterAccountID),
        isSigner: false,
        isWritable: true,
      },
    ],
    programId: new PublicKey(counterProgramID),
  });

  const transaction = new Transaction();
  transaction.add(instruction);
  return transaction;
};

export const incrementCounter = async (secretKey: string) => {
  const connection = new Connection(solanaEndpoint);
  const transaction = getIncrementTransaction();
  return sendAndConfirmTransaction(connection, transaction, [
    secretKeyToKeypair(secretKey),
  ]);
};
