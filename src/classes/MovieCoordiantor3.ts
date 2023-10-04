import { Connection, PublicKey } from "@solana/web3.js";
import * as bs58 from "bs58";
import { DEFAULT_MOVIE_PROGRAM_ID } from "@/lib/splMovieReview3";
import { Movie2 } from "./Movie2";

export class MovieCoordinator3 {
  static accounts: PublicKey[] = [];

  static async prefetchAccounts(connection: Connection, search?: string) {
    const DISCRIMINATOR_LENGTH = 4 + "review".length; // 4 for the allocated bytes for string length
    const IS_INITIALIZED_LENGTH = 1; // bool
    const REVIEW_PK_LENGTH = 32; // 32 bytes for public key
    const RATING_LENGTH = 1; // u8
    const OFFSET =
      DISCRIMINATOR_LENGTH +
      IS_INITIALIZED_LENGTH +
      REVIEW_PK_LENGTH +
      RATING_LENGTH;

    const accounts = await connection.getProgramAccounts(
      new PublicKey(DEFAULT_MOVIE_PROGRAM_ID),
      {
        dataSlice: {
          offset: 0,
          length: OFFSET + 20, // length = 18 because title length is likely to be within 18 bytes (approximate)
        },
        filters: !search
          ? [
              {
                memcmp: {
                  offset: 4,
                  bytes: bs58.encode(Buffer.from("review")),
                },
              },
            ]
          : [
              {
                memcmp: {
                  offset: OFFSET,
                  bytes: bs58.encode(Buffer.from(search)),
                },
              },
            ],
      }
    );

    accounts.toSorted((a, b) => {
      const DISCRIMINATOR_LENGTH = 4 + "review".length; // 4 for the allocated bytes for string length
      const IS_INITIALIZED_LENGTH = 1; // bool
      const REVIEW_PK_LENGTH = 32; // 32 bytes for public key
      const RATING_LENGTH = 1; // u8
      const OFFSET =
        DISCRIMINATOR_LENGTH +
        IS_INITIALIZED_LENGTH +
        REVIEW_PK_LENGTH +
        RATING_LENGTH +
        4;

      const lenA = a.account.data.readUint32LE(0);
      const lenB = b.account.data.readUint32LE(0);

      const dataA = a.account.data.subarray(OFFSET, OFFSET + lenA); // skip 4 bytes the allocated bytes for string length
      const dataB = a.account.data.subarray(OFFSET, OFFSET + lenB);

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
  ): Promise<Movie2[]> {
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
      const movie = Movie2.deserialize(acc?.data);
      if (!movie) {
        return prev;
      }
      return [...prev, movie];
    }, [] as Movie2[]);
  }
}
