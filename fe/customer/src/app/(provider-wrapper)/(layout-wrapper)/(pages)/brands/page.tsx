"use client";
import BTNAdd from "@/core/component/btnAdd";
import BTNDelete from "@/core/component/btnDelete";
import BTNDetail from "@/core/component/btnDetail";
import BTNReload from "@/core/component/btnReload";
import ImageSever from "@/core/component/imageServer";
import { BrandData } from "@/core/data/productData";
import useTablePagination from "@/core/hook/antdTableHook";
import FMBrandCreate from "@component/fmBrandCreate";
import { useBrands, useDeleteBrand } from "@hook/productHook/brandHook";
import { Breadcrumb, Flex, Popconfirm, Table, TableProps } from "antd";
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

//#region page
const PageBrand: React.FC = () => {
  const router = useRouter();
  const { pagination, requestParams, handleTableChange, setPagination } =
    useTablePagination();
  const { data: items, isFetching, refetch } = useBrands(requestParams);
  const { mutate: deleteMutate } = useDeleteBrand(refetch);

  useEffect(() => {
    if (items?.total !== pagination.total) {
      setPagination((prev) => ({ ...prev, total: items?.total || 0 }));
    }
  }, [items, pagination.total, setPagination]);

  const tableColumns = useMemo<TableProps<BrandData>["columns"]>(
    () => [
      {
        sorter: true,
        title: "Thương hiệu",
        dataIndex: "name",
        key: "name",
        fixed: "left",
        render: (name) => <>{name}</>,
      },
      {
        title: "Hình ảnh",
        dataIndex: "photoUrl",
        key: "photoUrl",
        render: (url) => url && <ImageSever size={"medium"} src={url} />,
      },
      {
        title: "Thao tác",
        key: "action",
        render: (r) => (
          <Flex gap={10} wrap>
            <BTNDetail onClick={() => router.push(`/brands/${r.uuid}`)} />
            <Popconfirm title="Xóa?" onConfirm={() => deleteMutate(r.uuid)}>
              <BTNDelete />
            </Popconfirm>
          </Flex>
        ),
      },
    ],
    [router, deleteMutate]
  );

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(
    () => [{ title: "Trang chủ", href: "/home" }, { title: "Thương hiệu" }],
    []
  );

  const [openFormCreate, setOpenFormCreate] = useState(false);

  return (
    <>
      <Flex vertical gap={40}>
        <Breadcrumb items={breadCrumbItems} />
        <Flex vertical gap={10}>
          <Flex gap={10}>
            <BTNAdd
              toolTipTitle="Thêm"
              onClick={() => setOpenFormCreate(true)}
            />
            <BTNReload
              loading={isFetching}
              onClick={() => refetch()}
              toolTipTitle="Tải lại trạng"
            />
          </Flex>
          <Table
            size="small"
            rowKey="uuid"
            columns={tableColumns}
            dataSource={items?.items}
            loading={isFetching}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: "max-content" }}
          />
        </Flex>
      </Flex>
      <FMBrandCreate
        open={openFormCreate}
        onCreated={() => {
          refetch();
          setOpenFormCreate(false);
        }}
        onCancle={() => {
          setOpenFormCreate(false);
        }}
      />
    </>
  );
};

export default PageBrand;

//#endregion
