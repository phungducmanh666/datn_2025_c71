import { OrderProduct } from '@hook/orderHook/orderHook';
import { usePromotionDetail } from '@hook/promotionHook/promotionDetailHook';
import { ConvertUtil } from '@util/convertUtil';
import { Flex } from 'antd';
import React, { useEffect, useMemo } from 'react';
import { calculatePriceInfo } from './infoPrice';
import LinkPromotion from './linkPromotion';

export interface DiscountInfo {
    finalPrice: number;
    hasDiscount: boolean;
    discountLabel: string
    savedAmount: number;
    discountId: number;
    promotionId: number;
}

interface OrderItemPriceInfoProps {
    product: OrderProduct;
    onGetPriceInfo?: (data: DiscountInfo) => any
}

const OrderItemPriceInfo: React.FC<OrderItemPriceInfoProps> = ({ product, onGetPriceInfo }) => {

    const { data: discount } = usePromotionDetail(product.discountId);
    const priceInfo = useMemo(() => calculatePriceInfo(product, discount ? [discount] : []), [discount]);

    useEffect(() => {
        onGetPriceInfo?.(priceInfo);
    }, [priceInfo]);

    return <Flex vertical gap={10} align="start">
        <div className="mt-1">
            {priceInfo.hasDiscount ? (
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                        {/* Giá mới: Đỏ, Đậm, To */}
                        <span className="text-xl font-bold text-red-600">
                            {ConvertUtil.formatVNCurrency(priceInfo.finalPrice)}
                        </span>
                        {/* Giá cũ: Xám, Nhỏ, Gạch ngang */}
                        <span className="text-xs text-gray-400 line-through decoration-gray-400">
                            {ConvertUtil.formatVNCurrency(product.price)}
                        </span>
                    </div>

                    {/* Badge tiết kiệm tiền: Nền đỏ nhạt, chữ đỏ */}
                    <div className="flex items-center mt-1">
                        <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                            {priceInfo.discountLabel}
                        </span>
                    </div>

                    {/* Badge tiết kiệm tiền: Nền đỏ nhạt, chữ đỏ */}
                    <div className="flex items-center mt-1">
                        <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                            Tiết kiệm {ConvertUtil.formatVNCurrency(priceInfo.savedAmount)}
                        </span>
                    </div>
                </div>
            ) : (
                // Trường hợp không giảm giá
                <div className="h-[52px] flex items-start pt-1">
                    <span className="text-lg font-bold text-gray-900">
                        {ConvertUtil.formatVNCurrency(product?.price)}
                    </span>
                </div>
            )}
        </div>
        {priceInfo.hasDiscount && <LinkPromotion id={priceInfo.promotionId} />}
    </Flex>

};

export default OrderItemPriceInfo;