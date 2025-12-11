"use client";

import { EditOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import AvatarServer from "@component/avatarServer";
import BTNEdit from "@component/btnEdit";
import FMUserUpdateAddress from "@component/fmUserUpdateAddress";
import FMUserUpdatePhoto from "@component/fmUserUpdatePhoto";
import { useCustomer } from "@hook/userHook/customerHook";
import { ConvertUtil } from "@util/convertUtil";
import { LocalStorageUtil } from "@util/localStorageUtil";
import { Button, Card, Descriptions, Flex, Tag, Typography } from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { FaBirthdayCake, FaUserAlt } from "react-icons/fa";
import { IoFemale, IoMale } from "react-icons/io5";
import { MdLocationOn, MdOutlineEmail, MdPhone } from "react-icons/md";

//#region real page

const getGenderIcon = (gender: string) => {
  switch (gender) {
    case "MALE":
      return <IoMale className="text-blue-500 text-lg" />;
    case "FEMALE":
      return <IoFemale className="text-pink-500 text-lg" />;
    case "OTHER":
    default:
      return <QuestionCircleOutlined className="text-gray-500 text-lg" />;
  }
};

const getGenderDisplay = (gender: string) => {
  switch (gender) {
    case "MALE":
      return "Nam";
    case "FEMALE":
      return "Nữ";
    case "OTHER":
      return "Khác";
    default:
      return "Không xác định";
  }
};

interface ProfilesProps {
  uuid: string;
}

const Profiles: React.FC<ProfilesProps> = ({ uuid }) => {
  const { data, isFetching, refetch } = useCustomer(uuid);
  const [openFormEditAvatar, setOpenFormEditAvatar] = useState<boolean>(false);
  const [openFormUpdateAddress, setOpenFormUpdateAddress] =
    useState<boolean>(false);

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(
    () => [{ title: "Trang chủ", href: "/home" }, { title: "Hồ sơ" }],
    []
  );

  useEffect(() => {
    if (data) {
      LocalStorageUtil.setCustomer(data);
    }
  }, [data]);

  const fullName = useMemo(() => {
    return data ? `${data.lastName} ${data.firstName}` : "";
  }, [data]);

  if (isFetching) {
    return <Card loading />;
  }

  if (!data) {
    return (
      <div className="text-center p-8 bg-white shadow-lg rounded-lg">
        <Typography.Title level={4} type="danger">
          Không tìm thấy thông tin người dùng
        </Typography.Title>
      </div>
    );
  }

  const items = [
    {
      key: "fullName",
      label: (
        <Flex align="center" gap={5}>
          <FaUserAlt className="text-gray-500" />
          <span>Họ và Tên</span>
        </Flex>
      ),
      children: <span className="font-semibold text-gray-800">{fullName}</span>,
    },
    {
      key: "gender",
      label: (
        <Flex align="center" gap={5}>
          {getGenderIcon(data.gender)}
          <span>Giới tính</span>
        </Flex>
      ),
      children: <Tag color="processing">{getGenderDisplay(data.gender)}</Tag>, // Hiển thị dưới dạng Tag
    },
    {
      key: "email",
      label: (
        <Flex align="center" gap={5}>
          <MdOutlineEmail className="text-gray-500" />
          <span>Email</span>
        </Flex>
      ),
      children: (
        <a
          href={`mailto:${data.email}`}
          className="text-blue-600 hover:text-blue-500"
        >
          {data.email}
        </a>
      ),
    },
    {
      key: "phoneNumber",
      label: (
        <Flex align="center" gap={5}>
          <MdPhone className="text-gray-500" />
          <span>Số điện thoại</span>
        </Flex>
      ),
      children: (
        <a
          href={`tel:${data.phoneNumber}`}
          className="text-blue-600 hover:text-blue-500"
        >
          {data.phoneNumber}
        </a>
      ),
    },
    {
      key: "birthDate",
      label: (
        <Flex align="center" gap={5}>
          <FaBirthdayCake className="text-gray-500" />
          <span>Ngày sinh</span>
        </Flex>
      ),
      children: (
        <span className="text-gray-600">
          {ConvertUtil.convertVietNamDate(data.birthDate)}
        </span>
      ),
    },
    {
      key: "address",
      label: (
        <Flex align="center" gap={20}>
          <Flex gap={5} align="center">
            <MdLocationOn className="text-gray-500" />
            <span>Địa chỉ nhận hàng</span>
          </Flex>
          <BTNEdit
            toolTipTitle="Chỉnh sửa địa chỉ nhận hàng"
            onClick={() => setOpenFormUpdateAddress(true)}
          />
        </Flex>
      ),
      children: data.address || (
        <span className="text-gray-400 italic">
          Chưa cập nhật địa chỉ mặc định
        </span>
      ),
      span: 2, // Chiếm 2 cột để có đủ không gian
    },
  ];

  return (
    <>
      <div className="p-4 md:p-8 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Flex vertical gap={40}>
            <Breadcrumb items={breadCrumbItems} />
            <Flex>
              {" "}
              {/* Đổi màu border-t thành teal cho mới mẻ */}
              <Flex gap={20} align="flex-start" wrap="wrap">
                {/* Cột 1: Ảnh đại diện và Tên */}
                <div className="flex flex-col items-center p-4 border-r lg:border-r border-gray-100 pr-6 w-full lg:w-auto min-w-[200px]">
                  <AvatarServer
                    size={120}
                    src={data.photoUrl}
                    icon={<FaUserAlt />}
                    className="shadow-lg mb-4 border-4 border-white ring-2 ring-teal-400"
                  />
                  <Typography.Title
                    level={3}
                    className="!text-2xl !mt-0 font-extrabold text-gray-900 text-center"
                  >
                    {fullName}
                  </Typography.Title>
                  {/* <div className="mb-4">
                {getMembershipTag(data.membershipLevel)}
              </div> */}
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => setOpenFormEditAvatar(true)}
                  >
                    Đổi avatar
                  </Button>
                </div>

                {/* Cột 2: Thông tin chi tiết */}
                <div className="flex-1 p-4 w-full md:w-auto">
                  <Typography.Title
                    level={4}
                    className="!text-xl border-b pb-2 mb-4 text-gray-700"
                  >
                    Thông Tin Cá Nhân
                  </Typography.Title>
                  <Descriptions
                    className="user-profile-descriptions"
                    layout="vertical"
                    column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                    items={items}
                    colon={false}
                  />

                  {/* Vùng thông tin bổ sung: Tỷ lệ hoàn thành hồ sơ */}
                  <div className="mt-8 pt-4 border-t">
                    <Typography.Title
                      level={4}
                      className="!text-xl mb-4 text-gray-700"
                    >
                      Tài Khoản & Khác
                    </Typography.Title>
                    <Descriptions
                      size="small"
                      layout="horizontal"
                      column={1}
                      items={[
                        {
                          key: "uuid",
                          label: "ID Khách hàng",
                          children: <Tag color="blue">{data.uuid}</Tag>,
                        },
                        {
                          key: "status",
                          label: "Trạng thái",
                          children: <Tag color="success">Đã xác thực</Tag>,
                        },
                      ]}
                    />
                  </div>
                </div>
              </Flex>
            </Flex>
          </Flex>
        </div>
      </div>
      <FMUserUpdatePhoto
        open={openFormEditAvatar}
        customer={data}
        onCancle={() => setOpenFormEditAvatar(false)}
        onUpdated={() => {
          setOpenFormEditAvatar(false);
          refetch();
        }}
      />
      <FMUserUpdateAddress
        open={openFormUpdateAddress}
        customerUUID={uuid}
        onCancle={() => setOpenFormUpdateAddress(false)}
        onSave={() => {
          setOpenFormUpdateAddress(false);
          refetch();
        }}
      />
    </>
  );
};

//#endregion

interface PageProfilesProps {}

const PageProfiles: React.FC<PageProfilesProps> = ({}) => {
  const router = useRouter();
  const [customerUUID, setCustomerUUID] = useState<string>();

  useEffect(() => {
    if (!!!LocalStorageUtil.getCustomer()) {
      router.push("/login");
      return;
    }
    setCustomerUUID(LocalStorageUtil.getCustomer()?.uuid);
  }, []);

  return <>{customerUUID && <Profiles uuid={customerUUID} />}</>;
};

export default PageProfiles;
