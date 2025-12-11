import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import { useRouter } from "next/navigation";
import React from "react";
import { BsGraphUp } from "react-icons/bs";

interface BTNStatisticsProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNStatistics: React.FC<BTNStatisticsProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  ...props
}) => {
  const router = useRouter();

  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "Xem thống kê đơn hàng chi tiết"}
      color={toolTipColor ? toolTipColor : "blue"}
    >
      <Button
        size="small"
        type="primary"
        {...props}
        icon={<BsGraphUp />}
        onClick={() => router.push("/statistics")}
      />
    </Tooltip>
  );
};

export default BTNStatistics;
