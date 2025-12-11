'use client';

import {
    MinusCircleOutlined,
    PlusOutlined
} from '@ant-design/icons';
// --- IMPORTS ---
// Giữ nguyên các import của bạn, thay đổi đường dẫn nếu cần
import FMProductSelection from '@component/fmProductSelection';
import ImageSever from '@component/imageServer';
import InputCurrency from '@component/inputCurrency';
import InputVietNamNumber2 from '@component/inputNumber2';
import { getToastApi } from '@context/toastContext';
import { ProductData } from '@data/productData';
import { DiscountType } from '@data/promotionData';
import { useCreatePromotion } from '@hook/promotionHook/promotionHook';
import { ConvertUtil } from '@util/convertUtil';
import {
    Alert,
    Button,
    Card,
    DatePicker,
    Flex,
    Form,
    Input,
    Radio,
    Select,
    Space,
    Typography
} from 'antd';
import dayjs from 'dayjs'; // Cần import dayjs để xử lý disabledDate
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// --- 1. CONSTANTS & ENUMS ---


const DISCOUNT_OPTIONS = [
    { label: 'Phần trăm (%)', value: DiscountType.PERCENTAGE },
    { label: 'Số tiền cố định (VND)', value: DiscountType.FIXED_AMOUNT },
];

enum PromotionScope {
    ORDER_LEVEL = 'ORDER_LEVEL',
    PRODUCT_LEVEL = 'PRODUCT_LEVEL'
}

// --- 2. VALIDATION RULES (Tách ra để tái sử dụng) ---

// Rule: Giá trị >= 0
const ruleMinZero = [
    { required: true, message: 'Vui lòng nhập giá trị' },
    {
        validator: (_: any, value: any) => {
            if (value === undefined || value === null || value === '') return Promise.reject(new Error('Bắt buộc'));
            // Parse về number để so sánh chắc chắn
            if (Number(value) >= 0) return Promise.resolve();
            return Promise.reject(new Error('Phải lớn hơn hoặc bằng 0'));
        }
    }
];

// Rule: Giá trị > 0 (Không cho phép 0 hoặc số âm)
const ruleGreaterThanZero = [
    { required: true, message: 'Vui lòng nhập mức giảm' },
    {
        validator: (_: any, value: any) => {
            if (value === undefined || value === null || value === '') return Promise.reject(new Error('Bắt buộc'));
            if (Number(value) > 0) return Promise.resolve();
            return Promise.reject(new Error('Phải lớn hơn 0'));
        }
    }
];

// --- 3. SUB-COMPONENTS ---

/** * Phần 1: Thông tin cơ bản 
 */
const BasicInfoSection: React.FC = () => (
    <Card title="1. Thông tin chương trình" size="small" className="shadow-sm">
        <Flex vertical gap={16}>
            <Form.Item
                name="title"
                label="Tên chương trình"
                rules={[{ required: true, message: 'Vui lòng nhập tên chương trình' }]}
            >
                <Input placeholder="Ví dụ: Siêu sale 11/11" />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={2} placeholder="Mô tả chi tiết..." />
            </Form.Item>

            <Form.Item
                name="dateRange"
                label="Thời gian áp dụng"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
            >
                <DatePicker.RangePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    className="w-full"
                    placeholder={['Bắt đầu', 'Kết thúc']}
                    // Ngăn chọn ngày trong quá khứ (tùy chọn)
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
            </Form.Item>
        </Flex>
    </Card>
);

/** * Phần 2: Điều kiện theo Đơn hàng
 */
const OrderConditionSection: React.FC = () => (
    <Card title="Chi tiết điều kiện đơn hàng" size="small" className="shadow-sm border-blue-100 bg-blue-50/20">
        <Typography.Text type="secondary" className="block mb-4 italic">
            Ví dụ: Đơn từ 500k giảm 50k, Đơn từ 1 triệu giảm 10%.
        </Typography.Text>

        <Form.List name="conditions">
            {(fields, { add, remove }) => (
                <Flex vertical gap={12}>

                    {fields.length === 0 && (
                        <Alert
                            message="Chưa có điều kiện nào"
                            description="Vui lòng nhấn nút 'Thêm mức điều kiện' bên dưới để thiết lập giảm giá."
                            type="warning"
                            showIcon
                            className="mb-2"
                        />
                    )}

                    {fields.map(({ key, name, ...restField }) => (
                        <Card key={key} size="small" className="bg-white border-gray-200">
                            <Flex gap={12} align="start" wrap="wrap">
                                {/* Rule: >= 0 */}
                                <Form.Item
                                    {...restField}
                                    name={[name, 'minimumValue']}
                                    label="Đơn tối thiểu"
                                    rules={ruleMinZero}
                                    className="flex-1 min-w-[200px] mb-0"
                                >
                                    <InputCurrency placeholder="Nhập giá trị đơn" />
                                </Form.Item>

                                <Form.Item
                                    {...restField}
                                    name={[name, 'discountType']}
                                    label="Loại giảm"
                                    initialValue={DiscountType.PERCENTAGE}
                                    className="w-[180px] mb-0"
                                >
                                    <Select options={DISCOUNT_OPTIONS} />
                                </Form.Item>

                                {/* Rule: > 0 */}
                                <Form.Item
                                    {...restField}
                                    name={[name, 'discountValue']}
                                    label="Giá trị giảm"
                                    rules={ruleGreaterThanZero}
                                    className="flex-1 min-w-[200px] mb-0"
                                >
                                    <InputVietNamNumber2 placeholder="Nhập mức giảm" />
                                </Form.Item>

                                <Button
                                    type="text"
                                    danger
                                    icon={<MinusCircleOutlined />}
                                    onClick={() => remove(name)}
                                    className="mt-8"
                                />
                            </Flex>
                        </Card>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Thêm mức điều kiện
                    </Button>
                </Flex>
            )}
        </Form.List>
    </Card>
);

/** * Phần 3: Chi tiết theo Sản phẩm
 */
interface ProductDetailSectionProps {
    onOpenModal: () => void;
}



const ProductDetailSection: React.FC<ProductDetailSectionProps> = ({ onOpenModal }) => {

    const calculateDiscountedPrice = (originalPrice: number, type: string, value: number) => {
        if (!originalPrice) return 0;
        const numValue = Number(value) || 0;

        if (type === DiscountType.PERCENTAGE) {
            return originalPrice * (1 - numValue / 100);
        } else {
            return originalPrice - numValue;
        }
    };
    return <Card
        title="Chi tiết sản phẩm khuyến mãi"
        size="small"
        className="shadow-sm border-green-100 bg-green-50/20"
        extra={
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={onOpenModal}>
                Chọn sản phẩm
            </Button>
        }
    >
        <Form.List name="details">
            {(fields, { remove }) => (
                <div className="flex flex-col gap-3">
                    {fields.map(({ key, name, ...restField }) => (
                        <Card key={key} size="small" className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                            <Flex align="start" gap={16} wrap="wrap"> {/* Align start để input và ảnh căn đỉnh trên */}

                                {/* A. INFO SẢN PHẨM */}
                                <Form.Item
                                    shouldUpdate={(prev, curr) =>
                                        prev.details?.[name]?._ui_photo !== curr.details?.[name]?._ui_photo ||
                                        prev.details?.[name]?._ui_name !== curr.details?.[name]?._ui_name
                                    }
                                    noStyle
                                >
                                    {({ getFieldValue }) => {
                                        const details = getFieldValue('details') || [];
                                        const item = details[name] || {};
                                        return (
                                            <Flex flex={1} gap={12} align="center" style={{ minWidth: '250px' }}>
                                                <ImageSever size={"small"} src={item._ui_photo} />
                                                <div className="flex flex-col">
                                                    <Typography.Text strong ellipsis style={{ maxWidth: 200 }}>
                                                        {item._ui_name || 'Sản phẩm'}
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                                                        UUID: {item.productUUID?.substring(0, 8)}...
                                                    </Typography.Text>
                                                    {/* Hiển thị giá gốc tĩnh */}
                                                    <Typography.Text type="secondary" delete className="text-xs mt-1">
                                                        Gốc: {ConvertUtil.formatVNCurrency(item._ui_price)}
                                                    </Typography.Text>
                                                </div>
                                            </Flex>
                                        );
                                    }}
                                </Form.Item>

                                {/* HIDDEN FIELDS: Nhớ thêm _ui_price vào đây */}
                                <Form.Item name={[name, 'productUUID']} hidden><Input /></Form.Item>
                                <Form.Item name={[name, '_ui_name']} hidden><Input /></Form.Item>
                                <Form.Item name={[name, '_ui_photo']} hidden><Input /></Form.Item>
                                <Form.Item name={[name, '_ui_price']} hidden><Input /></Form.Item>

                                {/* B. INPUTS & CALCULATION */}
                                <div className="flex flex-1 flex-col min-w-[300px]">
                                    <Flex gap={10} align="start">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'discountType']}
                                            label="Loại giảm"
                                            initialValue={DiscountType.PERCENTAGE}
                                            className="w-[160px] mb-2" // Giảm margin bottom để chừa chỗ cho text hiển thị
                                        >
                                            <Select options={DISCOUNT_OPTIONS} />
                                        </Form.Item>

                                        {/* Rule: > 0 VÀ Check giá sau giảm > 0 */}
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'discountValue']}
                                            label="Giá trị"
                                            className="flex-1 mb-2"
                                            dependencies={[['details', name, 'discountType'], ['details', name, '_ui_price']]} // Re-run validator khi các field này đổi
                                            rules={[
                                                { required: true, message: 'Bắt buộc' },
                                                {
                                                    validator: (_, value) => {
                                                        if (Number(value) <= 0) return Promise.reject('Phải lớn hơn 0');
                                                        return Promise.resolve();
                                                    }
                                                },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        const type = getFieldValue(['details', name, 'discountType']);
                                                        const price = getFieldValue(['details', name, '_ui_price']);

                                                        const finalPrice = calculateDiscountedPrice(price, type, value);

                                                        if (finalPrice <= 0) {
                                                            return Promise.reject(new Error('Giá sau giảm không hợp lệ (<= 0)'));
                                                        }
                                                        return Promise.resolve();
                                                    },
                                                }),
                                            ]}
                                        >
                                            <InputVietNamNumber2 placeholder="Nhập mức giảm" />
                                        </Form.Item>

                                        <Button
                                            type="text"
                                            danger
                                            icon={<MinusCircleOutlined />}
                                            onClick={() => remove(name)}
                                            className="mt-8"
                                        />
                                    </Flex>

                                    {/* C. HIỂN THỊ GIÁ SAU GIẢM (DYNAMIC) */}
                                    <Form.Item
                                        shouldUpdate={(prev, curr) => {
                                            const prevItem = prev.details?.[name];
                                            const currItem = curr.details?.[name];
                                            return (
                                                prevItem?.discountValue !== currItem?.discountValue ||
                                                prevItem?.discountType !== currItem?.discountType ||
                                                prevItem?._ui_price !== currItem?._ui_price
                                            );
                                        }}
                                        noStyle
                                    >
                                        {({ getFieldValue }) => {
                                            const type = getFieldValue(['details', name, 'discountType']);
                                            const val = getFieldValue(['details', name, 'discountValue']);
                                            const price = getFieldValue(['details', name, '_ui_price']);

                                            const finalPrice = calculateDiscountedPrice(price, type, val);
                                            const isValid = finalPrice > 0;

                                            return (
                                                <div className="text-right pr-10">
                                                    <Typography.Text className="text-xs mr-2">Sau giảm:</Typography.Text>
                                                    <Typography.Text
                                                        strong
                                                        type={isValid ? 'success' : 'danger'}
                                                        className="text-base"
                                                    >
                                                        {ConvertUtil.formatVNCurrency(finalPrice)}
                                                    </Typography.Text>
                                                </div>
                                            );
                                        }}
                                    </Form.Item>
                                </div>
                            </Flex>
                        </Card>
                    ))}

                    {fields.length === 0 && (
                        <Alert
                            message="Chưa có sản phẩm nào được chọn"
                            type="warning"
                            showIcon
                            className="mb-2"
                        />
                    )}
                </div>
            )}
        </Form.List>
    </Card>
}

// --- 4. MAIN COMPONENT ---

const PromotionCreatePage: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [openProductModal, setOpenProductModal] = useState(false);
    const scope = Form.useWatch('scope', form);
    const router = useRouter();

    const { mutate: createPromotion, isPending: isCreating } = useCreatePromotion((data) => router.push(`/promotions/${data.id}`));

    // Xử lý chọn sản phẩm
    const handleProductsSelected = (selectedProducts: ProductData[]) => {
        const currentDetails = form.getFieldValue('details') || [];
        const currentIds = new Set(currentDetails.map((d: any) => d.productUUID));

        const newItems = selectedProducts
            .filter(p => !currentIds.has(p.uuid))
            .map(product => ({
                productUUID: product.uuid,
                discountType: DiscountType.PERCENTAGE,
                discountValue: 0, // Giá trị mặc định (sẽ bị validator bắt nếu user ko sửa)
                _ui_price: product.price,
                _ui_name: product.name,
                _ui_photo: product.photoUrl
            }));

        if (newItems.length === 0) {
            if (selectedProducts.length > 0) getToastApi().warning("Các sản phẩm đã chọn đều đã tồn tại!");
        } else {
            form.setFieldValue('details', [...currentDetails, ...newItems]);
            getToastApi().success(`Đã thêm ${newItems.length} sản phẩm.`);
        }
        setOpenProductModal(false);
    };

    // Submit
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const { dateRange, scope, conditions, details, description, ...rest } = values;

            // Kiểm tra DateRange (Mặc định component RangePicker đã chặn End < Start)
            // Code này chỉ để chắc chắn 100% về mặt logic data
            if (dateRange && dateRange[1].isBefore(dateRange[0])) {
                getToastApi().error('Thời gian kết thúc không thể nhỏ hơn thời gian bắt đầu');
                setLoading(false); return;
            }

            const cleanDetails = details?.map((d: any) => ({
                productUUID: d.productUUID,
                discountType: d.discountType,
                discountValue: d.discountValue
            })) || [];

            const payload = {
                ...rest,
                startAt: dateRange ? dateRange[0].toISOString() : null,
                endAt: dateRange ? dateRange[1].toISOString() : null,
                conditions: scope === PromotionScope.ORDER_LEVEL ? conditions : [],
                details: scope === PromotionScope.PRODUCT_LEVEL ? cleanDetails : [],
                description: description || ""
            };

            if (scope === PromotionScope.ORDER_LEVEL && (!payload.conditions || payload.conditions.length === 0)) {
                getToastApi().error('Vui lòng thêm ít nhất một mức điều kiện');
                setLoading(false); return;
            }
            if (scope === PromotionScope.PRODUCT_LEVEL && (!payload.details || payload.details.length === 0)) {
                getToastApi().error('Vui lòng chọn ít nhất một sản phẩm');
                setLoading(false); return;
            }

            console.log('Payload Final:', payload);

            createPromotion(payload);

            // await api.create(payload);
            getToastApi().success('Tạo chương trình thành công');



        } catch (error) {
            console.error(error);
            getToastApi().error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex vertical gap={24}>
            <Flex justify="space-between" align="center" className="mb-6">
                <Typography.Title level={2} style={{ margin: 0 }}>Tạo mới khuyến mãi</Typography.Title>
            </Flex>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    scope: PromotionScope.ORDER_LEVEL,
                    conditions: [{}],
                    details: []
                }}
            >
                <Flex vertical gap={24}>
                    <BasicInfoSection />

                    <Card size="small" title="2. Hình thức khuyến mãi" className="shadow-sm">
                        <Form.Item name="scope" className="mb-0">
                            <Radio.Group buttonStyle="solid" className="w-full flex">
                                <Radio.Button value={PromotionScope.ORDER_LEVEL} className="flex-1 text-center py-1 h-auto">
                                    <div className="font-semibold">Theo tổng đơn hàng</div>
                                    <div className="text-xs text-gray-400">Giảm giá dựa trên tổng tiền thanh toán</div>
                                </Radio.Button>
                                <Radio.Button value={PromotionScope.PRODUCT_LEVEL} className="flex-1 text-center py-1 h-auto">
                                    <div className="font-semibold">Theo từng sản phẩm</div>
                                    <div className="text-xs text-gray-400">Giảm giá trên các sản phẩm được chọn</div>
                                </Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    </Card>

                    {scope === PromotionScope.ORDER_LEVEL ? (
                        <OrderConditionSection />
                    ) : (
                        <ProductDetailSection onOpenModal={() => setOpenProductModal(true)} />
                    )}
                </Flex>
            </Form>

            <FMProductSelection
                open={openProductModal}
                onCancle={() => setOpenProductModal(false)}
                onSelected={handleProductsSelected}
                onlyActiveProduct={true}
            />

            <Space>
                <Button>Hủy bỏ</Button>
                <Button type="primary" onClick={() => form.submit()} loading={loading || isCreating}>
                    Hoàn tất
                </Button>
            </Space>
        </Flex>
    );
};

export default PromotionCreatePage;