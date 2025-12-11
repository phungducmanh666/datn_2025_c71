import { getToastApi } from "@context/toastContext";
import { QueryDataFilter } from "@data/commonData";
import { StaffData } from "@data/userData";
import { StaffAPI } from "@net/user/staff";
import { useMutation, useQuery } from "@tanstack/react-query";

//#region staff
export function useCreateStaff(onSuccess?: (data: StaffData) => void) {
  return useMutation({
    mutationFn: ({
      firstName,
      lastName,
      gender,
      birthDate,
      phoneNumber,
      email,
    }: {
      firstName: string;
      lastName: string;
      gender: string;
      birthDate: string;
      phoneNumber: string;
      email: string;
    }) =>
      StaffAPI.createStaff({
        firstName,
        lastName,
        gender,
        birthDate,
        phoneNumber,
        email,
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

export const useStaff = (uuid?: string) => {
  return useQuery({
    queryKey: ["staff", uuid],
    queryFn: () => StaffAPI.getStaff(uuid),
    staleTime: 0,
    enabled: !!uuid,
  });
};

export const useStaffs = (filter: QueryDataFilter) => {
  return useQuery({
    queryKey: ["Staffs", filter],
    queryFn: () => StaffAPI.getStaffs(filter),
    staleTime: 0,
  });
};

export function useDeleteStaff(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (uuid: string) => StaffAPI.deleteStaff(uuid),
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
