import { OrderData, OrderPaymentMethod, OrderStatus } from "@data/orderData";
import { Tag } from "antd";

export class ConvertUtil {
  static formatVNCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  static formatVNNumber(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  static getProductStatusLabel(status: string) {
    switch (status) {
      case "DRAFT":
        return <Tag color="gray">Nháp</Tag>;
      case "ACTIVE":
        return <Tag color="blue">Đang kinh doanh</Tag>;
      case "INACTIVE":
        return <Tag color="red">Ngừng kinh doanh</Tag>;
      case "HIDE":
        return <Tag>Ẩn</Tag>;
      default:
        return status;
    }
  }

  static getOrderStatusLabel(status: string) {
    switch (status) {
      case "DRAFT":
        return <Tag color="gray">Chưa thanh toán</Tag>;
      case "PROCESSING":
        return <Tag color="blue">Đang chuẩn bị hàng</Tag>;
      case "PENDING":
        return <Tag color="cyan">Chờ xử lý</Tag>;
      case "SHIPPING":
        return <Tag color="blue-inverse">Đang giao</Tag>;
      case "SHIPPED":
        return <Tag color="orange">Đã giao</Tag>;
      case "SUCCESS":
        return <Tag color="green">Thành công</Tag>;
      case "CANCLED":
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return status;
    }
  }

  static formatUUID(uuid?: string) {
    if (!uuid) return "";
    return uuid.toUpperCase();
  }

  static getPurchaseOrderStatusLabel(status: string) {
    return status;
  }

  static convertVietNamDateTime(date: string | null) {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  static convertVietNamDate(date: string | null) {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }

  static getOrderPaymentMethodComponent(
    status: "COD" | "ZALO_PAY" | undefined | string
  ) {
    switch (status) {
      case "COD":
        return <Tag color="blue">Thanh toán khi nhận hàng</Tag>;
      case "ZALO_PAY":
        return <Tag color="blue-inverse">zalopay</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  }

  static getOrderThanhToanLabel(order: OrderData) {
    if (order && order.refund && order.refund.amount) {
      return <Tag color="green">Đã hoàn tiền</Tag>;
    }
    if (order?.payment?.paymentAmount) {
      return <Tag color="blue-inverse">Đã thanh toán</Tag>;
    }
    return <Tag color="red-inverse">Chưa thanh toán</Tag>;
  }

  static getOrderPaymentMethodLabel(method: string) {
    if (method === OrderPaymentMethod.COD) {
      return <Tag color="blue">COD</Tag>;
    }
    return <Tag color="blue-inverse">Zalopay</Tag>;
  }

  static isOrderCanCancle(status: string) {
    return status === OrderStatus.PENDING || status === OrderStatus.PROCESSING;
  }
}
