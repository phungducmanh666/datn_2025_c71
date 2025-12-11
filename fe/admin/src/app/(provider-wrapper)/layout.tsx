"use client";

import { ThemeProvider } from "@context/themeContext";
import { ToastProvider } from "@context/toastContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalstoreageUtil } from "@util/localStorageUtil";
import { useRouter } from "next/navigation"; // ⭐️ Import useRouter
import React, { ReactNode, useEffect } from "react";

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

  useEffect(() => {
    const token = LocalstoreageUtil.getToken();
    const currentPath = window.location.pathname;
    if (!token && currentPath !== "/login") {
      console.log("Không tìm thấy token. Chuyển hướng đến trang đăng nhập...");
      router.replace("/login");
    }
  }, [router]);
  return (
    <ThemeProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default ProviderWrapperLayout;
