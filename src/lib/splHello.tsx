import { PublicKey, Transaction } from "@solana/web3.js";

export const HELLO_WORLD_PROGRAM_ID =
  "FBggjdxDjnbCGzDX6Lo9W3FyCkDnU8StTWgbJV6PR87e";

export async function getSayHelloTransaction() {
  const transaction = new Transaction();

  transaction.add({
    keys: [],
    programId: new PublicKey(HELLO_WORLD_PROGRAM_ID),
  });

  return transaction;
}
