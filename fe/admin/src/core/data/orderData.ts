export interface CreateOrderRequest {
  note: string;
  paymentMethod: string;
  items: CreateOrderItemRequest[];
  totalAmount: number,
  totalSaved: number,
  discountIds: number[]
}

export interface CreateOrderItemRequest {
  productUUID: string;
  number: number;
  unitPrice: number;
  finalPrice: number;
  discountId: number;
}

export interface DeliveryInfoData {
  recipientName: string;
  recipientPhoneNumber: string;
  deliveryAddress: string;
}

export interface OrderPaymentData {
  paymentAmount: number;
  discountAmount: number;
  apptransid: string;
  zptransid: number;
  createdAt: string;
}

export interface OrderData {
  uuid: string;
  note: string;
  customerUUID: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  totalSaved: number;
  paymentMethod: string;
  items: OrderLineData[];
  discounts: DiscountData[];
  deliveryInfomation: DeliveryInfoData;
  payment: OrderPaymentData;
  refund: RefundData;
}

export interface DiscountData {
  id: number,
  discountId: number;
}

export interface ReviewData {
  content: string;
  star: number;
  createdAt: string;
  customerUUID: string;
}

export interface OrderLineData {
  uuid: string;
  productUUID: string;
  number: number;
  unitPrice: number;
  finalUnitPrice: number;
  discountId: number;
  review: ReviewData;
}

export enum OrderStatus {
  ALL = "ALL",
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPING = "SHIPPING",
  SUCCESS = "SUCCESS",
  RETURNING = "RETURNING",
  RETURNED = "RETURNED",
  CANCLED = "CANCLED",

  // Thêm các trạng thái còn lại
}

export interface PayForOrderResponse {
  isPaid: boolean;
  orderUrl: string;
}

export enum OrderPaymentMethod {
  COD = "COD",
  ZALO_PAY = "ZALO_PAY",
  // Thêm các trạng thái còn lại
}

export interface RefundData {
  zprefundsid: string;
  amount: number;
  createdAt: string;
}

export interface OrderStatisticData {
  date: string;
  totalOrders: number;
  totalAmount: number;
  totalSuccessAmount: number;
}
