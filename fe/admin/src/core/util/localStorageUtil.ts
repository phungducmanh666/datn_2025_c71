import { Message } from "@/app/(provider-wrapper)/(layout-wrapper)/(pages)/chat/page";
import { LoginInfo, StaffData } from "@data/userData";

const tokenKey = "tokenKey";
const staffKey = "staffKey";
const loginInfoKey = "loginInfoKey";
const messagesKey = "messagesKey";

export class LocalstoreageUtil {
  static getToken() {
    return localStorage.getItem(tokenKey);
  }

  static setToken(token: string) {
    localStorage.setItem(tokenKey, token);
  }

  static setStaff(staff: StaffData) {
    localStorage.setItem(staffKey, JSON.stringify(staff));
  }

  static getStaff() {
    const staffStr = localStorage.getItem(staffKey);
    if (staffStr) {
      try {
        return JSON.parse(staffStr) as StaffData;
      } catch (error) { }
    }
    return null;
  }

  static setLoginInfo(loginInfo: LoginInfo) {
    localStorage.setItem(loginInfoKey, JSON.stringify(loginInfo));
  }

  static getLoginInfo() {
    const loginInfoStr = localStorage.getItem(loginInfoKey);
    if (loginInfoStr) {
      try {
        return JSON.parse(loginInfoStr) as LoginInfo;
      } catch (error) { }
    }
    return null;
  }

  static clearAll() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(staffKey);
    localStorage.removeItem(loginInfoKey);
  }

  static setMessages(message: Message[]) {
    if (!!!message) return;
    if (message?.length <= 0) return;
    localStorage.setItem(messagesKey, JSON.stringify(message));
  }

  static getMessages() {
    const messageInfoStr = localStorage.getItem(messagesKey);
    if (messageInfoStr) {
      try {
        return JSON.parse(messageInfoStr) as Message[];
      } catch (error) { }
    }
    return [];
  }

}
