"use client";

import { ProductData } from "@data/productData";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface ChatContextType {
  open: boolean;
  closeChat: () => any;
  openChat: () => any;
}

const ChatContext = createContext<
  ChatContextType | undefined
>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [add, setAdd] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([]);

  const closeChat = () => {
    setOpen(false);
  };

  const openChat = () => {
    setOpen(true);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        open,
        closeChat,
        openChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat phải được dùng trong ThemeProvider");
  }
  return context;
};
