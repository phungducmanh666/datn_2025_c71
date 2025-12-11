import type { InputNumberProps } from "antd";
import { InputNumber } from "antd";
import React from "react";

// Thêm prop tùy chọn `showCurrencySymbol`
type InputCurrencyProps = InputNumberProps<number> & {
  showCurrencySymbol?: boolean;
};

const InputCurrency: React.FC<InputCurrencyProps> = (props) => {
  // Lấy prop `showCurrencySymbol` từ props
  const { value, onChange, showCurrencySymbol = true, ...rest } = props;

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
      formatter={(val) => {
        const formattedValue = val
          ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          : "";
        // Sử dụng `showCurrencySymbol` để điều kiện hiển thị
        return showCurrencySymbol ? `${formattedValue} ₫` : formattedValue;
      }}
      parser={(val) => {
        const parsed = val?.replace(/[₫,\s]/g, "") || "";
        return parsed ? parseFloat(parsed) : 0;
      }}
      onKeyDown={handleKeyDown}
      controls={false}
    />
  );
};

export default InputCurrency;
