import "./globals.css";
import "@solana/wallet-adapter-ant-design/styles.css";
import "@solana/wallet-adapter-react-ui/styles.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import AntdRegistry from "../lib/AntdRegistry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Soldev",
  description: "Soldev, a Solana learning playground",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
