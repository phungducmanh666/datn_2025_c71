export interface WarehouseData {
  uuid: string;
  name: string;
  wardCode: string;
  address: string;
}

export interface SupplierData {
  uuid: string;
  name: string;
  contactInfo: string;
  address: string;
}

export interface PurchaseOrderData {
  uuid: string;
  note: string;
  createdAt: string;
  staffUUID: string;
  supplier: SupplierData;
  receipt: ReciptData;
  items: PurchaseOrderItemData[];
}

export interface PurchaseOrderItemData {
  uuid: string;
  productUUID: string;
  orderNumber: number;
  receiptNumber: number;
}

export interface ReciptData {
  uuid: string;
  note: string;
  staffUUID: string;
  createdAt: string;
}

export interface PurchaseOrderReceiptData {
  uuid: string;
  warehouseUUID: string;
  purchaseOrderUUID: string;
  receiptBy: string;
  receiptDate: string;
  items: PurchaseOrderReceiptItemData[];
}

export interface PurchaseOrderReceiptItemData {
  uuid: string;
  productUUID: string;
  number: number;
}
