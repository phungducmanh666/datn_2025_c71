import { getToastApi } from "@context/toastContext";
import { CustomerData } from "@data/userData";
import { CustomerAPI } from "@net/user/customer";
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
    staleTime: 0,
    enabled: !!uuid,
  });
};
//#endregion

export function useCheckCustomerEmail(onSuccess?: (result: boolean) => any) {
  return useMutation({
    mutationFn: (email: string) => CustomerAPI.checkEmailUsaged(email),
    onSuccess: (isExists: boolean) => {
      onSuccess?.(isExists);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateCustomerPhoto(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, photo }: { uuid: string; photo?: File }) =>
      CustomerAPI.updatePhoto(uuid, photo),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateCustomerAddress(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, address }: { uuid: string; address: string }) =>
      CustomerAPI.updateAddress(uuid, address),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
