import { RoleData } from "@data/userData";
import { useCheckRoleName, useUpdateRoleName } from "@hook/userHook/roleHook";
import { Form, Input, Modal, Progress } from "antd";
import { debounce } from "lodash";
import React, { useEffect } from "react";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

interface FMRoleUpdateNameProps {
  role: RoleData;
  open: boolean;
  onUpdated?: () => any;
  onCancle?: () => any;
}

const FMRoleUpdateName: React.FC<FMRoleUpdateNameProps> = ({
  role,
  open,
  onUpdated,
  onCancle,
}) => {
  const [form] = Form.useForm();

  const { mutate: checkName, isPending: checking } = useCheckRoleName(
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

  const { mutate: updateMutate, isPending: updating } =
    useUpdateRoleName(onUpdated);

  const debouncedCheck = debounce((value: string) => {
    const name = value.trim();
    if (!name) {
      form.setFields([{ name: "name", errors: ["Tên không được để trống"] }]);
      return;
    }
    if (name != role.name) checkName(name);
  }, 500);

  useEffect(() => {
    const name = form.getFieldValue("name");
    if (name !== undefined) debouncedCheck(name);
    return () => debouncedCheck.cancel();
  }, [form.getFieldValue("name")]);

  const handleUpdate = () => {
    form.validateFields().then((values) => {
      const name = values.name.trim();
      if (!name || name == role.name) return;
      updateMutate({ uuid: role.uuid, name });
    });
  };

  const hasErrors = form
    .getFieldsError()
    .some(({ errors }) => errors.length > 0);

  return (
    <Modal
      open={open}
      title="Cập nhật tên"
      onCancel={onCancle}
      onOk={handleUpdate}
      destroyOnHidden
      footer={[
        <BTNSave
          key={1}
          type="primary"
          onClick={handleUpdate}
          disabled={hasErrors || checking || updating}
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
          name: role.name,
        }}
      >
        {(checking || updating) && (
          <Progress
            percent={checking ? 30 : updating ? 80 : 0}
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

export default FMRoleUpdateName;
