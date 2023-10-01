"use client";

import React, { useState } from "react";
import { Col, Row, Typography, Button } from "antd";
import { getTxURL } from "@/lib/solana";

import { truncateString } from "@/utils/format";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSOLBalance } from "@/hooks/useSOLBalance";
import { getSayHelloTransaction } from "@/lib/splHello";

const Module3Lesson1 = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const balance = useSOLBalance(connection, publicKey?.toBase58() || "");

  const [saying, setSaying] = useState(false);
  const [signature, setSignature] = useState("");

  const handleSay = async () => {
    if (publicKey) {
      setSaying(true);
      try {
        const transaction = await getSayHelloTransaction();
        const signature = await sendTransaction(transaction, connection);
        setSignature(signature);
      } catch (error) {
        console.error(error);
      }

      setSaying(false);
    }
  };

  return (
    <>
      <Row justify={"center"} gutter={[8, 8]}>
        <Col span={24} className="text-center">
          <Typography.Title>Hello World</Typography.Title>
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
              <Typography.Title level={4}>Say Hello</Typography.Title>
              <Button loading={saying} onClick={handleSay}>
                Say !
              </Button>
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

export default Module3Lesson1;
