import { TablePaginationConfig } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import React, { useCallback, useMemo, useState } from "react";

export interface AntdSorter {
  field?: string;
  order?: "ascend" | "descend" | null;
}

interface UseTableFilterState<T = any> {
  pagination: TablePaginationConfig;
  sorter: AntdSorter;
  filters: Record<string, FilterValue | null>;
  requestParams: {
    page: number;
    size: number;
    sort?: string;
  };
  handleTableChange: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => void;
  setPagination: React.Dispatch<React.SetStateAction<TablePaginationConfig>>;
  setFilters: React.Dispatch<
    React.SetStateAction<Record<string, FilterValue | null>>
  >;
  resetTable: () => void;
}

const useTablePagination = <T = any,>(): UseTableFilterState<T> => {
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["1", "10", "20", "50", "100"],
  });

  const [sorter, setSorter] = useState<AntdSorter>({
    field: undefined,
    order: null,
  });

  const [filters, setFilters] = useState<Record<string, FilterValue | null>>(
    {}
  );

  const handleTableChange = useCallback(
    (
      newPagination: TablePaginationConfig,
      newFilters: Record<string, FilterValue | null>,
      newSorter: SorterResult<T> | SorterResult<T>[]
    ) => {
      setPagination((prev) => ({
        ...prev,
        current: newPagination.current,
        pageSize: newPagination.pageSize,
      }));

      setFilters(newFilters);

      if (!Array.isArray(newSorter)) {
        setSorter({
          field: newSorter.field as string,
          order: newSorter.order,
        });
      }
    },
    []
  );

  const requestParams = useMemo(
    () => ({
      page: (pagination.current ?? 1) - 1,
      size: pagination.pageSize ?? 10,
      sort:
        sorter.field &&
        `${sorter.field},${sorter.order === "descend" ? "DESC" : "ASC"}`,
    }),
    [pagination, sorter]
  );

  const resetTable = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setFilters({});
    setSorter({ field: undefined, order: null });
  };

  return {
    pagination,
    sorter,
    filters,
    requestParams,
    handleTableChange,
    setPagination,
    setFilters,
    resetTable,
  };
};

export default useTablePagination;
