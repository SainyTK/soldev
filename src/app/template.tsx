"use client";
import React from "react";
import { ConfigProvider } from "antd";

import theme from "../theme/themeConfig";
import MenuLayout from "@/containers/MenuLayout";

type Props = {
  children: React.ReactNode;
};

export default function MainTemplate({ children }: Props) {
  return (
    <ConfigProvider theme={theme}>
      <MenuLayout>{children}</MenuLayout>
    </ConfigProvider>
  );
}
