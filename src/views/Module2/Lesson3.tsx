"use client";

import React, { useState } from "react";
import { Col, Row, Typography, Form, Button, Input } from "antd";
import { getMintURL, getTxURL } from "@/lib/solana";

import { truncateString } from "@/utils/format";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSOLBalance } from "@/hooks/useSOLBalance";
import UploadImage from "@/components/UploadImage";
import {
  createCollectionNft,
  createNft,
  fetchNftByMint,
  getMetaplexInstance,
  updateNftUri,
  uploadMetadata,
  verifyCollection,
} from "@/lib/metaplex";
import { CollectionNftData, NftData } from "@/lib/metaplex/type";

const Module2Lesson3 = () => {
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();

  const balance = useSOLBalance(connection, publicKey?.toBase58() || "");

  const [creating, setCreating] = useState(false);

  const [imageFile, setImageFile] = useState<File>();

  const [metadataUri, setMetadataUri] = useState("");
  const [tokenMint, setTokenMint] = useState("");

  const [updateForm] = Form.useForm();
  const [nftImageUrl, setNFTImageUrl] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updatedImageFile, setUpdatedImageFile] = useState<File>();
  const [signature, setSignature] = useState("");

  const [collectionCreating, setCollectionCreating] = useState(false);
  const [collectionImageFile, setCollectionImageFile] = useState<File>();
  const [collectionMetadataUri, setCollectionMetadataUri] = useState("");
  const [collectionTokenMint, setCollectionTokenMint] = useState("");

  const [adding, setAdding] = useState(false);
  const [addingSignature, setAddingSignature] = useState("");

  const handleCreateNFT = async (values: any) => {
    if (publicKey && wallet && imageFile) {
      setCreating(true);
      try {
        const { name, symbol, description } = values;

        const nftData: NftData = {
          name,
          symbol,
          description,
          sellerFeeBasisPoints: 0,
        };

        const metaplex = getMetaplexInstance(connection, wallet.adapter);
        const uri = await uploadMetadata(metaplex, nftData, imageFile);

        const nft = await createNft(metaplex, uri, nftData);

        setMetadataUri(uri);
        setTokenMint(nft.address.toBase58());
      } catch (error) {
        console.error(error);
      }
      setCreating(false);
    }
  };

  const handleFetchNFT = async (e: any) => {
    if (publicKey && wallet) {
      try {
        const mint = e.target.value;

        const metaplex = getMetaplexInstance(connection, wallet.adapter);

        const nft = await fetchNftByMint(metaplex, mint);

        if (nft) {
          updateForm.setFieldsValue({
            name: nft.json?.name,
            symbol: nft.json?.symbol,
            description: nft.json?.description,
          });

          setNFTImageUrl(nft.json?.image!);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUpdateNFT = async (values: any) => {
    setUpdating(true);
    if (publicKey && wallet && updatedImageFile) {
      try {
        const { name, symbol, description, mint } = values;

        const nftData: NftData = {
          name,
          symbol,
          description,
          sellerFeeBasisPoints: 0,
        };

        const metaplex = getMetaplexInstance(connection, wallet.adapter);

        const uri = await uploadMetadata(metaplex, nftData, updatedImageFile);

        const response = await updateNftUri(metaplex, uri, mint);

        setSignature(response.signature);
      } catch (e) {
        console.error(e);
      }
    }
    setUpdating(false);
  };

  const handleCreateCollectionNFT = async (values: any) => {
    if (publicKey && wallet && collectionImageFile) {
      setCollectionCreating(true);
      try {
        const { name, symbol, description } = values;

        const data: CollectionNftData = {
          name,
          symbol,
          description,
          sellerFeeBasisPoints: 100,
          isCollection: true,
        };

        const metaplex = getMetaplexInstance(connection, wallet.adapter);
        const uri = await uploadMetadata(metaplex, data, collectionImageFile);

        const nft = await createCollectionNft(metaplex, uri, data);

        setCollectionMetadataUri(uri);
        setCollectionTokenMint(nft.address.toBase58());
      } catch (error) {
        console.error(error);
      }
      setCollectionCreating(false);
    }
  };

  const handleAddToCollection = async (values: any) => {
    if (publicKey && wallet) {
      setAdding(true);
      try {
        const { nftMint, collectionMint } = values;

        const metaplex = getMetaplexInstance(connection, wallet.adapter);
        const response = await verifyCollection(
          metaplex,
          nftMint,
          collectionMint
        );

        setAddingSignature(response.signature);
      } catch (e) {
        console.error(e);
      }
      setAdding(false);
    }
  };

  return (
    <>
      <Row justify={"center"} gutter={[8, 8]}>
        <Col span={24} className="text-center">
          <Typography.Title>Create Solana NFTs With Metaplex</Typography.Title>
        </Col>
        {!publicKey ? (
          <Col span={24} className="text-center">
            <Typography.Text>
              Please connect your wallet to get started
            </Typography.Text>
          </Col>
        ) : (
          <>
            <Col span={24} className="text-center">
              <Typography.Text>
                Your address: {truncateString(publicKey.toBase58())}
              </Typography.Text>
            </Col>
            <Col span={24} className="text-center">
              <Typography.Text>Balance: {balance.value} SOL</Typography.Text>
            </Col>

            <Col span={24}>
              <Typography.Title level={4}>Create NFT</Typography.Title>
            </Col>
            <Col span={24}>
              <Form onFinish={handleCreateNFT}>
                <Form.Item name="name" label="Name">
                  <Input />
                </Form.Item>
                <Form.Item name="symbol" label="Symbol">
                  <Input />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input />
                </Form.Item>
                <Form.Item name="file">
                  <UploadImage
                    onChange={(param) => setImageFile(param.file.originFileObj)}
                  />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" loading={creating}>
                    Create
                  </Button>
                </Form.Item>
              </Form>
            </Col>

            {metadataUri && (
              <Col span={24}>
                <Typography.Text>
                  Metadata URI:{" "}
                  <a href={metadataUri} target="_blank">
                    {metadataUri}
                  </a>
                </Typography.Text>
              </Col>
            )}

            {tokenMint && (
              <Col span={24}>
                <Typography.Text>
                  Token Mint:{" "}
                  <a href={getMintURL(tokenMint)} target="_blank">
                    {getMintURL(tokenMint)}
                  </a>
                </Typography.Text>
              </Col>
            )}

            <Col span={24}>
              <Typography.Title level={4}>Update NFT</Typography.Title>
            </Col>
            <Col span={24}>
              <Form onFinish={handleUpdateNFT} form={updateForm}>
                <Form.Item name="mint" label="NFT Mint">
                  <Input onBlur={handleFetchNFT} />
                </Form.Item>
                <Form.Item name="name" label="Name">
                  <Input />
                </Form.Item>
                <Form.Item name="symbol" label="Symbol">
                  <Input />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input />
                </Form.Item>
                <Form.Item name="file">
                  <UploadImage
                    onChange={(param) =>
                      setUpdatedImageFile(param.file.originFileObj)
                    }
                    imageUrl={nftImageUrl}
                  />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" loading={updating}>
                    Update
                  </Button>
                </Form.Item>
              </Form>
            </Col>

            {signature && (
              <Col span={24}>
                <Typography.Text>
                  Transaction:{" "}
                  <a href={getTxURL(signature)} target="_blank">
                    {getTxURL(signature)}
                  </a>
                </Typography.Text>
              </Col>
            )}

            <Col span={24}>
              <Typography.Title level={4}>
                Create Collection NFT
              </Typography.Title>
            </Col>
            <Col span={24}>
              <Form onFinish={handleCreateCollectionNFT}>
                <Form.Item name="name" label="Name">
                  <Input />
                </Form.Item>
                <Form.Item name="symbol" label="Symbol">
                  <Input />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input />
                </Form.Item>
                <Form.Item name="file">
                  <UploadImage
                    onChange={(param) =>
                      setCollectionImageFile(param.file.originFileObj)
                    }
                  />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" loading={collectionCreating}>
                    Create
                  </Button>
                </Form.Item>
              </Form>
            </Col>

            {collectionMetadataUri && (
              <Col span={24}>
                <Typography.Text>
                  Metadata URI:{" "}
                  <a href={collectionMetadataUri} target="_blank">
                    {collectionMetadataUri}
                  </a>
                </Typography.Text>
              </Col>
            )}

            {collectionTokenMint && (
              <Col span={24}>
                <Typography.Text>
                  Token Mint:{" "}
                  <a href={getMintURL(collectionTokenMint)} target="_blank">
                    {getMintURL(collectionTokenMint)}
                  </a>
                </Typography.Text>
              </Col>
            )}

            <Col span={24}>
              <Typography.Title level={4}>
                Add NFT to a Collection
              </Typography.Title>
            </Col>
            <Col span={24}>
              <Form onFinish={handleAddToCollection}>
                <Form.Item name="nftMint" label="NFT Mint">
                  <Input />
                </Form.Item>
                <Form.Item name="collectionMint" label="Collection Mint">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" loading={adding}>
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </>
        )}
      </Row>
    </>
  );
};

export default Module2Lesson3;
