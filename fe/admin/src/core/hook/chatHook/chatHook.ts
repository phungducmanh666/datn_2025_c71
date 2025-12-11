import { ChatRequest, ChatResponse } from "@data/chatData";
import { ChatbotAPI } from "@net/chatNet/chatbot";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useChatWithBot(onSuccess?: (data: ChatResponse) => any) {
  return useMutation({
    mutationFn: (data: ChatRequest) => ChatbotAPI.sendMessage(data),
    onSuccess: (rs) => {
      onSuccess?.(rs);
    },
    onError: (error: any) => {
    },
  });
}

export const useGetBusinessDocuments = () => {
  return useQuery({
    queryKey: ["useGetBusinessDocuments"],
    queryFn: () => ChatbotAPI.getBusinessDocuments(),
    staleTime: 200,
  });
};

export function useAddBusinessDocument(onSuccess?: () => any) {
  return useMutation({
    mutationFn: (text: string) => ChatbotAPI.addBusinessDocument(text),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: any) => {
    },
  });
}

export function useDeleteBusinessDocument(onSuccess?: () => any) {
  return useMutation({
    mutationFn: (id: string) => ChatbotAPI.deleteBusinessDocument(id),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: any) => {
    },
  });
}

export const useGetProductDocuments = (productUUID: string) => {
  return useQuery({
    queryKey: ["useGetProductDocuments"],
    queryFn: () => ChatbotAPI.getProductocuments(productUUID),
    staleTime: 200,
  });
};

export function useAddProductDocument(onSuccess?: () => any) {
  return useMutation({
    mutationFn: ({ text, productUUID }: { text: string, productUUID: string }) => ChatbotAPI.addProductDocument(productUUID, text),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: any) => {
    },
  });
}

export function useDeleteProductDocument(onSuccess?: () => any) {
  return useMutation({
    mutationFn: (id: string) => ChatbotAPI.deleteProductDocument(id),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: any) => {
    },
  });
}