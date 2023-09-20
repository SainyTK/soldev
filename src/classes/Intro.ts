import * as borsh from "@project-serum/borsh";

export class Intro {
  name: string;
  message: string;

  borshInstructionSchema = borsh.struct([
    borsh.u8("variant"),
    borsh.str("name"),
    borsh.str("message"),
  ]);

  static borshAccountSchema = borsh.struct([
    borsh.bool("initialized"),
    borsh.str("name"),
    borsh.str("message"),
  ]);

  constructor(fields: { name: string; message: string }) {
    this.name = fields.name;
    this.message = fields.message;
  }

  serialize(): Buffer {
    const buffer = Buffer.alloc(1000);
    this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer);
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
  }

  static deserialize(buffer: Buffer): Intro | null {
    if (!buffer) {
      return null;
    }

    try {
      const { name, message } = this.borshAccountSchema.decode(buffer);
      return new Intro({ name, message });
    } catch (e) {
      console.error("Deserialization error:", e);
      return null;
    }
  }
}
