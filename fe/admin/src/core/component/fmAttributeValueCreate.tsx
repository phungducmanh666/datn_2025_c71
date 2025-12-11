import { AttributeData } from "@data/productData";
import { Form, Input, Modal } from "antd";
import { debounce } from "lodash";
import { useEffect } from "react";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

interface FMAttributeValueCreateProps {
  attribute: AttributeData;
  open: boolean;
  onSave?: (data: { attributeUUID: string; value: string }) => any;
  onCancle?: () => any;
}

const FMAttributeValueCreate: React.FC<FMAttributeValueCreateProps> = ({
  attribute,
  open,
  onSave,
  onCancle,
}) => {
  const [form] = Form.useForm();

  const debouncedCheck = debounce((value: string) => {
    const name = value.trim();
    if (!name)
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
      onSave?.({ attributeUUID: attribute.uuid, value: name });
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
          disabled={hasErrors}
        >
          Lưu
        </BTNSave>,
        <BTNCancle key={2} onClick={onCancle}>
          Đóng
        </BTNCancle>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item label={attribute.name} name="name">
          <Input
            placeholder="Nhập giá trị"
            onChange={(e) => debouncedCheck(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FMAttributeValueCreate;
