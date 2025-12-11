import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { AccountData, RoleData } from "@data/userData";

export class AccountAPI {
  static prefix: string = "/user/accounts";

  static async getAccount(username: string): Promise<AccountData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${username}`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: AccountData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  //#region roles
  static async getRoleRoles(username: string): Promise<RoleData[]> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${username}/roles`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      // Lấy text NDJSON
      const text = await res.text();

      // Chia từng dòng JSON, lọc rỗng, parse
      const items = text
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as RoleData);

      return items;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      console.error(error);
      getToastApi().error(message);
      throw error;
    }
  }

  static async assignRole(username: string, roleUUID: string): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${username}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          "role-uuid": roleUUID,
        },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async removeRole(username: string, roleUUID: string): Promise<void> {
    try {
      const res = await fetchWithAuth(
        `${this.prefix}/${username}/roles/${roleUUID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }
  //#endregion
}
