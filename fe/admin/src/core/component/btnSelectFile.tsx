import { Button, ButtonProps, Tooltip } from "antd";
import React, { useRef } from "react";
import { AiFillEdit } from "react-icons/ai";

interface BTNSelectFileProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: string;
  onSelected?: (files: File[]) => void;
  multiple?: boolean; // chọn nhiều file
  accept?: string; // định dạng file: "image/*", ".png,.jpg", v.v
}

const BTNSelectFile: React.FC<BTNSelectFileProps> = ({
  toolTipTitle = "Chọn file",
  toolTipColor = "blue",
  icon,
  multiple = false,
  accept,
  onSelected,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    onSelected?.(filesArray);
    e.target.value = ""; // reset để chọn lại cùng file nếu muốn
  };

  return (
    <>
      <Tooltip title={toolTipTitle} color={toolTipColor}>
        <Button
          onClick={handleClick}
          variant="solid"
          color="blue"
          shape="round"
          size="small"
          icon={icon ? icon : <AiFillEdit />}
          {...props}
        />
      </Tooltip>
      <input
        type="file"
        ref={inputRef}
        style={{ display: "none" }}
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
      />
    </>
  );
};

export default BTNSelectFile;
