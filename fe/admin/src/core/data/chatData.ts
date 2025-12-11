export interface ChatRequest {
    userId: string,
    message: string,
}

export interface ChatResponse {
    productUUIDS: string[],
    message: string,
    isShowProduct: boolean
}


export interface EmbeddingVectorData {
    id: string;
    text: string;
}
