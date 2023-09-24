"use client";

import React, { useEffect } from "react";
import { Col, Row, Typography, Form, Button, Input } from "antd";
import {
  getAccountInfo,
  getTransferTransaction,
  getTxURL,
  lamportsToSOL,
} from "@/lib/solana";

import { truncateString } from "@/utils/format";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getIncrementTransaction } from "@/lib/splCounter";

const Lesson3 = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = React.useState(0);

  const [signature1, setSignature1] = React.useState("");
  const [signature2, setSignature2] = React.useState("");

  const handleIncrement = async (values: any) => {
    try {
      const transaction = await getIncrementTransaction();
      const sig = await sendTransaction(transaction, connection);
      setSignature1(sig);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTransferTokens = async (values: any) => {
    try {
      const from = publicKey?.toBase58() || "";
      const to = values.to;
      const amount = values.amount;
      const transaction = await getTransferTransaction(from, to, amount);
      const sig = await sendTransaction(transaction, connection);
      setSignature2(sig);
    } catch (e) {
      console.error(e);
    }
  };

  const onAccountUpdate = async () => {
    if (publicKey) {
      const accountInfo = await getAccountInfo(
        publicKey.toBase58(),
        connection
      );
      if (accountInfo) {
        setBalance(lamportsToSOL(accountInfo.lamports));
      }
    }
  };

  useEffect(() => {
    if (publicKey) {
      onAccountUpdate();
    }
  }, [publicKey]);

  return (
    <>
      <Row justify={"center"} gutter={8}>
        <Col span={24} className="text-center">
          <Typography.Title>Wallet</Typography.Title>
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
              <Typography.Text>Balance: {balance} SOL</Typography.Text>
            </Col>
            <Col span={24}>
              <Form onFinish={handleIncrement}>
                <Typography.Title level={4}>
                  Call counter contract
                </Typography.Title>
                <Form.Item>
                  <Button htmlType="submit">Increment</Button>
                </Form.Item>
              </Form>
            </Col>
            {signature1 && (
              <Col span={24}>
                <a href={getTxURL(signature1)} target="_blank">
                  {getTxURL(signature1)}
                </a>
              </Col>
            )}
            <Col span={24}>
              <Form onFinish={handleTransferTokens}>
                <Typography.Title level={4}>Transfer Token</Typography.Title>
                <Form.Item name="to" label="To address">
                  <Input />
                </Form.Item>
                <Form.Item name="amount" label="Amount (SOL)">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit">Transfer</Button>
                </Form.Item>
              </Form>
            </Col>
            {signature2 && (
              <Col span={24}>
                <a href={getTxURL(signature2)} target="_blank">
                  {getTxURL(signature2)}
                </a>
              </Col>
            )}
          </>
        )}
      </Row>
    </>
  );
};

export default Lesson3;
