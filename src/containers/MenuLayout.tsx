"use client"

import React from "react";
import type { MenuProps } from "antd";
import MainLayout from "@/components/MainLayout";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const MENUS: MenuProps["items"] = [
  {
    key: "home",
    label: "Home",
  },
];

const SUBMENUS: MenuProps["items"] = [
  {
    key: "lesson1",
    label: "Lesson 1 - Read Data",
  },
  {
    key: "lesson2",
    label: "Lesson 2 - Write Data",
  },
  {
    key: "lesson3",
    label: "Lesson 3 - Wallet",
  }
];

type Props = {
  children: React.ReactNode;
};

const MenuLayout: React.FC<Props> = ({ children }) => {

  const router = useRouter();
  const paths = usePathname().split('/');
  const currentPath = paths[paths.length - 1]

  const handleChangeMenu = (key: string) => {
    console.log(key);
  };

  const handleChangeSubMenu = (key: string) => {
    router.push(key);
  };

  return (
    <MainLayout
      menus={MENUS}
      submenus={SUBMENUS}
      activeMenu="home"
      activeSubMenu={currentPath}
      onChangeMenu={handleChangeMenu}
      onChangeSubMenu={handleChangeSubMenu}
    >
      {children}
    </MainLayout>
  );
};

export default MenuLayout;
