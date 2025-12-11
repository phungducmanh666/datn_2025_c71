"use client";

import { useTheme } from "@context/themeContext";
import {
  App,
  Button,
  Card,
  ConfigProvider,
  Dropdown,
  Flex,
  Layout,
  Menu,
  MenuProps,
  Segmented,
  theme,
} from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { useRouter } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import { CiCloudMoon, CiCloudSun } from "react-icons/ci";
import { FaProductHunt, FaUserAlt, FaWarehouse } from "react-icons/fa";
import { GrCatalogOption, GrOrderedList } from "react-icons/gr";
import { IoHome } from "react-icons/io5";

//#region header

interface ThemeSwitchButtonProps {}

const ThemeSwitchButton: React.FC<ThemeSwitchButtonProps> = ({}) => {
  const { theme, toggleTheme } = useTheme();

  const handleChange = (val: "light" | "dark") => {
    toggleTheme();
  };

  return (
    <Segmented
      size="middle"
      shape="round"
      value={theme}
      onChange={handleChange}
      options={[
        {
          value: "light",
          icon: <CiCloudSun style={{ fontSize: 24 }} />,
        },
        {
          value: "dark",
          icon: <CiCloudMoon style={{ fontSize: 24 }} />,
        },
      ]}
    />
  );
};

interface CompLayoutHeaderProps {}

const CompLayoutHeader: React.FC<CompLayoutHeaderProps> = ({}) => {
  const { theme: myTheme } = useTheme();
  const [customerData, setCustomerData] = useState<CustomerData | undefined>();
  const router = useRouter();
  const { token } = theme.useToken();

  useEffect(() => {
    const storedCustomer = LocalStorageUtil.getCustomer();
    if (storedCustomer) {
      setCustomerData(storedCustomer);
    }
  }, []);

  // Hàm xử lý khi người dùng click vào nút Đăng xuất
  const handleLogout = () => {
    LocalStorageUtil.clearAll();
    router.push("/login");
    setCustomerData(undefined);
  };

  const menuItems: any = [
    {
      key: "profile",
      label: (
        <a
          onClick={() => {
            router.push("/profiles");
          }}
        >
          Hồ sơ
        </a>
      ),
    },
    {
      key: "logout",
      label: <a onClick={handleLogout}>Đăng xuất</a>,
    },
  ];

  const UserDisplay = (
    <Flex gap={10} align="center" style={{ cursor: "pointer" }}>
      <AvatarServer
        size={30}
        src={customerData?.photoUrl}
        icon={<FaUserAlt />}
        className="shadow-lg mb-4 border-4 border-white ring-2 ring-teal-400"
      />
      <strong>
        {customerData?.firstName} {customerData?.lastName}
      </strong>
    </Flex>
  );

    const { open, closeChat, openChat } =
      useChat();

  return (
    <Header
      style={{
        background: myTheme === "dark" ? "#001529" : "#fff",
        color: myTheme === "dark" ? "#fff" : "#000",
      }}
    >
      <Flex
        gap={10}
        align="center"
        style={{ height: "100%" }}
        justify="space-between"
      >
        <Flex align="center" gap={50}>{customerData ? (
          <Flex gap={10} align="center">
            <Dropdown menu={{ items: menuItems }} placement="bottomLeft">
              {UserDisplay}
            </Dropdown>
            <BTNCart />
            <BTNOrder />
          </Flex>
        ) : (
          <Flex gap={10}>
            <Button
              size="small"
              type="primary"
              onClick={() => router.push("/login")}
            >
              Đăng nhập
            </Button>
            <Button size="small" onClick={() => router.push("/register")}>
              Đăng ký
            </Button>
          </Flex>
        )}
          <Flex gap={10}>
            <Button icon={<IoHome />} type="text" shape="circle" size="large" onClick={() => router.push("/home")}/>
          <Button icon={<SiMessenger />} type="text" shape="circle" size="large" onClick={() => openChat()}/>
          </Flex>
      </Flex>
        <Flex gap={50} align="center">
          <ThemeSwitchButton />
        </Flex>
      </Flex>
    </Header>
  );
};

// export default CompLayoutHeader;
//#endregion

//#region sider
export const enum MenuKey {
  HOME = 1,
  CATALOG = 2,
  BRAND = 3,
  PRODUCT = 4,
  _PRODUCT = 4.1,
  _PRODUCT_ATTR = 4.2,
  _PRODUCT_VARIANT = 4.3,
  _CREATE_PRODUCT = 4.4,
  WAREHOUSE = 5,
  _WAREHOUSE = 5.1,
  _SUPPLIER = 5.2,
  _PURCHASE_ORDER = 5.3,
  _CREATE_PURCHASE_ORDER = 5.4,
  _CREATE_PURCHASE_ORDER_RECEIPT = 5.5,

  ORDER = 6,
  _ORDER_CREATE = 6.1,
  _ORDER_LIST = 6.2,
  USER = 7,
  _USER_ROLE = 7.1,
  _USER_STAFF = 7.2,
  _USER_STAFF_CREATE = 7.3,
  _USER_PERMISSION = 7.4,
  STATISTIC = 10,
}

type MenuItem = Required<MenuProps>["items"][number];

interface CompLayoutSiderProps {}

const CompLayoutSider: React.FC<CompLayoutSiderProps> = ({}) => {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      key: MenuKey.HOME,
      label: "Home",
      onClick: () => router.push("/home"),
      icon: <IoHome />,
    },
    {
      key: MenuKey.CATALOG,
      label: "Danh mục",
      onClick: () => router.push("/catalogs"),
      icon: <GrCatalogOption />,
    },
    {
      key: MenuKey.BRAND,
      label: "Thương hiệu",
      onClick: () => router.push("/brands"),
      icon: <TbBrandApple />,
    },
    {
      key: MenuKey.PRODUCT,
      label: "Sản phẩm",
      icon: <FaProductHunt />,
      children: [
        {
          key: MenuKey._CREATE_PRODUCT,
          label: "Thêm sản phẩm",
          onClick: () => router.push("/products/create"),
        },
        {
          key: MenuKey._PRODUCT,
          label: "Sản phẩm",
          onClick: () => router.push("/products"),
        },
        {
          key: MenuKey._PRODUCT_ATTR,
          label: "Thuộc tính",
          onClick: () => router.push("/attributes"),
        },
      ],
    },
    {
      key: MenuKey.WAREHOUSE,
      label: "Kho",
      icon: <FaWarehouse />,
      children: [
        {
          key: MenuKey._SUPPLIER,
          label: "Nhà cung cấp",
          onClick: () => router.push("/suppliers"),
        },
        {
          key: MenuKey._WAREHOUSE,
          label: "Kho hàng",
          onClick: () => router.push("/warehouses"),
        },

        {
          key: MenuKey._PURCHASE_ORDER,
          label: "Đơn đặt hàng",
          onClick: () => router.push("/purchase-orders"),
        },
        {
          key: MenuKey._CREATE_PURCHASE_ORDER,
          label: "Tạo đơn đặt hàng",
          onClick: () => router.push("/purchase-orders/create"),
        },
      ],
    },
    {
      key: MenuKey.USER,
      label: "Tài khoản",
      icon: <FaUser />,
      children: [
        {
          key: MenuKey._USER_ROLE,
          label: "Role",
          onClick: () => router.push("/roles"),
        },
        {
          key: MenuKey._USER_PERMISSION,
          label: "Permission",
          onClick: () => router.push("/permissions"),
        },
        {
          key: MenuKey._USER_STAFF,
          label: "Nhân viên",
          onClick: () => router.push("/staffs"),
        },
        {
          key: MenuKey._USER_STAFF_CREATE,
          label: "Thêm nhân viên",
          onClick: () => router.push("/staffs/create"),
        },
      ],
    },
    {
      key: MenuKey.ORDER,
      label: "Đơn hàng",
      icon: <GrOrderedList />,
      children: [
        {
          key: MenuKey._ORDER_CREATE,
          label: "Tạo đơn hàng",
          onClick: () => router.push("/orders/create"),
        },
        {
          key: MenuKey._ORDER_LIST,
          label: "Đơn hàng",
          onClick: () => router.push("/orders"),
        },
      ],
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      breakpoint="md"
      onCollapse={(value: boolean) => setCollapsed(value)}
      theme={theme}
    >
      <Menu mode="inline" items={menuItems} theme={theme} />
    </Sider>
  );
};
//#endregion

//#region content
interface CompLayoutContentProps {
  children: ReactNode;
}

const CompLayoutContent: React.FC<CompLayoutContentProps> = ({ children }) => {
  return (
    <Card style={{ padding: 0 }}>
      <Content
        style={{
          padding: "50px",
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        {children}
      </Content>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100vw",
          margin: 0,
        }}
      >
          <SoSanhSanPham />
      </div>
      <div
        style={{
          position: "fixed",
          bottom: 10,
          right: 10,
          width: "500px",
          margin: 0,
          zIndex: 1000
        }}
      >
          <Chat />
      </div>
    </Card>
  );
};
//#endregion

//#region footer

//#endregion

//#region layout
import AvatarServer from "@component/avatarServer";
import BTNCart from "@component/btnCart";
import BTNOrder from "@component/btnOrder";
import Chat from "@component/chat";
import SoSanhSanPham from "@component/sosanhsanpham";
import { useChat } from "@context/chatContext";
import { CustomerData } from "@data/userData";
import { LocalStorageUtil } from "@util/localStorageUtil";
import { theme as antdTheme } from "antd";
import { FaUser } from "react-icons/fa6";
import { SiMessenger } from "react-icons/si";
import { TbBrandApple } from "react-icons/tb";

interface LayoutWrapperLayoutProps {
  children: ReactNode;
}

const LayoutWrapperLayout: React.FC<LayoutWrapperLayoutProps> = ({
  children,
}) => {
  const { theme } = useTheme();

  const antdThemeConfig = {
    algorithm:
      theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: "#1677ff",
    },
  };

  return (
    <ConfigProvider theme={antdThemeConfig}>
      <App>
        <Layout>
          <CompLayoutHeader />
          <Layout>
            <CompLayoutContent>{children}</CompLayoutContent>
            <Footer />
          </Layout>
        </Layout>
      </App>
    </ConfigProvider>
  );
};

export default LayoutWrapperLayout;
//#endregion
