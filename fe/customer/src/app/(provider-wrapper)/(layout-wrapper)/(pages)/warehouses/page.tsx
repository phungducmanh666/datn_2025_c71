"use client";
import BTNAdd from "@/core/component/btnAdd";
import BTNDelete from "@/core/component/btnDelete";
import BTNDetail from "@/core/component/btnDetail";
import BTNReload from "@/core/component/btnReload";
import useTablePagination from "@/core/hook/antdTableHook";
import FMWarehouseCreate from "@component/fmWarehouseCreate";
import { WarehouseData } from "@data/warehouseData";
import {
  useDeleteWarehouse,
  useWarehouses,
} from "@hook/warehouseHook/warehouseHook";
import { Breadcrumb, Flex, Popconfirm, Table, TableProps } from "antd";
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

//#region page
const PageWarehouse: React.FC = () => {
  const router = useRouter();
  const { pagination, requestParams, handleTableChange, setPagination } =
    useTablePagination();
  const { data: items, isFetching, refetch } = useWarehouses(requestParams);
  const { mutate: deleteMutate } = useDeleteWarehouse(refetch);

  useEffect(() => {
    if (items?.total !== pagination.total) {
      setPagination((prev) => ({ ...prev, total: items?.total || 0 }));
    }
  }, [items, pagination.total, setPagination]);

  const tableColumns = useMemo<TableProps<WarehouseData>["columns"]>(
    () => [
      {
        sorter: true,
        title: "Tên kho",
        dataIndex: "name",
        key: "name",
        fixed: "left",
        render: (name) => <>{name}</>,
      },
      {
        sorter: true,
        title: "Mã xã",
        dataIndex: "wardCode",
        key: "wardCode",
        render: (wardCode) => <>{wardCode}</>,
      },
      {
        sorter: true,
        title: "Địa chỉ",
        dataIndex: "address",
        key: "address",
        render: (address) => <>{address}</>,
      },
      {
        title: "Thao tác",
        key: "action",
        render: (r) => (
          <Flex gap={10} wrap>
            <BTNDetail onClick={() => router.push(`/warehouses/${r.uuid}`)} />
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
    () => [{ title: "Trang chủ", href: "/home" }, { title: "Kho hàng" }],
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
      <FMWarehouseCreate
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

export default PageWarehouse;

//#endregion
