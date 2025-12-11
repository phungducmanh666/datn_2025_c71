import { DiscountType, PromotionConditionRES } from '@data/promotionData';
import { useOrderDiscounts } from '@hook/promotionHook/promotionHook';
import { ConvertUtil } from '@util/convertUtil';
import { Divider, Flex, Skeleton, Tag } from 'antd';
import React, { useEffect, useMemo } from 'react';
import LinkPromotion from './linkPromotion';

interface OrderTotalAmountDisplayProps {
    orderTotalAmount: number;
    orderTotalAmountAfterDiscountProducts: number;
    // Callback để truyền dữ liệu lên component cha
    onDiscountDataChange?: (data: {
        totalSaved: number; // Tổng tiền tiết kiệm (bao gồm giảm sản phẩm + giảm đơn)
        totalOrderDiscountAmount: number; // Chỉ giảm từ khuyến mãi đơn hàng
        appliedPromotionConditionIds: number[];
        finalPrice: number;
    }) => void;
}

const calculateSingleDiscountAmount = (baseAmount: number, condition: PromotionConditionRES): number => {
    if (condition.discountType === DiscountType.PERCENTAGE) {
        return baseAmount * (condition.discountValue / 100);
    } else {
        return condition.discountValue;
    }
};

export const calculateTotalDiscount = (baseAmount: number, conditions: PromotionConditionRES[] = []): number => {
    if (!conditions || conditions.length === 0) return 0;
    return conditions.reduce((total, condition) => total + calculateSingleDiscountAmount(baseAmount, condition), 0);
}

const OrderTotalAmountDisplay: React.FC<OrderTotalAmountDisplayProps> = ({
    orderTotalAmount,
    orderTotalAmountAfterDiscountProducts: baseAmountForOrderDiscount,
    onDiscountDataChange
}) => {
    const { data: promotions, isPending } = useOrderDiscounts(baseAmountForOrderDiscount);

    const totalOrderDiscountAmount = useMemo(() => {
        if (!promotions) return 0;
        return calculateTotalDiscount(baseAmountForOrderDiscount, promotions);
    }, [baseAmountForOrderDiscount, promotions]);

    const finalPrice = Math.max(0, baseAmountForOrderDiscount - totalOrderDiscountAmount);
    const totalSaved = orderTotalAmount - finalPrice;

    // Lấy danh sách ID các khuyến mãi được áp dụng
    const appliedPromotionConditionIds = useMemo(() => {
        return promotions?.map(promo => promo.id) || [];
    }, [promotions]);

    // Gửi dữ liệu lên component cha mỗi khi có thay đổi
    useEffect(() => {
        if (!isPending && onDiscountDataChange) {
            onDiscountDataChange({
                totalSaved, // Tổng tiền tiết kiệm (gốc - thành tiền)
                totalOrderDiscountAmount, // Chỉ giảm giá từ khuyến mãi đơn hàng
                appliedPromotionConditionIds: appliedPromotionConditionIds,
                finalPrice
            });
        }
    }, [totalSaved, totalOrderDiscountAmount, appliedPromotionConditionIds, finalPrice, isPending, onDiscountDataChange]);

    if (isPending) return <Skeleton.Input active size="small" />;

    return (
        <div className="flex flex-col items-end w-full">
            <Flex vertical gap={10} className="w-full">
                <div className="flex justify-between text-gray-500 text-sm">
                    <span>Tổng tiền hàng:</span>
                    <span className={orderTotalAmount !== baseAmountForOrderDiscount ? "line-through" : ""}>
                        {ConvertUtil.formatVNCurrency(orderTotalAmount)}
                    </span>
                </div>

                {orderTotalAmount !== baseAmountForOrderDiscount && (
                    <div className="flex justify-between text-gray-800 text-sm font-medium">
                        <span>Tạm tính:</span>
                        <span>{ConvertUtil.formatVNCurrency(baseAmountForOrderDiscount)}</span>
                    </div>
                )}

                {promotions && promotions.length > 0 && (
                    <Tag color='blue' style={{ padding: "10px" }}>
                        <div className="text-xs text-green-800 font-bold mb-1">Khuyến mãi áp dụng:</div>
                        <Flex vertical gap={10}>
                            {promotions.map((promo, index) => {
                                const amount = calculateSingleDiscountAmount(baseAmountForOrderDiscount, promo);
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
                                                <span className="whitespace-nowrap font-semibold">
                                                    (-{ConvertUtil.formatVNCurrency(amount)}) [{promo.id}]
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
                            {ConvertUtil.formatVNCurrency(finalPrice)}
                        </span>
                        {totalSaved > 0 && (
                            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full mt-1">
                                Tiết kiệm: {ConvertUtil.formatVNCurrency(totalSaved)}
                            </span>
                        )}
                    </div>
                </div>
            </Flex>
        </div>
    );
};

export default OrderTotalAmountDisplay;