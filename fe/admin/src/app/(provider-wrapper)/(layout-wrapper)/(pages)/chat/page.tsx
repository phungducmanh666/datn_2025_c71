'use client'

import { RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { ChatResponse } from '@data/chatData';
import { ProductData } from '@data/productData';
import { useChatWithBot } from '@hook/chatHook/chatHook';
import { useProductByIdsMutate } from '@hook/productHook/productHook';
import { LocalstoreageUtil } from '@util/localStorageUtil';
import { Avatar, Card, Flex, Input, Spin, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ProductCard } from '../products/page';


export type Message = {
    role: "user" | "model";
    content: ChatResponse | string;
};
//#region product card
//#endregion
//#region message item

interface MessageItemProps {
    message: Message
}

const MessageItem: React.FC<MessageItemProps> = ({ message: msg }) => {
    const [products, setProducts] = useState<ProductData[]>([]);

    const { mutate: fetchProducts, isPending } = useProductByIdsMutate((fetchedProducts) => {
        setProducts(fetchedProducts);
    });

    const isUser = msg.role === "user";
    const isModelResponse = !isUser && typeof msg.content === "object";

    const chatResponse = isModelResponse ? (msg.content as ChatResponse) : null;
    const productIds = chatResponse?.productUUIDS ?? [];
    const isShowProduct = chatResponse?.isShowProduct ?? false;
    const contentText = typeof msg.content === "string" ? msg.content : chatResponse?.message ?? "";

    useEffect(() => {
        if (isShowProduct && productIds.length > 0) {
            fetchProducts(productIds);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isShowProduct, productIds]);

    const shouldShowProducts = isShowProduct && products.length > 0;

    return (
        <Flex
            gap={10}
            vertical
            className={`w-full ${isUser ? "items-end" : "items-start"}`}
        >
            <Flex gap={10} className={`w-full ${isUser ? "justify-end" : "justify-start"}`}>
                {/* Avatar bot */}
                {!isUser && (
                    <Avatar
                        size="large"
                        icon={<RobotOutlined />}
                        className="bg-blue-100 text-blue-600"
                    />
                )}

                {/* Tin nhắn */}
                <div
                    className={`
                        p-3 rounded-lg max-w-[70%]
                        ${isUser
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-white border border-gray-200 text-black rounded-bl-none"
                        }
                    `}
                >
                    {/* Nội dung text */}
                    <Typography.Text className={isUser ? "text-white" : "text-black"}>
                        {contentText}
                    </Typography.Text>

                    {/* Loading khi đang fetch */}
                    {isPending && (
                        <Flex justify="center" className="mt-3">
                            <Spin />
                        </Flex>
                    )}

                    {/* Danh sách sản phẩm */}
                    {shouldShowProducts && (
                        <div
                            className="mt-3 overflow-x-auto pb-2"
                            style={{
                                scrollbarWidth: "thin",
                                scrollbarColor: "#a0a0a0 #f0f0f0",
                            }}
                        >
                            <Flex gap={10}>
                                {products.map((product) => (
                                    <ProductCard key={product.uuid} data={product} size="small" />
                                ))}
                            </Flex>
                        </div>
                    )}
                </div>

                {/* Avatar user */}
                {isUser && <Avatar size="large" icon={<UserOutlined />} />}
            </Flex>
        </Flex>
    );
};

//#endregion

interface ChatPageProps {
}


const ChatPage: React.FC<ChatPageProps> = ({ }) => {

    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [message, setMessage] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState<string>("");
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // FIX: Sửa lại onSuccess để cập nhật state một cách bất biến
    const { mutate: chatMutate, isPending: isChatPending } = useChatWithBot((data) => {
        const modelMessage: Message = { role: "model", content: data };
        setMessage(prevMessages => [...prevMessages, modelMessage]);
    });

    // Lấy userId khi component mount
    useEffect(() => {
        const staff = LocalstoreageUtil.getStaff();
        if (!!!staff) {
            const newUserId = uuidv4();
            // Bạn có thể muốn lưu newUserId này vào localStorage ở đây
            setUserId(newUserId);
            return;
        }
        setUserId(staff.uuid);
    }, []);


    useEffect(() => {
        setMessage(LocalstoreageUtil.getMessages() || []);
    }, []);

    // Tự động cuộn xuống tin nhắn cuối cùng
    useEffect(() => {
        if (messagesContainerRef.current) {
            // Scroll xuống cuối vùng chứa message
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }

        LocalstoreageUtil.setMessages(message);

    }, [message]);


    const handleSend = () => {
        const trimmedMessage = currentMessage.trim();
        if (!trimmedMessage || !userId || isChatPending) {
            return;
        }

        // 1. Thêm tin nhắn của user vào state (cập nhật UI ngay lập tức)
        const userMessage: Message = { role: "user", content: trimmedMessage };
        setMessage(prevMessages => [...prevMessages, userMessage]);

        // 2. Gửi request đến bot
        chatMutate({
            userId: userId,
            message: trimmedMessage
        });

        // 3. Xóa nội dung ô input
        setCurrentMessage("");
    };

    return (
        <Flex vertical className="p-4 bg-gray-100" style={{
            height: "500px",
            maxHeight: "90%"
        }}>

            {/* 1. Khu vực hiển thị tin nhắn */}
            <Card className="flex-1 overflow-y-auto mb-4" ref={messagesContainerRef}>
                <Flex vertical gap={16}>
                    {message.map((msg, index) => {
                        return <MessageItem message={msg} key={index} />
                    })}
                    {/* Element rỗng để tham chiếu cho việc cuộn */}
                    {/* <div ref={messagesEndRef} /> */}
                </Flex>
            </Card>

            {/* 2. Khu vực nhập liệu và gửi */}
            <Flex>
                <Input.Search
                    placeholder="Nhập tin nhắn..."
                    enterButton={<SendOutlined />}
                    size="large"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onSearch={handleSend} // Kích hoạt khi nhấn Enter hoặc click nút
                    loading={isChatPending} // Hiển thị loading trên nút
                    disabled={isChatPending || !userId} // Vô hiệu hóa khi đang gửi hoặc chưa có userId
                    onPressEnter={(e) => {
                        if (!e.shiftKey) { // Cho phép Shift+Enter để xuống dòng
                            e.preventDefault();
                        }
                    }}
                />
            </Flex>
        </Flex>
    );
};

export default ChatPage;