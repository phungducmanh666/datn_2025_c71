import type { InputNumberProps } from "antd";
import { InputNumber } from "antd";
import React from "react";

type inputNumber2Props = InputNumberProps<number>;

const inputNumber2: React.FC<inputNumber2Props> = (props) => {
  const { value, onChange, ...rest } = props;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedControlKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ];

    const isCtrlA = e.key === "a" && (e.ctrlKey || e.metaKey);
    const isNumberKey = /^[0-9.]$/.test(e.key);

    if (!isNumberKey && !allowedControlKeys.includes(e.key) && !isCtrlA) {
      e.preventDefault();
    }
  };

  return (
    <InputNumber
      {...rest}
      value={value}
      onChange={onChange}
      min={0}
      style={{ width: "100%", ...rest.style }}
      formatter={(val) =>
        val ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "" : ""
      }
      parser={(val) => {
        const parsed = val?.replace(/[₫,\s]/g, "") || "";
        return parsed ? parseFloat(parsed) : 0;
      }}
      onKeyDown={handleKeyDown}
      controls={false}
    />
  );
};

export default inputNumber2;
