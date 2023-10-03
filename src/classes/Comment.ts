import { DEFAULT_MOVIE_PROGRAM_ID } from "@/lib/splMovieReview2";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import * as borsh from "@project-serum/borsh";

export class Comment {
  review: string;
  commenter: string;
  comment: string;
  count: number;

  constructor(fields: {
    review: string;
    commenter: string;
    comment: string;
    count: number;
  }) {
    this.review = fields.review;
    this.commenter = fields.commenter;
    this.comment = fields.comment;
    this.count = fields.count;
  }

  async publicKey(): Promise<string> {
    const pda = await PublicKey.findProgramAddress(
      [
        new PublicKey(this.review).toBuffer(),
        new BN(this.count).toArrayLike(Buffer, "be", 8),
      ],
      new PublicKey(DEFAULT_MOVIE_PROGRAM_ID)
    );
    return pda[0].toBase58();
  }

  private static commentLayout = borsh.struct([
    borsh.str("discriminator"),
    borsh.u8("isInitialized"),
    borsh.publicKey("review"),
    borsh.publicKey("commenter"),
    borsh.str("comment"),
    borsh.u64("count"),
  ]);

  private instructionLayout = borsh.struct([
    borsh.u8("variant"),
    borsh.str("comment"),
  ]);

  serialize(): Buffer {
    const buffer = Buffer.alloc(1000);
    this.instructionLayout.encode({ ...this, variant: 2 }, buffer);
    return buffer.slice(0, this.instructionLayout.getSpan(buffer));
  }

  static deserialize(buffer?: Buffer): Comment | null {
    if (!buffer) {
      return null;
    }

    try {
      const { review, commenter, comment, count } =
        this.commentLayout.decode(buffer);
      return new Comment({ review: review.toBase58(), commenter: commenter.toBase58(), comment, count: new BN(count).toNumber() });
    } catch (e) {
      console.log("Deserialization error:", e);
      console.log(buffer);
      return null;
    }
  }
}
