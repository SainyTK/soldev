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
import { getAccountInfo, getTxURL, lamportsToSOL } from "@/lib/solana";

import { truncateString } from "@/utils/format";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getCommentTransaction,
  getMovieReviewTransaction,
} from "@/lib/splMovieReview2";
import { MovieCoordinator2 } from "@/classes/MovieCoordiantor2";
import { CommentCoordinator } from "@/classes/CommentCoordinator";
import { Movie2 } from "@/classes/Movie2";
import { Comment } from "@/classes/Comment";

const Module4Lesson2 = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = React.useState(0);

  const [signature1, setSignature1] = React.useState("");
  const [signature2, setSignature2] = React.useState("");

  const [movies, setMovies] = React.useState<Movie2[]>([]);
  const [totalMovies, setTotalMovies] = React.useState(0);
  const [pageSizeMovies, setPageSizeMovies] = React.useState(10);
  const [pageMovies, setPageMovies] = React.useState(1);
  const [searchMovies, setSearchMovies] = React.useState("");

  const [selectedMovie, setSelectedMovie] = React.useState<number | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [totalComments, setTotalComments] = React.useState(0);
  const [pageSizeComments, setPageSizeComments] = React.useState(10);
  const [pageComments, setPageComments] = React.useState(1);

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
    if (selectedMovie !== null) {
      const movie = movies[selectedMovie];
      if (movie) {
        loadCommentData(connection, movie, pageComments, pageSizeComments);
      }
    }
  }, [selectedMovie, connection, publicKey, pageSizeComments, pageComments]);

  const handleReview = async (values: any) => {
    try {
      if (publicKey) {
        const { title, rating, description } = values;
        const transaction = await getMovieReviewTransaction(
          publicKey.toBase58(),
          title,
          +rating,
          description,
          publicKey.toBase58()
        );
        const sig = await sendTransaction(transaction, connection);
        setSignature1(sig);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleComment = async (values: any) => {
    try {
      if (connection && publicKey && selectedMovie !== null) {
        const movie = movies[selectedMovie];
        const reviewPK = await movie.publicKey();
        await CommentCoordinator.syncCommentCount(
          connection,
          new PublicKey(reviewPK)
        );
        const counterPk = await CommentCoordinator.commentCounterPubkey(
          new PublicKey(reviewPK)
        );
        const { comment: content } = values;
        const count = CommentCoordinator.commentCount;

        const transaction = await getCommentTransaction(
          publicKey.toBase58(),
          counterPk.toBase58(),
          reviewPK,
          content,
          count
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
      const movies = await MovieCoordinator2.fetchPage(
        connection,
        page,
        pageSize,
        search,
        reload
      );
      const totalMovies = MovieCoordinator2.accounts.length;
      setMovies(movies);
      setTotalMovies(totalMovies);
    }
  };

  const loadCommentData = async (
    connection: Connection,
    movie: Movie2,
    page: number,
    pageSize: number
  ) => {
    if (connection) {
      const reviewPK = await movie.publicKey();
      await CommentCoordinator.syncCommentCount(
        connection,
        new PublicKey(reviewPK)
      );
      const totalComments = CommentCoordinator.commentCount;

      const comments = await CommentCoordinator.fetchPage(
        connection,
        new PublicKey(reviewPK),
        page,
        pageSize
      );
      setComments(comments);
      setTotalComments(totalComments);
    }
  };

  return (
    <>
      <Row justify={"center"} gutter={[8, 8]}>
        <Col span={24} className="text-center">
          <Typography.Title>PDA</Typography.Title>
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
                    <Card
                      onClick={() => setSelectedMovie(index)}
                      style={{
                        cursor: "pointer",
                        boxShadow: `${
                          index === selectedMovie ? "0 0 10px #ccc" : ""
                        }`,
                      }}
                    >
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
              <Typography.Title level={4}>Comments Reviews</Typography.Title>
            </Col>
            <Col span={24}>
              <Form onFinish={handleComment}>
                <Typography.Title level={4}>Post A Comment</Typography.Title>
                <Form.Item name="comment" label="Comment">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit">Submit</Button>
                </Form.Item>
              </Form>
            </Col>
            <Col span={24}>
              <Row gutter={[8, 8]}>
                {comments.map((comment, index) => (
                  <Col span={8} key={index}>
                    <Card>
                      <div>
                        <Typography.Title level={5}>
                          Commenter: {truncateString(comment.commenter)}
                        </Typography.Title>
                      </div>
                      <div>
                        <Typography.Text>{comment.comment}</Typography.Text>
                      </div>
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

export default Module4Lesson2;
