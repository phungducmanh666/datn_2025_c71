import { useWarehouse } from "@hook/warehouseHook/warehouseHook";
import { Spin } from "antd";
import React from "react";

interface IFWarehouseProps {
  uuid: string;
}

const IFWarehouse: React.FC<IFWarehouseProps> = ({ uuid }) => {
  const { data, isFetching } = useWarehouse(uuid);

  if (isFetching) return <Spin />;
  if (!data) return null;

  return <>{data.name}</>;
};

export default IFWarehouse;
