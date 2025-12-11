import useTablePagination from "@/core/hook/antdTableHook";
import { ProductData } from "@data/productData";
import { useProducts } from "@hook/productHook/productHook";
import { ConvertUtil } from "@util/convertUtil";
import { OrderUtil } from "@util/orderUtil";
import { Input, Modal, Table, TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { useEffect, useMemo, useState } from "react";
import BTNCancle from "./btnCancle";
import BTNSave from "./btnSave";
import ImageSever from "./imageServer";

interface FMProductSelectionProps {
  open: boolean;
  onSelected?: (data: ProductData[]) => any;
  onCancle?: () => any;
  onlyActiveProduct?: boolean;
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const FMProductSelection: React.FC<FMProductSelectionProps> = ({
  open,
  onSelected,
  onCancle,
  onlyActiveProduct = false,
}) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductData[]>([]);

  const debouncedSearchValue = useDebounce(searchValue, 500);

  // Thêm useTablePagination để quản lý phân trang
  const {
    pagination,
    requestParams,
    handleTableChange: baseHandleTableChange,
    setPagination,
  } = useTablePagination();

  // Truyền requestParams (bao gồm page, size, sort) và search vào hook useProducts
  const { data, isFetching } = useProducts({
    size: requestParams.size,
    sort: requestParams.sort,
    page: pagination.current,
    search: debouncedSearchValue,
  });

  const rData = useMemo(() => {
    if (!!!data || !!!data.items) return [];
    if (onlyActiveProduct) {
      return data.items.filter(
        (itm) => !OrderUtil.isProductNotValidForOrder(itm)
      );
    }
    return data.items;
  }, [data]);

  // Đồng bộ tổng số items từ API vào state phân trang
  useEffect(() => {
    if (data?.total !== pagination.total) {
      setPagination((prev) => ({ ...prev, total: data?.total || 0 }));
    }
  }, [data, pagination.total, setPagination]);

  const columns = useMemo(() => {
    return [
      {
        title: "Hình ảnh",
        dataIndex: "photoUrl",
        key: "photo",
        render: (url: string) => <ImageSever size={"small"} src={url} />,
      },
      {
        title: "Tên sản phẩm",
        dataIndex: "name",
        key: "name",
        sorter: true,
      },
      {
        title: "Giá",
        dataIndex: "price",
        key: "price",
        sorter: true,
        render: (price: number) => ConvertUtil.formatVNCurrency(price),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status: string) => ConvertUtil.getProductStatusLabel(status),
      },
    ];
  }, []);

  const rowSelection = {
    selectedRowKeys,
    onSelect: (record: ProductData, selected: boolean) => {
      if (selected) {
        setSelectedProducts((prev) => [...prev, record]);
      } else {
        setSelectedProducts((prev) =>
          prev.filter((p) => p.uuid !== record.uuid)
        );
      }
    },
    onSelectAll: (
      selected: boolean,
      selectedRows: ProductData[],
      changeRows: ProductData[]
    ) => {
      if (selected) {
        setSelectedProducts((prev) => [...prev, ...changeRows]);
      } else {
        setSelectedProducts((prev) =>
          prev.filter((p) => !changeRows.some((c) => c.uuid === p.uuid))
        );
      }
    },
  };

  useEffect(() => {
    setSelectedRowKeys(selectedProducts.map((p) => p.uuid));
  }, [selectedProducts]);

  const handleSave = () => {
    if (onSelected) {
      onSelected(selectedProducts);
    }
    if (onCancle) {
      onCancle();
    }
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<ProductData> | SorterResult<ProductData>[]
  ) => {
    let mappedSorter = sorter;

    // Trường hợp nhiều sorter thì map từng cái
    if (Array.isArray(sorter)) {
      mappedSorter = sorter.map((s) =>
        s.field === "price" ? { ...s, field: "unit_price" } : s
      );
    } else if (sorter.field === "price") {
      mappedSorter = { ...sorter, field: "unit_price" };
    }

    baseHandleTableChange(pagination, filters, mappedSorter);
  };

  return (
    <Modal
      open={open}
      title="Thêm"
      onCancel={onCancle}
      destroyOnHidden={true}
      width={800}
      footer={[
        <BTNSave key="save" type="primary" onClick={handleSave}>
          Lưu
        </BTNSave>,
        <BTNCancle key="cancel" onClick={onCancle}>
          Đóng
        </BTNCancle>,
      ]}
    >
      <Input
        placeholder="Tìm kiếm sản phẩm"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Table
        rowKey="uuid"
        columns={columns}
        dataSource={rData}
        loading={isFetching}
        rowSelection={rowSelection}
        pagination={pagination} // Thêm phân trang
        onChange={handleTableChange} // Thêm xử lý thay đổi trang
      />
    </Modal>
  );
};

export default FMProductSelection;
