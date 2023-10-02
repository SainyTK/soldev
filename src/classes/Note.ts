import * as borsh from "@project-serum/borsh";
import BN from "bn.js";

export class Note {
  id: BN;
  title: string;
  body: string;

  borshInstructionSchema = borsh.struct([
    borsh.u8("variant"),
    borsh.str("title"),
    borsh.str("body"),
    borsh.u64("id"),
  ]);

  constructor(fields: { id: number; title: string; body: string }) {
    this.id = new BN(fields.id);
    this.title = fields.title;
    this.body = fields.body;
  }

  serialize(): Buffer {
    const buffer = Buffer.alloc(1000);
    this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer);
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
  }
}
