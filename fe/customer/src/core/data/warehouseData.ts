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
  supplierName: string;
  note: string;
  orderDate: string;
  status: string;
  items: PurchaseOrderItemData[];
}

export interface PurchaseOrderItemData {
  uuid: string;
  productUUID: string;
  numberOrder: number;
  numberReceived: number;
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
