import { Form, Modal, Upload, UploadFile } from "antd";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";

interface FMImageSelectionProps {
  multiple?: boolean;
  open: boolean;
  onComfirm?: (fileList: UploadFile[]) => any;
  onCancle?: () => any;
}

const FMImageSelection: React.FC<FMImageSelectionProps> = ({
  multiple,
  open,
  onComfirm,
  onCancle,
}) => {
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [changed, setChanged] = useState<boolean>(false);

  const handleUploadChange = (info: any) => {
    setFileList(info.fileList);
    if (info.file.status === "done" || info.file.originFileObj) {
      const reader = new FileReader();
      reader.readAsDataURL(info.file.originFileObj);
    }
    setChanged(true);
  };

  const handleUpdate = () => {
    onComfirm?.(fileList);
  };

  return (
    <Modal
      open={open}
      title="Chọn hình ảnh"
      onCancel={onCancle}
      onOk={handleUpdate}
      destroyOnHidden
      footer={[
        <BTNSave key={1} type="primary" onClick={handleUpdate}>
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
            multiple={multiple}
          >
            {fileList.length >= 1 && !!!multiple ? null : <FaPlus />}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FMImageSelection;
