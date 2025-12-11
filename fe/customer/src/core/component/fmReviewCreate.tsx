import { useCreateReview } from "@hook/orderHook/reviewHook";
import { Form, Modal, Progress, Rate } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

export interface FMReviewCreateRef {
  submit: () => void;
}

interface FMReviewCreateProps {
  orderLineUUID: string;
  open: boolean;
  onCreated?: () => any;
  onCancle?: () => any;
}

const FMReviewCreate: React.FC<FMReviewCreateProps> = ({
  orderLineUUID,
  open,
  onCreated,
  onCancle,
}) => {
  const [form] = Form.useForm();

  const [ratingStar, setStar] = useState<number>(5);

  const { mutate: createMutate, isPending: creating } =
    useCreateReview(onCreated);

  const handleCreate = () => {
    form.validateFields().then((values) => {
      const { content, star } = values;
      createMutate({ orderLineUUID, content, star });
    });
  };

  const hasErrors = form
    .getFieldsError()
    .some(({ errors }) => errors.length > 0);

  return (
    <Modal
      open={open}
      title="Đánh giá sản phẩm"
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
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          content: "",
          star: 5,
        }}
      >
        {creating && (
          <Progress
            percent={creating ? 80 : 0}
            status="active"
            showInfo={false}
            size={"small"}
            style={{ marginBottom: 8 }}
          />
        )}

        <Form.Item label="Nội dung" name="content">
          <TextArea placeholder="Nhập nội dung" />
        </Form.Item>

        <Form.Item label="Đánh giá" name="star">
          <Rate
            onChange={(value) => {
              setStar(value);
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FMReviewCreate;
