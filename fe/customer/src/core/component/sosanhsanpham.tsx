import { useProductCompare } from "@context/productCompareContext";
import { ProductData } from "@data/productData";
import { LocalStorageUtil } from "@util/localStorageUtil";
import { Button, Card, Flex, theme, Typography } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { GrCompare } from "react-icons/gr";
import BTNClose from "./btnClose";
import BTNCompare from "./btnCompare";
import ImageSever from "./imageServer";

//#region
interface ProductReviewProps {
  data: ProductData;
}

const ProductReview: React.FC<ProductReviewProps> = ({ data }) => {
  const { removeProduct } = useProductCompare();

  return (
    <Card>
      <Flex style={{ marginBottom: 10 }} justify="end">
        <BTNClose size="small" onClick={() => removeProduct(data.uuid)} />
      </Flex>
      <Flex vertical gap={10} style={{ width: 150 }}>
        <Flex>
          <ImageSever
            src={data.photoUrl}
            style={{
              height: 100,
              objectFit: "contain",
            }}
          />
        </Flex>
        <Typography.Text ellipsis={true} strong>
          {data.name}
        </Typography.Text>
      </Flex>
    </Card>
  );
};
//#endregion

interface SoSanhSanPhamProps {}

const SoSanhSanPham: React.FC<SoSanhSanPhamProps> = ({}) => {
  const router = useRouter();

  const { open, add, closeCompare, openCompare, removeProduct } =
    useProductCompare();

  const [products, setProducts] = useState<ProductData[]>([]);

  useEffect(() => {
    setProducts(LocalStorageUtil.getCompareProducts());
  }, [add]);

  const { token } = theme.useToken();

  if (!open && products.length > 0) {
    return (
      <BTNCompare
        size="large"
        style={{ margin: 30 }}
        onClick={() => openCompare()}
      />
    );
  }

  return (
    <>
      {open && products.length > 0 && (
        <Card
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            backgroundColor: token.colorInfoBg,
            zIndex: 2000
          }}
        >
          <Flex justify="end">
            <BTNClose onClick={() => closeCompare()} />
          </Flex>
          <Flex gap={10} wrap>
            {products.map((product) => (
              <ProductReview key={product.uuid} data={product} />
            ))}
          </Flex>
          <Flex justify="end">
            <Button
              icon={<GrCompare />}
              variant="solid"
              color="orange"
              onClick={() => {
                closeCompare();
                router.push("/compares");
              }}
            >
              So sánh
            </Button>
          </Flex>
        </Card>
      )}
    </>
  );
};

export default SoSanhSanPham;
