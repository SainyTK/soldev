"use client"

import React from "react";
import { Col, Row, Typography, Form, Input, Button, Divider } from "antd";
import { getAccountInfo, lamportsToSOL } from "@/lib/solana";

import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

const Lesson1 = () => {
  const [address, setAddress] = React.useState("");
  const [balance, setBalance] = React.useState("0");
  const [executable, setExecutable] = React.useState("false");

  const onFinish = async (values: any) => {
    setAddress(values.address);
    const accountInfo = await getAccountInfo(values.address);
    if (accountInfo) {
      const { lamports, executable } = accountInfo;
      setBalance(lamportsToSOL(lamports).toString());
      setExecutable(executable ? "true" : "false");
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log(errorInfo);
  };

  const codeString = `
    import * as Web3 from "@solana/web3.js";

    export const getBalance = async (address: string) => {
        const key = new Web3.PublicKey(address);
        const connection = new Web3.Connection(Web3.clusterApiUrl("devnet"));
        return connection
        .getBalance(key)
        .then((balance) => (balance / Web3.LAMPORTS_PER_SOL).toString());
    };

    export const getAccountInfo = async (address: string) => {
        const key = new Web3.PublicKey(address);
        const connection = new Web3.Connection(Web3.clusterApiUrl("devnet"));
        return connection.getAccountInfo(key);
    };
  `;

  return (
    <>
      <Row justify={"center"}>
        <Col span={24} className="text-center">
          <Typography.Title>Start Your Solana Journey</Typography.Title>
        </Col>
        <Col span={24}>
          <Form onFinish={onFinish} onFinishFailed={onFinishFailed}>
            <Form.Item
              name="address"
              label="Enter your Solana address"
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
        <Col span={24}>
          <Typography.Text>Address: {address}</Typography.Text>
        </Col>
        <Col span={24}>
          <Typography.Text>Balance: {balance} SOL</Typography.Text>
        </Col>
        <Col span={24}>
          <Typography.Text>Is executable?: {executable}</Typography.Text>
        </Col>
        <Col span={24}>
          <Divider />
        </Col>
        <Col span={24}>
          <Typography.Title level={2}>Code</Typography.Title>
        </Col>
        <Col span={24}>
          <SyntaxHighlighter language="typescript" style={docco}>
            {codeString}
          </SyntaxHighlighter>
        </Col>
      </Row>
    </>
  );
};

export default Lesson1;
