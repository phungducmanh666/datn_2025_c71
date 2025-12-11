import { ProductData } from "@data/productData";
import { useRemoveFromCart } from "@hook/orderHook/cartHook";
import { ConvertUtil } from "@util/convertUtil";
import { LocalStorageUtil } from "@util/localStorageUtil";
import { OrderUtil } from "@util/orderUtil";
import { Badge, Card, Checkbox, CheckboxChangeEvent, Flex, Popconfirm } from "antd";
import Title from "antd/es/typography/Title";
import React, { useEffect, useState } from "react";
import BTNDelete from "./btnDelete";
import ImageSever from "./imageServer";
import ProductPriceInfo, { DiscountInfo } from "./infoPrice";
import ProductRating from "./productRating";

interface ProductItemProps {
  data: ProductData;
  reload?: () => any;
}

const ProductItem: React.FC<ProductItemProps> = ({ data, reload }) => {
  const { mutate: removeFromCart } = useRemoveFromCart(reload);
  const [disableOrder, setDisableOrder] = useState<boolean>(
    OrderUtil.isProductNotValidForOrder(data)
  );

  const [checked, setChecked] = useState<boolean>();

  const handleRemove = () => {
    removeFromCart(data.uuid);
    LocalStorageUtil.removeOrderProductUUID(data.uuid);
  };

  const handleCheck = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    setChecked(checked);
    if (checked) {
      LocalStorageUtil.addOrderProductUUID(data.uuid);
    } else {
      LocalStorageUtil.removeOrderProductUUID(data.uuid);
    }
  };

  useEffect(() => {
    setChecked(LocalStorageUtil.getOrderProductUUIDS().includes(data.uuid));

    if (disableOrder) {
      LocalStorageUtil.removeOrderProductUUID(data.uuid);
    }
  }, []);

    const [discountInfo, setDiscountInfo] = useState<DiscountInfo>();
  

    const CardContent =  <Card hoverable>
      <Flex justify="space-between" align="center">
        <Flex gap={10}>
          <Checkbox
            onChange={handleCheck}
            checked={checked}
            disabled={disableOrder}
          />
          <ImageSever size="medium" src={data.photoUrl} />
          <Flex vertical gap={10}>
            <Title level={5}>{data.name}</Title>
            <ProductRating uuid={data.uuid} />
            <ProductPriceInfo product={data} onGetPriceInfo={(info) => setDiscountInfo(info)} />
            <Flex>{ConvertUtil.getProductStatusLabel(data.status)}</Flex>
          </Flex>
        </Flex>
        <Flex>
          <Popconfirm onConfirm={handleRemove} title="Xóa khỏi giỏ hàng?">
            <BTNDelete />
          </Popconfirm>
        </Flex>
      </Flex>
    </Card>

  if (discountInfo && discountInfo.hasDiscount) {
    return (
      <Badge.Ribbon
        text={discountInfo.discountLabel}
        color="#ef4444" // Tailwind red-500 hex code
        className="font-bold shadow-md"
        placement="start"
      >
        {CardContent}
      </Badge.Ribbon>
    );
  }

  return CardContent;
};

export default ProductItem;
