export interface NftData {
    name: string;
    symbol: string;
    description: string;
    sellerFeeBasisPoints: number;
}

export interface CollectionNftData {
    name: string
    symbol: string
    description: string
    sellerFeeBasisPoints: number
    isCollection: boolean
}
