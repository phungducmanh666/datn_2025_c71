import { fetchWithAuth } from "@/core/util/fetchUtil";
import { ChatRequest, ChatResponse } from "@data/chatData";

export class ChatbotAPI {
  static prefix: string = "/chatbot";

  static async sendMessage({
    message,
    userId,
    history,
  }: ChatRequest): Promise<ChatResponse> {
    try {
      const body = {
        message: JSON.stringify(history),
        userId,
      };

      const res = await fetchWithAuth(`${this.prefix}/chat-agent`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const message = `(CHAT BOT)Failed: ${res.statusText}`;
        throw new Error(message);
      }

      return res.json();
    } catch (error: any) {
      throw error;
    }
  }
}
