import { WarehouseData } from "@data/warehouseData";
import { useProvinces, useWards } from "@hook/locationHook/provinceHook";
import {
  useCheckWarehouseName,
  useCreateWarehouse,
} from "@hook/warehouseHook/warehouseHook";
import { Form, Input, Modal, Progress, Select } from "antd";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

interface FMWarehouseCreateProps {
  open: boolean;
  onCreated?: (data: WarehouseData) => any;
  onCancle?: () => any;
}

const FMWarehouseCreate: React.FC<FMWarehouseCreateProps> = ({
  open,
  onCreated,
  onCancle,
}) => {
  const [form] = Form.useForm();
  const [nameError, setNameError] = useState<string | null>(null);

  // Hooks gọi API
  const { data: provinces, isFetching: fetchingProvinces } = useProvinces();
  const provinceCode = Form.useWatch("province", form);
  const { data: wards, isFetching: fetchingWards } = useWards(
    provinceCode || ""
  );

  const { mutate: createMutate, isPending: creating } =
    useCreateWarehouse(onCreated);

  // Check tên kho
  const { mutate: checkName, isPending: checking } = useCheckWarehouseName(
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

  useEffect(() => {
    if (provinces?.items?.length && !form.getFieldValue("province")) {
      form.setFieldsValue({ province: provinces.items[0].code });
    }
  }, [provinces]);

  useEffect(() => {
    if (wards?.items?.length) {
      if (!form.getFieldValue("ward")) {
        form.setFieldsValue({ ward: wards.items[0].code });
      }
    } else {
      form.setFieldsValue({ ward: undefined });
    }
  }, [wards]);

  // Validate form & submit
  const handleCreate = () => {
    form.validateFields().then(({ name, ward, address }) => {
      createMutate({
        name: name.trim(),
        wardCode: ward,
        address: address || "",
      });
    });
  };

  const hasErrors = useMemo(() => {
    // Lấy tất cả các lỗi hiện tại của form
    const formErrors = form
      .getFieldsError()
      .some((field) => field.errors.length > 0);
    // Kiểm tra các lỗi khác
    return formErrors || nameError !== null || checking || creating;
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

        <Form.Item label="Tỉnh" name="province">
          <Select
            loading={fetchingProvinces}
            showSearch
            placeholder="Chọn tỉnh"
            options={provinces?.items?.map((p) => ({
              label: p.name,
              value: p.code,
            }))}
            filterOption={(input, option) =>
              (option?.label as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="Xã"
          name="ward"
          rules={[{ required: true, message: "Phải chọn xã" }]}
        >
          <Select
            loading={fetchingWards}
            showSearch
            placeholder="Chọn xã"
            options={wards?.items?.map((w) => ({
              label: w.name,
              value: w.code,
            }))}
            filterOption={(input, option) =>
              (option?.label as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
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

export default FMWarehouseCreate;
