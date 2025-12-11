"use client";
import BTNDetail from "@/core/component/btnDetail";
import BTNReload from "@/core/component/btnReload";
import useTablePagination from "@/core/hook/antdTableHook";
import AvatarServer from "@component/avatarServer";
import FMBrandCreate from "@component/fmBrandCreate";
import { StaffData } from "@data/userData";
import { useCustomers, useDeleteCustomer } from "@hook/userHook/customerHook";
import { ConvertUtil } from "@util/convertUtil";
import { Breadcrumb, Flex, Table, TableProps } from "antd";
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

//#region page
const PageStaff: React.FC = () => {
  const router = useRouter();
  const { pagination, requestParams, handleTableChange, setPagination } =
    useTablePagination();
  const { data: items, isFetching, refetch } = useCustomers(requestParams);
  const { mutate: deleteMutate } = useDeleteCustomer(refetch);

  useEffect(() => {
    if (items?.total !== pagination.total) {
      setPagination((prev) => ({ ...prev, total: items?.total || 0 }));
    }
  }, [items, pagination.total, setPagination]);

  const tableColumns = useMemo<TableProps<StaffData>["columns"]>(
    () => [
      {
        sorter: true,
        title: "Mã khách hàng",
        dataIndex: "uuid",
        key: "uuid",
        fixed: "left",
        render: (code) => <>{code}</>,
      },
      {
        title: "Hình ảnh",
        dataIndex: "photoUrl",
        key: "photoUrl",
        fixed: "left",
        render: (photoUrl) => <AvatarServer src={photoUrl} />
      },
      {
        sorter: true,
        title: "Họ",
        dataIndex: "firstName",
        key: "firstName",
        render: (firstName) => <>{firstName}</>,
      },
      {
        sorter: true,
        title: "Tên",
        dataIndex: "lastName",
        key: "lastName",
        render: (lastName) => <>{lastName}</>,
      },
      {
        sorter: true,
        title: "Giới tính",
        dataIndex: "gender",
        key: "gender",
        render: (gender) => <>{gender}</>,
      },
      {
        sorter: true,
        title: "Ngày sinh",
        dataIndex: "birthDate",
        key: "birthDate",
        render: (birthDate) => ConvertUtil.convertVietNamDate(birthDate),
      },
      {
        sorter: true,
        title: "Số điện thoại",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
        render: (phoneNumber) => <>{phoneNumber}</>,
      },
      {
        sorter: true,
        title: "Email",
        dataIndex: "email",
        key: "email",
        render: (email) => <>{email}</>,
      },
      {
        title: "Thao tác",
        key: "action",
        render: (r) => (
          <Flex gap={10} wrap>
            <BTNDetail onClick={() => router.push(`/customers/${r.uuid}`)} />
            {/* <Popconfirm title="Xóa?" onConfirm={() => deleteMutate(r.uuid)}>
              <BTNDelete />
            </Popconfirm> */}
          </Flex>
        ),
      },
    ],
    [router, deleteMutate]
  );

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(
    () => [{ title: "Trang chủ", href: "/home" }, { title: "Khách hàng" }],
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

export default PageStaff;

//#endregion
