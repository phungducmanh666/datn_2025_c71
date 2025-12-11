"use client";

import ProductItem from "@component/productItem";
import { CartItemData } from "@data/orderData";
import { useCartItems, useCartProducts } from "@hook/orderHook/cartHook";
import { Button, Flex, Spin } from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

//#region detail
interface PageCartItemsProps {
  items: CartItemData[];
  reload?: () => any;
}

const PageCartItems: React.FC<PageCartItemsProps> = ({ items, reload }) => {
  const { data: cartProducts, isFetching: loading } = useCartProducts(items);

  return (
    <Flex vertical gap={10}>
      {loading && <Spin />}
      {cartProducts &&
        cartProducts.map((product) => (
          <ProductItem key={product.uuid} data={product} reload={reload} />
        ))}
    </Flex>
  );
};
//endregion

//#region page
interface PageCartProps {}

const PageCart: React.FC<PageCartProps> = ({}) => {
  const router = useRouter();

  const { data: cartItems, isFetching: loading, refetch } = useCartItems();

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(
    () => [{ title: "Trang chủ", href: "/products" }, { title: "Giỏ hàng" }],
    []
  );

  if (loading) {
    return <Spin />;
  }

  return (
    <Flex vertical gap={40}>
      <Breadcrumb items={breadCrumbItems} />
      {cartItems && <PageCartItems items={cartItems} reload={refetch} />}

      <Flex justify="end">
        <Button type="primary" onClick={() => router.push(`/orders/create`)}>
          Mua ngay
        </Button>
      </Flex>
    </Flex>
  );
};

export default PageCart;

//#endregion
