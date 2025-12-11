import { useProductStatusStatistics } from "@hook/productHook/productHook";
import { Flex } from "antd";
import Title from "antd/es/typography/Title";
import React, { useMemo } from "react";
import { FaProductHunt } from "react-icons/fa6";
import StatisticsCountBase from "./statisticsCountBase";

interface StatisticsProductCountProps {}

const StatisticsProductCount: React.FC<StatisticsProductCountProps> = ({}) => {
  const { data, isFetching } = useProductStatusStatistics();

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
          <FaProductHunt fontSize={"2rem"} />
          <Title level={5}>Sản phẩm</Title>
        </Flex>
      }
      total={total}
    />
  );
};

export default StatisticsProductCount;
