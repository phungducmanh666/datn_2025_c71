export interface ProvinceData {
  code: string;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
}

export interface WardData {
  code: string;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
  lat: string;
  lon: string;
}

export interface AddressInfo {
  displayName: string;
  houseNumber: string;
  road: string;
  suburb: string;
  district: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
}
