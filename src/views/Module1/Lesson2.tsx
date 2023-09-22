"use client";

import React from "react";
import { Col, Row, Typography, Form, Input, Button, Divider } from "antd";
import {
  airdropSOL,
  generateKeypair,
  getTxURL,
  incrementCounter,
} from "@/lib/solana";
import * as bs58 from "bs58";

import { truncateString } from "@/utils/format";

const Lesson2 = () => {
  const [loading, setLoading] = React.useState(false);
  const [generatedKey, setGeneratedKey] = React.useState("");
  const [signature, setSignature] = React.useState("");

  const generateKey = async () => {
    const result = generateKeypair();
    setGeneratedKey(bs58.encode(result.secretKey));
    setLoading(true);
    await airdropSOL(result.publicKey.toBase58());
    setLoading(false);
  };

  const onFinish = async (values: any) => {
    const sig = await incrementCounter(values.secretKey);
    setSignature(sig);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log(errorInfo);
  };

  return (
    <>
      <Row justify={"center"} gutter={8}>
        <Col span={24} className="text-center">
          <Typography.Title>
            Write Data To Solana With Transactions
          </Typography.Title>
        </Col>
        <Col span={24}>
          <Typography.Text style={{ marginRight: 4 }}>
            Generate a secret key:{" "}
          </Typography.Text>
          {generatedKey && (
            <Typography.Text
              copyable={{ text: generatedKey }}
              style={{ marginRight: 4 }}
            >
              {truncateString(generatedKey)}
            </Typography.Text>
          )}
          <Button onClick={generateKey} loading={loading}>Generate</Button>
        </Col>
        <Col span={24}>
          <Form onFinish={onFinish} onFinishFailed={onFinishFailed}>
            <Form.Item
              name="secretKey"
              label="Enter your Solana private key"
              style={{ maxWidth: 768 }}
            >
              <Input />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 4 }}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
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
      </Row>
    </>
  );
};

export default Lesson2;
