import { RoleData } from "@data/userData";
import { useCheckRoleName, useCreateRole } from "@hook/userHook/roleHook";
import { Form, Input, Modal, Progress } from "antd";
import { debounce } from "lodash";
import { useEffect } from "react";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

interface FMRoleCreateProps {
  open: boolean;
  onCreated?: (data: RoleData) => any;
  onCancle?: () => any;
}

const FMRoleCreate: React.FC<FMRoleCreateProps> = ({
  open,
  onCreated,
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

  const { mutate: createMutate, isPending: creating } =
    useCreateRole(onCreated);

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
      const name = values.name.trim();
      const description = values.description.trim();
      if (!name) return;
      createMutate({ name, description });
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
        <Form.Item label="Mô tả" name="description">
          <Input placeholder="Mô tả" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FMRoleCreate;
