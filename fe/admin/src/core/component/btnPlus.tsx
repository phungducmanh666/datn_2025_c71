import { Button, ButtonProps } from "antd";
import React from "react";
import { FaPlus } from "react-icons/fa6";

interface BTNPlusProps extends ButtonProps {}

const BTNPlus: React.FC<BTNPlusProps> = ({ icon, ...props }) => {
  return <Button shape="default" size="small" {...props} icon={<FaPlus />} />;
};

export default BTNPlus;
