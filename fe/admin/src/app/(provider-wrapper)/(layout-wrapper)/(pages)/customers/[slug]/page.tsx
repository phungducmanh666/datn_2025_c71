"use client";

import AvatarServer from "@component/avatarServer";
import { CustomerData } from "@data/userData";
import { useCustomer } from "@hook/userHook/customerHook";
import { ConvertUtil } from "@util/convertUtil";
import {
  Card,
  Descriptions,
  DescriptionsProps,
  Flex
} from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useParams } from "next/navigation";
import { useMemo } from "react";

//#region staff info
interface CustomerInfoProps {
  data: CustomerData
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ data }) => {

  const desItems = useMemo(
    (): DescriptionsProps["items"] =>
      data
        ? [
          {
            key: 2,
            label: "Mã khách hàng",
            children: data.uuid,
          },
          {
            key: 11,
            label: "Hình ảnh",
            children: <AvatarServer src={data.photoUrl} />,
          },
          {
            key: 3,
            label: "Họ",
            children: data.firstName,
          },
          {
            key: 4,
            label: "Tên",
            children: data.lastName,
          },
          {
            key: 5,
            label: "Giới tính",
            children: data.gender,
          },
          {
            key: 6,
            label: "Ngày sinh",
            children: ConvertUtil.convertVietNamDate(data.birthDate),
          },
          {
            key: 7,
            label: "Số điện thoại",
            children: data.phoneNumber,
          },
          {
            key: 8,
            label: "Email",
            children: data.email,
          },
        ]
        : [],
    [data]
  );

  return (
    <>
      <Flex vertical gap={40}>
        <Card title="Thông tin khách hàng">
          <Descriptions
            size="small"
            bordered
            layout="horizontal"
            column={1}
            items={desItems}
          />
        </Card>
      </Flex>
    </>
  );
};
//#endregion

//#region page
interface PageCustomerDetailProps { }

const PageCustomerDetail: React.FC<PageCustomerDetailProps> = ({ }) => {
  const { slug: uuid } = useParams<{ slug: string }>();
  const { data, isFetching, refetch } = useCustomer(uuid);

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(() => {
    return data
      ? [
        { title: "Trang chủ", href: "/home" },
        { title: "Khách hàng", href: "/customers" },
        { title: data.uuid },
      ]
      : [];
  }, [data]);

  return (
    <>
      <Flex vertical gap={40}>
        <Breadcrumb items={breadCrumbItems} />
        {data && <CustomerInfo data={data} />}
      </Flex>
    </>
  );
};

export default PageCustomerDetail;

//#endregion
