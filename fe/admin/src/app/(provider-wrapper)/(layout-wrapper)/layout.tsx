"use client";

import { useTheme } from "@context/themeContext";
import {
  App,
  Card,
  ConfigProvider,
  Dropdown,
  Flex,
  Layout,
  Menu,
  MenuProps,
  Segmented,
} from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { useRouter } from "next/navigation";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { CiCloudMoon, CiCloudSun } from "react-icons/ci";
import { FaProductHunt, FaRobot, FaWarehouse } from "react-icons/fa";
import { GrCatalogOption, GrOrderedList } from "react-icons/gr";
import { IoHome, IoPerson } from "react-icons/io5";

//#region header

interface ThemeSwitchButtonProps { }

const ThemeSwitchButton: React.FC<ThemeSwitchButtonProps> = ({ }) => {
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

interface CompLayoutHeaderProps { }

const CompLayoutHeader: React.FC<CompLayoutHeaderProps> = ({ }) => {
  const { theme } = useTheme();
  const [staff, setStaff] = useState<StaffData | undefined>();
  const router = useRouter();

  useEffect(() => {
    const storedCustomer = LocalstoreageUtil.getStaff();
    if (storedCustomer) {
      setStaff(storedCustomer);
    }
  }, []);

  const handleLogout = () => {
    LocalstoreageUtil.clearAll();
    router.push("/login");
    setStaff(undefined);
  };

  const menuItems: any = [
    {
      key: "logout",
      label: <a onClick={handleLogout}>Đăng xuất</a>,
    },
  ];

  const UserDisplay = (
    <Flex gap={10} align="center" style={{ cursor: "pointer" }}>
      <FaUser style={{ fontSize: 20 }} />
      <span>
        {staff?.firstName} {staff?.lastName} ({staff?.code})
      </span>
    </Flex>
  );

  return (
    <Header
      style={{
        background: theme === "dark" ? "#001529" : "#fff",
        color: theme === "dark" ? "#fff" : "#000",
      }}
    >
      <Flex
        gap={10}
        align="center"
        style={{ height: "100%" }}
        justify="space-between"
      >
        {staff && (
          <Flex gap={10} align="center">
            <Dropdown menu={{ items: menuItems }} placement="bottomLeft">
              {UserDisplay}
            </Dropdown>
          </Flex>
        )}
        <ThemeSwitchButton />
      </Flex>
    </Header>
  );
};
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
  RAG = 11,
  _RAG_CHAT = 11.1,
  _RAG_DOCUMENT = 11.2,

  PROMOTION = 12,
  _PROMOTION = 12.1,
  _PROMOTION_CREATE = 12.2,

  CUSTOMER = 13,


}

export enum Permissions {
  ALL = "ALL",
  thongke = "thongke",
  sanpham = "sanpham",
  kho = "kho",
  taikhoan = "taikhoan",
  donhang = "donhang",
  khachhang = "khachhang",
}

type MenuItem = Required<MenuProps>["items"][number];

interface CompLayoutSiderProps { }

const CompLayoutSider: React.FC<CompLayoutSiderProps> = ({ }) => {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const r = LocalstoreageUtil.getLoginInfo()?.roles;
    if (r) setRoles(r);
  }, []);

  useEffect(() => {
    const p = LocalstoreageUtil.getLoginInfo()?.permissions;
    if (p) {
      if (roles.includes(Permissions.ALL)) {
        p.push(Permissions.ALL);
      }
      setPermissions(p);
    }
  }, [roles]);

  const router = useRouter();

  const mitms: { [permission in Permissions]: MenuItem[] } = {
    "ALL": [{
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
    {
      key: MenuKey.CUSTOMER,
      label: "Khách hàng",
      icon: <IoPerson />,
      onClick: () => router.push("/customers"),
    },
    {
      key: MenuKey.RAG,
      label: "Ai agent",
      icon: <FaRobot />,
      children: [
        {
          key: MenuKey._RAG_DOCUMENT,
          label: "Kho dữ liệu",
          onClick: () => router.push("/chat/document"),
        },
        {
          key: MenuKey._RAG_CHAT,
          label: "Chat",
          onClick: () => router.push("/chat"),
        },
      ],
    },
    {
      key: MenuKey.PROMOTION,
      label: "Khuyến mãi",
      icon: <MdDiscount />,
      children: [
        {
          key: MenuKey._PROMOTION_CREATE,
          label: "Tạo khuyến mãi",
          onClick: () => router.push("/promotions/create"),
        },
        {
          key: MenuKey._PROMOTION,
          label: "Khuyến mãi đã tạo",
          onClick: () => router.push("/promotions"),
        },
      ],
    }
    ],
    "thongke": [{
      key: MenuKey.HOME,
      label: "Home",
      onClick: () => router.push("/home"),
      icon: <IoHome />,
    },],
    "sanpham": [
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
      }
    ],
    "kho": [
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
      }
    ],
    "taikhoan": [
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

    ],
    "donhang": [
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
      }
    ],
    "khachhang": [
      {
        key: MenuKey.CUSTOMER,
        label: "Khách hàng",
        icon: <IoPerson />,
        onClick: () => router.push("/customers"),

      }
    ]
  };

  // const menuItems: MenuItem[] = [
  //   {
  //     key: MenuKey.HOME,
  //     label: "Home",
  //     onClick: () => router.push("/home"),
  //     icon: <IoHome />,
  //   },
  //   {
  //     key: MenuKey.CATALOG,
  //     label: "Danh mục",
  //     onClick: () => router.push("/catalogs"),
  //     icon: <GrCatalogOption />,
  //   },
  //   {
  //     key: MenuKey.BRAND,
  //     label: "Thương hiệu",
  //     onClick: () => router.push("/brands"),
  //     icon: <TbBrandApple />,
  //   },
  //   {
  //     key: MenuKey.PRODUCT,
  //     label: "Sản phẩm",
  //     icon: <FaProductHunt />,
  //     children: [
  //       {
  //         key: MenuKey._CREATE_PRODUCT,
  //         label: "Thêm sản phẩm",
  //         onClick: () => router.push("/products/create"),
  //       },
  //       {
  //         key: MenuKey._PRODUCT,
  //         label: "Sản phẩm",
  //         onClick: () => router.push("/products"),
  //       },
  //       {
  //         key: MenuKey._PRODUCT_ATTR,
  //         label: "Thuộc tính",
  //         onClick: () => router.push("/attributes"),
  //       },
  //     ],
  //   },
  //   {
  //     key: MenuKey.WAREHOUSE,
  //     label: "Kho",
  //     icon: <FaWarehouse />,
  //     children: [
  //       {
  //         key: MenuKey._SUPPLIER,
  //         label: "Nhà cung cấp",
  //         onClick: () => router.push("/suppliers"),
  //       },
  //       {
  //         key: MenuKey._PURCHASE_ORDER,
  //         label: "Đơn đặt hàng",
  //         onClick: () => router.push("/purchase-orders"),
  //       },
  //       {
  //         key: MenuKey._CREATE_PURCHASE_ORDER,
  //         label: "Tạo đơn đặt hàng",
  //         onClick: () => router.push("/purchase-orders/create"),
  //       },
  //     ],
  //   },
  //   {
  //     key: MenuKey.USER,
  //     label: "Tài khoản",
  //     icon: <FaUser />,
  //     children: [
  //       {
  //         key: MenuKey._USER_ROLE,
  //         label: "Role",
  //         onClick: () => router.push("/roles"),
  //       },
  //       {
  //         key: MenuKey._USER_PERMISSION,
  //         label: "Permission",
  //         onClick: () => router.push("/permissions"),
  //       },
  //       {
  //         key: MenuKey._USER_STAFF,
  //         label: "Nhân viên",
  //         onClick: () => router.push("/staffs"),
  //       },
  //       {
  //         key: MenuKey._USER_STAFF_CREATE,
  //         label: "Thêm nhân viên",
  //         onClick: () => router.push("/staffs/create"),
  //       },
  //     ],
  //   },
  //   {
  //     key: MenuKey.ORDER,
  //     label: "Đơn hàng",
  //     icon: <GrOrderedList />,
  //     children: [
  //       {
  //         key: MenuKey._ORDER_CREATE,
  //         label: "Tạo đơn hàng",
  //         onClick: () => router.push("/orders/create"),
  //       },
  //       {
  //         key: MenuKey._ORDER_LIST,
  //         label: "Đơn hàng",
  //         onClick: () => router.push("/orders"),
  //       },
  //     ],
  //   },
  // ];

  const menuItems = useMemo((): MenuItem[] => {
    const menuMap = new Map<string, MenuItem>();
    const permissionValues = Object.values(Permissions);

    for (const value of permissionValues) {
      if (permissions.includes(value)) {
        mitms[value].forEach(item => {
          // Giả sử mỗi menu item có thuộc tính 'key' là unique
          if (item && item.key) {
            menuMap.set(item.key as string, item);
          }
        });
      }
    }

    return Array.from(menuMap.values());
  }, [permissions]);

  if (permissions.length === 0) return <></>

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
    <Card>
      <Content
        style={{
          padding: "50px",
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        {children}
      </Content>
    </Card>
  );
};
//#endregion

//#region footer

//#endregion

//#region layout
import { StaffData } from "@data/userData";
import { LocalstoreageUtil } from "@util/localStorageUtil";
import { theme as antdTheme } from "antd";
import { FaUser } from "react-icons/fa6";
import { MdDiscount } from "react-icons/md";
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
            <CompLayoutSider />
            <Layout>
              <CompLayoutContent>{children}</CompLayoutContent>
              <Footer />
            </Layout>
          </Layout>
        </Layout>
      </App>
    </ConfigProvider>
  );
};

export default LayoutWrapperLayout;
//#endregion
