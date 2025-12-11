"use client";
import BTNAdd from "@component/btnAdd";
import BTNDelete from "@component/btnDelete";
import BTNReload from "@component/btnReload";
import FMAttributeCreate from "@component/fmAttributeCreate";
import FMAttributeGroupCreate from "@component/fmAttributeGroupCreate";
import { AttributeGroupData } from "@data/productData";
import useTablePagination from "@hook/antdTableHook";
import {
  useAttributeGroups,
  useAttributes,
  useDeleteAttribute,
  useDeleteAttributeGroup,
} from "@hook/productHook/attributeHook";
import {
  Flex,
  Popconfirm,
  Spin,
  Table,
  TableProps,
  Tabs,
  TabsProps,
} from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import React, { useEffect, useMemo, useState } from "react";

//#region attribute group
interface AttributeGroupProps {}

const AttributeGroup: React.FC<AttributeGroupProps> = ({}) => {
  const { pagination, requestParams, handleTableChange, setPagination } =
    useTablePagination();
  const {
    data: pageData,
    isFetching,
    refetch,
  } = useAttributeGroups(requestParams);

  useEffect(() => {
    if (pageData?.total !== pagination.total) {
      setPagination((prev) => ({ ...prev, total: pageData?.total || 0 }));
    }
  }, [pageData, pagination.total, setPagination]);

  // delete
  const { mutate: deleteGroup, isPending: deleting } =
    useDeleteAttributeGroup(refetch);

  // table columns
  const tableColums = useMemo<TableProps<AttributeGroupData>["columns"]>(
    () => [
      {
        sorter: true,
        title: "Nhóm thuộc tính",
        dataIndex: "name",
        key: "name",
        fixed: "left",
        render: (name: string) => <>{name}</>,
      },
      {
        title: "Thao tác",
        key: "action",
        render: (r: AttributeGroupData) => (
          <Flex gap={10} wrap>
            <Popconfirm title="Xóa?" onConfirm={() => deleteGroup(r.uuid)}>
              <BTNDelete />
            </Popconfirm>
          </Flex>
        ),
      },
    ],
    [pageData, refetch]
  );

  const [openFormCreate, setOpenFormCreate] = useState(false);

  return (
    <>
      <Flex vertical gap={10}>
        <Flex vertical gap={10}>
          <Flex gap={10}>
            <BTNAdd
              toolTipTitle="Thêm"
              onClick={() => setOpenFormCreate(true)}
            />
            <BTNReload onClick={() => refetch()} toolTipTitle="Tải lại trạng" />
          </Flex>
          <Table
            size="small"
            rowKey="uuid"
            columns={tableColums}
            dataSource={pageData?.items}
            loading={isFetching}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: "max-content" }}
          />
        </Flex>
      </Flex>
      <FMAttributeGroupCreate
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
//#endregion

//#region attribute
interface AttributeTableProps {
  groupUUID: string;
}

const AttributeTable: React.FC<AttributeTableProps> = ({ groupUUID }) => {
  const { pagination, requestParams, handleTableChange, setPagination } =
    useTablePagination();
  const {
    data: pageData,
    isFetching,
    refetch,
  } = useAttributes(groupUUID, requestParams);

  useEffect(() => {
    if (pageData?.total !== pagination.total) {
      setPagination((prev) => ({ ...prev, total: pageData?.total || 0 }));
    }
  }, [pageData, pagination.total, setPagination]);

  // delete
  const { mutate: deleteMutate, isPending: deleting } =
    useDeleteAttribute(refetch);

  // table columns
  const tableColums = useMemo<TableProps<AttributeGroupData>["columns"]>(
    () => [
      {
        sorter: true,
        title: "Thuộc tính",
        dataIndex: "name",
        key: "name",
        fixed: "left",
        render: (name: string) => <>{name}</>,
      },
      {
        title: "Thao tác",
        key: "action",
        render: (r: AttributeGroupData) => (
          <Flex gap={10} wrap>
            <Popconfirm title="Xóa?" onConfirm={() => deleteMutate(r.uuid)}>
              <BTNDelete />
            </Popconfirm>
          </Flex>
        ),
      },
    ],
    [pageData, refetch]
  );

  const [openFormCreate, setOpenFormCreate] = useState(false);

  return (
    <>
      <Flex vertical gap={10}>
        <Flex vertical gap={10}>
          <Flex gap={10}>
            <BTNAdd
              toolTipTitle="Thêm"
              onClick={() => setOpenFormCreate(true)}
            />
            <BTNReload onClick={() => refetch()} toolTipTitle="Tải lại trạng" />
          </Flex>
          <Table
            size="small"
            rowKey="uuid"
            columns={tableColums}
            dataSource={pageData?.items}
            loading={isFetching}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: "max-content" }}
          />
        </Flex>
      </Flex>
      <FMAttributeCreate
        groupUUID={groupUUID}
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

interface AttributeProps {}

const Attribute: React.FC<AttributeProps> = ({}) => {
  const {
    data: groups,
    isFetching: fetchingGroups,
    refetch: refecthGroups,
  } = useAttributeGroups({
    sort: "name,ASC",
  });

  const tabItems = useMemo((): TabsProps["items"] => {
    if (!groups?.items) return [];

    return [
      ...groups.items.map((group) => ({
        key: group.uuid,
        label: group.name,
        children: <AttributeTable groupUUID={group.uuid} />,
      })),
    ];
  }, [groups?.items]);

  return (
    <Flex vertical gap={10}>
      <Flex gap={10}>
        <BTNReload
          onClick={() => refecthGroups()}
          toolTipTitle="Tải lại trạng"
        />
      </Flex>
      {fetchingGroups ? (
        <Spin />
      ) : (
        <Tabs size="small" items={tabItems} tabPosition="left" />
      )}
    </Flex>
  );
};
//#endregion

//#region page
interface PageAttributeProps {}

const PageAttribute: React.FC<PageAttributeProps> = ({}) => {
  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(() => {
    return [
      { title: "Trang chủ", href: "/home" },
      { title: "Sản phẩm" },
      { title: "Thuộc tính" },
    ];
  }, []);

  const tabItems = useMemo(
    (): TabsProps["items"] => [
      {
        key: "1",
        label: "Nhóm thuộc tính",
        children: <AttributeGroup />,
      },
      {
        key: "2",
        label: "Thuộc tính",
        children: <Attribute />,
      },
    ],
    []
  );

  return (
    <Flex vertical gap={10}>
      <Breadcrumb items={breadCrumbItems} />
      <Tabs items={tabItems} />
    </Flex>
  );
};

export default PageAttribute;

//#endregion
