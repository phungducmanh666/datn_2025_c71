"use client";

import BTNAddCompare from "@component/btnAddCompare";
import BTNAddToCart from "@component/btnAddToCart";
import BTNBuy from "@component/btnBuy";
import BTNDetail from "@component/btnDetail";
import BTNFilter from "@component/btnFilter";
import ImageSever from "@component/imageServer";
import ProductPriceInfo, { DiscountInfo } from "@component/infoPrice";
import ProductRating from "@component/productRating";
import { ProductData } from "@data/productData";
import { CustomerData } from "@data/userData";
import useTablePagination, { AntdSorter } from "@hook/antdTableHook";
import { useBrands } from "@hook/productHook/brandHook";
import {
  useCatalogBrands,
  useCatalogProductLines,
  useCatalogs,
} from "@hook/productHook/catalogHook";
import { useProducts, useProductsByIds } from "@hook/productHook/productHook";
import { useRecommendedHomeProducts } from "@hook/recommendationHook/recommendationHook";
import { ConvertUtil } from "@util/convertUtil";
import { LocalStorageUtil } from "@util/localStorageUtil";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Drawer,
  Flex,
  Input,
  Pagination,
  Radio,
  Row,
  Slider,
  Spin,
  Typography,
} from "antd";
import Meta from "antd/es/card/Meta";
import {
  FilterValue,
  SorterResult,
  TablePaginationConfig,
} from "antd/es/table/interface";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
const { Title } = Typography;

//#region FilterContext
interface ProductFilterContextType {
  catalogUUID?: string;
  brandUUID?: string;
  productLineUUIDs: string[];
  search?: string;
  priceRange?: number[];

  setCatalogUUID: (uuid?: string) => void;
  setBrandUUID: (uuid?: string) => void;
  setProductLineUUIDs: (uuids: string[]) => void;
  setSearch: (text?: string) => void;
  setPriceRange: (arr?: number[]) => void;

  // public table pagination & filter
  sorter: AntdSorter;
  filters: Record<string, FilterValue | null>;
  pagination: TablePaginationConfig;
  requestParams: { page: number; size: number; sort?: string };
  handleTableChange: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<any> | SorterResult<any>[]
  ) => void;
  setPagination: React.Dispatch<React.SetStateAction<TablePaginationConfig>>;
  setFilters: React.Dispatch<
    React.SetStateAction<Record<string, FilterValue | null>>
  >;
  resetTable: () => void;
}

const ProductFilterContext = React.createContext<
  ProductFilterContextType | undefined
>(undefined);

export const ProductFilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [catalogUUID, setCatalogUUID] = useState<string | undefined>();
  const [brandUUID, setBrandUUID] = useState<string | undefined>();
  const [productLineUUIDs, setProductLineUUIDs] = useState<string[]>([]);
  const [search, setSearch] = useState<string>();
  const [priceRange, setPriceRange] = useState<number[]>();

  const {
    pagination,
    filters,
    sorter,
    requestParams,
    handleTableChange,
    setPagination,
    setFilters,
    resetTable,
  } = useTablePagination();

  return (
    <ProductFilterContext.Provider
      value={{
        catalogUUID,
        brandUUID,
        productLineUUIDs,
        search,
        priceRange,
        setCatalogUUID,
        setBrandUUID,
        setProductLineUUIDs,
        setSearch,
        setPriceRange,
        pagination,
        filters,
        sorter,
        requestParams,
        handleTableChange,
        setPagination,
        setFilters,
        resetTable,
      }}
    >
      {children}
    </ProductFilterContext.Provider>
  );
};

export const useProductFilterContext = () => {
  const context = React.useContext(ProductFilterContext);
  if (!context)
    throw new Error(
      "useProductFilterContext must be used within ProductFilterProvider"
    );
  return context;
};
//#endregion

//#region SearchInput
const SearchInput: React.FC = () => {
  const { search, setSearch } = useProductFilterContext();

  // tạo hàm debounce chỉ khởi tạo 1 lần
  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);
      }, 300),
    [setSearch]
  );

  // cleanup để tránh memory leak khi component unmount
  React.useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSetSearch(e.target.value);
    },
    [debouncedSetSearch]
  );

  return (
    <div>
      <Title level={5}>Tìm kiếm</Title>
      <Input
        placeholder="Nhập từ khóa..."
        defaultValue={search}
        onChange={handleChange}
      />
    </div>
  );
};
//#endregion

//#region selector
const CatalogSelector = () => {
  const { catalogUUID, setCatalogUUID } = useProductFilterContext();
  const { data: catalogs } = useCatalogs({ sort: "name,ASC" });

  // khi catalogs thay đổi, nếu catalogUUID hiện tại không tồn tại trong danh sách, set lại cái đầu tiên
  useEffect(() => {
    if (!catalogs?.items?.length) return;
    // nếu catalogUUID không tồn tại trong danh sách, set lại cái đầu tiên
    if (catalogUUID && !catalogs.items.some((c) => c.uuid === catalogUUID)) {
      setCatalogUUID(catalogs.items[0].uuid);
    }
  }, [catalogs, catalogUUID, setCatalogUUID]);

  // tạo options cho Radio.Group, thêm "Tất cả" ở đầu
  const radioOptions = [
    { label: "Tất cả", value: undefined },
    ...(catalogs?.items.map((c) => ({
      label: c.name,
      value: c.uuid,
    })) || []),
  ];

  return (
    <Flex vertical gap={30}>
      <Flex vertical gap={10}>
        <Title level={5}>Danh mục</Title>
        <Radio.Group
          value={catalogUUID}
          options={radioOptions}
          onChange={(e) => setCatalogUUID(e.target.value)}
        />
      </Flex>
      <CatalogBrandSelector />
    </Flex>
  );
};

const useBrandsSelector = (catalogUUID?: string) => {
  // 1. Luôn luôn gọi useCatalogBrands.
  // Nếu catalogUUID là undefined, hook này nên được thiết kế để
  // TẮT TÍNH NĂNG FETCH (enabled: !!catalogUUID trong react-query/swr)
  const catalogBrandsResult = useCatalogBrands(catalogUUID);

  // 2. Luôn luôn gọi useBrands.
  const allBrandsResult = useBrands({ sort: "name,ASC" });

  // 3. Trả về KẾT QUẢ theo điều kiện
  // Chúng ta trả về toàn bộ đối tượng result (bao gồm data, refetch, isFetching,...)
  if (catalogUUID) {
    return catalogBrandsResult;
  } else {
    return allBrandsResult;
  }
};

const CatalogBrandSelector = () => {
  const { catalogUUID, brandUUID, setBrandUUID } = useProductFilterContext();

  const { data: brands, refetch, isFetching } = useBrandsSelector(catalogUUID);

  useEffect(() => {
    refetch();
  }, [catalogUUID]);

  useEffect(() => {
    if (!brands?.items?.length) {
      if (brandUUID) setBrandUUID(undefined);
      return;
    } // Thêm một điều kiện để không tự động set lại giá trị khi người dùng đã chọn "Tất cả"

    if (brandUUID === undefined) return; // Dòng code quan trọng

    if (!brands.items.some((b) => b.uuid === brandUUID)) {
      setBrandUUID(brands.items[0].uuid);
    }
  }, [brands, brandUUID, setBrandUUID]);

  // tạo options cho Radio.Group, thêm "Tất cả" ở đầu
  const radioOptions = [
    { label: "Tất cả", value: undefined },
    ...(brands?.items.map((b) => ({
      label: b.name,
      value: b.uuid,
    })) || []),
  ];

  if (isFetching) return <Spin />;
  if (!brands || brands.items.length === 0) return <></>;

  return (
    <Flex vertical gap={30}>
      <Flex vertical gap={10}>
        <Title level={5}>Thương hiệu</Title>
        <Radio.Group
          value={brandUUID}
          options={radioOptions}
          onChange={(e) => setBrandUUID(e.target.value)}
        />
      </Flex>
      <CatalogProductLineSelector />
    </Flex>
  );
};

const CatalogProductLineSelector = () => {
  const { catalogUUID, brandUUID, productLineUUIDs, setProductLineUUIDs } =
    useProductFilterContext();
  const {
    data: lines,
    refetch,
    isFetching,
  } = useCatalogProductLines(catalogUUID!, brandUUID!, {});

  useEffect(() => {
    refetch();
  }, [catalogUUID, brandUUID]);

  useEffect(() => {
    if (!lines?.items?.length) {
      if (productLineUUIDs.length > 0) setProductLineUUIDs([]);
      return;
    }

    const validUUIDs = productLineUUIDs.filter((uuid) =>
      lines.items.some((l) => l.uuid === uuid)
    );

    // chỉ set khi khác với state hiện tại
    if (validUUIDs.length !== productLineUUIDs.length) {
      setProductLineUUIDs(
        validUUIDs.length > 0 ? validUUIDs : [lines.items[0].uuid]
      );
    }
  }, [lines, productLineUUIDs, setProductLineUUIDs]);

  if (isFetching) return <Spin />;
  if (!lines || lines.items.length === 0) return <></>;

  return (
    <Flex vertical gap={10}>
      <Title level={5}>Dòng sản phẩm</Title>
      <Checkbox.Group
        value={productLineUUIDs}
        options={lines?.items.map((l) => ({ label: l.name, value: l.uuid }))}
        onChange={(checked) => setProductLineUUIDs(checked as string[])}
      />
    </Flex>
  );
};
//#endregion

//#region PriceSlider
const PriceSlider: React.FC = () => {
  const { priceRange, setPriceRange } = useProductFilterContext();

  // state cục bộ hiển thị slider
  const [localRange, setLocalRange] = useState<number[]>(
    priceRange ?? [0, 100000000]
  );

  // debounce để cập nhật context
  const debouncedUpdateContext = useMemo(
    () =>
      debounce((val: number[]) => {
        setPriceRange(val);
      }, 300),
    [setPriceRange]
  );

  useEffect(() => {
    // cleanup khi component unmount
    return () => {
      debouncedUpdateContext.cancel();
    };
  }, [debouncedUpdateContext]);

  // Khi slider thay đổi
  const handleChange = (val: number[]) => {
    setLocalRange(val); // update UI ngay lập tức
    debouncedUpdateContext(val); // debounce update context
  };

  return (
    <div>
      <Title level={5}>Khoảng giá</Title>
      <Slider
        range
        min={0}
        max={100000000}
        value={localRange}
        onChange={handleChange}
        tooltip={{
          formatter: (val) => (val ? ConvertUtil.formatVNCurrency(val) : ""),
        }}
      />
      <div style={{ marginTop: 8 }}>
        Giá hiện tại: {ConvertUtil.formatVNCurrency(localRange[0])} -{" "}
        {ConvertUtil.formatVNCurrency(localRange[1])}
      </div>
    </div>
  );
};
//#endregion

//#region ApplyButton
const ApplyButton: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const filter = useProductFilterContext();
  return (
    <Button
      type="primary"
      onClick={() => {
        console.log(filter);

        onClose();
      }}
    >
      Tìm kiếm
    </Button>
  );
};
//#endregion

//#region ProductFilterDrawer
interface ProductFilterDrawerProps {
  onSearch: () => void; // callback gọi khi bấm Tìm kiếm
}

const ProductFilterDrawer: React.FC<ProductFilterDrawerProps> = ({
  onSearch,
}) => {
  const [open, setOpen] = useState(false);

  const handleSearch = () => {
    onSearch(); // Gọi refetch từ useProducts
    setOpen(false); // Đóng drawer
  };

  return (
    <>
      <Flex>
        <BTNFilter onClick={() => setOpen(true)}>Mở Bộ lọc</BTNFilter>
      </Flex>
      <Drawer
        title="Bộ lọc sản phẩm"
        placement="right"
        closable
        open={open}
        onClose={() => setOpen(false)}
        width={400}
      >
        <Flex vertical gap={40}>
          <SearchInput />
          <CatalogSelector />
          <PriceSlider />
          {/* <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button> */}
        </Flex>
      </Drawer>
    </>
  );
};

//#endregion

//#region product card
interface ProductCardProps {
  data: ProductData;
  size?: "small" | "medium" | "large";
}

export const ProductCard: React.FC<ProductCardProps> = ({ data, size }) => {
  const router = useRouter();

  const [discountInfo, setDiscountInfo] = useState<DiscountInfo>();

  const imageH = useMemo(() => {
    switch (size) {
      case "small":
        return "100px";
      case "medium":
        return "200px";
      case "large":
        return "300px";
      default:
        return "200px";
    }
  }, [size]);

  const cardW = useMemo(() => {
    switch (size) {
      case "small":
        return "200px";
      case "medium":
        return "200px";
      case "large":
        return "300px";
      default:
        return "100%";
    }
  }, [size]);

  const CardContent = (
    <Card
      className="w-full h-full shadow-sm hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden border-gray-200"
      hoverable
      style={{ width: cardW }}
      cover={
        <ImageSever
          src={data.photoUrl}
          style={{
            height: imageH, // Đặt chiều cao mong muốn
            objectFit: "cover", // Rất quan trọng: đảm bảo ảnh phủ đầy khung mà không bị méo
          }}
        />
      }
    >
      <Meta
        title={data.name}
        description={
          <Flex vertical gap={10}>
            <ProductPriceInfo
              product={data}
              onGetPriceInfo={(info) => setDiscountInfo(info)}
            />
            <Typography>
              {ConvertUtil.getProductStatusLabel(data.status)}
            </Typography>
            <ProductRating uuid={data.uuid} />
            <Flex gap={10} align="center" justify="space-between">
              <Flex gap={10}>
                <BTNBuy productUUID={data.uuid} />
                <BTNAddToCart productUUID={data.uuid} />
                <BTNAddCompare product={data} />
              </Flex>
              <BTNDetail
                onClick={() => router.push(`/products/${data.uuid}`)}
              />
            </Flex>
          </Flex>
        }
      />
    </Card>
  );

  if (discountInfo && discountInfo.hasDiscount) {
    return (
      <Badge.Ribbon
        text={discountInfo.discountLabel}
        color="#ef4444" // Tailwind red-500 hex code
        className="font-bold shadow-md"
        placement="start"
      >
        {CardContent}
      </Badge.Ribbon>
    );
  }

  return CardContent;
};
//#endregion

//#region ProductRecommendation
const ProductRecommendation: React.FC = () => {
  const [customerData, setCustomerData] = useState<CustomerData | undefined>();
  useEffect(() => {
    const storedCustomer = LocalStorageUtil.getCustomer();
    if (storedCustomer) {
      setCustomerData(storedCustomer);
    }
  }, []);
  const userUUID = customerData?.uuid;
  const { data: idList = [], isFetching: fetchingIds } =
    useRecommendedHomeProducts(userUUID ?? "");

  const arr: string[] = Array.from(idList ?? []);
  const { data: products, isFetching: loading } = useProductsByIds(arr);

  if (loading) return <Spin />;
  if (!idList || !products) return <></>;

  return (
    <Row gutter={[40, 40]}>
      {products.map((item) => (
        <Col
          key={item.uuid}
          xl={{ span: 6 }}
          lg={{ span: 8 }}
          md={{ span: 12 }}
          sm={{ span: 24 }}
        >
          <ProductCard data={item} />
        </Col>
      ))}
    </Row>
  );
};
//#endregion
//#region PageProduct
const PageProductContent: React.FC = () => {
  const filter = useProductFilterContext();

  const { data, isFetching, refetch } = useProducts({
    catalogUUID: filter.catalogUUID,
    brandUUID: filter.brandUUID,
    productLineUUIDS: filter.productLineUUIDs,
    priceRange: filter.priceRange,
    search: filter.search,
    page: filter.pagination.current || 1,
    size: filter.pagination.pageSize || 10,
    sort: filter.requestParams.sort,
  });

  const handleChangePage = (page: number, pageSize: number) => {
    filter.handleTableChange(
      { ...filter.pagination, current: page, pageSize }, // pagination mới
      filter.filters, // filters hiện tại
      filter.sorter // sorter hiện tại nếu có
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <Flex vertical gap={40}>
        <ProductFilterDrawer onSearch={refetch} />

        {isFetching ? (
          <Spin />
        ) : (
          data && (
            <Row gutter={[40, 40]}>
              {data.items.map((product) => (
                <Col
                  key={product.uuid}
                  xl={{ span: 6 }}
                  lg={{ span: 8 }}
                  md={{ span: 12 }}
                  sm={{ span: 24 }}
                >
                  <ProductCard data={product} />
                </Col>
              ))}
            </Row>
          )
        )}
        <Pagination
          align="center"
          defaultCurrent={filter.pagination.current}
          total={data?.total}
          current={filter.pagination.current}
          pageSize={filter.pagination.pageSize}
          onChange={handleChangePage}
          showSizeChanger
          pageSizeOptions={["1", "2", "5", "10"]}
        />
      </Flex>
      <Flex vertical gap={40}>
        <Typography.Text strong style={{ fontWeight: 500, fontSize: 30 }}>
          Gợi ý cho bạn
        </Typography.Text>
        <ProductRecommendation />
      </Flex>
    </div>
  );
};

//#endregion

const PageProduct: React.FC = () => {
  return (
    <ProductFilterProvider>
      <PageProductContent />
    </ProductFilterProvider>
  );
};

export default PageProduct;
