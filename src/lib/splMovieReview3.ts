import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { solanaEndpoint } from "./solana";
import { Movie2 } from "@/classes/Movie2";
import { Comment } from "@/classes/Comment";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

export const DEFAULT_MOVIE_PROGRAM_ID =
  "Fwm1r5H3pTwwco7aRba3wVKa89vJyrHdbCuDWKhqZHoq";

export const getMovieReviewTransaction = async (
  senderAddress: string,
  title: string,
  rating: number,
  description: string,
  reviewer: string,
  connection = new Connection(solanaEndpoint),
  movieProgramId = DEFAULT_MOVIE_PROGRAM_ID
) => {
  const movie = new Movie2({ title, rating, description, reviewer });
  const buffer = movie.serialize();

  const [accountPDA] = await PublicKey.findProgramAddress(
    [new PublicKey(senderAddress).toBuffer(), Buffer.from(movie.title)],
    new PublicKey(movieProgramId)
  );
  const [counterPDA] = await PublicKey.findProgramAddress(
    [accountPDA.toBuffer(), Buffer.from("comment")],
    new PublicKey(movieProgramId)
  );
  const [tokenMint] = await PublicKey.findProgramAddress(
    [Buffer.from("token_mint")],
    new PublicKey(movieProgramId)
  );
  const [mintAuth] = await PublicKey.findProgramAddress(
    [Buffer.from("token_auth")],
    new PublicKey(movieProgramId)
  );
  const userAta = await getAssociatedTokenAddress(
    tokenMint,
    new PublicKey(senderAddress)
  );
  const ataAccount = await connection.getAccountInfo(userAta);

  const transaction = new Transaction();

  if (!ataAccount) {
    const ataInstruction = createAssociatedTokenAccountInstruction(
      new PublicKey(senderAddress),
      userAta,
      new PublicKey(senderAddress),
      tokenMint
    );

    transaction.add(ataInstruction);
  }

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey(senderAddress),
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: accountPDA,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: counterPDA,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: tokenMint,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: mintAuth,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: userAta,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
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
    programId: new PublicKey(movieProgramId),
  });

  transaction.add(instruction);

  return transaction;
};

// Update movie
export const getReviewUpdateTransaction = async (
  senderAddress: string,
  title: string,
  rating: number,
  description: string,
  reviewer: string,
  movieProgramId = DEFAULT_MOVIE_PROGRAM_ID
) => {
  const movie = new Movie2({ title, rating, description, reviewer });
  const buffer = movie.serialize(1); // 1 is the variant for update

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

export const getCommentTransaction = async (
  commenter: string,
  counter: string,
  review: string,
  content: string,
  count: number,
  movieProgramId = DEFAULT_MOVIE_PROGRAM_ID
) => {
  const comment = new Comment({ review, commenter, comment: content, count });
  const buffer = comment.serialize();

  const pda = await comment.publicKey();

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey(commenter),
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: new PublicKey(review),
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: new PublicKey(counter),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: new PublicKey(pda),
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

export const fetchMovieReviews = (
  connection = new Connection(solanaEndpoint),
  movieProgramId = DEFAULT_MOVIE_PROGRAM_ID
) => {
  return connection.getProgramAccounts(new PublicKey(movieProgramId)).then(
    (accounts) =>
      accounts
        .map((acc) => {
          return Movie2.deserialize(acc.account.data);
        })
        .filter((x) => x !== null) as Movie2[]
  );
};
