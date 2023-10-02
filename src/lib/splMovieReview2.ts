import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { Movie } from "@/classes/Movie";

export const MOVIE_PROGRAM_ID = "4jvF1FLvcKb2aJjNqJvnEX88XNWSnNw6Ay18gN9BYhGd";

export const getCreateReviewTransaction = async (
  senderAddress: string,
  title: string,
  rating: number,
  description: string
) => {
  const movie = new Movie({ title, rating, description });
  const buffer = movie.serialize();

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey(senderAddress),
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: new PublicKey(MOVIE_PROGRAM_ID),
    data: buffer,
  });

  const transaction = new Transaction();
  transaction.add(instruction);
  return transaction;
};
