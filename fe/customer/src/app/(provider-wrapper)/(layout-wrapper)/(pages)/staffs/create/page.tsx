"use client";
import { useCreateStaff } from "@hook/userHook/staffHook";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React from "react";

// Định nghĩa kiểu dữ liệu cho form - ĐÃ LOẠI BỎ 'code'
interface StaffFormData {
  // code: string; <-- Đã loại bỏ
  first_name: string;
  last_name: string;
  birth_date: dayjs.Dayjs;
  gender: "MALE" | "FEMALE" | "OTHER";
  phone_number: string;
  email: string;
}

interface PageStaffCreateProps {}

const PageStaffCreate: React.FC<PageStaffCreateProps> = ({}) => {
  const router = useRouter();
  const [form] = Form.useForm<StaffFormData>();

  // Hook dùng để gọi API tạo nhân viên
  const { mutate: createMutate, isPending: creating } = useCreateStaff((data) =>
    router.push(`/staffs/${data.uuid}`)
  );

  const onFinish = (values: StaffFormData) => {
    // ...

    const birthDateWithTime = values.birth_date
      ? // Định dạng chuỗi theo chuẩn ISO 8601, bao gồm T00:00:00Z (hoặc chỉ T00:00:00)
        values.birth_date.format("YYYY-MM-DDTHH:mm:ss") // Ví dụ: "2002-11-18T00:00:00"
      : null;

    // Ánh xạ và gán giá trị chỉ khi nó tồn tại, nếu không, bỏ qua việc gọi API.
    const dataToSend = {
      firstName: values.first_name,
      lastName: values.last_name,
      gender: values.gender,
      // birthDate sẽ được gán trong khối if bên dưới
      phoneNumber: values.phone_number,
      email: values.email,
    };

    console.log("Dữ liệu gửi đi:", dataToSend);

    // CHỈ GỌI MUTATE KHI birthDateWithTime LÀ STRING (KHÔNG PHẢI NULL)
    if (birthDateWithTime) {
      // TypeScript hiểu rằng trong khối này, birthDateWithTime là string
      createMutate({
        ...dataToSend,
        birthDate: birthDateWithTime, // Gán birthDate đã là string
      });
    } else {
      // Form của bạn đã có required rule cho birth_date, nên khối này ít khi xảy ra.
      console.error("Lỗi: Ngày sinh bị thiếu hoặc không hợp lệ.");
    }
  };

  // Định nghĩa các thuộc tính responsive cho Col
  // Giữ nguyên các trường có Col props là {md: 12}
  const responsiveColProps = {
    xs: 24,
    sm: 24,
    md: 12,
    lg: 12,
  };

  return (
    <Card title="Tạo Hồ Sơ Nhân Viên Mới">
      <Form
        form={form}
        name="staff_create_form"
        onFinish={onFinish}
        layout="vertical"
        initialValues={{ gender: "MALE" }}
      >
        <Flex vertical gap={20}>
          <Row gutter={[16, 16]}>
            {/* Bố cục được điều chỉnh:
                - Mã nhân viên (code) ĐÃ BỊ LOẠI BỎ.
                - Hiện tại có 6 trường (first_name, last_name, gender, birth_date, phone_number, email).
                - 4 trường đầu tiên (first_name, last_name, gender, birth_date) sẽ chiếm 2 cột (md: 12).
                - phone_number cũng chiếm 2 cột (md: 12).
                - email chiếm toàn bộ chiều rộng (span={24}). 
            */}

            {/* Họ (last_name) - Di chuyển lên đầu */}
            <Col {...responsiveColProps}>
              <Form.Item
                name="last_name"
                label="Họ"
                rules={[{ required: true, message: "Vui lòng nhập Họ!" }]}
              >
                <Input placeholder="Ví dụ: Nguyễn Văn" />
              </Form.Item>
            </Col>

            {/* Tên (first_name) */}
            <Col {...responsiveColProps}>
              <Form.Item
                name="first_name"
                label="Tên"
                rules={[{ required: true, message: "Vui lòng nhập Tên!" }]}
              >
                <Input placeholder="Ví dụ: An" />
              </Form.Item>
            </Col>

            {/* Giới tính (gender) */}
            <Col {...responsiveColProps}>
              <Form.Item
                name="gender"
                label="Giới Tính"
                rules={[
                  { required: true, message: "Vui lòng chọn Giới tính!" },
                ]}
              >
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="MALE">Nam</Select.Option>
                  <Select.Option value="FEMALE">Nữ</Select.Option>
                  <Select.Option value="OTHER">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Ngày sinh (birth_date) */}
            <Col {...responsiveColProps}>
              <Form.Item
                name="birth_date"
                label="Ngày Sinh"
                rules={[
                  { required: true, message: "Vui lòng chọn Ngày sinh!" },
                ]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            {/* Số điện thoại (phone_number) - Đặt thành responsiveColProps để tiếp tục bố cục 2 cột */}
            <Col {...responsiveColProps}>
              <Form.Item
                name="phone_number"
                label="Số Điện Thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập Số điện thoại!" },
                  {
                    pattern: new RegExp(/^[0-9]+$/),
                    message: "Chỉ được chứa số!",
                  },
                ]}
              >
                <Input placeholder="Ví dụ: 0901234567" />
              </Form.Item>
            </Col>

            {/* Tạo một Col rỗng để cân bằng bố cục 2 cột cho hàng này */}
            <Col {...responsiveColProps}></Col>

            {/* Email (email) - Vẫn chiếm toàn bộ chiều rộng */}
            <Col span={24}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập Email!" },
                  { type: "email", message: "Email không đúng định dạng!" },
                ]}
              >
                <Input placeholder="Ví dụ: an.nguyen@example.com" />
              </Form.Item>
            </Col>
          </Row>

          {/* Nút gửi form */}
          <Form.Item style={{ margin: 0, marginTop: 10 }}>
            <Button
              type="primary"
              htmlType="submit"
              // THÊM HIỆU ỨNG LOADING: sử dụng biến 'creating' từ hook
              loading={creating}
              disabled={creating} // Vô hiệu hóa nút trong khi đang tải
            >
              Tạo Nhân Viên
            </Button>
          </Form.Item>
        </Flex>
      </Form>
    </Card>
  );
};

export default PageStaffCreate;
