import {
  Metaplex,
  bundlrStorage,
  walletAdapterIdentity,
  Nft,
  toMetaplexFileFromBrowser,
} from "@metaplex-foundation/js";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Connection, PublicKey } from "@solana/web3.js";
import { CollectionNftData, NftData } from "./type";

export function getMetaplexInstance(
  connection: Connection,
  wallet: WalletAdapter
) {
  const metaplex = Metaplex.make(connection)
    .use(walletAdapterIdentity(wallet))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );
  return metaplex;
}

export async function uploadMetadata(
  metaplex: Metaplex,
  nftData: NftData,
  imageFile: File
): Promise<string> {
  // buffer to metaplex file
  const file = await toMetaplexFileFromBrowser(imageFile);

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: nftData.name,
    symbol: nftData.symbol,
    description: nftData.description,
    image: imageUri,
  });

  return uri;
}

// helper function create NFT
export async function createNft(
  metaplex: Metaplex,
  uri: string,
  nftData: NftData
): Promise<Nft> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri, // metadata URI
      name: nftData.name,
      sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
      symbol: nftData.symbol,
    },
    { commitment: "finalized" }
  );

  return nft;
}

export async function fetchNftByMint(metaplex: Metaplex, mintAddress: string) {
  const nft = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(mintAddress),
  });
  return nft;
}

// helper function update NFT
export async function updateNftUri(
  metaplex: Metaplex,
  uri: string,
  mintAddress: string
) {
  // fetch NFT data using mint address
  const nft = await metaplex
    .nfts()
    .findByMint({ mintAddress: new PublicKey(mintAddress) });

  // update the NFT metadata
  const { response } = await metaplex.nfts().update(
    {
      nftOrSft: nft,
      uri: uri,
    },
    { commitment: "finalized" }
  );

  return response;
}

export async function createCollectionNft(
  metaplex: Metaplex,
  uri: string,
  data: CollectionNftData
): Promise<Nft> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: data.name,
      sellerFeeBasisPoints: data.sellerFeeBasisPoints,
      symbol: data.symbol,
      isCollection: true,
    },
    { commitment: "finalized" }
  );
  return nft;
}

export async function verifyCollection(
  metaplex: Metaplex,
  nftMint: string,
  collectionMint: string
) {
  const output = await metaplex.nfts().verifyCollection({
    mintAddress: new PublicKey(nftMint),
    collectionMintAddress: new PublicKey(collectionMint),
    isSizedCollection: true,
  });
  return output.response;
}
