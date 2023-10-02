"use client";

import React, { useEffect } from "react";
import { Col, Row, Typography, Form, Button, Input, Rate, Card } from "antd";
import { getAccountInfo, getTxURL, lamportsToSOL } from "@/lib/solana";

import { truncateString } from "@/utils/format";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Movie } from "@/classes/Movie";
import { fetchMovieReviews, getMovieReviewTransaction, getReviewUpdateTransaction } from "@/lib/splMovieReview1";

const Module3Lesson4 = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = React.useState(0);

  const [signature1, setSignature1] = React.useState("");

  const [updatings, setUpdatings] = React.useState<boolean[]>([]);
  const [movies, setMovies] = React.useState<Movie[]>([]);

  useEffect(() => {
    if (connection && publicKey) {
      loadBalanceData();
      loadMovieData();
    }
  }, [connection, publicKey]);

  const updateLoading = (index: number, loading: boolean) => {
    setUpdatings((updatings) => {
      const newUpdatings = [...updatings];
      newUpdatings[index] = loading;
      return newUpdatings;
    });
  }

  const handleChangeReview = async (index: number, values: any) => {
    setMovies((movies) => {
      const newMovies = [...movies];
      newMovies[index] = {
        ...newMovies[index],
        ...values,
      };
      return newMovies;
    });
  };

  const handleReview = async (values: any) => {
    try {
      if (publicKey) {
        const { title, rating, description } = values;
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

  const handleUpdateReview = async (index: number) => {
    updateLoading(index, true);
    try {
      if (publicKey) {
        const { title, rating, description } = movies[index];

        const transaction = await getReviewUpdateTransaction(
          publicKey.toBase58(),
          title,
          +rating,
          description
        );
        await sendTransaction(transaction, connection);
      }
    } catch (e) {
      console.error(e);
    }
    updateLoading(index, false);
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

  return (
    <>
      <Row justify={"center"} gutter={8}>
        <Col span={24} className="text-center">
          <Typography.Title>Basic Security and Validation</Typography.Title>
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
                        <Typography.Text
                          editable={{
                            onChange: (value) => {
                              handleChangeReview(index, { description: value });
                            },
                          }}
                        >
                          {movie.description}
                        </Typography.Text>
                      </div>
                      <div>
                        <Rate
                          value={movie.rating}
                          onChange={(val) =>
                            handleChangeReview(index, { rating: val })
                          }
                        />
                      </div>
                      <div>
                        <Button onClick={() => handleUpdateReview(index)} loading={updatings[index]}>Update</Button>
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

export default Module3Lesson4;
