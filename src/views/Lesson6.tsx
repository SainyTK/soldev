"use client";

import React, { useEffect } from "react";
import {
  Col,
  Row,
  Typography,
  Form,
  Button,
  Input,
  Rate,
  Card,
  Pagination,
} from "antd";
import {
  getAccountInfo,
  getTxURL,
  lamportsToSOL,
  getMovieReviewTransaction,
  getIntroTransaction,
} from "@/lib/solana";

import { truncateString } from "@/utils/format";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Movie } from "@/classes/Movie";
import { Intro } from "@/classes/Intro";
import { MovieCoordinator } from "@/classes/MovieCoordiantor";
import { Connection } from "@solana/web3.js";
import { IntroCoordinator } from "@/classes/IntroCoordinator";

const Lesson6 = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = React.useState(0);

  const [signature1, setSignature1] = React.useState("");
  const [signature2, setSignature2] = React.useState("");

  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [totalMovies, setTotalMovies] = React.useState(0);
  const [pageSizeMovies, setPageSizeMovies] = React.useState(10);
  const [pageMovies, setPageMovies] = React.useState(1);
  const [searchMovies, setSearchMovies] = React.useState("");

  const [intros, setIntros] = React.useState<Intro[]>([]);
  const [totalIntros, setTotalIntros] = React.useState(0);
  const [pageSizeIntros, setPageSizeIntros] = React.useState(10);
  const [pageIntros, setPageIntros] = React.useState(1);
  const [searchIntros, setSearchIntros] = React.useState("");

  useEffect(() => {
    if (connection && publicKey) {
      loadBalanceData();
    }
  }, [connection, publicKey]);

  useEffect(() => {
    if (connection && publicKey) {
      loadMovieData(
        connection,
        pageMovies,
        pageSizeMovies,
        searchMovies,
        searchMovies !== ""
      );
    }
  }, [connection, publicKey, pageSizeMovies, pageMovies, searchMovies]);

  useEffect(() => {
    if (connection && publicKey) {
      loadIntroData(
        connection,
        pageIntros,
        pageSizeIntros,
        searchIntros,
        searchIntros !== ""
      );
    }
  }, [connection, publicKey, pageSizeIntros, pageIntros, searchIntros]);

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

  const loadMovieData = async (
    connection: Connection,
    page: number,
    pageSize: number,
    search?: string,
    reload?: boolean
  ) => {
    if (connection) {
      const movies = await MovieCoordinator.fetchPage(
        connection,
        page,
        pageSize,
        search,
        reload
      );
      const totalMovies = MovieCoordinator.accounts.length;
      setMovies(movies);
      setTotalMovies(totalMovies);
    }
  };

  const loadIntroData = async (
    connection: Connection,
    page: number,
    pageSize: number,
    search?: string,
    reload?: boolean
  ) => {
    if (connection) {
      const intros = await IntroCoordinator.fetchPage(
        connection,
        page,
        pageSize,
        search,
        reload
      );
      const totalIntros = IntroCoordinator.accounts.length;
      setIntros(intros);
      setTotalIntros(totalIntros);
    }
  };

  return (
    <>
      <Row justify={"center"} gutter={[8, 8]}>
        <Col span={24} className="text-center">
          <Typography.Title>
            Page, Order, and Filter Custom Account Data
          </Typography.Title>
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
              <Typography.Title level={4}>Movie Reviews</Typography.Title>
            </Col>
            <Col span={24}>
              <Input.Search
                placeholder="Search by title"
                onSearch={(value) => {
                  setSearchMovies(value);
                }}
              />
            </Col>
            <Col span={24}>
              <Row gutter={[8, 8]}>
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
            <Col span={24}>
              <div style={{ margin: "20px 0" }}>
                <Pagination
                  pageSize={pageSizeMovies}
                  current={pageMovies}
                  total={totalMovies}
                  onChange={(p, s) => {
                    setPageMovies(p);
                    setPageSizeMovies(s);
                  }}
                />
              </div>
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
              <Typography.Title level={4}>Intro List</Typography.Title>
            </Col>
            <Col span={24}>
              <Input.Search
                placeholder="Search by name"
                onSearch={(value) => {
                  setSearchIntros(value);
                }}
              />
            </Col>
            <Col span={24}>
              <Row gutter={[8, 8]}>
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
            <Col span={24}>
              <Pagination
                current={pageIntros}
                pageSize={pageSizeIntros}
                total={totalIntros}
                onChange={(p, s) => {
                  setPageIntros(p);
                  setPageSizeIntros(s);
                }}
              />
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

export default Lesson6;
