import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { LoginInfo } from "@data/userData";

export class AuthAPI {
  static prefix: string = "/user/auths";

  static async generateToken(account: {
    username: string;
    password: string;
  }): Promise<string> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/token/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(account),
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: string = await res.text();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async parserToken(token: string): Promise<LoginInfo> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/token/parser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        params: { token },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: LoginInfo = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }
}
