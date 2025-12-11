import { ProvinceAPI } from "@net/locationNet/province";
import { useQuery } from "@tanstack/react-query";

export const useProvinces = (sort?: string) => {
  return useQuery({
    queryKey: ["provinces", sort],
    queryFn: () => ProvinceAPI.getProvinces(sort),
    staleTime: 200,
  });
};

export const useWards = (provinceCode?: string, sort?: string) => {
  return useQuery({
    queryKey: ["wards", provinceCode, sort],
    queryFn: () => ProvinceAPI.getWards(provinceCode!, sort),
    enabled: !!provinceCode,
    staleTime: 200,
  });
};
