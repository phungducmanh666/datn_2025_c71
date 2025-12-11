import { QueryDataFilter } from "@/core/data/commonData";
import { getToastApi } from "@context/toastContext";
import { AttributeData, AttributeGroupData } from "@data/productData";
import { AttributeAPI } from "@net/productNet/attribute";
import { useMutation, useQuery } from "@tanstack/react-query";

//#region attribute group
export const useAttributeGroups = (filter?: QueryDataFilter) => {
  return useQuery({
    queryKey: ["attributeGroups", filter],
    queryFn: () => AttributeAPI.getGroups(filter),
    staleTime: 200,
  });
};

export const useAttributeGroup = (uuid: string) => {
  return useQuery({
    queryKey: ["attributeGroup", uuid],
    queryFn: () => AttributeAPI.getGroup(uuid),
    staleTime: 200,
  });
};

export function useCreateAttributeGroup(
  onSuccess?: (data: AttributeGroupData) => void
) {
  return useMutation({
    mutationFn: (name: string) => AttributeAPI.createGroup(name),
    onSuccess: (rs) => {
      getToastApi().success("Đã thêm");
      onSuccess?.(rs);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useDeleteAttributeGroup(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (uuid: string) => AttributeAPI.deleteGroup(uuid),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useCheckAttributeGroupName(
  onSuccess?: (result: boolean) => any
) {
  return useMutation({
    mutationFn: (name: string) => AttributeAPI.checkGroupName(name),
    onSuccess: (isExists: boolean) => {
      onSuccess?.(isExists);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
//#endregion

//#region attribute
export const useAttributes = (groupUUID: string, filter: QueryDataFilter) => {
  return useQuery({
    queryKey: ["attributes", groupUUID, filter],
    queryFn: () => AttributeAPI.getAttributes(groupUUID, filter),
    staleTime: 200,
  });
};

export const useAttribute = (uuid: string) => {
  return useQuery({
    queryKey: ["attribute", uuid],
    queryFn: () => AttributeAPI.getAttribute(uuid),
    staleTime: 200,
  });
};

export function useCreateAttribute(onSuccess?: (data: AttributeData) => void) {
  return useMutation({
    mutationFn: ({ name, groupUUID }: { name: string; groupUUID: string }) =>
      AttributeAPI.createAttribute(groupUUID, name),
    onSuccess: (rs) => {
      getToastApi().success("Đã thêm");
      onSuccess?.(rs);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useDeleteAttribute(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (uuid: string) => AttributeAPI.deleteAttribute(uuid),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useCheckAttributeName(onSuccess?: (result: boolean) => any) {
  return useMutation({
    mutationFn: ({ name, groupUUID }: { name: string; groupUUID: string }) =>
      AttributeAPI.checkAttributeName(groupUUID, name),
    onSuccess: (isExists: boolean) => {
      onSuccess?.(isExists);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
//#endregion
