import { ChatRequest, ChatResponse } from "@data/chatData";
import { ChatbotAPI } from "@net/chatNet/chatbot";
import { useMutation } from "@tanstack/react-query";

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