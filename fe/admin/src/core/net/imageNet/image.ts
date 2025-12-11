import { fetchWithAuth } from "@/core/util/fetchUtil";

export class ImageApi {
  static prefix: string = "/image/images";

  static async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetchWithAuth(`${this.prefix}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        throw new Error(message);
      }

      return await res.text();
    } catch (error: any) {
      throw error;
    }
  }
}
