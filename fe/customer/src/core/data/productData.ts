export interface CatalogData {
  uuid: string;
  name: string;
  photoUrl: string;
}

export interface BrandData {
  uuid: string;
  name: string;
  photoUrl: string;
}

export interface AttributeGroupData {
  uuid: string;
  name: string;
  attributes: AttributeData[];
}

export interface ProductStatusData {
  key: string;
  value: string;
}

export interface AttributeData {
  uuid: string;
  name: string;
  attribute_values: AttributeValueData[];
}

export interface AttributeValueData {
  uuid: string;
  value: string;
}

export interface ProductInfoData {
  name: string;
  price: number;
  photo: File;
}

export interface ProductMetaData {
  catalogUUID: string;
  brandUUID: string;
  productLineUUIDS: string[];
}

export interface ProductCreateData {
  metadata: ProductMetaData;
  info: ProductInfoData;
}

export interface ProductData {
  uuid: string;
  name: string;
  photoUrl: string;
  status: string;
  price: number;
}

export interface ProductImageData {
  uuid: string;
  photoUrl: string;
}

export interface ProductLineData {
  uuid: string;
  name: string;
}
