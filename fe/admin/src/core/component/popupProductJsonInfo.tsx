import { CopyOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { getToastApi } from "@context/toastContext";
import {
  useAddProductDocument,
  useDeleteProductDocument,
  useGetProductDocuments,
} from "@hook/chatHook/chatHook";
import { useProductJson } from "@hook/productHook/productHook";
import { Button, Drawer, Space, Spin, Tag } from "antd";
import React from "react";

interface PopupProductJsonInfoProps {
  uuid: string;
  open: boolean;
  onClose?: () => any;
}

const PopupProductJsonInfo: React.FC<PopupProductJsonInfoProps> = ({
  uuid,
  open,
  onClose,
}) => {
  const { data: jsonString, isPending } = useProductJson(uuid);

  const {
    data: embeddings,
    isPending: isFetching,
    refetch: refetchDocument,
  } = useGetProductDocuments(uuid);

  const { mutate: addDocumentMutate, isPending: isAdding } =
    useAddProductDocument(() => {
      getToastApi().success("Đã thêm document embedding!");
      refetchDocument();
    });

  const { mutate: deleteDocumentMutate, isPending: isDeleting } =
    useDeleteProductDocument(() => {
      getToastApi().success("Đã xóa document embedding!");
      refetchDocument();
    });

  let formattedJson = "";
  try {
    formattedJson = jsonString
      ? JSON.stringify(JSON.parse(jsonString), null, 2)
      : "";
  } catch (err) {
    formattedJson = jsonString || "Invalid JSON format";
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      getToastApi().success("Đã sao chép JSON vào clipboard!");
    } catch (err) {
      getToastApi().error("Không thể sao chép, thử lại sau.");
    }
  };

  const handleAddDocument = () => {
    if (!formattedJson) {
      getToastApi().error("Không có JSON để thêm document.");
      return;
    }
    addDocumentMutate({ text: formattedJson, productUUID: uuid });
  };

  const handleDeleteDocument = () => {
    if (!embeddings || embeddings.length === 0) {
      getToastApi().warning("Không có document nào để xóa.");
      return;
    }
    deleteDocumentMutate(uuid);
  };

  const hasEmbedding = embeddings && embeddings.length > 0;

  return (
    <Drawer
      open={open}
      width={600}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>JSON Data Viewer</span>
          <Space>
            <Button icon={<CopyOutlined />} size="small" onClick={handleCopy}>
              Copy
            </Button>
            <Button
              icon={<PlusOutlined />}
              size="small"
              type="primary"
              loading={isAdding}
              onClick={handleAddDocument}
            >
              Thêm Document
            </Button>
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              loading={isDeleting}
              onClick={handleDeleteDocument}
            >
              Xóa Document
            </Button>
          </Space>
        </div>
      }
      onClose={() => onClose?.()}
      footer={null}
      bodyStyle={{
        padding: 0,
        overflow: "auto",
        height: "100%",
      }}
    >
      {isPending || isFetching ? (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin />
        </div>
      ) : (
        <>
          <div
            style={{
              padding: "8px 16px",
              borderBottom: "1px solid #333",
              background: "#111",
              color: "#dcdcdc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Trạng thái Document:</span>
            {hasEmbedding ? (
              <Tag color="green">Đã có embedding</Tag>
            ) : (
              <Tag color="red">Chưa có</Tag>
            )}
          </div>

          <pre
            style={{
              margin: 0,
              padding: "16px",
              background: "#1e1e1e",
              color: "#dcdcdc",
              fontSize: 13,
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              height: "calc(100% - 40px)",
              overflow: "auto",
            }}
          >
            {formattedJson}
          </pre>
        </>
      )}
    </Drawer>
  );
};

export default PopupProductJsonInfo;
