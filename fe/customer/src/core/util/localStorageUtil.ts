import { Message } from "@/app/(provider-wrapper)/(layout-wrapper)/(pages)/chat/page";
import { DeliveryInfo } from "@component/deliveryAddress";
import { ProductData } from "@data/productData";
import { CustomerData, LoginInfo } from "@data/userData";

const orderProductKey = "orderProduct";
const customerKey = "customer";
const tokenKey = "tokenKey";
const loginInfoKey = "loginInfoKey";
const deliveryInfoKey = "deliveryInfoKey";
const productCompareKey = "productCompareKey";
const messagesKey = "messagesKey";

export class LocalStorageUtil {

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

  static clearAll() {
    localStorage.removeItem(orderProductKey);
    localStorage.removeItem(customerKey);
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(loginInfoKey);
    localStorage.removeItem(deliveryInfoKey);
    localStorage.removeItem(messagesKey);
  }

  static getCompareProducts() {
    const dataStr = localStorage.getItem(productCompareKey);
    if (!dataStr) return [];
    return JSON.parse(dataStr) as ProductData[];
  }

  static setCompareProducts(data: ProductData[]) {
    const dataStr = localStorage.setItem(
      productCompareKey,
      JSON.stringify(data)
    );
  }

  static addCompareProduct(data: ProductData) {
    const products = LocalStorageUtil.getCompareProducts();
    const exists = products.some((p) => p.uuid === data.uuid);
    if (exists) return;
    products.push(data);
    localStorage.setItem(productCompareKey, JSON.stringify(products));
  }

  static removeCompareProduct(uuid: string) {
    const products = LocalStorageUtil.getCompareProducts();
    const updatedProducts = products.filter((p) => p.uuid !== uuid);
    localStorage.setItem(productCompareKey, JSON.stringify(updatedProducts));
  }

  static clearCompareProducts() {
    localStorage.removeItem(productCompareKey);
  }

  static getLoginInfo() {
    const dataStr = localStorage.getItem(loginInfoKey);
    if (!dataStr) return null;
    return JSON.parse(dataStr) as LoginInfo;
  }

  static setLoginInfo(info: LoginInfo) {
    localStorage.setItem(loginInfoKey, JSON.stringify(info));
  }

  static setToken(token: string) {
    localStorage.setItem(tokenKey, token);
  }

  static getToken() {
    return localStorage.getItem(tokenKey);
  }

  static setCustomer(customer: CustomerData) {
    localStorage.setItem(customerKey, JSON.stringify(customer));
  }

  static setOrderProductUIDS(uuids: string[]) {
    localStorage.setItem(orderProductKey, uuids.join(","));
  }

  static getOrderProductUUIDS() {
    const orderProducts = localStorage.getItem(orderProductKey);
    return orderProducts ? orderProducts.split(",") : [];
  }

  static clearOrderProductUUIDS() {
    localStorage.removeItem(orderProductKey);
  }

  static removeOrderProductUUID(uuid: string) {
    const orderProductUUIDS = LocalStorageUtil.getOrderProductUUIDS();
    const newData = orderProductUUIDS.filter((item) => item !== uuid);
    LocalStorageUtil.setOrderProductUIDS(newData);
  }

  static addOrderProductUUID(uuid: string) {
    const orderProductUUIDS = LocalStorageUtil.getOrderProductUUIDS();
    if (!orderProductUUIDS.includes(uuid)) {
      orderProductUUIDS.push(uuid);
    }
    LocalStorageUtil.setOrderProductUIDS(orderProductUUIDS);
  }

  static getCustomer() {
    const customerStr = localStorage.getItem(customerKey);
    if (!customerStr) return null;
    return JSON.parse(customerStr) as CustomerData;
  }

  static getDeliveryInfo(): DeliveryInfo | null {
    const objStr = localStorage.getItem(deliveryInfoKey);
    if (objStr) {
      try {
        return JSON.parse(objStr) as DeliveryInfo;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  static setDeliveryInfo(data: DeliveryInfo) {
    localStorage.setItem(deliveryInfoKey, JSON.stringify(data));
  }
}
