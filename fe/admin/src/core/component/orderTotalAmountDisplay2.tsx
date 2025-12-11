import { OrderData } from '@data/orderData';
import { DiscountType } from '@data/promotionData';
import { usePromotionConditions } from '@hook/promotionHook/promotionConditionHook';
import { ConvertUtil } from '@util/convertUtil';
import { Divider, Flex, Skeleton, Tag } from 'antd';
import React, { useMemo } from 'react';
import LinkPromotion from './linkPromotion';

interface OrderTotalAmountDisplay2Props {
    orderData: OrderData
}

const OrderTotalAmountDisplay2: React.FC<OrderTotalAmountDisplay2Props> = ({
    orderData
}) => {
    const { data: promotions, isPending } = usePromotionConditions(orderData.discounts.map(d => d.discountId));

    // Lấy danh sách ID các khuyến mãi được áp dụng
    const appliedPromotionConditionIds = useMemo(() => {
        return promotions?.map(promo => promo.id) || [];
    }, [promotions]);

    if (isPending) return <Skeleton.Input active size="small" />;

    return (
        <div className="flex flex-col items-end w-full">
            <Flex vertical gap={10} className="w-full">
                <div className="flex justify-between text-gray-500 text-sm">
                    <span>Tổng tiền hàng:</span>
                    <span className={orderData.totalSaved > 0 ? "line-through" : ""}>
                        {ConvertUtil.formatVNCurrency(orderData.totalAmount)}
                    </span>
                </div>


                {promotions && promotions.length > 0 && (
                    <Tag color='blue' style={{ padding: "10px" }}>
                        <div className="text-xs text-green-800 font-bold mb-1">Khuyến mãi áp dụng:</div>
                        <Flex vertical gap={10}>
                            {promotions.map((promo, index) => {
                                return (
                                    <Tag color='orange' key={index}>
                                        <Flex vertical gap={5}>
                                            <Flex gap={10}>
                                                <span>
                                                    {(promo.discountType === DiscountType.PERCENTAGE
                                                        ? `Giảm ${promo.discountValue}% đơn từ ${ConvertUtil.formatVNCurrency(promo.minimumValue || 0)}`
                                                        : `Giảm ${ConvertUtil.formatVNCurrency(promo.discountValue)} đơn từ ${ConvertUtil.formatVNCurrency(promo.minimumValue || 0)}`
                                                    )}
                                                </span>
                                            </Flex>
                                            <LinkPromotion id={promo.promotionId} />
                                        </Flex>
                                    </Tag>
                                );
                            })}
                        </Flex>
                    </Tag>
                )}

                <Divider className="my-2" />

                <div className="flex justify-between items-end">
                    <div className="text-gray-600 font-medium pb-1">Thành tiền:</div>
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-red-600">
                            {ConvertUtil.formatVNCurrency(orderData.totalAmount - orderData.totalSaved)}
                        </span>
                        {orderData.totalSaved > 0 && (
                            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full mt-1">
                                Tiết kiệm: {ConvertUtil.formatVNCurrency(orderData.totalSaved)}
                            </span>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
};

export default OrderTotalAmountDisplay2;