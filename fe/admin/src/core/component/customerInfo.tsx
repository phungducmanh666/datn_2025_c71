import { useCustomer } from "@hook/userHook/customerHook";
import React from "react";

interface CustomerInfoProps {
  uuid: string;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ uuid }) => {
  const { data } = useCustomer(uuid);

  if (!uuid) return <>Ẩn danh</>;

  return <>{data && `${data.firstName} ${data.lastName}`}</>;
};

export default CustomerInfo;
