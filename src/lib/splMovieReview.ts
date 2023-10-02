import { Movie } from "@/classes/Movie";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { solanaEndpoint } from "./solana";

export const DEFAULT_MOVIE_PROGRAM_ID = "CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN"; 
export const MY_MOVIE_PROGRAM_ID = "4jvF1FLvcKb2aJjNqJvnEX88XNWSnNw6Ay18gN9BYhGd";

export const getMovieReviewTransaction = async (
  senderAddress: string,
  title: string,
  rating: number,
  description: string,
  movieProgramId = DEFAULT_MOVIE_PROGRAM_ID
) => {

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

export const fetchMovieReviews = (
  connection = new Connection(solanaEndpoint),
  movieProgramId = DEFAULT_MOVIE_PROGRAM_ID
) => {
  return connection.getProgramAccounts(new PublicKey(movieProgramId)).then(
    (accounts) =>
      accounts
        .map((acc) => {
          return Movie.deserialize(acc.account.data);
        })
        .filter((x) => x !== null) as Movie[]
  );
};
