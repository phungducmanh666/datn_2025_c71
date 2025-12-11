"use client";

import BTNAdd from "@component/btnAdd";
import BTNDelete from "@component/btnDelete";
import BTNDropDown from "@component/btnDropDown";
import BTNReload from "@component/btnReload";
import FMRoleUpdateDescription from "@component/fmRoleUpdateDescription";
import FMRoleUpdateName from "@component/fmRoleUpdateName";
import { PermissionData } from "@data/userData";
import { usePermissions } from "@hook/userHook/permissionHook";
import {
  useAssignPermissions,
  useRemovePermissions,
  useRole,
  useRolePermissions,
} from "@hook/userHook/roleHook";
import {
  Col,
  Descriptions,
  DescriptionsProps,
  Flex,
  MenuProps,
  Popconfirm,
  Row,
  Table,
  Tabs,
  TabsProps,
  Typography,
} from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import Title from "antd/es/typography/Title";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

//#region role info
interface RoleInfoProps {
  uuid: string;
}

const RoleInfo: React.FC<RoleInfoProps> = ({ uuid }) => {
  const { data, isFetching, refetch } = useRole(uuid);

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
              label: "Mô tả",
              children: data.description,
            },
          ]
        : [],
    [data]
  );

  const [openFormUpdateName, setOpenFormUpdateName] = useState<boolean>(false);
  const [openFormUpdateDescription, setOpenFormUpdateDescription] =
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
          <Typography onClick={() => setOpenFormUpdateDescription(true)}>
            Cập nhật mô tả
          </Typography>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Flex vertical gap={10}>
        <Descriptions
          size="small"
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
        <FMRoleUpdateName
          role={data}
          open={openFormUpdateName}
          onCancle={() => setOpenFormUpdateName(false)}
          onUpdated={() => {
            refetch();
            setOpenFormUpdateName(false);
          }}
        />
      )}
      {data && (
        <FMRoleUpdateDescription
          role={data}
          open={openFormUpdateDescription}
          onCancle={() => setOpenFormUpdateDescription(false)}
          onUpdated={() => {
            refetch();
            setOpenFormUpdateDescription(false);
          }}
        />
      )}
    </>
  );
};
//#endregion

//#region role permission
interface RolePermissionProps {
  uuid: string;
}

const RolePermission: React.FC<RolePermissionProps> = ({ uuid }) => {
  const { data: permissions = [], isFetching: loadingPermissions } =
    usePermissions("name,ASC");
  const {
    data: rolePermissions = [],
    isFetching: loadingRolePermissions,
    refetch,
  } = useRolePermissions(uuid);

  const { mutate: assignMutate, isPending: assignPending } =
    useAssignPermissions(refetch);
  const { mutate: removeMutate, isPending: removePending } =
    useRemovePermissions(refetch);

  // Lọc permission chưa có trong role
  const assignedIds = new Set(rolePermissions.map((p: any) => p.uuid));
  const unassignedPermissions = permissions.filter(
    (p: any) => !assignedIds.has(p.uuid)
  );

  const columnsCommon = [
    {
      title: "Permission",
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
      render: (_: any, record: PermissionData) => (
        <BTNAdd
          loading={assignPending}
          onClick={() =>
            assignMutate({ roleUUID: uuid, permissionUUID: record.uuid })
          }
        />
      ),
    },
  ];

  const columnsAssigned = [
    ...columnsCommon,
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: PermissionData) => (
        <Popconfirm
          title="Xóa permission này?"
          onConfirm={() =>
            removeMutate({ roleUUID: uuid, permissionUUID: record.uuid })
          }
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
            title={() => <Title level={5}>Permissions chưa có</Title>}
            columns={columnsUnassigned}
            dataSource={unassignedPermissions}
            rowKey="uuid"
            loading={loadingPermissions || assignPending}
            pagination={false}
          />
        </Col>
        <Col xl={{ span: 12 }} md={{ span: 24 }}>
          <Table
            title={() => <Title level={5}>Permissions đã có</Title>}
            columns={columnsAssigned}
            dataSource={rolePermissions}
            rowKey="uuid"
            loading={loadingRolePermissions || removePending}
            pagination={false}
          />
        </Col>
      </Row>
    </Flex>
  );
};
//#endregion

//#region page
interface PageRoleDetailProps {}

const PageRoleDetail: React.FC<PageRoleDetailProps> = ({}) => {
  const { slug: uuid } = useParams<{ slug: string }>();
  const { data, isFetching, refetch } = useRole(uuid);

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(() => {
    return data
      ? [
          { title: "Trang chủ", href: "/home" },
          { title: "Role", href: "/roles" },
          { title: data.name },
        ]
      : [];
  }, [data]);

  const tabItems = useMemo(
    (): TabsProps["items"] => [
      {
        key: "1",
        label: "Role",
        children: <RoleInfo uuid={uuid} />,
      },
      {
        key: "2",
        label: "Role permissions",
        children: <RolePermission uuid={uuid} />,
      },
    ],
    []
  );

  return (
    <Flex vertical gap={40}>
      <Breadcrumb items={breadCrumbItems} />
      <Tabs items={tabItems} />
    </Flex>
  );
};

export default PageRoleDetail;
//#endregion
