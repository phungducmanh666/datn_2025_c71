import { CustomerData } from "@data/userData";
import { useUpdateCustomerPhoto } from "@hook/userHook/customerHook";
import { createPhotoUrl } from "@net/serverInfo";
import { Form, Modal, Upload, UploadFile } from "antd";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

interface FMUserUpdatePhotoProps {
  customer: CustomerData;
  open: boolean;
  onUpdated?: () => any;
  onCancle?: () => any;
}

const FMUserUpdatePhoto: React.FC<FMUserUpdatePhotoProps> = ({
  customer,
  open,
  onUpdated,
  onCancle,
}) => {
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [changed, setChanged] = useState<boolean>(false);

  useEffect(() => {
    const fetchUrl = async () => {
      if (customer.photoUrl) {
        const url = await createPhotoUrl(customer.photoUrl);
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url,
          },
        ]);
      }
    };
    fetchUrl();
  }, [customer.photoUrl]);

  const handleUploadChange = (info: any) => {
    const latestFile = info.fileList.slice(-1)[0];
    setFile(latestFile?.originFileObj || null);
    setFileList(info.fileList.slice(-1));

    if (info.file.status === "done" || info.file.originFileObj) {
      const reader = new FileReader();
      reader.readAsDataURL(info.file.originFileObj);
    }
    setChanged(true);
  };

  const { mutate: updateMutate, isPending: updating } =
    useUpdateCustomerPhoto(onUpdated);

  const handleUpdate = () => {
    if (file == null && !customer.photoUrl) return;
    updateMutate({ uuid: customer.uuid, photo: file ?? undefined });
  };

  return (
    <Modal
      open={open}
      title="Cập nhật hình ảnh"
      onCancel={onCancle}
      onOk={handleUpdate}
      destroyOnHidden
      footer={[
        <BTNSave
          key={1}
          type="primary"
          onClick={handleUpdate}
          disabled={updating || !changed || !file}
          loading={updating}
        >
          Lưu
        </BTNSave>,
        <BTNCancle key={2} onClick={onCancle}>
          Đóng
        </BTNCancle>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Ảnh" name="photoUrl">
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={handleUploadChange}
            maxCount={1}
          >
            {fileList.length >= 1 ? null : <FaPlus />}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FMUserUpdatePhoto;
