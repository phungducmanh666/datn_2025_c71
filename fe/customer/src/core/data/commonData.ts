export interface PageData<T> {
  page: number;
  size: number;
  total: number;
  items: T[];
}

export type SortDirection = "ASC" | "DESC";
export type SortParam = `${string},${SortDirection}`;

export interface QueryDataFilter {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}
