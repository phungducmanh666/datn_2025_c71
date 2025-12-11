"use client";

import { useLogin, useParserToken } from "@hook/userHook/authHook";
import { useStaff } from "@hook/userHook/staffHook";
import { LocalstoreageUtil } from "@util/localStorageUtil";
import { Button, Flex, Form, Input, Typography } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Dùng Antd's Form.ItemProps cho type safety nếu cần,
// nhưng ta sẽ dùng trực tiếp các component cơ bản.

interface PageLoginProps { }

const { Link } = Typography;

const PageLogin: React.FC<PageLoginProps> = ({ }) => {
  const router = useRouter();

  const [staffUUID, setStaffUUID] = useState<string>();

  // State loading từ hook lấy thông tin nhân viên
  const { data: staff, isFetching: loadingStaff } = useStaff(staffUUID);

  useEffect(() => {
    if (!staff) return;
    LocalstoreageUtil.setStaff(staff);
    router.push("/products");
  }, [staff]);

  // State loading từ hook phân tích token
  const { mutate: parserTokenMutate, isPending: parsering } = useParserToken(
    (info) => {
      LocalstoreageUtil.setLoginInfo(info);
      setStaffUUID(info.userUUID);
    }
  );

  // State loading từ hook đăng nhập
  const { mutate: loginMutate, isPending: loging } = useLogin((token) => {
    LocalstoreageUtil.setToken(token);
    parserTokenMutate(token);
  });

  const onFinish = (values: any) => {
    const { username, password } = values;
    loginMutate({ username, password });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Gửi Form thất bại:", errorInfo);
  };

  // ⭐️ XÁC ĐỊNH TRẠNG THÁI LOADING CHUNG
  // Nút sẽ ở trạng thái loading nếu một trong các bước đang diễn ra.
  const isLoading = loging || parsering || loadingStaff;

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      style={{ minHeight: "100vh", padding: 20, backgroundColor: "#f0f2f5" }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          padding: 24,
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>Đăng nhập</h2>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          {/* Trường Tên đăng nhập (Username) */}
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" },
            ]}
          >
            <Input placeholder="Nhập tên đăng nhập" disabled={isLoading} />
          </Form.Item>

          {/* Trường Mật khẩu (Password) */}
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" disabled={isLoading} />
          </Form.Item>

          {/* Nhóm các link chức năng */}
          <Flex justify="space-between" style={{ marginBottom: 24 }}>
            <Link href="/forgot-password" disabled={isLoading}>
              Quên mật khẩu?
            </Link>
          </Flex>

          {/* Nút Đăng nhập - ĐÃ THÊM THUỘC TÍNH loading VÀ disabled */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              // ⭐️ ÁP DỤNG HIỆU ỨNG LOADING VÀ DISABLED
              loading={isLoading}
              disabled={isLoading}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          {/* Link Đăng ký (Tùy chọn) */}
          <Flex justify="center" style={{ marginTop: 16 }}>
            <Link href="/register" disabled={isLoading}>
              Chưa có tài khoản? Đăng ký ngay!
            </Link>
          </Flex>
        </Form>
      </div>
    </Flex>
  );
};

export default PageLogin;
