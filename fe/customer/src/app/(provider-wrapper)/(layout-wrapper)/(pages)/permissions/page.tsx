"use client";
import BTNAdd from "@/core/component/btnAdd";
import BTNDelete from "@/core/component/btnDelete";
import BTNReload from "@/core/component/btnReload";
import FMPermissionCreate from "@component/fmPermissionCreate";
import { RoleData } from "@data/userData";
import {
  useDeletePermission,
  usePermissions,
} from "@hook/userHook/permissionHook";
import { Breadcrumb, Flex, Popconfirm, Table, TableProps } from "antd";
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

//#region page
const PagePermission: React.FC = () => {
  const router = useRouter();
  const { data: items, isFetching, refetch } = usePermissions("name,ASC");
  const { mutate: deleteMutate } = useDeletePermission(refetch);

  const tableColumns = useMemo<TableProps<RoleData>["columns"]>(
    () => [
      {
        sorter: (a, b) => a.name.localeCompare(b.name),
        title: "Permission",
        dataIndex: "name",
        key: "name",
        fixed: "left",
        render: (name) => <>{name}</>,
      },
      {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
      },
      {
        title: "Thao tác",
        key: "action",
        render: (r) => (
          <Flex gap={10} wrap>
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
    () => [{ title: "Trang chủ", href: "/home" }, { title: "Permission" }],
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
            dataSource={items}
            loading={isFetching}
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        </Flex>
      </Flex>
      <FMPermissionCreate
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

export default PagePermission;

//#endregion
