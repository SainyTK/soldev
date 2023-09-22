"use client";

import React, { useEffect } from "react";
import { Col, Row, Typography, Form, Button, Divider, Input, Rate } from "antd";
import {
  solToLamports,
  getAccountInfo,
  getIncrementTransaction,
  getTransferTransaction,
  getTxURL,
  lamportsToSOL,
  getMovieReviewTransaction,
  getIntroTransaction,
} from "@/lib/solana";

import { truncateString } from "@/utils/format";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const Lesson4 = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = React.useState(0);

  const [signature1, setSignature1] = React.useState("");
  const [signature2, setSignature2] = React.useState("");

  const handleReview = async (values: any) => {
    try {
      if (publicKey) {
        const { title, rating, description } = values;
        console.log({ title, rating, description })
        const transaction = await getMovieReviewTransaction(publicKey.toBase58(), title, +rating, description);
        const sig = await sendTransaction(transaction, connection);
        setSignature1(sig);
      }

    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitIntro = async (values: any) => {
    try {
      if (publicKey) {
        const { name, message } = values;
        const transaction = await getIntroTransaction(publicKey.toBase58(), name, message);
        const sig = await sendTransaction(transaction, connection);
        setSignature2(sig);
      }
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
          <Typography.Title>Serialize Custom Instruction Data</Typography.Title>
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
              <Form onFinish={handleReview}>
                <Typography.Title level={4}>Movie Review</Typography.Title>
                <Form.Item name="title" label="Title">
                  <Input />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input />
                </Form.Item>
                <Form.Item name="rating" label="Rating">
                  <Rate />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit">Submit</Button>
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
              <Form onFinish={handleSubmitIntro}>
                <Typography.Title level={4}>Student Intros</Typography.Title>
                <Form.Item name="name" label="What do we call you ?">
                  <Input />
                </Form.Item>
                <Form.Item name="message" label="What brings you to Solana, friend ?">
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit">Submit</Button>
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

export default Lesson4;
