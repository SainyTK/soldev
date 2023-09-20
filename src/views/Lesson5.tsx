"use client";

import React, { useEffect } from "react";
import {
  Col,
  Row,
  Typography,
  Form,
  Button,
  Divider,
  Input,
  Rate,
  Card,
} from "antd";
import {
  solToLamports,
  getAccountInfo,
  getIncrementTransaction,
  getTransferTransaction,
  getTxURL,
  lamportsToSOL,
  getMovieReviewTransaction,
  getIntroTransaction,
  fetchMovieReviews,
  fetchIntros,
} from "@/lib/solana";

import { truncateString } from "@/utils/format";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Movie } from "@/classes/Movie";
import { Intro } from "@/classes/Intro";

const Lesson5 = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = React.useState(0);

  const [signature1, setSignature1] = React.useState("");
  const [signature2, setSignature2] = React.useState("");

  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [intros, setIntros] = React.useState<Intro[]>([]);

  const handleReview = async (values: any) => {
    try {
      if (publicKey) {
        const { title, rating, description } = values;
        console.log({ title, rating, description });
        const transaction = await getMovieReviewTransaction(
          publicKey.toBase58(),
          title,
          +rating,
          description
        );
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
        const transaction = await getIntroTransaction(
          publicKey.toBase58(),
          name,
          message
        );
        const sig = await sendTransaction(transaction, connection);
        setSignature2(sig);
      }
    } catch (e) {
      console.error(e);
    }
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

  const loadMovieData = async () => {
    if (connection) {
      const movies = await fetchMovieReviews(connection);
      setMovies(movies);
    }
  };

  const loadIntroData = async () => {
    if (connection) {
      const intros = await fetchIntros(connection);
      setIntros(intros);
    }
  };

  useEffect(() => {
    if (connection && publicKey) {
      loadBalanceData();
      loadMovieData();
      loadIntroData();
    }
  }, [connection, publicKey]);

  return (
    <>
      <Row justify={"center"} gutter={8}>
        <Col span={24} className="text-center">
          <Typography.Title>Deserialize Custom Data</Typography.Title>
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
            <Col span={24}>
              <Row gutter={8}>
                {movies.map((movie, index) => (
                  <Col span={8} key={index}>
                    <Card>
                      <div>
                        <Typography.Title level={5}>
                          {movie.title}
                        </Typography.Title>
                      </div>
                      <div>
                        <Typography.Text>{movie.description}</Typography.Text>
                      </div>
                      <div>
                        <Rate value={movie.rating} disabled />
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
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
                <Form.Item
                  name="message"
                  label="What brings you to Solana, friend ?"
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit">Submit</Button>
                </Form.Item>
              </Form>
            </Col>

            <Col span={24}>
              <Row gutter={8}>
                {intros.map((intro, index) => (
                  <Col span={8} key={index}>
                    <Card>
                      <Typography.Title level={5}>
                        {intro.name}
                      </Typography.Title>
                      <Typography.Text>{intro.message}</Typography.Text>
                    </Card>
                  </Col>
                ))}
              </Row>
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

export default Lesson5;
