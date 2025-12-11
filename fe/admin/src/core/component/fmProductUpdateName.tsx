import { ProductData } from "@data/productData";
import {
  useCheckProductName,
  useUpdateProductName,
} from "@hook/productHook/productHook";
import { Form, Input, Modal, Progress } from "antd";
import { debounce } from "lodash";
import React, { useEffect } from "react";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

interface FMProductUpdateNameProps {
  product: ProductData;
  open: boolean;
  onUpdated?: () => any;
  onCancle?: () => any;
}

const FMProductUpdateName: React.FC<FMProductUpdateNameProps> = ({
  product,
  open,
  onUpdated,
  onCancle,
}) => {
  const [form] = Form.useForm();

  const { mutate: checkName, isPending: checking } = useCheckProductName(
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
    useUpdateProductName(onUpdated);

  const debouncedCheck = debounce((value: string) => {
    const name = value.trim();
    if (!name) {
      form.setFields([{ name: "name", errors: ["Tên không được để trống"] }]);
      return;
    }
    if (name != product.name) checkName(name);
  }, 500);

  useEffect(() => {
    const name = form.getFieldValue("name");
    if (name !== undefined) debouncedCheck(name);
    return () => debouncedCheck.cancel();
  }, [form.getFieldValue("name")]);

  const handleUpdate = () => {
    form.validateFields().then((values) => {
      const name = values.name.trim();
      if (!name || name == product.name) return;
      updateMutate({ uuid: product.uuid, name });
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
          name: product.name,
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

export default FMProductUpdateName;
