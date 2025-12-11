export interface PromotionREQ {
    title: string;
    description: string;
    conditions: PromotionConditionREQ[];
    details: PromotionDetailREQ[];
    startAt: string;
    endAt: string;
}


export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum PromotionStatus {
    ALL = 'ALL',
    DRAFT = 'DRAFT',
    ENABLE = 'ENABLE',
    DISABLE = 'DISABLE',
}

export interface PromotionConditionREQ {
    minimumValue: number;
    discountType: DiscountType;
    discountValue: number;
}

export interface PromotionDetailREQ {
    productUUID: string;
    discountType: DiscountType;
    discountValue: number;
}

export interface PromotionConditionRES {
    id: number;
    minimumValue: number;
    discountType: string;
    discountValue: number;
    promotionId: number;
}

export interface PromotionDetailRES {
    id: number;
    productUUID: string;
    discountType: string;
    discountValue: number;
    promotionId: number;
}


export interface PromotionRES {
    id: number;
    title: string;
    description: string;
    staffUUID: string;
    status: string;
    startAt: string;
    endAt: string;
    CreatedAt: string;
    conditions: PromotionConditionRES[];
    details: PromotionDetailRES[];
}