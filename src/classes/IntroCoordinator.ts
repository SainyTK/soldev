import { Connection, PublicKey } from "@solana/web3.js";
import * as bs58 from "bs58";
import { Intro } from "./Intro";

const COURSE_PROGRAM_ID = "HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf";

export class IntroCoordinator {
  static accounts: PublicKey[] = [];

  static async prefetchAccounts(connection: Connection, search?: string) {
    const accounts = await connection.getProgramAccounts(
      new PublicKey(COURSE_PROGRAM_ID),
      {
        dataSlice: {
          offset: 1, // offset = 1 because we want to skip { initialized: bool }
          length: 15, // length = 15 because name length is likely to be within 15 bytes (approximate)
        },
        filters: !search
          ? []
          : [
              {
                memcmp: {
                  offset: 5, // offset = 5 because we want to skip { initialized: bool } <= 1 bytes + 4 bytes (for the allocated bytes for string length)
                  bytes: bs58.encode(Buffer.from(search)),
                },
              },
            ],
      }
    );

    accounts.toSorted((a, b) => {
      const lenA = a.account.data.readUint32LE(0);
      const lenB = b.account.data.readUint32LE(0);

      const dataA = a.account.data.subarray(4, 4 + lenA); // skip 4 bytes the allocated bytes for string length
      const dataB = a.account.data.subarray(4, 4 + lenB);

      return dataA.compare(dataB);
    });

    this.accounts = accounts.map((acc) => acc.pubkey);
  }

  static async fetchPage(
    connection: Connection,
    page: number,
    perPage: number,
    search?: string,
    reload?: boolean
  ): Promise<Intro[]> {
    if (this.accounts.length === 0 || reload) {
      await this.prefetchAccounts(connection, search);
    }

    const paginatedPublicKeys = this.accounts.slice(
      (page - 1) * perPage,
      page * perPage
    );

    if (paginatedPublicKeys.length === 0) {
      return [];
    }

    const accounts = await connection.getMultipleAccountsInfo(
      paginatedPublicKeys
    );

    return accounts.reduce((prev, acc) => {
      const intro = Intro.deserialize(acc?.data);
      if (!intro) {
        return prev;
      }
      return [...prev, intro];
    }, [] as Intro[]);
  }
}
