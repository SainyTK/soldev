"use client";

import React, { useEffect, useState } from "react";
import { Col, Row, Typography, Button } from "antd";
import { getTxURL } from "@/lib/solana";

import { truncateString } from "@/utils/format";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useSOLBalance } from "@/hooks/useSOLBalance";

import * as anchor from "@project-serum/anchor";
import idl from "@/constants/idl/anchor_counter.json";
import { COUNTER_PROGRAM_ID } from "@/constants/addresses";
import { AnchorCounter, IDL } from "@/types/anchor_counter";
import { PublicKey } from "@solana/web3.js";

const Module5Lesson1 = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const wallet = useAnchorWallet();

  const [count, setCount] = useState(0);

  const balance = useSOLBalance(connection, publicKey?.toBase58() || "");

  const [program, setProgram] = useState<anchor.Program<AnchorCounter> | null>(
    null
  );

  const [initializing, setInitializing] = useState(false);
  const [incrementing, setIncrementing] = useState(false);
  const [decrementing, setDecrementing] = useState(false);
  const [signature, setSignature] = useState("");

  const [counterPk, setCounterPk] = useState<PublicKey | null>(null);

  useEffect(() => {
    if (connection && wallet) {
      let provider: anchor.Provider;

      try {
        provider = anchor.getProvider();
      } catch (e) {
        provider = new anchor.AnchorProvider(connection, wallet, {});
        anchor.setProvider(provider);
      }

      const program = new anchor.Program(IDL, COUNTER_PROGRAM_ID);
      setProgram(program);
    }
  }, [connection, wallet]);

  const handleInitialize = async () => {
    if (program && wallet) {
      setInitializing(true);
      try {
        const newAccount = anchor.web3.Keypair.generate();
        const sig = await program.methods
          .initialize()
          .accounts({
            counter: newAccount.publicKey,
            user: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([newAccount])
          .rpc();

        setSignature(sig);
        setCounterPk(newAccount.publicKey);
      } catch {}

      setInitializing(false);
    }
  };

  const handleIncrement = async () => {
    if (program && counterPk && wallet) {
      setIncrementing(true);

      try {
        const sig = await program.methods
          .increment()
          .accounts({ counter: counterPk, user: wallet.publicKey })
          .rpc();
        setSignature(sig);
      } catch {}

      fetchCount();
      setIncrementing(false);
    }
  };

  const handleDecrement = async () => {
    if (program && counterPk && wallet) {
      setDecrementing(true);

      try {
        const sig = await program.methods
          .decrement()
          .accounts({ counter: counterPk, user: wallet.publicKey })
          .rpc();
        setSignature(sig);
      } catch {}

      fetchCount();
      setDecrementing(false);
    }
  };

  const fetchCount = async () => {
    if (program && counterPk) {
      const counterAccount = await program.account.counter.fetch(counterPk);
      setCount(counterAccount.count.toNumber());
    }
  };

  return (
    <>
      <Row justify={"center"} gutter={[8, 8]}>
        <Col span={24} className="text-center">
          <Typography.Title>Local Program Development</Typography.Title>
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
              <Typography.Title level={4}>Anchor Counter</Typography.Title>
              <div>
                <Button onClick={handleInitialize} loading={initializing}>
                  Initialize
                </Button>
              </div>

              {counterPk && (
                <>
                  <Button
                    loading={decrementing}
                    onClick={handleDecrement}
                    style={{ marginRight: 8 }}
                  >
                    -
                  </Button>
                  <Typography.Text style={{ marginRight: 8 }}>
                    {count}
                  </Typography.Text>
                  <Button loading={incrementing} onClick={handleIncrement}>
                    +
                  </Button>
                </>
              )}
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

export default Module5Lesson1;
