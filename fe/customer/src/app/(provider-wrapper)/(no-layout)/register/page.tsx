"use client";
import { getToastApi } from "@context/toastContext";
import {
  useCheckCustomerEmail,
  useCreateCustomer,
} from "@hook/userHook/customerHook";
import { CustomerAPI } from "@net/user/customer";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
// ⭐️ IMPORT REACT ICONS
import {
  AiOutlineLock,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineUser,
} from "react-icons/ai";
import { FaBirthdayCake } from "react-icons/fa";
import { MdOutlineElectricalServices } from "react-icons/md";

// Định nghĩa kiểu dữ liệu cho form (Giữ nguyên)
interface StaffFormData {
  first_name: string;
  last_name: string;
  birth_date: dayjs.Dayjs;
  gender: "MALE" | "FEMALE" | "OTHER";
  phone_number: string;
  email: string;
  password: string;
}

interface PageCreateCustomerProps {}

const { Link } = Typography;

const PageCreateCustomer: React.FC<PageCreateCustomerProps> = () => {
  const router = useRouter();
  const [form] = Form.useForm<StaffFormData>();
  const [registering, setReigstering] = useState<boolean>(false);

  // Hook dùng để gọi API tạo khách hàng (Giữ nguyên)
  const { mutate: createMutate, isPending: creating } = useCreateCustomer(
    (data) => router.push(`/login`) // Giả định chuyển hướng sau khi tạo thành công
  );

  const { mutate: checkEmailMutate, isPending: checkingEmail } =
    useCheckCustomerEmail((isExists) => {
      const email = form.getFieldValue("email");
      if (!email) {
        form.setFields([
          { name: "email", errors: ["Email không được để trống"] },
        ]);
        return;
      }
      if (isExists) {
        form.setFields([{ name: "email", errors: ["Email đã được sử dụng"] }]);
      } else {
        form.setFields([{ name: "email", errors: [] }]);
      }
    });

  const debouncedCheck = debounce((value: string) => {
    if (!!value.trim()) checkEmailMutate(value.trim());
    else {
      form.setFields([
        { name: "email", errors: ["Email không được để trống"] },
      ]);
    }
  }, 500);

  useEffect(() => {
    const email = form.getFieldValue("email");
    if (!!email) checkEmailMutate(email);
  }, [form.getFieldValue("email")]);

  const onFinish = (values: StaffFormData) => {
    const hasErrors = form
      .getFieldsError()
      .some(({ errors }) => errors.length > 0);

    if (hasErrors) {
      getToastApi().error("Dữ liệu không hợp lệ");
      return;
    }

    const { email } = values;

    if (!!!email) {
      getToastApi().error("Email không được để trống");
      return;
    }

    setReigstering(true);

    CustomerAPI.checkEmailUsaged(email)
      .then((isExists) => {
        if (isExists) {
          getToastApi().error("Email đã được sử dụng");
          return;
        }
        const birthDateWithTime = values.birth_date
          ? values.birth_date.format("YYYY-MM-DDTHH:mm:ss")
          : null;

        const dataToSend = {
          firstName: values.first_name,
          lastName: values.last_name,
          gender: values.gender,
          phoneNumber: values.phone_number,
          email: values.email,
          password: values.password,
        };

        if (birthDateWithTime) {
          createMutate({
            ...dataToSend,
            birthDate: birthDateWithTime,
          });
        } else {
          console.error("Lỗi: Ngày sinh bị thiếu hoặc không hợp lệ.");
        }
      })
      .catch(() => {
        getToastApi().error("Lỗi khi kiểm tra tính hợp lệ của email");
      })
      .finally(() => {
        setReigstering(false);
      });
  };

  // ⭐️ Định nghĩa Col span (Giữ nguyên cho tính Responsive)
  const fullWidthColProps = {
    span: 24,
  };
  const halfWidthColProps = {
    xs: 24, // Trên màn hình nhỏ vẫn full width
    sm: 24,
    md: 12, // Trên màn hình trung bình trở lên là nửa width
    lg: 12,
  };

  return (
    // ⭐️ Tailwind CSS: Nền xanh đậm, căn giữa, chiều cao toàn màn hình
    <div className="min-h-screen flex items-center justify-center bg-blue-900 p-4 py-8">
      <div
        className="
          max-w-xl w-full p-8 
          bg-white rounded-lg shadow-2xl 
          border-t-4 border-blue-600
          hover:shadow-blue-500/50 transition duration-300
        "
      >
        <div className="flex flex-col items-center mb-6">
          {/* Icon/Logo phù hợp với ngành điện tử */}
          <MdOutlineElectricalServices className="text-blue-600 text-5xl mb-2" />
          <h2 className="text-center text-3xl font-bold text-gray-800">
            Đăng ký Tài khoản Khách hàng
          </h2>
          <p className="text-gray-500 mt-1">
            Vui lòng điền đầy đủ thông tin để tham gia
          </p>
        </div>

        <Form
          form={form}
          name="customer_create_form"
          onFinish={onFinish}
          layout="vertical"
          initialValues={{ gender: "MALE" }}
        >
          {/* Antd Form kết hợp với Tailwind để căn lề và khoảng cách */}
          <Row gutter={[16, 0]}>
            {/* HỌ (last_name) và TÊN (first_name) CÙNG MỘT DÒNG */}
            <Col {...halfWidthColProps}>
              <Form.Item
                name="last_name"
                label="Họ"
                rules={[{ required: true, message: "Vui lòng nhập Họ!" }]}
              >
                <Input
                  placeholder="Ví dụ: Nguyễn Văn"
                  disabled={creating}
                  prefix={
                    <AiOutlineUser className="site-form-item-icon mr-2" />
                  }
                />
              </Form.Item>
            </Col>
            <Col {...halfWidthColProps}>
              <Form.Item
                name="first_name"
                label="Tên"
                rules={[{ required: true, message: "Vui lòng nhập Tên!" }]}
              >
                <Input
                  placeholder="Ví dụ: An"
                  disabled={creating}
                  prefix={
                    <AiOutlineUser className="site-form-item-icon mr-2" />
                  }
                />
              </Form.Item>
            </Col>

            {/* Giới tính (gender) */}
            <Col {...halfWidthColProps}>
              <Form.Item
                name="gender"
                label="Giới Tính"
                rules={[
                  { required: true, message: "Vui lòng chọn Giới tính!" },
                ]}
              >
                {/* ⭐️ Thêm Icon vào Select (dùng tùy biến CSS nếu muốn Icon nằm trong Select) */}
                <Select placeholder="Chọn giới tính" disabled={creating}>
                  <Select.Option value="MALE">Nam</Select.Option>
                  <Select.Option value="FEMALE">Nữ</Select.Option>
                  <Select.Option value="OTHER">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Ngày sinh (birth_date) */}
            <Col {...halfWidthColProps}>
              <Form.Item
                name="birth_date"
                label="Ngày Sinh"
                rules={[
                  { required: true, message: "Vui lòng chọn Ngày sinh!" },
                ]}
              >
                {/* ⭐️ Thêm Icon (không phải prefix) bằng cách chỉnh style */}
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  disabled={creating}
                  placeholder="Chọn ngày sinh"
                  suffixIcon={
                    <FaBirthdayCake className="text-gray-400 text-lg" />
                  }
                />
              </Form.Item>
            </Col>

            {/* Số điện thoại (phone_number) */}
            <Col {...fullWidthColProps}>
              <Form.Item
                name="phone_number"
                label="Số Điện Thoại"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập Số điện thoại!",
                  },
                  {
                    pattern: new RegExp(/^[0-9]+$/),
                    message: "Chỉ được chứa số!",
                  },
                ]}
              >
                <Input
                  placeholder="Ví dụ: 0901234567"
                  disabled={creating}
                  prefix={
                    <AiOutlinePhone className="site-form-item-icon mr-2" />
                  }
                />
              </Form.Item>
            </Col>

            {/* Email (email) */}
            <Col {...fullWidthColProps}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập Email!" },
                  { type: "email", message: "Email không đúng định dạng!" },
                ]}
              >
                <Input
                  placeholder="Ví dụ: an.nguyen@example.com"
                  disabled={creating}
                  onChange={(e) => debouncedCheck(e.target.value)}
                  prefix={
                    <AiOutlineMail className="site-form-item-icon mr-2" />
                  }
                />
              </Form.Item>
            </Col>

            {/* Password */}
            <Col {...fullWidthColProps}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Vui lòng nhập Password!" },
                  {
                    type: "string",
                    min: 6,
                    message: "Password phải có ít nhất 6 ký tự!",
                  },
                ]}
                className="mb-8"
              >
                <Input.Password
                  placeholder="Nhập Password"
                  disabled={creating}
                  prefix={
                    <AiOutlineLock className="site-form-item-icon mr-2" />
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Nút gửi form */}
          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={creating}
              disabled={creating}
              // ⭐️ Tailwind: Áp dụng style nút tương tự trang Đăng nhập
              className="bg-blue-600 hover:!bg-blue-700 !border-blue-600 hover:!border-blue-700 shadow-lg shadow-blue-500/50"
            >
              {creating || registering ? "Đang tạo tài khoản..." : "Đăng ký"}
            </Button>
          </Form.Item>

          {/* Link Đã có tài khoản */}
          <div className="flex justify-center mt-4">
            <Typography.Text className="text-gray-600 mr-2">
              Đã có tài khoản?
            </Typography.Text>
            <Link
              href="/login"
              disabled={creating}
              className="font-medium text-blue-600 hover:text-blue-700 transition duration-200"
            >
              Đăng nhập
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PageCreateCustomer;
