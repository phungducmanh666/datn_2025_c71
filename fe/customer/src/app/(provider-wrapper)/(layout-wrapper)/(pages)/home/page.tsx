"use client";

import { Flex } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface PageHomeProps {}

const PageHome: React.FC<PageHomeProps> = ({}) => {
  const router = useRouter();

  useEffect(() => {
    router.push("/products");
  }, []);

  return (
    <Flex vertical gap={10}>
      {}
    </Flex>
  );
};

export default PageHome;
