"use client";

import BTNDropDown from "@component/btnDropDown";
import FMBrandUpdateName from "@component/fmBrandUpdateName";
import FMBrandUpdatePhoto from "@component/fmBrandUpdatePhoto";
import ImageSever from "@component/imageServer";
import { useBrand } from "@hook/productHook/brandHook";
import {
  Descriptions,
  DescriptionsProps,
  Flex,
  MenuProps,
  Typography,
} from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

interface PageCatalogDetailProps {}

const PageCatalogDetail: React.FC<PageCatalogDetailProps> = ({}) => {
  const { slug: uuid } = useParams<{ slug: string }>();
  const { data, isFetching, refetch } = useBrand(uuid);

  const desItems = useMemo(
    (): DescriptionsProps["items"] =>
      data
        ? [
            {
              key: 1,
              label: "UUID",
              children: data.uuid,
            },
            {
              key: 2,
              label: "Tên",
              children: data.name,
            },
            {
              key: 3,
              label: "Hình ảnh",
              children: <ImageSever size={"small"} src={data.photoUrl} />,
            },
          ]
        : [],
    [data]
  );

  const [openFormUpdateName, setOpenFormUpdateName] = useState<boolean>(false);
  const [openFormUpdatePhoto, setOpenFormUpdatePhoto] =
    useState<boolean>(false);

  const menuItems = useMemo(
    (): MenuProps["items"] => [
      {
        key: 1,
        label: (
          <Typography onClick={() => setOpenFormUpdateName(true)}>
            Đổi tên
          </Typography>
        ),
      },
      {
        key: 2,
        label: (
          <Typography onClick={() => setOpenFormUpdatePhoto(true)}>
            Cập nhật hình ảnh
          </Typography>
        ),
      },
    ],
    []
  );

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(() => {
    return data
      ? [
          { title: "Trang chủ", href: "/home" },
          { title: "Thương hiệu", href: "/brands" },
          { title: data.name },
        ]
      : [];
  }, [data]);

  return (
    <>
      <Flex vertical gap={10}>
        <Breadcrumb items={breadCrumbItems} />
        <Descriptions
          bordered
          layout="horizontal"
          column={1}
          items={desItems}
        />
        <Flex>
          <BTNDropDown items={menuItems} />
        </Flex>
      </Flex>
      {data && (
        <FMBrandUpdateName
          brand={data}
          open={openFormUpdateName}
          onCancle={() => setOpenFormUpdateName(false)}
          onUpdated={() => {
            refetch();
            setOpenFormUpdateName(false);
          }}
        />
      )}
      {data && (
        <FMBrandUpdatePhoto
          brand={data}
          open={openFormUpdatePhoto}
          onCancle={() => setOpenFormUpdatePhoto(false)}
          onUpdated={() => {
            refetch();
            setOpenFormUpdatePhoto(false);
          }}
        />
      )}
    </>
  );
};

export default PageCatalogDetail;
