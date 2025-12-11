import { RoleData } from "@data/userData";
import { useUpdateRoleDescription } from "@hook/userHook/roleHook";
import { Form, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import React from "react";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

interface FMRoleUpdateDescriptionProps {
  role: RoleData;
  open: boolean;
  onUpdated?: () => any;
  onCancle?: () => any;
}

const FMRoleUpdateDescription: React.FC<FMRoleUpdateDescriptionProps> = ({
  role,
  open,
  onUpdated,
  onCancle,
}) => {
  const [form] = Form.useForm();

  const { mutate: updateMutate, isPending: updating } =
    useUpdateRoleDescription(onUpdated);

  const handleUpdate = () => {
    form.validateFields().then((values) => {
      const description = values.description.trim();
      if (!description || description == role.description) return;
      updateMutate({ uuid: role.uuid, description });
    });
  };

  const hasErrors = form
    .getFieldsError()
    .some(({ errors }) => errors.length > 0);

  return (
    <Modal
      open={open}
      title="Cập nhật"
      onCancel={onCancle}
      onOk={handleUpdate}
      destroyOnHidden
      footer={[
        <BTNSave
          key={1}
          type="primary"
          onClick={handleUpdate}
          disabled={hasErrors || updating}
          loading={updating}
        >
          Lưu
        </BTNSave>,
        <BTNCancle key={2} onClick={onCancle}>
          Đóng
        </BTNCancle>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: role.description,
        }}
      >
        <Form.Item label="Mô tả" name="description">
          <TextArea placeholder="Nhập mô tả" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FMRoleUpdateDescription;
