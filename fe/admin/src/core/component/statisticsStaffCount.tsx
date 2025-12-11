import { useStaffCountStatistics } from "@hook/userHook/staffHook";
import { Flex } from "antd";
import Title from "antd/es/typography/Title";
import React from "react";
import { RiCustomerService2Line } from "react-icons/ri";
import StatisticsCountBase from "./statisticsCountBase";

interface StatisticsStaffCountProps {}

const StatisticsStaffCount: React.FC<StatisticsStaffCountProps> = ({}) => {
  const { data, isFetching } = useStaffCountStatistics();

  return (
    <StatisticsCountBase
      title={
        <Flex gap={10} align="center">
          <RiCustomerService2Line fontSize={"2rem"} />
          <Title level={5}>Nhân viên</Title>
        </Flex>
      }
      total={data}
    />
  );
};

export default StatisticsStaffCount;
