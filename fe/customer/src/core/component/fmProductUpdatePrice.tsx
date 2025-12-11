import { useUpdateProductPrice } from "@hook/productHook/productHook";
import { Form, Modal, Progress } from "antd";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";
import InputCurrency from "./inputCurrency";

interface FMProductUpdatePriceProps {
  uuid: string;
  open: boolean;
  onUpdated?: () => any;
  onCancle?: () => any;
}

const FMProductUpdatePrice: React.FC<FMProductUpdatePriceProps> = ({
  uuid,
  open,
  onUpdated,
  onCancle,
}) => {
  const [form] = Form.useForm();

  const { mutate: updateMutate, isPending: updating } =
    useUpdateProductPrice(onUpdated);

  const handleUpdate = () => {
    form.validateFields().then((values) => {
      if (!values.price) return;
      updateMutate({ uuid, price: values.price }); // status là key
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
      destroyOnHidden
      footer={[
        <BTNSave
          key="save"
          type="primary"
          onClick={handleUpdate}
          disabled={hasErrors || updating}
          loading={updating}
        >
          Lưu
        </BTNSave>,
        <BTNCancle key="cancel" onClick={onCancle}>
          Đóng
        </BTNCancle>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Giá niêm yết"
          name="price"
          rules={[{ required: true, message: "Vui lòng nhập giá niêm yết" }]}
        >
          {updating && (
            <Progress
              percent={updating ? 30 : 0}
              status="active"
              showInfo={false}
              size={"small"}
              style={{ marginBottom: 8 }}
            />
          )}
          <InputCurrency />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FMProductUpdatePrice;
