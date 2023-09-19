"use client";

import React from "react";
import { Col, Row, Typography, Form, Input, Button, Divider } from "antd";
import {
  airdropSOL,
  generateKeypair,
  getAccountInfo,
  getTxURL,
  incrementCounter,
  lamportsToSOL,
} from "@/lib/solana";
import * as bs58 from "bs58";

import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { truncateString } from "@/utils/format";

const Lesson3 = () => {
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

  const codeString = `
    import {
      LAMPORTS_PER_SOL,
      PublicKey,
      Connection,
      clusterApiUrl,
      Keypair,
      Transaction,
      SystemProgram,
      sendAndConfirmTransaction,
      TransactionInstruction,
    } from "@solana/web3.js";
    import * as bs58 from "bs58";

    export const secretKeyToKeypair = (secretKey: string) => {
      if (secretKey.includes(",")) {
        const secret = secretKey.split(",").map((x) => Number(x));
        return Keypair.fromSecretKey(Uint8Array.from(secret));
      } else {
        const secret = bs58.decode(secretKey);
        return Keypair.fromSecretKey(Uint8Array.from(secret));
      }
    };

    export const incrementCounter = async (secretKey: string) => {
      const connection = new Connection(clusterApiUrl("devnet"));
    
      const counterProgramID = "ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa";
      const counterAccountID = "Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod";
    
      const instruction = new TransactionInstruction({
        keys: [
          {
            pubkey: new PublicKey(counterAccountID),
            isSigner: false,
            isWritable: true,
          },
        ],
        programId: new PublicKey(counterProgramID),
      });
    
      const transaction = new Transaction();
      transaction.add(instruction);
    
      return sendAndConfirmTransaction(connection, transaction, [
        secretKeyToKeypair(secretKey),
      ]);
    };    
  `;

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

export default Lesson3;
