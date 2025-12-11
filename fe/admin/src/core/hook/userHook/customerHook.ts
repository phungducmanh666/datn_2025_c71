import { getToastApi } from "@context/toastContext";
import { QueryDataFilter } from "@data/commonData";
import { CustomerData } from "@data/userData";
import { CustomerAPI } from "@net/userNet/customer";
import { useMutation, useQuery } from "@tanstack/react-query";

//#region customer
export function useCreateCustomer(onSuccess?: (data: CustomerData) => void) {
  return useMutation({
    mutationFn: ({
      firstName,
      lastName,
      gender,
      birthDate,
      phoneNumber,
      email,
      password,
    }: {
      firstName: string;
      lastName: string;
      gender: string;
      birthDate: string;
      phoneNumber: string;
      email: string;
      password: string;
    }) =>
      CustomerAPI.createCustomer({
        firstName,
        lastName,
        gender,
        birthDate,
        phoneNumber,
        email,
        password,
      }),
    onSuccess: (rs) => {
      getToastApi().success("Đã thêm");
      onSuccess?.(rs);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export const useCustomer = (uuid?: string) => {
  return useQuery({
    queryKey: ["customer", uuid],
    queryFn: () => CustomerAPI.getCustomer(uuid),
    staleTime: 200,
    enabled: !!uuid,
  });
};

export const useCustomers = (filter: QueryDataFilter) => {
  return useQuery({
    queryKey: ["customers", filter],
    queryFn: () => CustomerAPI.getCustomers(filter),
    staleTime: 200,
  });
};

export function useDeleteCustomer(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (uuid: string) => CustomerAPI.deleteCustomer(uuid),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
//#endregion

export const useCustomerCountStatistics = () => {
  return useQuery({
    queryKey: ["useCustomerCountStatistics"],
    queryFn: () => CustomerAPI.getCountStatistics(),
    staleTime: 200,
  });
};
