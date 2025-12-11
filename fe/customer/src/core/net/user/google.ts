import { getToastApi } from "@context/toastContext";
import { fetchWithAuth } from "@util/fetchUtil";

export class LoginGoogleAPI {
  static prefix: string = "/user/google/auth";

  static async getLoginUrl(): Promise<string> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/login`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data = await res.text();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async exchangeCodeForToken(
    code: string,
    state: string
  ): Promise<string> {
    try {
      const res = await fetchWithAuth(
        `${this.prefix}/exchange-code-for-token`,
        {
          method: "GET",
          params: {
            code,
            state,
          },
        }
      );

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data = await res.text();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }
}
