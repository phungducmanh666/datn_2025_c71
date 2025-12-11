"use client";

import { useParserToken } from "@hook/userHook/authHook";
import { useCustomer } from "@hook/userHook/customerHook";
import { useExchangeGoogleCodeForToken } from "@hook/userHook/google";
import { LocalStorageUtil } from "@util/localStorageUtil";
import { Spin } from "antd"; // Giữ lại Spin của Ant Design
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
// Import React Icons
import { FcGoogle } from "react-icons/fc";

interface AuthGoogleCallBackPageProps {}

const AuthGoogleCallBackPage: React.FC<AuthGoogleCallBackPageProps> = ({}) => {
  const searchParams = useSearchParams();
  const state = searchParams.get("state");
  const code = searchParams.get("code");

  const router = useRouter();

  const [customerUUID, setCustomerUUID] = useState<string>();

  // Lấy trạng thái loading từ tất cả các hook liên quan
  const { data: customer, isFetching: loadingCustomer } =
    useCustomer(customerUUID);

  const { mutate: parserTokenMutate, isPending: parsering } = useParserToken(
    (info) => {
      LocalStorageUtil.setLoginInfo(info);
      setCustomerUUID(info.userUUID);
    }
  );

  const { mutate: exchangeMutate, isPending: exchanging } =
    useExchangeGoogleCodeForToken((token) => {
      console.log("DA LAY DUOC TOKEN: ", token);

      LocalStorageUtil.setToken(token);
      parserTokenMutate(token);
    });

  // LOGIC XỬ LÝ (GIỮ NGUYÊN)
  useEffect(() => {
    if (!customer) return;
    LocalStorageUtil.setCustomer(customer);
    // Chuyển hướng về trang chủ sau khi lấy đủ thông tin khách hàng
    router.push("/home");
  }, [customer, router]);

  useEffect(() => {
    if (code && state) {
      exchangeMutate({ code, state });
    }
  }, [code, state, exchangeMutate]);

  // TÍNH TOÀN BỘ TRẠNG THÁI LOADING
  const isLoading = exchanging || parsering || loadingCustomer;

  // GIAO DIỆN MỚI DÙNG TAILWIND CSS VÀ ANT DESIGN
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      {/* Container Chính giữa, có hiệu ứng đổ bóng và bo góc */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl max-w-md w-full text-center">
        {/* Icon Google */}
        <div className="mb-6 flex justify-center">
          <FcGoogle size={48} />
        </div>

        {/* Tiêu đề */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Đang Xác Thực...
        </h1>

        {/* Mô tả trạng thái */}
        <p className="text-gray-500 mb-8 text-base">
          Vui lòng chờ trong giây lát. Chúng tôi đang hoàn tất quá trình đăng
          nhập của bạn.
        </p>

        {/* Khu vực Loading */}
        <div className="flex flex-col items-center space-y-4">
          {/* Spin của Ant Design hoặc một icon Loading lớn */}
          {/* Dùng Spin của Antd: */}
          <Spin size="large" spinning={isLoading} />

          {/* Hoặc dùng Icon React: */}
          {/* <AiOutlineLoading3Quarters 
            size={36} 
            className="animate-spin text-blue-500" 
          /> */}

          {/* Hiển thị thông tin cụ thể hơn về trạng thái (Tùy chọn) */}
          <p className="text-sm font-medium text-blue-600 mt-4">
            {exchanging && "Đang trao đổi mã Google lấy Token..."}
            {parsering && !exchanging && "Đang phân tích Token & Lấy UUID..."}
            {loadingCustomer &&
              !parsering &&
              "Đang tải thông tin khách hàng..."}
            {!isLoading && "Đã hoàn tất! Đang chuyển hướng..."}
            {isLoading &&
              !exchanging &&
              !parsering &&
              !loadingCustomer &&
              "Đang xử lý..."}
          </p>
        </div>

        {/* Thanh tiến trình giả lập (Tùy chọn) */}
        <div className="mt-8">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            {/* Thanh loading chạy ngang */}
            <div className="h-1 bg-blue-500 rounded-full w-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthGoogleCallBackWrapper = () => {
  // Bọc component Client Component bên trong Suspense
  return (
    // Component của bạn được gọi ở đây
    <Suspense fallback={<div>Đang tải tham số...</div>}>
      <AuthGoogleCallBackPage />
    </Suspense>
  );
};

export default AuthGoogleCallBackWrapper;
