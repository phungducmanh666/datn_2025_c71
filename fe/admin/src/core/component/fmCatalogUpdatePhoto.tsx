import { CatalogData } from "@data/productData";
import { useUpdateCatalogPhoto } from "@hook/productHook/catalogHook";
import { createPhotoUrl } from "@net/serverInfo";
import { Form, Modal, Upload, UploadFile } from "antd";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

interface FMCatalogUpdatePhotoProps {
  catalog: CatalogData;
  open: boolean;
  onUpdated?: () => any;
  onCancle?: () => any;
}

const FMCatalogUpdatePhoto: React.FC<FMCatalogUpdatePhotoProps> = ({
  catalog,
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
      if (catalog.photoUrl) {
        const url = await createPhotoUrl(catalog.photoUrl);
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
  }, [catalog.photoUrl]);

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
    useUpdateCatalogPhoto(onUpdated);

  const handleUpdate = () => {
    if (file == null && !catalog.photoUrl) return;
    updateMutate({ uuid: catalog.uuid, photo: file ?? undefined });
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
          disabled={updating}
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

export default FMCatalogUpdatePhoto;
