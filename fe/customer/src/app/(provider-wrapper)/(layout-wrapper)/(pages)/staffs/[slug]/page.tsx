"use client";

import BTNAdd from "@component/btnAdd";
import BTNDelete from "@component/btnDelete";
import BTNDropDown from "@component/btnDropDown";
import BTNReload from "@component/btnReload";
import { RoleData } from "@data/userData";
import {
  useAccount,
  useAccountRoles,
  useAssignRole,
  useRemoveRole,
} from "@hook/userHook/accountHook";
import { useRoles } from "@hook/userHook/roleHook";
import { useStaff } from "@hook/userHook/staffHook";
import { ConvertUtil } from "@util/convertUtil";
import {
  Card,
  Col,
  Descriptions,
  DescriptionsProps,
  Flex,
  MenuProps,
  Popconfirm,
  Row,
  Spin,
  Table,
  Tabs,
  TabsProps,
  Typography,
} from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import Title from "antd/es/typography/Title";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

//#region staff info
interface StaffInfoProps {
  uuid: string;
}

const StaffInfo: React.FC<StaffInfoProps> = ({ uuid }) => {
  const { data, isFetching, refetch } = useStaff(uuid);

  const desItems = useMemo(
    (): DescriptionsProps["items"] =>
      data
        ? [
            {
              key: 2,
              label: "Mã nhân viên",
              children: data.code,
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
              children: ConvertUtil.convertVietNamDateTime(data.birthDate),
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

  return (
    <>
      <Flex vertical gap={40}>
        <Card title="Thông tin nhân viên">
          <Descriptions
            size="small"
            bordered
            layout="horizontal"
            column={1}
            items={desItems}
          />
        </Card>
        <Flex>
          <BTNDropDown items={menuItems} />
        </Flex>
      </Flex>
    </>
  );
};
//#endregion

//#region account

interface AccountRoleProps {
  username: string;
}

const AccountRole: React.FC<AccountRoleProps> = ({ username }) => {
  const { data: roles, isFetching: loadingRoles } = useRoles({
    sort: "name,ASC",
  });
  const {
    data: accountRoles = [],
    isFetching: loadingAccountRoles,
    refetch,
  } = useAccountRoles(username);

  const { mutate: assignMutate, isPending: assignPending } =
    useAssignRole(refetch);
  const { mutate: removeMutate, isPending: removePending } =
    useRemoveRole(refetch);

  // Lọc permission chưa có trong role
  const assignedIds = new Set(accountRoles.map((p: any) => p.uuid));
  const unassignedRoles = roles?.items.filter(
    (p: any) => !assignedIds.has(p.uuid)
  );

  const columnsCommon = [
    {
      title: "Role",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
  ];

  const columnsUnassigned = [
    ...columnsCommon,
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: RoleData) => (
        <BTNAdd
          loading={assignPending}
          onClick={() => assignMutate({ username, roleUUID: record.uuid })}
        />
      ),
    },
  ];

  const columnsAssigned = [
    ...columnsCommon,
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: RoleData) => (
        <Popconfirm
          title="Xóa role này?"
          onConfirm={() => removeMutate({ username, roleUUID: record.uuid })}
        >
          <BTNDelete danger loading={removePending} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Flex vertical gap={30}>
      <Flex gap={10}>
        <BTNReload onClick={() => refetch()} />
      </Flex>
      <Row gutter={[20, 20]}>
        <Col xl={{ span: 12 }} md={{ span: 24 }}>
          <Table
            title={() => <Title level={5}>Role chưa có</Title>}
            columns={columnsUnassigned}
            dataSource={unassignedRoles}
            rowKey="uuid"
            loading={loadingRoles || assignPending}
            pagination={false}
          />
        </Col>
        <Col xl={{ span: 12 }} md={{ span: 24 }}>
          <Table
            title={() => <Title level={5}>Role đã có</Title>}
            columns={columnsAssigned}
            dataSource={accountRoles}
            rowKey="uuid"
            loading={loadingAccountRoles || removePending}
            pagination={false}
          />
        </Col>
      </Row>
    </Flex>
  );
};

interface StaffAccountProps {
  username: string;
}

const StaffAccount: React.FC<StaffAccountProps> = ({ username }) => {
  const { data, isFetching } = useAccount(username);

  const desItems = useMemo(
    (): DescriptionsProps["items"] =>
      data
        ? [
            {
              key: 2,
              label: "username",
              children: data.username,
            },
            {
              key: 3,
              label: "password",
              children: "*********",
            },
          ]
        : [],
    [data]
  );

  if (isFetching) return <Spin />;

  return (
    <Flex vertical gap={40}>
      <Card title="Thông tin tài khoản">
        <Descriptions
          size="small"
          bordered
          layout="horizontal"
          column={1}
          items={desItems}
        />
      </Card>
      <Card title="Quyền tài khoản">
        <AccountRole username={username} />
      </Card>
    </Flex>
  );
};
//#endregion

//#region page
interface PageStaffDetailProps {}

const PageStaffDetail: React.FC<PageStaffDetailProps> = ({}) => {
  const { slug: uuid } = useParams<{ slug: string }>();
  const { data, isFetching, refetch } = useStaff(uuid);

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(() => {
    return data
      ? [
          { title: "Trang chủ", href: "/home" },
          { title: "Nhân viên", href: "/staffs" },
          { title: data.code },
        ]
      : [];
  }, [data]);

  const tabItems = useMemo(
    (): TabsProps["items"] => [
      {
        key: "1",
        label: "Nhân viên",
        children: <StaffInfo uuid={uuid} />,
      },
      {
        key: "2",
        label: "Tài khoản",
        children: data?.code && <StaffAccount username={data.code} />,
      },
    ],
    [uuid, data]
  );

  return (
    <>
      <Flex vertical gap={40}>
        <Breadcrumb items={breadCrumbItems} />
        <Tabs items={tabItems} />
      </Flex>
    </>
  );
};

export default PageStaffDetail;

//#endregion
