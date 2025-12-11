"use client";

import BTNEdit from "@component/btnEdit";
import FMProductUpdateName from "@component/fmProductUpdateName";
import FMProductUpdatePrice from "@component/fmProductUpdatePrice";
import FMProductUpdateStatus from "@component/fmProductUpdateStatus";
import ImageSever from "@component/imageServer";
import { useProduct } from "@hook/productHook/productHook";
import { ConvertUtil } from "@util/convertUtil";
import { Breadcrumb, Descriptions, Flex, Spin } from "antd";
import { useParams } from "next/navigation";
import React, { useState } from "react";

const ProductInfo: React.FC = () => {
  const { slug: uuid } = useParams<{ slug: string }>();
  const { data, isFetching, refetch } = useProduct(uuid);

  const [openForm, setOpenForm] = useState<null | "name" | "price" | "status">(
    null
  );

  const handleUpdated = () => {
    refetch();
    setOpenForm(null);
  };

  if (isFetching) return <Spin size="large" />;

  const breadCrumbItems = data
    ? [
        { title: "Trang chủ", href: "/home" },
        { title: "Sản phẩm", href: "/products" },
        { title: data.name, href: `/products/${uuid}` },
        { title: "Thông tin" },
      ]
    : [];

  const desItems = data
    ? [
        {
          key: "uuid",
          label: "Mã sản phẩm",
          children: (
            <Flex justify="space-between" align="center">
              <span>{data.uuid}</span>
            </Flex>
          ),
        },
        {
          key: "name",
          label: "Tên sản phẩm",
          children: (
            <Flex justify="space-between" align="center" gap={20}>
              <span>{data.name}</span>
              <BTNEdit
                size="small"
                toolTipTitle="Chỉnh sửa tên"
                onClick={() => setOpenForm("name")}
              />
            </Flex>
          ),
        },
        {
          key: "price",
          label: "Giá niêm yết",
          children: (
            <Flex justify="space-between" align="center" gap={20}>
              <span>{ConvertUtil.formatVNCurrency(data.price)}</span>
              <BTNEdit
                size="small"
                toolTipTitle="Chỉnh sửa giá"
                onClick={() => setOpenForm("price")}
              />
            </Flex>
          ),
        },
        {
          key: "status",
          label: "Trạng thái",
          children: (
            <Flex justify="space-between" align="center" gap={20}>
              <span>{ConvertUtil.getProductStatusLabel(data.status)}</span>
              <BTNEdit
                size="small"
                toolTipTitle="Chỉnh sửa trạng thái"
                onClick={() => setOpenForm("status")}
              />
            </Flex>
          ),
        },
        {
          key: "avatar",
          label: "Avatar",
          children: <ImageSever size="small" src={data.photoUrl} />,
        },
        {
          key: "stock",
          label: "Tồn kho",
          children: <>NUmber</>,
        },
      ]
    : [];

  return (
    <>
      <Flex vertical gap={50}>
        <Breadcrumb items={breadCrumbItems} />
        <Descriptions
          bordered
          title={<h1>Thông tin sản phẩm</h1>}
          layout="horizontal"
          column={1}
          items={desItems}
          styles={{
            label: { fontWeight: "bold" },
            content: { paddingLeft: 8 },
          }}
        />
      </Flex>

      <FMProductUpdateStatus
        open={openForm === "status"}
        uuid={uuid}
        onCancle={() => setOpenForm(null)}
        onUpdated={handleUpdated}
      />
      <FMProductUpdatePrice
        open={openForm === "price"}
        uuid={uuid}
        onCancle={() => setOpenForm(null)}
        onUpdated={handleUpdated}
      />
      {data && (
        <FMProductUpdateName
          open={openForm === "name"}
          product={data}
          onCancle={() => setOpenForm(null)}
          onUpdated={handleUpdated}
        />
      )}
    </>
  );
};

export default ProductInfo;
