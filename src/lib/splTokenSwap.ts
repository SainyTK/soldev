import { TOKEN_SWAP_PROGRAM_ID } from "@/constants/addresses";
import {
  ACCOUNT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeAccountInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptAccount,
} from "@solana/spl-token";
import { CurveType, TokenSwap, TokenSwapLayout } from "./spl-token-swap";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export const getCreateTokenSwapStateTransaction = async (
  connection: Connection,
  stateAccount: string,
  from: string
) => {
  const rent = await TokenSwap.getMinBalanceRentForExemptTokenSwap(connection);
  const tokenSwapStateAccountInstruction = SystemProgram.createAccount({
    newAccountPubkey: new PublicKey(stateAccount),
    fromPubkey: new PublicKey(from),
    lamports: rent,
    space: TokenSwapLayout.span,
    programId: TOKEN_SWAP_PROGRAM_ID,
  });

  const transaction = new Transaction();
  transaction.add(tokenSwapStateAccountInstruction);
  return transaction;
};

export const getSwapAuthority = async (tokenSwapStateAccount: string) => {
  return PublicKey.findProgramAddressSync(
    [new PublicKey(tokenSwapStateAccount).toBuffer()],
    TOKEN_SWAP_PROGRAM_ID
  );
};

export const getInitializeTokenAccountPoolTransaction = async (
  connection: Connection,
  tokenPoolAccount: string,
  poolTokenMint: string,
  from: string
) => {
  const rent = await getMinimumBalanceForRentExemptAccount(connection);
  const createTokenAccountPoolInstruction = SystemProgram.createAccount({
    fromPubkey: new PublicKey(from),
    newAccountPubkey: new PublicKey(tokenPoolAccount),
    space: ACCOUNT_SIZE,
    lamports: rent,
    programId: TOKEN_PROGRAM_ID,
  });
  const initializeTokenAccountPoolInstruction =
    createInitializeAccountInstruction(
      new PublicKey(tokenPoolAccount),
      new PublicKey(poolTokenMint),
      new PublicKey(from)
    );
  const transaction = new Transaction();
  transaction.add(
    createTokenAccountPoolInstruction,
    initializeTokenAccountPoolInstruction
  );
  return transaction;
};

export const getCreatePoolTokenFeeAccountTransaction = async (
  poolTokenMint: string,
  payer: string
) => {
  const feeOwner = "HfoTxFR1Tm6kGmWgYWD6J7YHVy1UwqSULUGVLXkJqaKN";

  const tokenFeeAccountAddress = await getAssociatedTokenAddress(
    new PublicKey(poolTokenMint), // mint
    new PublicKey(feeOwner), // owner
    true // allow owner off curve
  );

  const tokenFeeAccountInstruction = createAssociatedTokenAccountInstruction(
    new PublicKey(payer),
    tokenFeeAccountAddress,
    new PublicKey(feeOwner),
    new PublicKey(poolTokenMint)
  );

  const transaction = new Transaction();
  transaction.add(tokenFeeAccountInstruction);

  return transaction;
};

export const getCreateSwapTransaction = async (
  tokenSwapStateAccount: Keypair,
  swapAuthority: string,
  poolTokenA: string,
  poolTokenB: string,
  poolTokenMint: string,
  tokenFeeAccountAddress: string,
  tokenAccountPool: string
) => {
  const createSwapInstruction = TokenSwap.createInitSwapInstruction(
    tokenSwapStateAccount, // Token swap state account
    new PublicKey(swapAuthority), // Swap pool authority
    new PublicKey(poolTokenA), // Token A token account
    new PublicKey(poolTokenB), // Token B token account
    new PublicKey(poolTokenMint), // Swap pool token mint
    new PublicKey(tokenFeeAccountAddress), // Token fee account
    new PublicKey(tokenAccountPool), // Swap pool token account
    TOKEN_PROGRAM_ID, // Token Program ID
    TOKEN_SWAP_PROGRAM_ID, // Token Swap Program ID
    BigInt(0), // Trade fee numerator
    BigInt(10000), // Trade fee denominator
    BigInt(5), // Owner trade fee numerator
    BigInt(10000), // Owner trade fee denominator
    BigInt(0), // Owner withdraw fee numerator
    BigInt(0), // Owner withdraw fee denominator
    BigInt(20), // Host fee numerator
    BigInt(100), // Host fee denominator
    CurveType.ConstantProduct // Curve type
  );

  const transaction = new Transaction();
  transaction.add(createSwapInstruction);
  return transaction;
};

export const getSwapTransaction = async (
  connection: Connection,
  tokenSwapStateAccount: string,
  swapAuthority: string,
  userPublicKey: string,

  mintA: string,
  mintB: string,
  mintLP: string,

  poolAccountA: string,
  poolAccountB: string,

  feeAccount: string,
  hostFeeAccount: string | null,

  amountIn: bigint,
  amountOutMin: bigint,
) => {
  const transaction = new Transaction();

  const userPk = new PublicKey(userPublicKey);
  const mintAPk = new PublicKey(mintA);
  const mintBPk = new PublicKey(mintB);
  const mintLPPk = new PublicKey(mintLP);

  const ataTokenA = await getAssociatedTokenAddress(mintAPk, userPk);
  const ataTokenB = await getAssociatedTokenAddress(mintBPk, userPk);
  const ataLPToken = await getAssociatedTokenAddress(mintLPPk, userPk);

  const account = await connection.getAccountInfo(ataLPToken);
  if (account === null) {
    const createATAInstruction = createAssociatedTokenAccountInstruction(
      userPk,
      ataLPToken,
      userPk,
      mintLPPk
    );
    transaction.add(createATAInstruction);
  }

  const instruction = TokenSwap.swapInstruction(
    new PublicKey(tokenSwapStateAccount),
    new PublicKey(swapAuthority),
    userPk,
    ataTokenA,
    new PublicKey(poolAccountA),
    new PublicKey(poolAccountB),
    ataTokenB,
    mintLPPk,
    new PublicKey(feeAccount),
    hostFeeAccount ? new PublicKey(hostFeeAccount) : null,
    TOKEN_SWAP_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    amountIn,
    amountOutMin
)

  transaction.add(instruction);
  return transaction;
};

export const getProvideLiquidityTransaction = async (
  connection: Connection,
  tokenSwapStateAccount: string,
  swapAuthority: string,
  userPublicKey: string,

  mintA: string,
  mintB: string,
  mintLP: string,

  intoA: string,
  intoB: string,

  lpTokenAmount: bigint,
  maxAmountA: bigint,
  maxAmountB: bigint
) => {
  const transaction = new Transaction();

  const userPk = new PublicKey(userPublicKey);
  const mintAPk = new PublicKey(mintA);
  const mintBPk = new PublicKey(mintB);
  const mintLPPk = new PublicKey(mintLP);

  const ataTokenA = await getAssociatedTokenAddress(mintAPk, userPk);
  const ataTokenB = await getAssociatedTokenAddress(mintBPk, userPk);
  const ataLPToken = await getAssociatedTokenAddress(mintLPPk, userPk);

  const account = await connection.getAccountInfo(ataLPToken);
  if (account === null) {
    const createATAInstruction = createAssociatedTokenAccountInstruction(
      userPk,
      ataLPToken,
      userPk,
      mintLPPk
    );
    transaction.add(createATAInstruction);
  }

  const instruction = TokenSwap.depositAllTokenTypesInstruction(
    new PublicKey(tokenSwapStateAccount),
    new PublicKey(swapAuthority),
    userPk,
    ataTokenA,
    ataTokenB,
    new PublicKey(intoA),
    new PublicKey(intoB),
    mintLPPk,
    ataLPToken,
    TOKEN_SWAP_PROGRAM_ID,
    TOKEN_PROGRAM_ID, // Token A Program ID
    lpTokenAmount,
    maxAmountA,
    maxAmountB
  );
  transaction.add(instruction);
  return transaction;
};

export const getProvideSingleLiquidityTransaction = async (
  tokenSwapStateAccount: string,
  swapAuthority: string,
  userPublicKey: string,
  userTokenA: string,
  intoA: string,
  intoB: string,
  poolMint: string,
  userPoolToken: string,
  tokenAMint: string,
  amountIn: bigint,
  minLPTokenAmount: bigint
) => {
  const instruction = TokenSwap.depositSingleTokenTypeExactAmountInInstruction(
    new PublicKey(tokenSwapStateAccount),
    new PublicKey(swapAuthority),
    new PublicKey(userPublicKey),
    new PublicKey(userTokenA),
    new PublicKey(intoA),
    new PublicKey(intoB),
    new PublicKey(poolMint),
    new PublicKey(userPoolToken),
    new PublicKey(tokenAMint),
    TOKEN_SWAP_PROGRAM_ID,
    TOKEN_PROGRAM_ID, // Token A Program ID
    TOKEN_PROGRAM_ID, // LP Token Program ID
    amountIn,
    minLPTokenAmount
  );

  const transaction = new Transaction();
  transaction.add(instruction);
  return transaction;
};

export const getRemoveLiquidityTransaction = async (
  connection: Connection,
  tokenSwapStateAccount: string,
  swapAuthority: string,
  userPublicKey: string,

  mintA: string,
  mintB: string,
  mintLP: string,

  feeAccount: string,

  fromA: string,
  fromB: string,

  lpTokenAmount: bigint,
  minAmountA: bigint,
  minAmountB: bigint
) => {
  const transaction = new Transaction();

  const userPk = new PublicKey(userPublicKey);
  const mintAPk = new PublicKey(mintA);
  const mintBPk = new PublicKey(mintB);
  const mintLPPk = new PublicKey(mintLP);

  const ataTokenA = await getAssociatedTokenAddress(mintAPk, userPk);
  const ataTokenB = await getAssociatedTokenAddress(mintBPk, userPk);
  const ataLPToken = await getAssociatedTokenAddress(mintLPPk, userPk);

  const account = await connection.getAccountInfo(ataLPToken);
  if (account === null) {
    const createATAInstruction = createAssociatedTokenAccountInstruction(
      userPk,
      ataLPToken,
      userPk,
      mintLPPk
    );
    transaction.add(createATAInstruction);
  }

  const instruction = TokenSwap.withdrawAllTokenTypesInstruction(
    new PublicKey(tokenSwapStateAccount),
    new PublicKey(swapAuthority),
    userPk,
    mintLPPk,
    new PublicKey(feeAccount),
    ataLPToken,
    new PublicKey(fromA),
    new PublicKey(fromB),
    ataTokenA,
    ataTokenB,
    TOKEN_SWAP_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    lpTokenAmount,
    minAmountA,
    minAmountB
  );

  transaction.add(instruction);
  return transaction;
};

export const getRemoveSingleLiquidityTransaction = async (
  tokenSwap: string,
  authority: string,
  userTransferAuthority: string,
  poolMint: string,
  feeAccount: string,
  sourcePoolAccount: string,
  fromA: string,
  fromB: string,
  userAccount: string,
  destinationMint: string,
  destinationTokenAmount: bigint,
  maximumPoolTokenAmount: bigint
) => {
  const instruction =
    TokenSwap.withdrawSingleTokenTypeExactAmountOutInstruction(
      new PublicKey(tokenSwap),
      new PublicKey(authority),
      new PublicKey(userTransferAuthority),
      new PublicKey(poolMint),
      new PublicKey(feeAccount),
      new PublicKey(sourcePoolAccount),
      new PublicKey(fromA),
      new PublicKey(fromB),
      new PublicKey(userAccount),
      new PublicKey(destinationMint),
      TOKEN_SWAP_PROGRAM_ID,
      TOKEN_PROGRAM_ID, // LP Token Program ID
      TOKEN_PROGRAM_ID, // Token A Program ID
      destinationTokenAmount,
      maximumPoolTokenAmount
    );

  const transaction = new Transaction();
  transaction.add(instruction);
  return transaction;
};
