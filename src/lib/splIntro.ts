import { Intro } from "@/classes/Intro";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { solanaEndpoint } from "./solana";

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
