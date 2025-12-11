import { useAddBusinessDocument } from "@hook/chatHook/chatHook";
import { Form, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

interface FMRagDocumentCreateProps {
  open: boolean;
  onCreated?: () => any;
  onCancle?: () => any;
}

const FMRagDocumentCreate: React.FC<FMRagDocumentCreateProps> = ({
  open,
  onCreated,
  onCancle,
}) => {
  const [form] = Form.useForm();

  const { mutate: createMutate, isPending: creating } =
    useAddBusinessDocument(onCreated);

  const handleCreate = () => {
    form.validateFields().then((values) => {
      const name = values.name?.trim();
      if (!!!name) return;
      createMutate(name);
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
          disabled={hasErrors || creating}
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
        <Form.Item label="Nội dung" name="name">
          <TextArea
            placeholder="Nhập nội dung"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FMRagDocumentCreate;
