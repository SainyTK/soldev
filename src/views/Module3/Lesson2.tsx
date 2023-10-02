"use client";

import React, { useEffect, useState } from "react";
import { Col, Row, Typography, Form, Button, Input, Rate } from "antd";
import { getAccountInfo, getTxURL, lamportsToSOL } from "@/lib/solana";

import { truncateString } from "@/utils/format";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getCreateReviewTransaction } from "@/lib/splMovieReview1";

const Module3Lesson2 = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState(0);

  const [creating, setCreating] = useState(false);
  const [signature, setSignature] = useState("");

  const handleCreateReview = async (values: any) => {
    setCreating(true);
    try {
      if (publicKey) {
        const { title, rating, description } = values;
        const transaction = await getCreateReviewTransaction(publicKey.toBase58(), title, +rating, description);
        const sig = await sendTransaction(transaction, connection);
        setSignature(sig); 
      }
    } catch (e) {
      console.error(e);
    }
    setCreating(false);
  };

  const loadBalanceData = async () => {
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
    if (connection && publicKey) {
      loadBalanceData();
    }
  }, [connection, publicKey]);

  return (
    <>
      <Row justify={"center"} gutter={8}>
        <Col span={24} className="text-center">
          <Typography.Title>Handle Instruction Data</Typography.Title>
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
              <Form onFinish={handleCreateReview}>
                <Typography.Title level={4}>My movie review</Typography.Title>
                <Form.Item name="title" label="Title">
                  <Input />
                </Form.Item>
                <Form.Item name="rating" label="Rating">
                  <Rate />
                </Form.Item>
                <Form.Item name="body" label="Body">
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" loading={creating}>Submit</Button>
                </Form.Item>
              </Form>
            </Col>

            {signature && (
              <Col span={24}>
                <a href={getTxURL(signature)} target="_blank">
                  {getTxURL(signature)}
                </a>
              </Col>
            )}
          </>
        )}
      </Row>
    </>
  );
};

export default Module3Lesson2;
