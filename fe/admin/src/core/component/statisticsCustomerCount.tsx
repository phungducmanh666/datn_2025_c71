import { useCustomerCountStatistics } from "@hook/userHook/customerHook";
import { Flex } from "antd";
import Title from "antd/es/typography/Title";
import React from "react";
import { FaUser } from "react-icons/fa6";
import StatisticsCountBase from "./statisticsCountBase";

interface StatisticsCustomerCountProps {}

const StatisticsCustomerCount: React.FC<
  StatisticsCustomerCountProps
> = ({}) => {
  const { data, isFetching } = useCustomerCountStatistics();

  return (
    <StatisticsCountBase
      title={
        <Flex gap={10} align="center">
          <FaUser fontSize={"2rem"} />
          <Title level={5}>Khách hàng</Title>
        </Flex>
      }
      total={data}
    />
  );
};

export default StatisticsCustomerCount;
