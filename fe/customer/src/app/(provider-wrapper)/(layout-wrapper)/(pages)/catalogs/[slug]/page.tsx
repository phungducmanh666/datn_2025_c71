"use client";

import BTNAdd from "@component/btnAdd";
import BTNDelete from "@component/btnDelete";
import BTNDropDown from "@component/btnDropDown";
import BTNReload from "@component/btnReload";
import FMCatalogUpdateName from "@component/fmCatalogUpdateName";
import FMCatalogUpdatePhoto from "@component/fmCatalogUpdatePhoto";
import FMProductLineCreate from "@component/fmProductLineCreate";
import ImageSever from "@component/imageServer";
import { BrandData, ProductLineData } from "@data/productData";
import useTablePagination from "@hook/antdTableHook";
import { useBrands } from "@hook/productHook/brandHook";
import {
  useCatalog,
  useCatalogBrands,
  useCatalogConnectBrand,
  useCatalogProductLines,
  useDeleteProductLine,
  useRemoveCatalogBrandConnection,
} from "@hook/productHook/catalogHook";
import {
  Col,
  Descriptions,
  DescriptionsProps,
  Flex,
  MenuProps,
  Popconfirm,
  Row,
  Spin,
  Table,
  TableProps,
  Tabs,
  TabsProps,
  Typography,
} from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import Title from "antd/es/typography/Title";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

//#region catalog info
interface CatalogInfoProps {
  uuid: string;
}

const CatalogInfo: React.FC<CatalogInfoProps> = ({ uuid }) => {
  const { data: catalog, isFetching, refetch } = useCatalog(uuid);

  const desItems = useMemo(
    (): DescriptionsProps["items"] =>
      catalog
        ? [
            {
              key: 1,
              label: "UUID",
              children: catalog.uuid,
            },
            {
              key: 2,
              label: "Tên",
              children: catalog.name,
            },
            {
              key: 3,
              label: "Hình ảnh",
              children: <ImageSever size={"small"} src={catalog.photoUrl} />,
            },
          ]
        : [],
    [catalog]
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

  if (isFetching) return <Spin />;

  return (
    <>
      <Flex vertical gap={10}>
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
      {catalog && (
        <FMCatalogUpdateName
          catalog={catalog}
          open={openFormUpdateName}
          onCancle={() => setOpenFormUpdateName(false)}
          onUpdated={() => {
            refetch();
            setOpenFormUpdateName(false);
          }}
        />
      )}
      {catalog && (
        <FMCatalogUpdatePhoto
          catalog={catalog}
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
//#endregion

//#region catalog brands
interface CatalogBrandsProps {
  uuid: string;
}

const CatalogBrands: React.FC<CatalogBrandsProps> = ({ uuid }) => {
  //#region data
  const { data: brands, isFetching: fetchingBrands } = useBrands({});
  const {
    data: catalogBrands,
    isFetching: fecthingCatalogBrands,
    refetch: refetchCatalogBrands,
  } = useCatalogBrands(uuid, {});

  const otherBrands = useMemo((): BrandData[] => {
    const allBrands = brands?.items ?? [];
    const catalogBrandList = catalogBrands?.items ?? [];

    const catalogBrandIds = new Set(catalogBrandList.map((b) => b.uuid));
    return allBrands.filter((b) => !catalogBrandIds.has(b.uuid));
  }, [brands, catalogBrands]);
  //#endregion

  //#region data
  const { mutate: createConnection, isPending: creating } =
    useCatalogConnectBrand(refetchCatalogBrands);

  const { mutate: removeConnection, isPending: removing } =
    useRemoveCatalogBrandConnection(refetchCatalogBrands);
  //#endregion

  //#region table
  const commonTableColums: TableProps<BrandData>["columns"] = [
    {
      sorter: (a, b) => a.name.localeCompare(b.name),
      title: "Thương hiệu",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      render: (name: string) => <>{name}</>,
    },
    {
      title: "Hình ảnh",
      dataIndex: "photoUrl",
      key: "photoUrl",
      render: (url: string) => url && <ImageSever size="small" src={url} />,
    },
  ];

  const catalogBrandsTableColums = useMemo<TableProps<BrandData>["columns"]>(
    () => [
      ...commonTableColums,
      {
        title: "Thao tác",
        key: "action",
        render: (r: BrandData) => (
          <Flex gap={10} wrap>
            <Popconfirm
              title="Gỡ?"
              onConfirm={() => {
                removeConnection({
                  catalogUUID: uuid,
                  brandUUID: r.uuid,
                });
              }}
            >
              <BTNDelete />
            </Popconfirm>
          </Flex>
        ),
      },
    ],
    [uuid, removeConnection, removing, catalogBrands?.items]
  );

  const otherBrandsTableColums = useMemo<TableProps<BrandData>["columns"]>(
    () => [
      ...commonTableColums,
      {
        title: "Thao tác",
        key: "action",
        render: (r: BrandData) => (
          <Flex gap={10} wrap>
            <Popconfirm
              title="Thêm?"
              onConfirm={() => {
                createConnection({
                  catalogUUID: uuid,
                  brandUUID: r.uuid,
                });
              }}
            >
              <BTNAdd loading={creating} />
            </Popconfirm>
          </Flex>
        ),
      },
    ],
    [uuid, createConnection, creating, otherBrands]
  );
  //#endregion

  return (
    <Row gutter={[10, 10]}>
      <Col xl={{ span: 12 }} md={{ span: 24 }}>
        <Table
          title={() => <Title level={4}>Đã thêm</Title>}
          size="small"
          rowKey="uuid"
          columns={catalogBrandsTableColums}
          dataSource={catalogBrands?.items}
          loading={fecthingCatalogBrands}
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </Col>

      <Col xl={{ span: 12 }} md={{ span: 24 }}>
        <Table
          title={() => <Title level={4}>Chưa thêm</Title>}
          size="small"
          rowKey="uuid"
          columns={otherBrandsTableColums}
          dataSource={otherBrands}
          loading={fecthingCatalogBrands || fetchingBrands}
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </Col>
    </Row>
  );
};
//#endregion

//#region catalog product line
interface ProductLineManageProps {
  catalogUUID: string;
  brandUUID: string;
}

const ProductLineManage: React.FC<ProductLineManageProps> = ({
  catalogUUID,
  brandUUID,
}) => {
  const { pagination, requestParams, handleTableChange, setPagination } =
    useTablePagination();
  const {
    data: productLines,
    isFetching,
    refetch,
  } = useCatalogProductLines(catalogUUID, brandUUID, requestParams);

  useEffect(() => {
    if (
      productLines?.total != null &&
      productLines.total !== pagination.total
    ) {
      setPagination((prev) =>
        prev.total === productLines.total
          ? prev
          : { ...prev, total: productLines.total }
      );
    }
  }, [productLines?.total, pagination.total]);

  // remove
  const { mutate: deleteMutate, isPending: deleting } =
    useDeleteProductLine(refetch);

  // table columns
  const tableColums = useMemo<TableProps<ProductLineData>["columns"]>(
    () => [
      {
        sorter: true,
        title: "Dòng sản phẩm",
        dataIndex: "name",
        key: "name",
        fixed: "left",
        render: (name: string) => <>{name}</>,
      },
      {
        title: "Thao tác",
        key: "action",
        render: (r: ProductLineData) => (
          <Flex gap={10} wrap>
            <Popconfirm title="Xóa?" onConfirm={() => deleteMutate(r.uuid)}>
              <BTNDelete />
            </Popconfirm>
          </Flex>
        ),
      },
    ],
    [productLines?.items]
  );

  //form create
  const [openFormCreate, setOpenFormCreate] = useState(false);

  return (
    <>
      <Flex vertical gap={10}>
        <Flex gap={10}>
          <BTNAdd toolTipTitle="Thêm" onClick={() => setOpenFormCreate(true)} />
          <BTNReload onClick={() => refetch()} toolTipTitle="Tải lại trạng" />
        </Flex>
        <Table
          size="small"
          rowKey="uuid"
          columns={tableColums}
          dataSource={productLines?.items}
          loading={isFetching || deleting}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Flex>
      {catalogUUID && brandUUID && (
        <FMProductLineCreate
          catalogUUID={catalogUUID}
          brandUUID={brandUUID}
          open={openFormCreate}
          onCreated={() => {
            refetch();
            setOpenFormCreate(false);
          }}
          onCancle={() => {
            setOpenFormCreate(false);
          }}
        />
      )}
    </>
  );
};

interface CatalogProductLineProps {
  uuid: string;
}

const CatalogProductLine: React.FC<CatalogProductLineProps> = ({ uuid }) => {
  const { data: catalogBrands } = useCatalogBrands(uuid, {});

  const tabItems = !catalogBrands?.items
    ? []
    : [
        ...catalogBrands.items.map((brand) => ({
          key: brand.uuid,
          label: brand.name,
          children: (
            <ProductLineManage catalogUUID={uuid} brandUUID={brand.uuid} />
          ),
        })),
      ];

  return (
    <Flex vertical gap={10}>
      <Tabs size="small" items={tabItems} />
    </Flex>
  );
};
//#endregion

//#region page
interface PageCatalogDetailProps {}

const PageCatalogDetail: React.FC<PageCatalogDetailProps> = ({}) => {
  const { slug: uuid } = useParams<{ slug: string }>();

  const { data: catalog, isFetching, refetch } = useCatalog(uuid);

  const tabItems = useMemo(
    (): TabsProps["items"] => [
      {
        key: "1",
        label: "Danh mục",
        children: <CatalogInfo uuid={uuid} />,
      },
      {
        key: "2",
        label: "Thương hiệu",
        children: <CatalogBrands uuid={uuid} />,
      },
      {
        key: "3",
        label: "Dòng sản phẩm",
        children: <CatalogProductLine uuid={uuid} />,
      },
    ],
    [catalog]
  );

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(() => {
    return catalog
      ? [
          { title: "Trang chủ", href: "/home" },
          { title: "Danh mục", href: "/catalogs" },
          { title: catalog.name },
        ]
      : [];
  }, [catalog]);

  return (
    <Flex vertical gap={10}>
      {isFetching ? <Spin /> : <Breadcrumb items={breadCrumbItems} />}
      <Tabs items={tabItems} />
    </Flex>
  );
};

export default PageCatalogDetail;

//#endregion
