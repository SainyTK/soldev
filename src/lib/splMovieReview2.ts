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

export const DEFAULT_MOVIE_PROGRAM_ID =
  "AUmWBUud7DQGzQYwYmb8EjthATEcYuNGMQci5eERDbff";

export const getMovieReviewTransaction = async (
  senderAddress: string,
  title: string,
  rating: number,
  description: string,
  reviewer: string,
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
