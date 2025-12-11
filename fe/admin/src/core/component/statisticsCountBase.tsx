import { Flex } from "antd";
import Title from "antd/es/typography/Title";
import React from "react";

interface StatisticsCountBaseProps {
  title: React.ReactNode;
  total?: number;
}

const StatisticsCountBase: React.FC<StatisticsCountBaseProps> = ({
  title,
  total,
}) => {
  return (
    <Flex vertical gap={10}>
      {title}
      <Flex gap={10} justify="start">
        <Title level={2}>{total}</Title>
      </Flex>
    </Flex>
  );
};

export default StatisticsCountBase;
