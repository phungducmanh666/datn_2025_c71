'use client'

import BTNDetail from '@component/btnDetail';
import ImageSever from '@component/imageServer';
import StaffInfo from '@component/staffInfo';
import { DiscountType, PromotionConditionRES, PromotionDetailRES, PromotionStatus } from '@data/promotionData';
import { PromotionDetailRESProduct, usePromotion, usePromotionProducts, useUpdatePromotionStatus } from '@hook/promotionHook/promotionHook';
import { Alert, Breadcrumb, Card, Descriptions, Flex, Space, Spin, Switch, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

// ==========================================
// 2. SUB-COMPONENTS (Internal)
// ==========================================

// Component hiển thị bảng điều kiện (theo tổng tiền)
const PromotionConditionsTable: React.FC<{ data: PromotionConditionRES[] }> = ({ data }) => {
    const columns: ColumnsType<PromotionConditionRES> = [
        {
            title: 'Hóa đơn tối thiểu',
            dataIndex: 'minimumValue',
            key: 'minimumValue',
            render: (val) => <Typography.Text strong>{Number(val).toLocaleString()} đ</Typography.Text>,
        },
        {
            title: 'Loại giảm giá',
            dataIndex: 'discountType',
            key: 'discountType',
            align: 'center',
            render: (type) => (type === DiscountType.PERCENTAGE ? <Tag color="blue">Phần trăm (%)</Tag> : <Tag color="green">Số tiền (VNĐ)</Tag>),
        },
        {
            title: 'Giá trị giảm',
            dataIndex: 'discountValue',
            key: 'discountValue',
            align: 'right',
            render: (val, record) =>
                <span style={{ color: 'red', fontWeight: 'bold' }}>
                    {record.discountType === DiscountType.PERCENTAGE ? `${val}%` : `-${Number(val).toLocaleString()} đ`}
                </span>,
        },
    ];

    return (
        <Table
            title={() => <b>Danh sách điều kiện áp dụng</b>}
            dataSource={data}
            columns={columns}
            rowKey="id"
            pagination={false}
            bordered
            size="small"
        />
    );
};

// Component hiển thị bảng sản phẩm (theo từng sản phẩm)
const PromotionProductsTable: React.FC<{ data: PromotionDetailRES[] }> = ({ data }) => {

    const router = useRouter();

    // 1. Lấy dữ liệu chi tiết sản phẩm từ Hook
    const { data: products, isLoading } = usePromotionProducts(data);

    // Hàm tiện ích format tiền tệ VNĐ
    const formatCurrency = (value: number) => {
        if (!value && value !== 0) return '---';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const columns: ColumnsType<PromotionDetailRESProduct> = [
        {
            title: 'Sản phẩm',
            key: 'product',
            width: 300,
            render: (_, record) => (
                <Space>
                    {/* Hiển thị ảnh sản phẩm */}
                    <ImageSever src={record.photoUrl} size={"small"} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Tên sản phẩm */}
                        <Typography.Text strong>
                            {record.name || <span style={{ color: '#ccc' }}>Sản phẩm không tồn tại</span>}
                        </Typography.Text>
                        {/* UUID nhỏ bên dưới để tra cứu nếu cần */}
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {record.productUUID}
                        </Typography.Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Giá niêm yết',
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            render: (price) => (
                <Typography.Text delete type="secondary">
                    {formatCurrency(price)}
                </Typography.Text>
            ),
        },
        {
            title: 'Mức giảm',
            key: 'discount',
            align: 'center',
            render: (_, record) => {
                const isPercent = record.discountType === DiscountType.PERCENTAGE;
                return (
                    <Tag color={isPercent ? "blue" : "green"}>
                        {isPercent ? `Giảm ${record.discountValue}%` : `Giảm ${formatCurrency(record.discountValue)}`}
                    </Tag>
                );
            },
        },
        {
            title: 'Giá sau giảm',
            key: 'finalPrice',
            align: 'right',
            render: (_, record) => {
                // Logic tính giá sau giảm
                if (!record.price) return '---';

                let finalPrice = 0;
                if (record.discountType === DiscountType.PERCENTAGE) {
                    // Giá gốc - (Giá gốc * % / 100)
                    finalPrice = record.price - (record.price * record.discountValue / 100);
                } else {
                    // Giá gốc - Số tiền fix
                    finalPrice = record.price - record.discountValue;
                }

                // Đảm bảo giá không âm
                finalPrice = finalPrice < 0 ? 0 : finalPrice;

                return (
                    <Typography.Text type="danger" strong style={{ fontSize: 15 }}>
                        {formatCurrency(finalPrice)}
                    </Typography.Text>
                );
            },
        },
        {
            title: 'Xem sản phẩm',
            key: 'thaoTac',
            align: 'right',
            render: (_, record) => <BTNDetail onClick={() => router.push(`/products/${record.productUUID}`)} />
        },
    ];

    return (
        <Table
            title={() => <b>Danh sách sản phẩm áp dụng</b>}
            // 2. Quan trọng: Dùng products (từ hook) thay vì data gốc
            dataSource={products || []}
            columns={columns}
            rowKey="productUUID" // Dùng UUID làm key
            loading={isLoading} // Hiển thị loading khi đang fetch thông tin sản phẩm
            pagination={{ pageSize: 10, showSizeChanger: true }}
            bordered
            size="small"
            locale={{ emptyText: 'Không có dữ liệu sản phẩm' }}
        />
    );
};

// ==========================================
// 3. MAIN PAGE COMPONENT
// ==========================================

const PagePromotionDetail: React.FC = () => {
    // 1. Lấy ID từ URL (Fix lỗi convert type)
    const params = useParams();
    const id = params?.slug ? Number(params.slug) : NaN;

    // 2. Gọi Hook lấy dữ liệu
    const { data: promotion, isLoading, isError, refetch } = usePromotion(id);

    // Config Breadcrumb
    const breadCrumbItems = [
        { title: "Trang chủ", href: "/home" },
        { title: "Khuyến mãi", href: "/promotions" },
        { title: promotion?.title || "Chi tiết khuyến mãi" },
    ];

    const { mutate: updatePromotionStatus, isPending: isUpdatingStatus } = useUpdatePromotionStatus();

    // Xử lý loading/error
    if (isLoading) return <Flex justify="center" align="center" style={{ height: '50vh' }}><Spin size="large" tip="Đang tải dữ liệu..." /></Flex>;
    if (isError || !promotion) return <Alert message="Lỗi" description="Không tìm thấy thông tin khuyến mãi hoặc có lỗi xảy ra." type="error" showIcon style={{ margin: 20 }} />;

    // Xử lý sự kiện switch
    const handleStatusChange = (checked: boolean) => {
        const newStatus = checked ? PromotionStatus.ENABLE : PromotionStatus.DISABLE;
        updatePromotionStatus({ id, status: newStatus }, {
            onSuccess: () => {
                refetch();
            }
        });
    };

    return (
        <Flex vertical gap={24} style={{ padding: 24 }}>
            <Breadcrumb items={breadCrumbItems} />

            {/* Block 1: Thông tin chung */}
            <Card
                title={<span style={{ fontSize: 18 }}>Thông tin chương trình</span>}
                extra={
                    <Flex align="center" gap={8}>
                        <Typography.Text>Trạng thái kích hoạt:</Typography.Text>
                        <Switch
                            checkedChildren="Bật"
                            unCheckedChildren="Tắt"
                            checked={promotion.status === PromotionStatus.ENABLE}
                            onChange={handleStatusChange}
                        />
                    </Flex>
                }
            >
                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Tiêu đề"><b>{promotion.title}</b></Descriptions.Item>
                    <Descriptions.Item label="Nhân viên"><StaffInfo uuid={promotion.staffUUID} /></Descriptions.Item>
                    <Descriptions.Item label="Trạng thái hiện tại">
                        {promotion.status === PromotionStatus.ENABLE
                            ? <Tag color="success">Đang hoạt động</Tag>
                            : <Tag color="error">Đã dừng</Tag>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian bắt đầu">
                        {dayjs(promotion.startAt).format('HH:mm - DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian kết thúc">
                        {dayjs(promotion.endAt).format('HH:mm - DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả chi tiết" span={2}>
                        {promotion.description || "Không có mô tả"}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Block 2: Logic hiển thị danh sách (Điều kiện hoặc Sản phẩm) */}
            <Card>
                {promotion.conditions && promotion.conditions.length > 0 ? (
                    <PromotionConditionsTable data={promotion.conditions} />
                ) : promotion.details && promotion.details.length > 0 ? (
                    <PromotionProductsTable data={promotion.details} />
                ) : (
                    <Alert
                        message="Cảnh báo cấu hình"
                        description="Khuyến mãi này chưa được cấu hình điều kiện hoặc sản phẩm áp dụng."
                        type="warning"
                        showIcon
                    />
                )}
            </Card>
        </Flex>
    );
};

export default PagePromotionDetail;

// ==========================================
// 4. CUSTOM HOOKS & API LOGIC
// ==========================================

