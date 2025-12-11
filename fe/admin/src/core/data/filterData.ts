interface ProductQueryDataFilter {
  catalogUUID?: string;
  brandUUID?: string;
  productLineUUIDS?: string[]; // UUIDs dưới dạng string
  priceRange?: number[]; // Giá dạng number
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}
