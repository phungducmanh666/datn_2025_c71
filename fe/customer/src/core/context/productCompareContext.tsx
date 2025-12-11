"use client";

import { ProductData } from "@data/productData";
import { LocalStorageUtil } from "@util/localStorageUtil";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface ProductCompareContextType {
  add: boolean;
  open: boolean;
  closeCompare: () => any;
  openCompare: () => any;
  addProduct: (data: ProductData) => any;
  removeProduct: (uuid: string) => any;
  products: ProductData[];
}

const ProductCompareContext = createContext<
  ProductCompareContextType | undefined
>(undefined);

export const ProductCompareProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [add, setAdd] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([]);

  const closeCompare = () => {
    setOpen(false);
  };

  const openCompare = () => {
    setOpen(true);
  };

  const addProduct = (data: ProductData) => {
    setProducts((prev) => [...prev, data]);
    LocalStorageUtil.addCompareProduct(data);
    setAdd((prev) => !prev);

    if (!open) openCompare();
  };

  const removeProduct = (uuid: string) => {
    setProducts((prev) => prev.filter((item) => item.uuid !== uuid));
    LocalStorageUtil.removeCompareProduct(uuid);
    setAdd((prev) => !prev);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ProductCompareContext.Provider
      value={{
        add,
        open,
        closeCompare,
        openCompare,
        addProduct,
        removeProduct,
        products,
      }}
    >
      {children}
    </ProductCompareContext.Provider>
  );
};

export const useProductCompare = (): ProductCompareContextType => {
  const context = useContext(ProductCompareContext);
  if (!context) {
    throw new Error("useProductCompare phải được dùng trong ThemeProvider");
  }
  return context;
};
