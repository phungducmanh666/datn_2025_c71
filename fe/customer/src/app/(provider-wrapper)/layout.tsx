"use client";

import { ChatProvider } from "@context/chatContext";
import { ProductCompareProvider } from "@context/productCompareContext";
import { ThemeProvider } from "@context/themeContext";
import { ToastProvider } from "@context/toastContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation"; // ⭐️ Import useRouter
import React, { ReactNode } from "react";

interface ProviderWrapperLayoutProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  // Tùy chọn cấu hình queryClient nếu cần (ví dụ: defaultOptions)
});

const ProviderWrapperLayout: React.FC<ProviderWrapperLayoutProps> = ({
  children,
}) => {
  const router = useRouter(); // ⭐️ Khởi tạo router

  // useEffect(() => {
  //   // ⭐️ LOGIC KIỂM TRA TOKEN VÀ CHUYỂN HƯỚNG
  //   const token = localStorage.getItem("token");

  //   // Lấy path hiện tại để tránh loop redirect nếu đang ở trang /login
  //   // Hoặc nếu đang ở trang không yêu cầu đăng nhập (ví dụ: /register)
  //   const currentPath = window.location.pathname;

  //   // Chỉ chuyển hướng nếu không có token VÀ path hiện tại KHÔNG PHẢI là /login
  //   if (!token && currentPath !== "/login") {
  //     console.log("Không tìm thấy token. Chuyển hướng đến trang đăng nhập...");
  //     router.replace("/login");
  //   }

  //   // Bạn có thể thêm logic kiểm tra token hết hạn ở đây nếu cần
  // }, [router]); // Thêm router vào dependencies

  // Khi người dùng đã đăng nhập hoặc đang ở trang login, render children
  return (
    <ThemeProvider>
      <ProductCompareProvider>
        <ChatProvider>
          <ToastProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </ToastProvider>
        </ChatProvider>
      </ProductCompareProvider>
    </ThemeProvider>
  );
};

export default ProviderWrapperLayout;
