"use client";
import BTNAdd from "@/core/component/btnAdd";
import BTNDelete from "@/core/component/btnDelete";
import BTNDetail from "@/core/component/btnDetail";
import BTNReload from "@/core/component/btnReload";
import useTablePagination from "@/core/hook/antdTableHook";
import FMBrandCreate from "@component/fmBrandCreate";
import { StaffData } from "@data/userData";
import { useDeleteStaff, useStaffs } from "@hook/userHook/staffHook";
import { Breadcrumb, Flex, Popconfirm, Table, TableProps } from "antd";
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

//#region page
const PageStaff: React.FC = () => {
  const router = useRouter();
  const { pagination, requestParams, handleTableChange, setPagination } =
    useTablePagination();
  const { data: items, isFetching, refetch } = useStaffs(requestParams);
  const { mutate: deleteMutate } = useDeleteStaff(refetch);

  useEffect(() => {
    if (items?.total !== pagination.total) {
      setPagination((prev) => ({ ...prev, total: items?.total || 0 }));
    }
  }, [items, pagination.total, setPagination]);

  const tableColumns = useMemo<TableProps<StaffData>["columns"]>(
    () => [
      {
        sorter: true,
        title: "Mã nhân viên",
        dataIndex: "code",
        key: "code",
        fixed: "left",
        render: (code) => <>{code}</>,
      },
      {
        sorter: true,
        title: "Họ",
        dataIndex: "firstName",
        key: "firstName",
        fixed: "left",
        render: (firstName) => <>{firstName}</>,
      },
      {
        sorter: true,
        title: "Tên",
        dataIndex: "lastName",
        key: "lastName",
        fixed: "left",
        render: (lastName) => <>{lastName}</>,
      },
      {
        sorter: true,
        title: "Giới tính",
        dataIndex: "gender",
        key: "gender",
        fixed: "left",
        render: (gender) => <>{gender}</>,
      },
      {
        title: "Thao tác",
        key: "action",
        render: (r) => (
          <Flex gap={10} wrap>
            <BTNDetail onClick={() => router.push(`/staffs/${r.uuid}`)} />
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
    () => [{ title: "Trang chủ", href: "/home" }, { title: "Nhân viên" }],
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
              onClick={() => router.push("/staffs/create")}
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

export default PageStaff;

//#endregion
