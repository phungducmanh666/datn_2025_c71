import { ProductData } from '@data/productData';
import { PromotionDetailRES } from '@data/promotionData';
import { useProductDiscounts } from '@hook/promotionHook/promotionHook';
import { ConvertUtil } from '@util/convertUtil';
import { Flex } from 'antd';
import React, { useEffect, useMemo } from 'react';
import LinkPromotion from './linkPromotion';

export interface DiscountInfo {
    finalPrice: number;
    hasDiscount: boolean;
    discountLabel: string
    savedAmount: number;
    discountId: number;
    promotionId: number;
}

export const calculatePriceInfo = (product: ProductData, discounts?: PromotionDetailRES[]) => {
    let finalPrice = product.price;
    let hasDiscount = false;
    let discountLabel = "";
    let savedAmount = 0;
    let discountId = -1;
    let promotionId = -1;

    if (discounts && discounts.length > 0) {
        let maxDiscountAmount = 0;
        discounts.forEach((d) => {
            const currentAmount = d.discountType === "PERCENTAGE"
                ? (product.price * d.discountValue) / 100
                : d.discountValue;

            if (currentAmount > maxDiscountAmount) {
                maxDiscountAmount = currentAmount;
                discountLabel = d.discountType === "PERCENTAGE" ? `-${d.discountValue}%` : `-${ConvertUtil.formatVNCurrency(d.discountValue)}`;
                promotionId = d.promotionId;
                discountId = d.id;
            }
        });

        if (maxDiscountAmount > 0) {
            finalPrice = product.price - maxDiscountAmount;
            if (finalPrice < 0) finalPrice = 0;
            hasDiscount = true;
            savedAmount = maxDiscountAmount;
        }
    }
    return { finalPrice, hasDiscount, discountLabel, savedAmount, discountId, promotionId };
}

interface ProductPriceInfoProps {
    product: ProductData;
    onGetPriceInfo?: (data: DiscountInfo) => any
}

const ProductPriceInfo: React.FC<ProductPriceInfoProps> = ({ product, onGetPriceInfo }) => {

    const { data: discounts } = useProductDiscounts(product.uuid);
    const priceInfo = useMemo(() => calculatePriceInfo(product, discounts), [discounts]);

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

export default ProductPriceInfo;