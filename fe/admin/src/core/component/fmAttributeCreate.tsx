import {
  useCheckAttributeName,
  useCreateAttribute,
} from "@hook/productHook/attributeHook";
import { Form, Input, Modal, Progress } from "antd";
import { debounce } from "lodash";
import { useEffect } from "react";
import { AttributeData } from "../data/productData";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

export interface FMAttributeCreateRef {
  submit: () => void;
}

interface FMAttributeCreateProps {
  groupUUID: string;
  open: boolean;
  onCreated?: (data: AttributeData) => any;
  onCancle?: () => any;
}

const FMAttributeCreate: React.FC<FMAttributeCreateProps> = ({
  groupUUID,
  open,
  onCreated,
  onCancle,
}) => {
  const [form] = Form.useForm();

  const { mutate: checkName, isPending: checking } = useCheckAttributeName(
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
    useCreateAttribute(onCreated);

  const debouncedCheck = debounce((value: string) => {
    const name = value.trim();
    if (name) checkName({ groupUUID, name });
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
      if (!name) return;
      createMutate({ groupUUID, name });
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

export default FMAttributeCreate;
