"use client";

import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Typography,
  Form,
  Button,
  Input,
  Rate,
  Card,
  Pagination,
} from "antd";
import {
  getAccountInfo,
  getTxURL,
  lamportsToSOL,
  getMovieReviewTransaction,
  getIntroTransaction,
  getCreateMintTransaction,
  generateKeypair,
  getCreateAtaTransaction,
  fetchMintInfo,
  getMintTokenTransaction,
} from "@/lib/solana";

import { truncateString } from "@/utils/format";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Movie } from "@/classes/Movie";
import { Intro } from "@/classes/Intro";
import { MovieCoordinator } from "@/classes/MovieCoordiantor";
import { Connection, PublicKey } from "@solana/web3.js";
import { IntroCoordinator } from "@/classes/IntroCoordinator";
import { useSOLBalance } from "@/hooks/useSOLBalance";
import { generateKeyPair } from "crypto";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

const Module2Lesson1 = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const balance = useSOLBalance(connection, publicKey?.toBase58() || "");

  const [creatingMint, setCreatingMint] = useState(false);
  const [createdMint, setCreatedMint] = useState("");
  const [mintAuthority, setMintAuthority] = useState("");
  const [freezeAuthority, setFreezeAuthority] = useState("");
  const [decimals, setDecimals] = useState(0);

  const [creatingAta, setCreatingAta] = useState(false);
  const [ata, setAta] = useState("");

  const [minting, setMinting] = useState(false);

  const [signature1, setSignature1] = useState("");
  const [signature2, setSignature2] = useState("");
  const [signature3, setSignature3] = useState("");

  const handleCreateMint = async () => {
    if (publicKey) {
      setCreatingMint(true);
      try {
        const payer = publicKey;
        const mint = generateKeypair();
        const decimals = 0;

        const transaction = await getCreateMintTransaction(
          connection,
          payer.toBase58(),
          mint.publicKey.toBase58(),
          decimals
        );
        const signature = await sendTransaction(transaction, connection, {
          signers: [mint],
        });
        setCreatedMint(mint.publicKey.toBase58());

        setSignature1(signature);
      } catch (error) {
        console.error(error);
      }

      setCreatingMint(false);
    }
  };

  const createAssociatedTokenAccount = async (values: any) => {
    if (publicKey) {
      setCreatingAta(true);

      try {
        const { mint, owner } = values;

        const transaction = await getCreateAtaTransaction(
          publicKey.toBase58(),
          owner,
          mint
        );
        const signature = await sendTransaction(transaction, connection);

        const ata = await getAssociatedTokenAddress(
          new PublicKey(mint),
          new PublicKey(owner),
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        setAta(ata.toBase58());
        setSignature2(signature);
      } catch (e) {
        console.error(e);
      }

      setCreatingAta(false);
    }
  };

  const handleMintToken = async (values: any) => {
    setMinting(true);

    try {
      const { mint, recipient, amount } = values;

      const mintInfo = await fetchMintInfo(connection, mint);
      const mintAmount = +amount * 10 ** mintInfo.decimals;

      const authority = publicKey?.toBase58() || "";
      const ata = await getAssociatedTokenAddress(
        new PublicKey(mint),
        new PublicKey(recipient),
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      const transaction = await getMintTokenTransaction(
        mint,
        ata.toBase58(),
        authority,
        mintAmount
      );
      const signature = await sendTransaction(transaction, connection);

      setSignature3(signature);
    } catch (e) {
      console.error(e);
    }

    setMinting(false);
  };

  return (
    <>
      <Row justify={"center"} gutter={[8, 8]}>
        <Col span={24} className="text-center">
          <Typography.Title>
            Create Tokens With The Token Program
          </Typography.Title>
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
              <Typography.Title level={4}>Create Mint</Typography.Title>
            </Col>
            <Col span={24}>
              <Button onClick={handleCreateMint} loading={creatingMint}>
                Create Mint
              </Button>
            </Col>
            {createdMint && (
              <Col span={24}>
                <Typography.Text copyable={{ text: createdMint }}>
                  Mint address: {createdMint}
                </Typography.Text>
              </Col>
            )}
            {mintAuthority && (
              <Col span={24}>
                <Typography.Text copyable={{ text: mintAuthority }}>
                  Mint authority: {mintAuthority}
                </Typography.Text>
              </Col>
            )}
            {freezeAuthority && (
              <Col span={24}>
                <Typography.Text copyable={{ text: freezeAuthority }}>
                  Freeze authority: {freezeAuthority}
                </Typography.Text>
              </Col>
            )}
            {decimals && (
              <Col span={24}>
                <Typography.Text>Decimals: {decimals}</Typography.Text>
              </Col>
            )}
            {signature1 && (
              <Col span={24}>
                <a href={getTxURL(signature1)} target="_blank">
                  {getTxURL(signature1)}
                </a>
              </Col>
            )}

            <Col span={24}>
              <Typography.Title level={4}>
                Create Associated Token Account
              </Typography.Title>
            </Col>
            <Col span={24}>
              <Form onFinish={createAssociatedTokenAccount}>
                <Form.Item name="mint" label="Mint">
                  <Input />
                </Form.Item>
                <Form.Item name="owner" label="Token Account Owner">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" loading={creatingAta}>
                    Create
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            {ata && (
              <Col span={24}>
                <Typography.Text copyable={{ text: ata }}>
                  Associated Token Account: {ata}
                </Typography.Text>
              </Col>
            )}
            {signature2 && (
              <Col span={24}>
                <a href={getTxURL(signature2)} target="_blank">
                  {getTxURL(signature2)}
                </a>
              </Col>
            )}

            <Col span={24}>
              <Typography.Title level={4}>Mint Token</Typography.Title>
            </Col>
            <Col span={24}>
              <Form onFinish={handleMintToken}>
                <Form.Item name="mint" label="Mint">
                  <Input />
                </Form.Item>
                <Form.Item name="recipient" label="Recipient">
                  <Input />
                </Form.Item>
                <Form.Item name="amount" label="Amount">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" loading={minting}>
                    Mint
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            {signature3 && (
              <Col span={24}>
                <a href={getTxURL(signature3)} target="_blank">
                  {getTxURL(signature3)}
                </a>
              </Col>
            )}
          </>
        )}
      </Row>
    </>
  );
};

export default Module2Lesson1;
