import {
  useCheckAttributeGroupName,
  useCreateAttributeGroup,
} from "@hook/productHook/attributeHook";
import { Form, Input, Modal, Progress } from "antd";
import { debounce } from "lodash";
import React, { useEffect } from "react";
import { AttributeGroupData } from "../data/productData";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

export interface FMAttributeGroupCreateRef {
  submit: () => void;
}

interface FMAttributeGroupCreateProps {
  open: boolean;
  onCreated?: (data: AttributeGroupData) => any;
  onCancle?: () => any;
}

const FMAttributeGroupCreate: React.FC<FMAttributeGroupCreateProps> = ({
  open,
  onCreated,
  onCancle,
}) => {
  const [form] = Form.useForm();

  const { mutate: checkName, isPending: checking } = useCheckAttributeGroupName(
    (isExists) => {
      const name = form.getFieldValue("name");
      if (!name) {
        form.setFields([{ name: "name", errors: ["Tên không được để trống"] }]);
        return;
      }
      if (isExists) {
        form.setFields([{ name: "name", errors: ["Tên đã được sử dụng"] }]);
      } else {
        form.setFields([{ name: "name", errors: [] }]);
      }
    }
  );

  const { mutate: createMutate, isPending: creating } =
    useCreateAttributeGroup(onCreated);

  const debouncedCheck = debounce((value: string) => {
    if (value.trim()) checkName(value.trim());
    else
      form.setFields([{ name: "name", errors: ["Tên không được để trống"] }]);
  }, 500);

  useEffect(() => {
    const name = form.getFieldValue("name");
    if (name !== undefined) debouncedCheck(name);
    return () => debouncedCheck.cancel();
  }, [form.getFieldValue("name")]);

  const handleCreate = () => {
    form.validateFields().then((values) => {
      if (!values.name) return;
      createMutate(values.name.trim());
    });
  };

  const hasErrors = form
    .getFieldsError()
    .some(({ errors }) => errors.length > 0);

  return (
    <Modal
      open={open}
      title="Thêm"
      onCancel={onCancle}
      destroyOnHidden
      footer={[
        <BTNSave
          key={1}
          type="primary"
          onClick={handleCreate}
          disabled={hasErrors || checking || creating}
          loading={creating}
        >
          Lưu
        </BTNSave>,
        <BTNCancle key={2} onClick={onCancle}>
          Đóng
        </BTNCancle>,
      ]}
    >
      <Form form={form} layout="vertical">
        {(checking || creating) && (
          <Progress
            percent={checking ? 30 : creating ? 80 : 0}
            status="active"
            showInfo={false}
            size={"small"}
            style={{ marginBottom: 8 }}
          />
        )}

        <Form.Item label="Tên" name="name">
          <Input
            placeholder="Nhập tên"
            onChange={(e) => debouncedCheck(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default FMAttributeGroupCreate;
