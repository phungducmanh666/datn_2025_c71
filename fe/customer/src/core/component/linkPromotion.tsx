import { usePromotion } from "@hook/promotionHook/promotionHook";
import { Button, Flex } from "antd";
import { useRouter } from "next/navigation";
import React from "react";
import { FaLink } from "react-icons/fa";


interface LinkPromotionProps {
  id: number
}

const LinkPromotion: React.FC<LinkPromotionProps> = ({
  id
}) => {

  const router = useRouter();

  const { data: promotion } = usePromotion(id);

  if (!promotion) return <></>

  return (
    <Flex gap={10}>
      <Button
        shape="round"
        type="link"
        size="small"
        icon={<FaLink />}
        onClick={() => {
          router.push(`/promotions/${id}`);
        }}
        style={{ maxWidth: 150, padding: 0 }} // tuỳ chỉnh chiều rộng tối đa
      >
        <span
          style={{
            display: "inline-block",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {promotion.title}
        </span>
      </Button>

    </Flex>
  );
};

export default LinkPromotion;
