"use client";

import React, { useEffect } from "react";
import { Col, Row, Typography, Form, Button, Input, Rate, Card } from "antd";
import { getAccountInfo, getTxURL, lamportsToSOL } from "@/lib/solana";

import { truncateString } from "@/utils/format";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Movie } from "@/classes/Movie";
import {
  MY_MOVIE_PROGRAM_ID,
  fetchMovieReviews,
  getMovieReviewTransaction,
} from "@/lib/splMovieReview";

const Module3Lesson3 = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = React.useState(0);

  const [signature1, setSignature1] = React.useState("");

  const [movies, setMovies] = React.useState<Movie[]>([]);

  const handleReview = async (values: any) => {
    try {
      if (publicKey) {
        const { title, rating, description } = values;
        const transaction = await getMovieReviewTransaction(
          publicKey.toBase58(),
          title,
          +rating,
          description,
          MY_MOVIE_PROGRAM_ID
        );
        const sig = await sendTransaction(transaction, connection);
        setSignature1(sig);
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
      const movies = await fetchMovieReviews(connection, MY_MOVIE_PROGRAM_ID);
      setMovies(movies);
    }
  };

  useEffect(() => {
    if (connection && publicKey) {
      loadBalanceData();
      loadMovieData();
    }
  }, [connection, publicKey]);

  return (
    <>
      <Row justify={"center"} gutter={8}>
        <Col span={24} className="text-center">
          <Typography.Title>State Management</Typography.Title>
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
          </>
        )}
      </Row>
    </>
  );
};

export default Module3Lesson3;
