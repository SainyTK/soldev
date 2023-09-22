import React from "react";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import type { MenuProps } from "antd";
import dynamic from "next/dynamic";

const Connect = dynamic(() => import("../containers/Connect").then(module => module.Connect), { ssr: false })

const { Header, Content, Sider } = Layout;

type Props = {
  menus: MenuProps["items"];
  submenus: MenuProps["items"];
  activeMenu: string;
  activeSubMenu: string;
  paths?: string[];
  children: React.ReactNode;
  onChangeMenu?: (key: string) => void;
  onChangeSubMenu?: (key: string) => void;
};

const MainLayout: React.FC<Props> = ({
  menus,
  submenus,
  activeMenu,
  activeSubMenu,
  paths,
  children,
  onChangeMenu,
  onChangeSubMenu,
}) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Menu
          theme="dark"
          defaultSelectedKeys={[activeMenu]}
          items={menus}
          onSelect={(e) => onChangeMenu && onChangeMenu(e.key)}
        />
        <Connect />
      </Header>
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={[activeSubMenu]}
            style={{ height: "100%", borderRight: 0 }}
            items={submenus}
            onSelect={(e) => {
              onChangeSubMenu && onChangeSubMenu(e.key);
            }}
          />
        </Sider>
        <Layout style={{ padding: "24px 24px" }}>
          {paths && paths.length && (
            <Breadcrumb style={{ margin: "16px 0" }}>
              {paths.map((path, index) => (
                <Breadcrumb.Item key={index}>{path}</Breadcrumb.Item>
              ))}
            </Breadcrumb>
          )}
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: "calc(100vh - 64px - 48px)",
              background: colorBgContainer,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
