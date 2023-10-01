"use client";

import React, { useState } from "react";
import { Col, Row, Typography, Form, Button, Input, Select } from "antd";
import { getTxURL } from "@/lib/solana";

import { truncateString } from "@/utils/format";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSOLBalance } from "@/hooks/useSOLBalance";
import {
  fetchMintInfo,
  getTokenAirdropTransaction,
} from "@/lib/splToken";
import {
  feeAccount,
  kryptMint,
  poolKryptAccount,
  poolMint,
  poolScroogeAccount,
  scroogeMint,
  swapAuthority,
  tokenSwapStateAccount,
} from "@/constants/addresses";
import {
  getProvideLiquidityTransaction,
  getRemoveLiquidityTransaction,
  getSwapTransaction,
} from "@/lib/splTokenSwap";

const Module2Lesson2 = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const balance = useSOLBalance(connection, publicKey?.toBase58() || "");

  const [airdropping1, setAirdropping1] = useState(false);
  const [airdropping2, setAirdropping2] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [swapping, setSwapping] = useState(false);

  const [airdrop1Signature, setAirdrop1Signature] = useState("");
  const [airdrop2Signature, setAirdrop2Signature] = useState("");
  const [depositSignature, setDepositSignature] = useState("");
  const [withdrawSignature, setWithdrawSignature] = useState("");
  const [swapSignature, setSwapSignature] = useState("");

  const handleAirdropKrypt = async (values: any) => {
    if (publicKey) {
      setAirdropping1(true);
      try {
        const amount = values.amount;
        const transaction = await getTokenAirdropTransaction(
          connection,
          publicKey.toBase58(),
          kryptMint.toBase58(),
          publicKey.toBase58(),
          amount
        );
        const signature = await sendTransaction(transaction, connection);
        setAirdrop1Signature(signature);
      } catch (e) {
        console.error(e);
      }
      setAirdropping1(false);
    }
  };

  const handleAirdropScroorage = async (values: any) => {
    if (publicKey) {
      setAirdropping2(true);
      try {
        const amount = values.amount;
        const transaction = await getTokenAirdropTransaction(
          connection,
          publicKey.toBase58(),
          scroogeMint.toBase58(),
          publicKey.toBase58(),
          amount
        );
        const signature = await sendTransaction(transaction, connection);
        setAirdrop2Signature(signature);
      } catch (e) {
        console.error(e);
      }
      setAirdropping2(false);
    }
  };

  const handleProvideLiquidity = async (values: any) => {
    if (publicKey) {
      setDepositing(true);
      try {
        const amount = values.amount;
        const poolMintInfo = await fetchMintInfo(
          connection,
          poolMint.toBase58()
        );
        const lpTokenAmount = amount * 10 ** poolMintInfo.decimals;

        const transaction = await getProvideLiquidityTransaction(
          connection,
          tokenSwapStateAccount.toBase58(),
          swapAuthority.toBase58(),
          publicKey.toBase58(),
          kryptMint.toBase58(),
          scroogeMint.toBase58(),
          poolMint.toBase58(),
          poolKryptAccount.toBase58(),
          poolScroogeAccount.toBase58(),
          BigInt(lpTokenAmount),
          BigInt(100e9),
          BigInt(100e9)
        );

        const signature = await sendTransaction(transaction, connection);
        setDepositSignature(signature);
      } catch (error) {
        console.error(error);
      }
      setDepositing(false);
    }
  };

  const handleRemoveLiquidity = async (values: any) => {
    if (publicKey) {
      setWithdrawing(true);
      try {
        const amount = values.amount;
        const poolMintInfo = await fetchMintInfo(
          connection,
          poolMint.toBase58()
        );
        const lpTokenAmount = amount * 10 ** poolMintInfo.decimals;

        const transaction = await getRemoveLiquidityTransaction(
          connection,
          tokenSwapStateAccount.toBase58(),
          swapAuthority.toBase58(),
          publicKey.toBase58(),
          kryptMint.toBase58(),
          scroogeMint.toBase58(),
          poolMint.toBase58(),
          feeAccount.toBase58(),
          poolKryptAccount.toBase58(),
          poolScroogeAccount.toBase58(),
          BigInt(lpTokenAmount),
          BigInt(0),
          BigInt(0)
        );

        const signature = await sendTransaction(transaction, connection);
        setWithdrawSignature(signature);
      } catch (e) {
        console.error(e);
      }
      setWithdrawing(false);
    }
  };

  const handleSwap = async (values: any) => {
    if (publicKey) {
      setSwapping(true);
      try {
        const amount = values.amount;
        const tokenName = values.token;

        if (tokenName === "krypt") {
          const kryptMintInfo = await fetchMintInfo(connection, kryptMint.toBase58());
          const kryptAmount = amount * 10 ** kryptMintInfo.decimals;
          const transaction = await getSwapTransaction(
            connection,
            tokenSwapStateAccount.toBase58(),
            swapAuthority.toBase58(),
            publicKey.toBase58(),
            kryptMint.toBase58(),
            scroogeMint.toBase58(),
            poolMint.toBase58(),
            poolKryptAccount.toBase58(),
            poolScroogeAccount.toBase58(),
            feeAccount.toBase58(),
            null,
            BigInt(kryptAmount),
            BigInt(0)
          )
          const signature = await sendTransaction(transaction, connection);
          setSwapSignature(signature);
        } else if (tokenName === "scrooge") {
          const scroogeInfo = await fetchMintInfo(connection, scroogeMint.toBase58());
          const scroogeAmount = amount * 10 ** scroogeInfo.decimals;
          const transaction = await getSwapTransaction(
            connection,
            tokenSwapStateAccount.toBase58(),
            swapAuthority.toBase58(),
            publicKey.toBase58(),
            scroogeMint.toBase58(),
            kryptMint.toBase58(),
            poolMint.toBase58(),
            poolScroogeAccount.toBase58(),
            poolKryptAccount.toBase58(),
            feeAccount.toBase58(),
            null,
            BigInt(scroogeAmount),
            BigInt(0)
          )
          const signature = await sendTransaction(transaction, connection);
          setSwapSignature(signature);
        }
      } catch (e) {
        console.error(e);
      }
      setSwapping(false);
    }
  };

  return (
    <>
      <Row justify={"center"} gutter={[8, 8]}>
        <Col span={24} className="text-center">
          <Typography.Title>
            Swap Token With Token Swap Program
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
              <Typography.Title level={4}>Airdrop Test Token</Typography.Title>
            </Col>
            <Col span={12}>
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Form onFinish={handleAirdropKrypt}>
                    <Form.Item name="amount" label="Krypt amount" required>
                      <Input />
                    </Form.Item>
                    <Form.Item>
                      <Button htmlType="submit" loading={airdropping1}>Airdrop Krypt</Button>
                    </Form.Item>
                  </Form>
                </Col>
                {airdrop1Signature && (
                  <Col span={24}>
                    <a href={getTxURL(airdrop1Signature)} target="_blank">
                      {getTxURL(airdrop1Signature)}
                    </a>
                  </Col>
                )}
              </Row>
            </Col>
            <Col span={12}>
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Form onFinish={handleAirdropScroorage}>
                    <Form.Item name="amount" label="Scroorage amount" required>
                      <Input />
                    </Form.Item>
                    <Form.Item>
                      <Button htmlType="submit" loading={airdropping2}>Airdrop Scroorage</Button>
                    </Form.Item>
                  </Form>
                </Col>
                {airdrop2Signature && (
                  <Col span={24}>
                    <a href={getTxURL(airdrop2Signature)} target="_blank">
                      {getTxURL(airdrop2Signature)}
                    </a>
                  </Col>
                )}
              </Row>
            </Col>

            <Col span={24}>
              <Typography.Title level={4}>Provide Liquidity</Typography.Title>
            </Col>
            <Col span={24}>
              <Form onFinish={handleProvideLiquidity}>
                <Form.Item name="amount" label="LP token amount">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" loading={depositing}>
                    Deposit
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            {depositSignature && (
              <Col span={24}>
                <a href={getTxURL(depositSignature)} target="_blank">
                  {getTxURL(depositSignature)}
                </a>
              </Col>
            )}

            <Col span={24}>
              <Typography.Title level={4}>Remove Liquidity</Typography.Title>
            </Col>
            <Col span={24}>
              <Form onFinish={handleRemoveLiquidity}>
                <Form.Item name="amount" label="LP token amount">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" loading={withdrawing}>
                    Withdraw
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            {withdrawSignature && (
              <Col span={24}>
                <a href={getTxURL(withdrawSignature)} target="_blank">
                  {getTxURL(withdrawSignature)}
                </a>
              </Col>
            )}

            <Col span={24}>
              <Typography.Title level={4}>Swap Token</Typography.Title>
            </Col>
            <Col span={24}>
              <Form onFinish={handleSwap}>
                <Form.Item name="token" label="Input token">
                  <Select>
                    <Select.Option value="krypt">Krypt</Select.Option>
                    <Select.Option value="scrooge">Scrooge</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="amount" label="Input amount">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" loading={swapping}>
                    Swap
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            {swapSignature && (
              <Col span={24}>
                <a href={getTxURL(swapSignature)} target="_blank">
                  {getTxURL(swapSignature)}
                </a>
              </Col>
            )}
          </>
        )}
      </Row>
    </>
  );
};

export default Module2Lesson2;
