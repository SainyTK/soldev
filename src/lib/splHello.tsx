import { PublicKey, Transaction } from "@solana/web3.js";

export const DEFAULT_HELLO_WORLD_PROGRAM_ID =
  "FBggjdxDjnbCGzDX6Lo9W3FyCkDnU8StTWgbJV6PR87e";

export const MY_HELLO_WORLD_PROGRAM_ID = "BeEVH6URAhBXbgZe47zqxXjw6ZC9LYtJxEEmFnxGoacP";

export async function getSayHelloTransaction(programId = DEFAULT_HELLO_WORLD_PROGRAM_ID) {
  const transaction = new Transaction();

  transaction.add({
    keys: [],
    programId: new PublicKey(programId),
  });

  return transaction;
}
