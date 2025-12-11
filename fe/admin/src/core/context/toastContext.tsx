"use client";

import { message } from "antd";
import React from "react";

let messageApiRef: ReturnType<typeof message.useMessage>[0];

export const getToastApi = () => {
  if (!messageApiRef) throw new Error("Message API chưa sẵn sàng");
  return messageApiRef;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [messageApi, contextHolder] = message.useMessage();
  messageApiRef = messageApi;

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
};
