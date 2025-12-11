import { AttributeData, AttributeGroupData } from "@data/productData";
import { useAttributeGroups } from "@hook/productHook/attributeHook";
import {
  useAddProductAttribute,
  useProductAttributes,
  useRemoveProductAttribute,
} from "@hook/productHook/productHook";
import { Checkbox, Modal, Spin, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import BTNCancle from "./btnCancle";

interface FMProductAttributeSelectionProps {
  uuid: string;
  open: boolean;
  onCancle?: () => void;
}

const FMProductAttributeSelection: React.FC<
  FMProductAttributeSelectionProps
> = ({ uuid, open, onCancle }) => {
  const [checkedUUIDs, setCheckedUUIDs] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const { data: groupPage, isFetching: loadingGroups } = useAttributeGroups({
    sort: "name,ASC",
  });

  const { data: productGroups, isFetching: loadingProductGroups } =
    useProductAttributes(uuid);

  const tableData = useMemo(() => groupPage?.items || [], [groupPage]);

  useEffect(() => {
    if (!productGroups) return;
    const uuids = productGroups.flatMap((g) => g.attributes.map((a) => a.uuid));
    setCheckedUUIDs(uuids);
  }, [productGroups]);

  useEffect(() => {
    setExpandedKeys(tableData.map((g) => g.uuid));
  }, [tableData]);

  const { mutate: addMutate } = useAddProductAttribute();
  const { mutate: removeMutate } = useRemoveProductAttribute();

  const handleCheckChange = (attr: AttributeData, checked: boolean) => {
    if (checked) {
      addMutate({ productUUID: uuid, attributeUUID: attr.uuid });
      setCheckedUUIDs((prev) => [...prev, attr.uuid]);
    } else {
      removeMutate({ productUUID: uuid, attributeUUID: attr.uuid });
      setCheckedUUIDs((prev) =>
        prev.filter((id) => id.toLowerCase() !== attr.uuid.toLowerCase())
      );
    }
  };

  const expandedRowRender = (group: AttributeGroupData) => (
    <Table
      rowKey="uuid"
      dataSource={group.attributes}
      pagination={false}
      size="small"
      columns={[
        {
          title: "Thuộc tính",
          dataIndex: "name",
          key: "name",
          render: (_: any, attr: AttributeData) => (
            <Checkbox
              checked={checkedUUIDs.some(
                (id) => id.toLowerCase() === attr.uuid.toLowerCase()
              )}
              onChange={(e) => handleCheckChange(attr, e.target.checked)}
            >
              {attr.name}
            </Checkbox>
          ),
        },
      ]}
    />
  );

  if (loadingGroups || loadingProductGroups) return <Spin />;

  return (
    <Modal
      open={open}
      title="Thêm"
      onCancel={onCancle}
      destroyOnHidden
      width={1000}
      footer={<BTNCancle onClick={onCancle}>Đóng</BTNCancle>}
    >
      <Table
        rowKey="uuid"
        columns={[{ title: "Nhóm thuộc tính", dataIndex: "name", key: "name" }]}
        expandable={{
          expandedRowKeys: expandedKeys,
          onExpandedRowsChange: (keys) => setExpandedKeys(keys as string[]),
          expandedRowRender,
          rowExpandable: (record) => record.attributes.length > 0,
        }}
        dataSource={tableData}
        pagination={false}
      />
    </Modal>
  );
};

export default FMProductAttributeSelection;
