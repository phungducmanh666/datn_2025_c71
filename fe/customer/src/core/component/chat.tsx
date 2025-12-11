import ChatPage from "@/app/(provider-wrapper)/(layout-wrapper)/(pages)/chat/page";
import { useChat } from "@context/chatContext";
import { Button, Flex, theme } from "antd";
import { useRouter } from "next/navigation";
import React from "react";
import { CgClose } from "react-icons/cg";

interface ChatProps {}

const Chat: React.FC<ChatProps> = ({}) => {
  const router = useRouter();

  const { open, closeChat, openChat } =
    useChat();

  const { token } = theme.useToken();

  return (
    <>
      {open &&  (
          <Flex vertical  style={{width: "100%"}} justify="end" align="end">
          <Flex justify="end" style={{backgroundColor: "blue", width: "100%", padding: "5px"}} >
            <Button icon={<CgClose />} onClick={() => closeChat()} />
          </Flex>
          <ChatPage />
        </Flex>
      )}
    </>
  );
};

export default Chat;
