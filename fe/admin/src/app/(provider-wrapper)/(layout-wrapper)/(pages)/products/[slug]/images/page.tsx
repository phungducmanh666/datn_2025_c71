"use client";

import BTNDelete from "@component/btnDelete";
import BTNEdit from "@component/btnEdit";
import FMImageSelection from "@component/fmImageSelection";
import ImageSever from "@component/imageServer";
import { getToastApi } from "@context/toastContext";
import { ProductImageData } from "@data/productData";
import {
  useAddProductImage,
  useProduct,
  useProductImages,
  useRemoveProductImage,
  useUpdateProductPhoto,
} from "@hook/productHook/productHook";
import {
  Badge,
  Breadcrumb,
  Flex,
  Popconfirm,
  Spin,
  Table,
  TableProps,
  Tabs,
  TabsProps,
  UploadFile,
} from "antd";
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

//#region avatar manage
interface ProductAvatarProps {
  uuid: string;
}

const ProductAvatar: React.FC<ProductAvatarProps> = ({ uuid }) => {
  const { data, isFetching, refetch } = useProduct(uuid);

  const [openForm, setOpenForm] = useState<boolean>(false);

  const { mutate: updateMutate, isPending } = useUpdateProductPhoto(refetch);

  const handleUpdateAvatar = (fileList: UploadFile[]) => {
    setOpenForm(false);
    const photo = fileList[0]?.originFileObj;
    if (!photo) {
      getToastApi().error("Hình ảnh không hợp lệ");
      return;
    }
    updateMutate({ uuid, photo });
  };

  if (isFetching || isPending) return <Spin />;

  return (
    <>
      <Flex vertical gap={30} align="center">
        <div style={{ maxWidth: 400, marginTop: 40 }}>
          <ImageSever src={data?.photoUrl} />
        </div>
        <Flex>
          <BTNEdit onClick={() => setOpenForm(true)} />
        </Flex>
      </Flex>
      <FMImageSelection
        open={openForm}
        onCancle={() => setOpenForm(false)}
        onComfirm={handleUpdateAvatar}
      />
    </>
  );
};
//#endregion

//#region image
interface ProductImageProps {
  uuid: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ uuid }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [openForm, setOpenForm] = useState<boolean>(false);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const { data: images, isFetching, refetch } = useProductImages(uuid);

  const { mutate: deleteMutate, isPending: deleting } =
    useRemoveProductImage(refetch);

  const handleDeleteSelected = () => {
    selectedRowKeys.forEach((imageUUID) => {
      deleteMutate({ productUUID: uuid, imageUUID: imageUUID as string });
    });
    setSelectedRowKeys([]);
  };

  const tableColumns = useMemo<TableProps<ProductImageData>["columns"]>(
    () => [
      {
        title: "Hình ảnh",
        dataIndex: "photoUrl",
        key: "photoUrl",
        render: (url) => url && <ImageSever size={"medium"} src={url} />,
      },
      {
        title: "Thao tác",
        key: "action",
        width: 100,
        render: (r) => (
          <Flex gap={10} wrap>
            <Popconfirm
              title="Xóa?"
              onConfirm={() =>
                deleteMutate({
                  productUUID: uuid,
                  imageUUID: r.uuid,
                })
              }
            >
              <BTNDelete />
            </Popconfirm>
          </Flex>
        ),
      },
    ],
    [deleteMutate, images]
  );

  const { mutateAsync: addImageMutate, isPending: adding } = useAddProductImage(
    () => refetch()
  );
  const handleAddImage = (fileList: UploadFile[]) => {
    setOpenForm(false);

    const photos = fileList.map((f) => f.originFileObj);

    const uploadSequentially = async () => {
      for (const photo of photos) {
        try {
          await addImageMutate({ productUUID: uuid, photo });
        } catch (error) {
          console.error("Upload failed for a file:", error);
        }
      }
    };

    // Gọi bất đồng bộ, không block render
    setTimeout(uploadSequentially, 0);
  };

  return (
    <>
      <Flex vertical gap={30} style={{ padding: 40 }}>
        <Flex gap={10}>
          <BTNEdit onClick={() => setOpenForm(true)} loading={adding} />
          <Badge count={selectedRowKeys.length} offset={[10, 0]}>
            <Popconfirm
              title="Xóa các hình ảnh đã chọn?"
              onConfirm={handleDeleteSelected}
              disabled={selectedRowKeys.length === 0}
            >
              <BTNDelete disabled={selectedRowKeys.length === 0} />
            </Popconfirm>
          </Badge>
        </Flex>
        <Table
          size="small"
          rowKey="uuid"
          columns={tableColumns}
          dataSource={images}
          loading={isFetching || deleting || adding}
          pagination={false}
          scroll={{ x: "max-content" }}
          rowSelection={rowSelection}
        />
      </Flex>
      <FMImageSelection
        multiple
        open={openForm}
        onCancle={() => setOpenForm(false)}
        onComfirm={handleAddImage}
      />
    </>
  );
};
//#endregion

//#region page
interface PageProductImageProps {}

const PageProductImage: React.FC<PageProductImageProps> = ({}) => {
  const router = useRouter();
  const { slug: uuid } = useParams<{ slug: string }>();
  const { data, isFetching, refetch } = useProduct(uuid);

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(() => {
    return data
      ? [
          { title: "Trang chủ", href: "/home" },
          { title: "Sản phẩm", href: "/products" },
          { title: data.name, href: `/products/${uuid}` },
          { title: "Hình ảnh" },
        ]
      : [];
  }, [data]);

  const tabItems = useMemo(
    (): TabsProps["items"] => [
      {
        key: "1",
        label: "Avatar",
        children: <ProductAvatar uuid={uuid} />,
      },
      {
        key: "2",
        label: "Hình ảnh sản phẩm",
        children: <ProductImage uuid={uuid} />,
      },
    ],
    [uuid]
  );

  return (
    <>
      <Flex vertical gap={10}>
        <Breadcrumb items={breadCrumbItems} />
        <Tabs items={tabItems} />
      </Flex>
    </>
  );
};

export default PageProductImage;

//#endregion
