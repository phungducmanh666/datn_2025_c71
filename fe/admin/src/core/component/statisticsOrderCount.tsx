import { useOrderStatusStatistics } from "@hook/orderHook/orderHook";
import { Flex } from "antd";
import Title from "antd/es/typography/Title";
import React, { useMemo } from "react";
import { FaShoppingCart } from "react-icons/fa";
import StatisticsCountBase from "./statisticsCountBase";

interface StatisticsOrderCountProps {}

const StatisticsOrderCount: React.FC<StatisticsOrderCountProps> = ({}) => {
  const { data, isFetching } = useOrderStatusStatistics();

  const total = useMemo(() => {
    if (!data) return 0;
    let t = 0;
    data.map((item) => (t += item.number));
    return t;
  }, [data]);

  return (
    <StatisticsCountBase
      title={
        <Flex gap={10} align="center">
          <FaShoppingCart fontSize={"2rem"} />
          <Title level={5}>Đơn hàng</Title>
        </Flex>
      }
      total={total}
    />
  );
};

export default StatisticsOrderCount;
