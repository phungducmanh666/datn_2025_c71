import { ProductData } from "@data/productData";

export class OrderUtil {
  static isProductNotValidForOrder(p: ProductData) {
    return (
      p.status === "DRAFT" || p.status === "HIDE" || p.status === "INACTIVE"
    );
  }
}
