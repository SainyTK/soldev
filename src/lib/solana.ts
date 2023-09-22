import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Connection,
  clusterApiUrl,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from "@solana/web3.js";
import * as bs58 from "bs58";
import { Movie } from "@/classes/Movie";
import { Intro } from "@/classes/Intro";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  getMint,
} from "@solana/spl-token";

export const solanaEndpoint = clusterApiUrl("devnet");

export const solToLamports = (sol: number) => {
  return sol * LAMPORTS_PER_SOL;
};

export const lamportsToSOL = (lamport: number) => {
  return lamport / LAMPORTS_PER_SOL;
};

export const getTxURL = (signature: string) => {
  const baseURL = `https://solscan.io/tx`;
  return `${baseURL}/${signature}?cluster=devnet`;
};

export const generateKeypair = () => {
  return Keypair.generate();
};

export const secretKeyToKeypair = (secretKey: string) => {
  if (secretKey.includes(",")) {
    const secret = secretKey.split(",").map((x) => Number(x));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  } else {
    const secret = bs58.decode(secretKey);
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  }
};

export const getBalance = async (
  address: string,
  connection = new Connection(solanaEndpoint)
) => {
  const key = new PublicKey(address);
  return connection
    .getBalance(key)
    .then((balance) => lamportsToSOL(balance).toString());
};

export const getAccountInfo = async (
  address: string,
  connection = new Connection(solanaEndpoint)
) => {
  const key = new PublicKey(address);
  return connection.getAccountInfo(key);
};

export const airdropSOL = async (
  to: string,
  connection = new Connection(solanaEndpoint)
) => {
  return connection.requestAirdrop(new PublicKey(to), LAMPORTS_PER_SOL);
};

export const transferSOL = async (
  from: string,
  to: string,
  amount: number,
  secretKey: string
) => {
  const connection = new Connection(solanaEndpoint);
  const transaction = getTransferTransaction(from, to, amount);
  return sendAndConfirmTransaction(connection, transaction, [
    secretKeyToKeypair(secretKey),
  ]);
};

export const incrementCounter = async (secretKey: string) => {
  const connection = new Connection(solanaEndpoint);
  const transaction = getIncrementTransaction();
  return sendAndConfirmTransaction(connection, transaction, [
    secretKeyToKeypair(secretKey),
  ]);
};

export const getTransferTransaction = (
  from: string,
  to: string,
  amount: number
) => {
  const transaction = new Transaction();

  const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: new PublicKey(from),
    toPubkey: new PublicKey(to),
    lamports: LAMPORTS_PER_SOL * amount,
  });

  transaction.add(sendSolInstruction);

  return transaction;
};

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

export const getMovieReviewTransaction = async (
  senderAddress: string,
  title: string,
  rating: number,
  description: string
) => {
  const movieProgramId = "CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN";

  const movie = new Movie({ title, rating, description });
  const buffer = movie.serialize();

  const [pda] = await PublicKey.findProgramAddress(
    [new PublicKey(senderAddress).toBuffer(), Buffer.from(movie.title)],
    new PublicKey(movieProgramId)
  );

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey(senderAddress),
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: pda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: buffer,
    programId: new PublicKey(movieProgramId),
  });

  const transaction = new Transaction();
  transaction.add(instruction);

  return transaction;
};

export const getIntroTransaction = async (
  senderAddress: string,
  name: string,
  message: string
) => {
  const courseProgramId = "HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf";

  const intro = new Intro({ name, message });
  const buffer = intro.serialize();

  const [pda] = await PublicKey.findProgramAddress(
    [new PublicKey(senderAddress).toBuffer()],
    new PublicKey(courseProgramId)
  );

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey(senderAddress),
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: pda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: new PublicKey(courseProgramId),
    data: buffer,
  });

  const transaction = new Transaction();
  transaction.add(instruction);
  return transaction;
};

export const fetchMovieReviews = (
  connection = new Connection(solanaEndpoint)
) => {
  const movieProgramId = "CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN";

  return connection.getProgramAccounts(new PublicKey(movieProgramId)).then(
    (accounts) =>
      accounts
        .map((acc) => {
          return Movie.deserialize(acc.account.data);
        })
        .filter((x) => x !== null) as Movie[]
  );
};

export const fetchIntros = (connection = new Connection(solanaEndpoint)) => {
  const courseProgramId = "HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf";

  return connection.getProgramAccounts(new PublicKey(courseProgramId)).then(
    (accounts) =>
      accounts
        .map((acc) => {
          return Intro.deserialize(acc.account.data);
        })
        .filter((x) => x !== null) as Intro[]
  );
};

export const fetchMintInfo = async (connection: Connection, mint: string) => {
  return getMint(connection, new PublicKey(mint));
}

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

export const getCreateAtaTransaction = async (payer: string, owner: string, mint: string) => {
  const ownerPk = new PublicKey(owner);
  const payerPk = new PublicKey(payer);
  const mintPk = new PublicKey(mint);

  const ata = await getAssociatedTokenAddress(
    mintPk,
    ownerPk,
    false,
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

export const getMintTokenTransaction = async (mint: string, recipient: string, authority: string, amount: number) => {
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
  transaction.add(createMintToInstruction(mintPk, ataPk, authorityPk, amount))
  return transaction;
}

export const getTransferTokenTransaction = async (mint: string, from: string, to: string, owner: string, amount: number) => {
  const mintPk = new PublicKey(mint);
  const ownerPk = new PublicKey(owner);
  
  const fromAta  = await getAssociatedTokenAddress(
    mintPk,
    new PublicKey(from),
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )

  const toAta = await getAssociatedTokenAddress(
    mintPk,
    new PublicKey(to),
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )

  const transaction = new Transaction();

  transaction.add(createTransferInstruction(fromAta, toAta, ownerPk, amount))
  return transaction;
}