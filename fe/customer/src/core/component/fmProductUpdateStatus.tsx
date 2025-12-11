import {
  useProductStatus,
  useUpdateProductStatus,
} from "@hook/productHook/productHook";
import { Form, Modal, Progress, Select } from "antd";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

interface FMProductUpdateStatusProps {
  uuid: string;
  open: boolean;
  onUpdated?: () => any;
  onCancle?: () => any;
}

const FMProductUpdateStatus: React.FC<FMProductUpdateStatusProps> = ({
  uuid,
  open,
  onUpdated,
  onCancle,
}) => {
  const [form] = Form.useForm();

  const { data: status, isFetching: loading } = useProductStatus();
  const { mutate: updateMutate, isPending: updating } =
    useUpdateProductStatus(onUpdated);

  const handleUpdate = () => {
    form.validateFields().then((values) => {
      if (!values.status) return;
      updateMutate({ uuid, status: values.status }); // status là key
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
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
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
          <Select
            loading={loading}
            placeholder="Chọn trạng thái"
            options={status?.map((s) => ({
              label: s.value,
              value: s.key,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FMProductUpdateStatus;
