'use client'

import { OrderProduct } from "@hook/orderHook/orderHook";
import { useProductStock } from "@hook/warehouseHook/stockHook";
import { ConvertUtil } from "@util/convertUtil";
import { Flex, Spin, Tag } from "antd";
import React, { useEffect, useState } from "react";
import ProductNumber from "./productNumber";

interface ProductOrderNumberProps {
  data: OrderProduct
}

const ProductOrderNumber: React.FC<ProductOrderNumberProps> = ({ data }) => {

  const [khongDuHangHoa, setKhongDuHangHoa] = useState(false);
  const { data: stock, isPending } = useProductStock(data.productUUID);



  useEffect(() => {
    if (!stock || stock < data.number) {
      setKhongDuHangHoa(true);
    } else {
      setKhongDuHangHoa(false);
    }
  }, [stock]);

  if (isPending) return <Spin />



  return <Flex vertical gap={10}>
    <Flex gap={10}>
      <strong>Số lượng đặt: </strong>
      {
        ConvertUtil.formatVNNumber(data.number)
      }
    </Flex>
    <Flex>
      <strong>Tồn kho: </strong>
      <ProductNumber uuid={data.productUUID} />
    </Flex>
    {
      khongDuHangHoa && <Tag color="red">Không đủ hàng</Tag>
    }
  </Flex>
};

export default ProductOrderNumber;
