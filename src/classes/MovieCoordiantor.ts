import { Connection, PublicKey } from "@solana/web3.js";
import { Movie } from "./Movie";
import * as bs58 from "bs58";

const MOVIE_REVIEW_PROGRAM_ID = "CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN";

export class MovieCoordinator {
  static accounts: PublicKey[] = [];

  static async prefetchAccounts(connection: Connection, search?: string) {
    const accounts = await connection.getProgramAccounts(
      new PublicKey(MOVIE_REVIEW_PROGRAM_ID),
      {
        dataSlice: {
          offset: 2, // offset = 2 because we want to skip { initialized: bool, rating: u8 } <= 2 bytes (bool = 1, u8 = 1)
          length: 18, // length = 18 because title length is likely to be within 18 bytes (approximate)
        },
        filters: !search
          ? []
          : [
              {
                memcmp: {
                  offset: 6, // offset = 6 because we want to skip { initialized: bool, rating: u8 } <= 2 bytes + 4 bytes (for the allocated bytes for string length)
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
  ): Promise<Movie[]> {
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
      const movie = Movie.deserialize(acc?.data);
      if (!movie) {
        return prev;
      }
      return [...prev, movie];
    }, [] as Movie[]);
  }
}
