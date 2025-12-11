import {
  useCheckCatalogName,
  useUpdateCatalogName,
} from "@hook/productHook/catalogHook";
import { Form, Input, Modal, Progress } from "antd";
import { debounce } from "lodash";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { CatalogData } from "../data/productData";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

export interface FMCatalogUpdateNameRef {
  submit: () => void;
}

interface FMCatalogUpdateNameProps {
  catalog: CatalogData;
  open: boolean;
  onUpdated?: () => any;
  onCancle?: () => any;
}

const FMCatalogUpdateName = forwardRef<
  FMCatalogUpdateNameRef,
  FMCatalogUpdateNameProps
>(({ catalog, open, onUpdated, onCancle }, ref) => {
  const [form] = Form.useForm();

  const { mutate: checkName, isPending: checking } = useCheckCatalogName(
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
    useUpdateCatalogName(onUpdated);

  const debouncedCheck = debounce((value: string) => {
    const name = value.trim();
    if (!name) {
      form.setFields([{ name: "name", errors: ["Tên không được để trống"] }]);
      return;
    }
    if (name != catalog.name) checkName(name);
  }, 500);

  useEffect(() => {
    const name = form.getFieldValue("name");
    if (name !== undefined) debouncedCheck(name);
    return () => debouncedCheck.cancel();
  }, [form.getFieldValue("name")]);

  const handleUpdate = () => {
    form.validateFields().then((values) => {
      const name = values.name.trim();
      if (!name || name == catalog.name) return;
      updateMutate({ uuid: catalog.uuid, name });
    });
  };

  // expose submit ra bên ngoài
  useImperativeHandle(ref, () => ({
    submit: handleUpdate,
  }));

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
          name: catalog.name,
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
});

FMCatalogUpdateName.displayName = "FMCatalogUpdateName";

export default FMCatalogUpdateName;
