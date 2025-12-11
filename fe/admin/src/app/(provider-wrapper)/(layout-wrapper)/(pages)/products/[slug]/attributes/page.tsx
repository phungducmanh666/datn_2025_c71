"use client";

import { Flex, Popconfirm, Table, TableProps, Tag } from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useParams } from "next/navigation";
import React, { useCallback, useMemo, useReducer } from "react";

import BTNAdd from "@component/btnAdd";
import BTNDelete from "@component/btnDelete";
import BTNReload from "@component/btnReload";
import FMAttributeValueCreate from "@component/fmAttributeValueCreate";
import FMProductAttributeSelection from "@component/fmProductAttributeSelection";

import {
  AttributeData,
  AttributeGroupData,
  AttributeValueData,
} from "@data/productData";

import {
  useAddProductAttributeValue,
  useProduct,
  useProductAttributes,
  useRemoveProductAttribute,
  useRemoveProductAttributeValue,
} from "@hook/productHook/productHook";

//==================== COMPONENT CON ====================//

const AttributeValueTag = React.memo(
  ({
    value,
    attributeUUID,
    onDelete,
  }: {
    value: AttributeValueData;
    attributeUUID: string;
    onDelete: (params: { attributeUUID: string; valueUUID: string }) => void;
  }) => (
    <Flex>
      <Tag
        closable
        onClose={() => onDelete({ attributeUUID, valueUUID: value.uuid })}
      >
        {value.value}
      </Tag>
    </Flex>
  )
);
AttributeValueTag.displayName = "AttributeValueTag";

const AttributeValuesList = React.memo(
  ({
    values,
    attributeUUID,
    onDelete,
  }: {
    values?: AttributeValueData[];
    attributeUUID: string;
    onDelete: (params: { attributeUUID: string; valueUUID: string }) => void;
  }) => (
    <Flex vertical gap={10}>
      {values?.length ? (
        values.map((v) => (
          <AttributeValueTag
            key={v.uuid}
            value={v}
            attributeUUID={attributeUUID}
            onDelete={onDelete}
          />
        ))
      ) : (
        <>_____</>
      )}
    </Flex>
  )
);
AttributeValuesList.displayName = "AttributeValuesList";

const ExpandedRow = React.memo(
  ({
    group,
    onDeleteAttr,
    onDeleteValue,
    onAddValue,
  }: {
    group: AttributeGroupData;
    onDeleteAttr: (uuid: string) => void;
    onDeleteValue: (params: {
      attributeUUID: string;
      valueUUID: string;
    }) => void;
    onAddValue: (attribute: AttributeData) => void;
  }) => {
    const columns = useMemo<TableProps<AttributeData>["columns"]>(
      () => [
        { title: "Tên thuộc tính", dataIndex: "name", key: "name" },
        {
          title: "Giá trị",
          key: "values",
          width: 300,
          render: (_, attr) => (
            <AttributeValuesList
              values={attr.attribute_values}
              attributeUUID={attr.uuid}
              onDelete={onDeleteValue}
            />
          ),
        },
        {
          title: "Thao tác",
          key: "action",
          width: 150,
          render: (_, attr) => (
            <Flex gap={10}>
              <Popconfirm title="Xóa" onConfirm={() => onDeleteAttr(attr.uuid)}>
                <BTNDelete />
              </Popconfirm>
              <BTNAdd
                toolTipTitle="Thêm giá trị"
                onClick={() => onAddValue(attr)}
              />
            </Flex>
          ),
        },
      ],
      [onDeleteAttr, onDeleteValue, onAddValue]
    );

    return (
      <Table<AttributeData>
        rowKey="uuid"
        columns={columns}
        dataSource={group.attributes || []}
        pagination={false}
        size="small"
      />
    );
  }
);
ExpandedRow.displayName = "ExpandedRow";

//==================== STATE REDUCER ====================//

type ModalState = { open: boolean; attribute?: AttributeData };
type ModalAction =
  | { type: "open"; attribute: AttributeData }
  | { type: "close" };

function modalReducer(_: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "open":
      return { open: true, attribute: action.attribute };
    case "close":
      return { open: false };
    default:
      return { open: false };
  }
}

//==================== PAGE ====================//

const PageProductAttribute: React.FC = () => {
  const { slug: uuid } = useParams<{ slug: string }>();
  const { data: product, isFetching } = useProduct(uuid);
  const {
    data: groups,
    isFetching: loading,
    refetch,
  } = useProductAttributes(uuid);

  const { mutate: addValue } = useAddProductAttributeValue(refetch);
  const { mutate: deleteValue } = useRemoveProductAttributeValue(refetch);
  const { mutate: deleteAttr } = useRemoveProductAttribute(refetch);

  const [modalState, dispatch] = useReducer(modalReducer, { open: false });
  const [openAttrSelect, setOpenAttrSelect] = useReducer(
    (s: boolean, v: boolean) => v,
    false
  );

  const handleDeleteValue = useCallback(
    (params: { attributeUUID: string; valueUUID: string }) =>
      deleteValue({ productUUID: uuid, ...params }),
    [deleteValue, uuid]
  );

  const handleDeleteAttr = useCallback(
    (attributeUUID: string) => deleteAttr({ productUUID: uuid, attributeUUID }),
    [deleteAttr, uuid]
  );

  const handleAddValue = useCallback(
    (params: { attributeUUID: string; value: string }) => {
      dispatch({ type: "close" });
      addValue({ productUUID: uuid, ...params });
    },
    [addValue, uuid]
  );

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(
    () =>
      product
        ? [
            { title: "Trang chủ", href: "/home" },
            { title: "Sản phẩm", href: "/products" },
            { title: product.name, href: `/products/${uuid}` },
            { title: "Thuộc tính" },
          ]
        : [],
    [product, uuid]
  );

  const tableColumns = useMemo<TableProps<AttributeGroupData>["columns"]>(
    () => [{ title: "Nhóm thuộc tính", dataIndex: "name", key: "name" }],
    []
  );

  return (
    <>
      <Flex vertical gap={30}>
        <Breadcrumb items={breadCrumbItems} />

        <Flex gap={10}>
          <BTNAdd type="primary" onClick={() => setOpenAttrSelect(true)} />
          <BTNReload onClick={() => refetch()} />
        </Flex>

        <Table<AttributeGroupData>
          rowKey="uuid"
          columns={tableColumns}
          expandable={{
            expandedRowRender: (group) => (
              <ExpandedRow
                group={group}
                onDeleteAttr={handleDeleteAttr}
                onDeleteValue={handleDeleteValue}
                onAddValue={(attr) =>
                  dispatch({ type: "open", attribute: attr })
                }
              />
            ),
            rowExpandable: (record) => !!record.attributes?.length,
          }}
          dataSource={groups || []}
          loading={isFetching || loading}
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </Flex>

      <FMProductAttributeSelection
        uuid={uuid}
        open={openAttrSelect}
        onCancle={() => {
          refetch();
          setOpenAttrSelect(false);
        }}
      />

      {modalState.attribute && (
        <FMAttributeValueCreate
          open={modalState.open}
          attribute={modalState.attribute}
          onCancle={() => dispatch({ type: "close" })}
          onSave={handleAddValue}
        />
      )}
    </>
  );
};

export default PageProductAttribute;
