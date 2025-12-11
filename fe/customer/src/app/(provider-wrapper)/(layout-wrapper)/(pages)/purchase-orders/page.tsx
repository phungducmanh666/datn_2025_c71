"use client";
import BTNDetail from "@/core/component/btnDetail";
import BTNReload from "@/core/component/btnReload";
import { BrandData } from "@/core/data/productData";
import useTablePagination from "@/core/hook/antdTableHook";
import FMBrandCreate from "@component/fmBrandCreate";
import { usePurchaseOrders } from "@hook/warehouseHook/purchaseOrderHook";
import { ConvertUtil } from "@util/convertUtil";
import { Breadcrumb, Flex, Table, TableProps } from "antd";
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

//#region page
const PagePurchaseOrder: React.FC = () => {
  const router = useRouter();
  const { pagination, requestParams, handleTableChange, setPagination } =
    useTablePagination();
  const { data: items, isFetching, refetch } = usePurchaseOrders(requestParams);

  useEffect(() => {
    if (items?.total !== pagination.total) {
      setPagination((prev) => ({ ...prev, total: items?.total || 0 }));
    }
  }, [items, pagination.total, setPagination]);

  const tableColumns = useMemo<TableProps<BrandData>["columns"]>(
    () => [
      {
        sorter: true,
        title: "Mã đơn hàng",
        dataIndex: "uuid",
        key: "uuid",
        fixed: "left",
        render: (uuid) => <>{uuid}</>,
      },
      {
        sorter: true,
        title: "Nhà cung cấp",
        dataIndex: "supplierName",
        key: "supplierName",
        render: (name) => <>{name}</>,
      },
      {
        sorter: true,
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status) => <>{ConvertUtil.getProductStatusLabel(status)}</>,
      },
      {
        sorter: true,
        title: "Ngày đặt hàng",
        dataIndex: "orderDate",
        key: "orderDate",
        render: (orderDate) => (
          <>{ConvertUtil.convertVietNamDateTime(orderDate)}</>
        ),
      },
      {
        title: "Thao tác",
        key: "action",
        render: (r) => (
          <Flex gap={10} wrap>
            <BTNDetail
              onClick={() => router.push(`/purchase-orders/${r.uuid}`)}
            />
          </Flex>
        ),
      },
    ],
    [router]
  );

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(
    () => [{ title: "Trang chủ", href: "/home" }, { title: "Đơn đặt hàng" }],
    []
  );

  const [openFormCreate, setOpenFormCreate] = useState(false);

  return (
    <>
      <Flex vertical gap={40}>
        <Breadcrumb items={breadCrumbItems} />
        <Flex vertical gap={10}>
          <Flex gap={10}>
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

export default PagePurchaseOrder;

//#endregion
