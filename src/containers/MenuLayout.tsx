"use client";

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
    key: "/module1",
    label: "Module 1 - Introduction to cryptography and Solana program",
    children: [
      {
        key: "/module1/lesson1",
        label: "Lesson 1 - Read Data",
      },
      {
        key: "/module1/lesson2",
        label: "Lesson 2 - Write Data",
      },
      {
        key: "/module1/lesson3",
        label: "Lesson 3 - Wallet",
      },
      {
        key: "/module1/lesson4",
        label: "Lesson 4 - Serialize Custom Instruction Data",
      },
      {
        key: "/module1/lesson5",
        label: "Lesson 5 - Deserialize Custom Data",
      },
      {
        key: "/module1/lesson6",
        label: "Lesson 6 - Page, Order, and Filter Custom Account Data",
      },
    ],
  },
  {
    key: '/module2',
    label: 'Module 2 - Client interaction with Common Solana Programs',
    children: [
      {
        key: '/module2/lesson1',
        label: 'Lesson 1 - Create tokens with the Token Program'
      },
      {
        key: '/module2/lesson2',
        label: 'Lesson 2 - Swap token with Token Swap Program'
      },
      {
        key: '/module2/lesson3',
        label: 'Lesson 3 - Create Solana NFTs with Metaplex'
      }
    ]
  },
  {
    key: '/module3',
    label: 'Module 3 - Basic Solana Program Development',
    children: [
      {
        key: '/module3/lesson1',
        label: 'Lesson 1 - Hello World'
      },
      {
        key: '/module3/lesson2',
        label: 'Lesson 2 - Create a Basic Program, Part 1 - Handle Instruction Data'
      },
      {
        key: '/module3/lesson3',
        label: 'Lesson 3 - Create a Basic Program, Part 2 - State Management'
      },
      {
        key: '/module3/lesson4',
        label: 'Lesson 4 - Create a Basic Program, Part 3 - Basic Security and Validation'
      }
    ]
  },
  {
    key: '/module4',
    label: 'Module 4 - Local Solana Program Development',
    children: [
      {
        key: '/module4/lesson1',
        label: 'Lesson 1 - Local Program Development'
      },
      {
        key: '/module4/lesson2',
        label: 'Lesson 2 - PDA (Program Derived Address)'
      },
      {
        key: '/module4/lesson3',
        label: 'Lesson 3 - CPI (Cross Program Invocation)'
      }
    ]
  },
  {
    key: '/module5',
    label: 'Module 5 - Anchor Solana Program Development',
    children: [
      {
        key: '/module5/lesson1',
        label: 'Lesson 1 - Intro to Anchor'
      },
      {
        key: '/module5/lesson2',
        label: 'Lesson 2 - PDA (Program Derived Address)'
      },
      {
        key: '/module5/lesson3',
        label: 'Lesson 3 - CPI (Cross Program Invocation)'
      }
    ]
  }
];

type Props = {
  children: React.ReactNode;
};

const MenuLayout: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const paths = usePathname().split("/");
  const currentPath = paths[paths.length - 1];

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
