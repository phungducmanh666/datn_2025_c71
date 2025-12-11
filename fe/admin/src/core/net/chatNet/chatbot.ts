import { fetchWithAuth } from "@/core/util/fetchUtil";
import { ChatRequest, ChatResponse, EmbeddingVectorData } from "@data/chatData";

export class ChatbotAPI {
  static prefix: string = "/chatbot";

  static async sendMessage({ message, userId }: ChatRequest): Promise<ChatResponse> {
    try {
      const body = {
        message,
        userId
      }

      const res = await fetchWithAuth(`${this.prefix}/chat-agent`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        throw new Error(message);
      }

      return res.json();
    } catch (error: any) {
      throw error;
    }
  }

  static async addBusinessDocument(text: string): Promise<void> {
    try {

      const res = await fetchWithAuth(`${this.prefix}/embedding/business`, {
        method: "POST",
        body: text,
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        throw new Error(message);
      }
    } catch (error: any) {
      throw error;
    }
  }

  static async getBusinessDocuments(): Promise<EmbeddingVectorData[]> {
    try {

      const res = await fetchWithAuth(`${this.prefix}/embedding/business`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        throw new Error(message);
      }

      return res.json();
    } catch (error: any) {
      throw error;
    }
  }

  static async deleteBusinessDocument(id: string): Promise<void> {
    try {

      const res = await fetchWithAuth(`${this.prefix}/embedding/business/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        throw new Error(message);
      }

    } catch (error: any) {
      throw error;
    }
  }

  static async addProductDocument(productUUID: string, text: string): Promise<void> {
    try {

      const res = await fetchWithAuth(`${this.prefix}/embedding/products/${productUUID}`, {
        method: "POST",
        body: text,
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        throw new Error(message);
      }
    } catch (error: any) {
      throw error;
    }
  }

  static async getProductocuments(productUUID: string): Promise<EmbeddingVectorData[]> {
    try {

      const res = await fetchWithAuth(`${this.prefix}/embedding/products/${productUUID}`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        throw new Error(message);
      }

      return res.json();
    } catch (error: any) {
      throw error;
    }
  }

  static async deleteProductDocument(productUUID: string): Promise<void> {
    try {

      const res = await fetchWithAuth(`${this.prefix}/embedding/products/${productUUID}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        throw new Error(message);
      }

    } catch (error: any) {
      throw error;
    }
  }

}
