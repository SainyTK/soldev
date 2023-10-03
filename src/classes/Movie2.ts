import { DEFAULT_MOVIE_PROGRAM_ID } from "@/lib/splMovieReview2";
import * as borsh from "@project-serum/borsh";
import { PublicKey } from "@solana/web3.js";

export class Movie2 {
  title: string;
  rating: number;
  description: string;
  reviewer: string;

  borshInstructionSchema = borsh.struct([
    borsh.u8("variant"),
    borsh.str("title"),
    borsh.u8("rating"),
    borsh.str("description"),
  ]);

  static borshAccountSchema = borsh.struct([
    borsh.str("discriminator"),
    borsh.bool("initialized"),
    borsh.publicKey("reviewer"),
    borsh.u8("rating"),
    borsh.str("title"),
    borsh.str("description"),
  ]);

  constructor(fields: {
    title: string;
    rating: number;
    description: string;
    reviewer: string;
  }) {
    this.title = fields.title;
    this.rating = fields.rating;
    this.description = fields.description;
    this.reviewer = fields.reviewer;
  }

  async publicKey(): Promise<string> {
    const pda = await PublicKey.findProgramAddress(
      [new PublicKey(this.reviewer).toBuffer(), Buffer.from(this.title)],
      new PublicKey(DEFAULT_MOVIE_PROGRAM_ID)
    );
    return pda[0].toBase58();
  }

  serialize(variant = 0): Buffer {
    const buffer = Buffer.alloc(1000);
    this.borshInstructionSchema.encode({ ...this, variant }, buffer);
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
  }

  static deserialize(buffer?: Buffer): Movie2 | null {
    if (!buffer) {
      return null;
    }

    try {
      const { title, rating, description, reviewer } =
        this.borshAccountSchema.decode(buffer);
      return new Movie2({ title, rating, description, reviewer });
    } catch (e) {
      console.log("Deserialization error:", e);
      console.log(buffer);
      return null;
    }
  }
}
