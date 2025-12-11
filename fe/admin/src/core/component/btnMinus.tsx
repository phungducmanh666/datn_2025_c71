import { Button, ButtonProps } from "antd";
import React from "react";
import { BiMinus } from "react-icons/bi";

interface BTNMinusProps extends ButtonProps {}

const BTNMinus: React.FC<BTNMinusProps> = ({ icon, ...props }) => {
  return <Button shape="default" size="small" {...props} icon={<BiMinus />} />;
};

export default BTNMinus;
