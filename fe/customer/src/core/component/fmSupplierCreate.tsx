import { SupplierData } from "@data/warehouseData";
import {
  useCheckSupplierName,
  useCreateSupplier,
} from "@hook/warehouseHook/supplierHook";
import { Form, Input, Modal, Progress } from "antd";
import { debounce } from "lodash";
import { useCallback, useMemo, useState } from "react";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

interface FMSupplierCreateProps {
  open: boolean;
  onCreated?: (data: SupplierData) => any;
  onCancle?: () => any;
}

const FMSupplierCreate: React.FC<FMSupplierCreateProps> = ({
  open,
  onCreated,
  onCancle,
}) => {
  const [form] = Form.useForm();
  const [nameError, setNameError] = useState<string | null>(null);

  const { mutate: createMutate, isPending: creating } =
    useCreateSupplier(onCreated);

  // Check tên kho
  const { mutate: checkName, isPending: checking } = useCheckSupplierName(
    (isExists) => {
      if (isExists) {
        setNameError("Tên đã được sử dụng");
      } else {
        setNameError(null);
      }
    }
  );

  const debouncedCheck = useCallback(
    debounce((value: string) => {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        setNameError("Tên không được để trống");
      } else {
        checkName(trimmedValue);
      }
    }, 500),
    []
  );

  // Validate form & submit
  const handleCreate = () => {
    form.validateFields().then(({ name, contact, address }) => {
      createMutate({
        name: name.trim(),
        contactInfo: contact,
        address: address || "",
      });
    });
  };

  const hasErrors = useMemo(() => {
    const { name = "", contact = "", address = "" } = form.getFieldsValue(true);

    // Bạn cũng có thể kiểm tra từng trường riêng lẻ và gán giá trị mặc định,
    // hoặc dùng form.getFieldsError() để check lỗi từ Ant Design.

    const hasFormErrors = form
      .getFieldsError()
      .some(({ errors }) => errors.length > 0);

    return (
      nameError !== null ||
      !name.trim() ||
      !contact.trim() ||
      !address.trim() ||
      checking ||
      creating ||
      hasFormErrors
    );
  }, [form, nameError, checking, creating]);

  return (
    <Modal
      open={open}
      title="Thêm"
      onCancel={onCancle}
      destroyOnClose
      footer={[
        <BTNSave
          key="save"
          type="primary"
          onClick={handleCreate}
          disabled={hasErrors}
          loading={creating}
        >
          Lưu
        </BTNSave>,
        <BTNCancle key="cancel" onClick={onCancle}>
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
            size="small"
            style={{ marginBottom: 8 }}
          />
        )}

        <Form.Item
          label="Tên"
          name="name"
          validateStatus={checking ? "validating" : nameError ? "error" : ""}
          help={nameError}
          rules={[{ required: true, message: "Tên không được để trống" }]}
        >
          <Input
            placeholder="Nhập tên"
            onChange={(e) => debouncedCheck(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Thông tin liên hệ"
          name="contact"
          rules={[
            {
              required: true,
              message: "Thông tin liên hệ không được để trống",
            },
          ]}
        >
          <Input placeholder="Nhập thông tin liên hệ" />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: "Địa chỉ không được để trống" }]}
        >
          <Input placeholder="Nhập địa chỉ" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FMSupplierCreate;
