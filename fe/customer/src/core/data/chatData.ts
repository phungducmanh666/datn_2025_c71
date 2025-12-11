import { Message } from "@/app/(provider-wrapper)/(layout-wrapper)/(pages)/chat/page";

export interface ChatRequest{
    userId: string,
    message: string,
    history: Message[]
}

export interface ChatResponse{
    productUUIDS: string[],
    message: string,
    isShowProduct: boolean
}