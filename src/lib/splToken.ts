import { AirdropSchema } from "@/classes/Airdrop";
import { airdropPDA, airdropProgramId } from "@/constants/addresses";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
  getMint,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

export const fetchMintInfo = async (connection: Connection, mint: string) => {
  return getMint(connection, new PublicKey(mint));
};

export const getCreateMintTransaction = async (
  connection: Connection,
  payer: string,
  mintAuthority: string,
  decimals: number
) => {
  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  const programId = TOKEN_PROGRAM_ID;

  const transaction = new Transaction();

  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: new PublicKey(payer),
      newAccountPubkey: new PublicKey(mintAuthority),
      space: MINT_SIZE,
      lamports,
      programId,
    }),
    createInitializeMintInstruction(
      new PublicKey(mintAuthority),
      decimals,
      new PublicKey(payer),
      new PublicKey(payer),
      programId
    )
  );

  return transaction;
};

export const getCreateAtaTransaction = async (
  payer: string,
  owner: string,
  mint: string,
  allowOwnerOffCurve = false
) => {
  const ownerPk = new PublicKey(owner);
  const payerPk = new PublicKey(payer);
  const mintPk = new PublicKey(mint);

  const ata = await getAssociatedTokenAddress(
    mintPk,
    ownerPk,
    allowOwnerOffCurve,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const transaction = new Transaction();

  transaction.add(
    createAssociatedTokenAccountInstruction(
      payerPk,
      ata,
      ownerPk,
      mintPk,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  );

  return transaction;
};

export const getMintTokenTransaction = async (
  mint: string,
  recipient: string,
  authority: string,
  amount: number
) => {
  const mintPk = new PublicKey(mint);
  const authorityPk = new PublicKey(authority);

  const ataPk = await getAssociatedTokenAddress(
    mintPk,
    new PublicKey(recipient),
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const transaction = new Transaction();
  transaction.add(createMintToInstruction(mintPk, ataPk, authorityPk, amount));
  return transaction;
};

export const getTransferTokenTransaction = async (
  mint: string,
  from: string,
  to: string,
  owner: string,
  amount: number
) => {
  const mintPk = new PublicKey(mint);
  const ownerPk = new PublicKey(owner);

  const fromAta = await getAssociatedTokenAddress(
    mintPk,
    new PublicKey(from),
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const toAta = await getAssociatedTokenAddress(
    mintPk,
    new PublicKey(to),
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const transaction = new Transaction();

  transaction.add(createTransferInstruction(fromAta, toAta, ownerPk, amount));
  return transaction;
};

export const getTokenAirdropTransaction = async (
  connection: Connection,
  payer: string,

  mint: string,
  recipient: string,
  amount: number
) => {
  const transaction = new Transaction();
  const airdrop = new AirdropSchema(amount);

  const ata = await getAssociatedTokenAddressSync(
    new PublicKey(mint),
    new PublicKey(recipient)
  );
  const account = await connection.getAccountInfo(ata);

  if (account === null) {
    const createATAIx = await createAssociatedTokenAccountInstruction(
      new PublicKey(payer),
      ata,
      new PublicKey(recipient),
      new PublicKey(mint)
    );
    transaction.add(createATAIx);
  }

  const buffer = airdrop.serialize();

  const airdropIX = new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey(payer),
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: ata,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: new PublicKey(mint),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: airdropPDA,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: buffer,
    programId: airdropProgramId,
  });

  transaction.add(airdropIX);

  return transaction;
};
