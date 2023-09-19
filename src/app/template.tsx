"use client";
import React from "react";
import { ConfigProvider } from "antd";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import theme from "../theme/themeConfig";
import MenuLayout from "@/containers/MenuLayout";
import { solanaEndpoint } from "@/lib/solana";

type Props = {
  children: React.ReactNode;
};

export default function MainTemplate({ children }: Props) {
  const wallet = new PhantomWalletAdapter();

  return (
    <ConfigProvider theme={theme}>
      <ConnectionProvider endpoint={solanaEndpoint}>
        <WalletProvider wallets={[wallet]}>
          <WalletModalProvider>
            <MenuLayout>{children}</MenuLayout>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ConfigProvider>
  );
}
