"use client";

import AvatarServer from "@component/avatarServer";
import BTNAddToCart from "@component/btnAddToCart";
import BTNBuy from "@component/btnBuy";
import BTNDetail from "@component/btnDetail";
import ImageSever from "@component/imageServer";
import ProductPriceInfo, { DiscountInfo } from "@component/infoPrice";
import PopupProductAttribute from "@component/popupProductAttributes";
import ProductRating from "@component/productRating";
import ReviewStatistics from "@component/reviewStatistics";
import { ReviewData } from "@data/orderData";
import { AttributeData } from "@data/productData";
import { CustomerData } from "@data/userData";
import { useReviews } from "@hook/orderHook/reviewHook";
import {
  useProduct,
  useProductAttributes,
  useProductImages,
  useProductProductLines,
  useProductsByIds,
} from "@hook/productHook/productHook";
import { useRecommendedRelatedProducts } from "@hook/recommendationHook/recommendationHook";
import { useCustomer } from "@hook/userHook/customerHook";
import { ConvertUtil } from "@util/convertUtil";
import { LocalStorageUtil } from "@util/localStorageUtil";
import {
  Badge,
  Button,
  Card,
  Carousel,
  Col,
  Collapse,
  Descriptions,
  DescriptionsProps,
  Flex,
  Rate,
  Row,
  Spin,
  theme,
} from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import Title from "antd/es/typography/Title";
import Typography from "antd/es/typography/Typography";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { ProductCard } from "../page";

//#region product lines
interface ProductProductLinesProps {
  uuid: string;
}

const ProductProductLines: React.FC<ProductProductLinesProps> = ({ uuid }) => {
  const { data } = useProductProductLines(uuid);

  const rData = useMemo(() => {
    if (!data) return [];

    return data.filter((pl) => pl.name !== "Default");
  }, [data]);

  return (
    <Flex gap={10} wrap={true}>
      {rData.length > 0 ? (
        rData.map((pl) => (
          <Button key={pl.uuid} size="middle" variant="outlined">
            {pl.name}
          </Button>
        ))
      ) : (
        <Typography>Chưa cập nhật</Typography>
      )}
    </Flex>
  );
};

//#endregion

//#region product image
interface ProductImageProps {
  uuid: string;
  avatar?: string;
}

const contentStyle: React.CSSProperties = {
  margin: 0,
  height: "400px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px 50px",
};

const ProductImage: React.FC<ProductImageProps> = ({ uuid, avatar }) => {
  const { data, isFetching: loading } = useProductImages(uuid);

  const imageList = useMemo(() => {
    const arr = [];
    if (avatar) arr.push({ uuid: "-1", photoUrl: avatar });
    if (data) {
      arr.push(...data);
    }
    return arr;
  }, [avatar, data]);

  const { token } = theme.useToken();

  return (
    <Flex vertical gap={10} style={{ width: "100%" }}>
      {loading ? (
        <Spin />
      ) : imageList.length > 0 ? (
        <Carousel
          autoplay
          arrows
          nextArrow={<IoIosArrowForward color={token.colorText} size={20} />}
          prevArrow={<IoIosArrowBack color={token.colorText} size={20} />}
          style={{
            backgroundColor: token.colorBgBase, // Màu trắng hoặc bỏ hẳn
            padding: "10px 0",
          }}
          dotPosition="bottom"
        >
          {imageList.map((img) => (
            <div key={img.uuid}>
              <div style={contentStyle}>
                <ImageSever
                  src={img.photoUrl}
                  alt="product"
                  style={{
                    maxHeight: "360px",
                    maxWidth: "100%",
                    objectFit: "contain",
                    width: "auto",
                  }}
                />
              </div>
            </div>
          ))}
        </Carousel>
      ) : (
        <div style={{ textAlign: "center" }}>Không có hình ảnh</div>
      )}

      <style>
        {`
          .ant-carousel .slick-prev,
          .ant-carousel .slick-next {
            z-index: 10;
            width: 40px;
            height: 40px;
          }
          
          .ant-carousel .slick-prev {
            left: 15px;
          }
          
          .ant-carousel .slick-next {
            right: 15px;
          }
          
          .ant-carousel .slick-prev:before,
          .ant-carousel .slick-next:before {
            font-size: 40px;
            opacity: 0.8;
            color: #000; /* Màu đen cho mũi tên */
          }
          
          .ant-carousel .slick-prev:hover:before,
          .ant-carousel .slick-next:hover:before {
            opacity: 1;
          }
        `}
      </style>
    </Flex>
  );
};

//#endregion

//#region product attribute

interface AttributeRowProps {
  attributes: AttributeData[];
}

const AttributeRows: React.FC<AttributeRowProps> = ({ attributes }) => {
  const items = attributes.map((attr) => ({
    key: attr.uuid,
    label: attr.name,
    children: (
      <Flex vertical gap={6}>
        {attr.attribute_values?.length > 0 ? (
          attr.attribute_values.map((val) => (
            <Typography key={val.uuid}>{val.value}</Typography>
          ))
        ) : (
          <Typography>Chưa cập nhật</Typography>
        )}
      </Flex>
    ),
    span: 2,
  }));

  return (
    <Descriptions
      items={items}
      bordered={false}
      column={1}
      labelStyle={{
        width: 200,
        textAlign: "left",
        color: "black",
        fontWeight: "bold",
      }}
      contentStyle={{ textAlign: "left" }}
    />
  );
};

interface ProductAttributeProps {
  uuid: string;
}

const ProductAttribute: React.FC<ProductAttributeProps> = ({ uuid }) => {
  const { data, isFetching } = useProductAttributes(uuid);

  const items = useMemo(
    () =>
      data?.map((gr) => ({
        key: gr.uuid,
        label: gr.name,
        children: <AttributeRows attributes={gr.attributes} />,
      })) ?? [],
    [data]
  );

  // Lấy tất cả key để mở mặc định
  const allKeys = useMemo(() => items.map((item) => item.key), [items]);

  if (isFetching) return <Spin />;

  return (
    <Flex vertical gap={10}>
      {items.length === 0 ? (
        <Typography>Chưa cập nhật</Typography>
      ) : (
        <Collapse
          items={items}
          defaultActiveKey={allKeys}
          style={{
            borderRadius: 10,
            overflow: "hidden",
          }}
          expandIconPosition="end"
        />
      )}
    </Flex>
  );
};
//#endregion

//#region reviews

interface ReviewProps {
  review: ReviewData;
}

const Review: React.FC<ReviewProps> = ({ review }) => {
  const { data: customer } = useCustomer(review.customerUUID);

  return (
    <Flex vertical gap={10}>
      {customer && (
        <Card>
          <Flex vertical gap={10}>
            <Flex gap={10}>
              <AvatarServer src={customer.photoUrl} size={"small"} />
              <Title
                level={5}
              >{`${customer.firstName} ${customer.lastName}`}</Title>
            </Flex>
            <Rate value={review.star} style={{ fontSize: "1rem" }} disabled />
            <Typography style={{ marginLeft: "10px" }}>
              {review.content}
            </Typography>
          </Flex>
        </Card>
      )}
    </Flex>
  );
};

interface ProductReviewsProps {
  uuid: string;
}
const ProductReviews: React.FC<ProductReviewsProps> = ({ uuid }) => {
  const { data: reviews } = useReviews(uuid);

  return (
    <Flex vertical gap={50}>
      {reviews && <ReviewStatistics data={reviews} />}

      <Flex vertical gap={30}>
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <Review key={review.createdAt} review={review} />
          ))
        ) : (
          <Typography>Chưa có đánh giá nào</Typography>
        )}
      </Flex>
    </Flex>
  );
};

//#endregion
//#region ProductRecommendation
//#region product card
interface ProductRecommendationProps {
  productUUID: string;
}
const ProductRecommendation: React.FC<ProductRecommendationProps> = ({
  productUUID,
}) => {
  const [customerData, setCustomerData] = useState<CustomerData | undefined>();
  useEffect(() => {
    const storedCustomer = LocalStorageUtil.getCustomer();
    if (storedCustomer) {
      setCustomerData(storedCustomer);
    }
  }, []);
  const userUUID = customerData?.uuid;
  const { data: idList = [], isFetching: fetchingIds } =
    useRecommendedRelatedProducts(userUUID ?? "", productUUID ?? "");

  const arr: string[] = Array.from(idList ?? []);
  const { data: products, isFetching: loading } = useProductsByIds(arr);

  if (loading) return <Spin />;
  if (!idList || !products) return <></>;

  return (
    <Row gutter={[40, 40]}>
      {products.map((item) => (
        <Col
          key={item.uuid}
          xl={{ span: 6 }}
          lg={{ span: 8 }}
          md={{ span: 12 }}
          sm={{ span: 24 }}
        >
          <ProductCard data={item} />
        </Col>
      ))}
    </Row>
  );
};
//#endregion
//#region page
interface PageProductDetailProps {}

const PageProductDetail: React.FC<PageProductDetailProps> = ({}) => {
  const router = useRouter();
  const { slug: uuid } = useParams<{ slug: string }>();
  const { data, isFetching, refetch } = useProduct(uuid);

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(() => {
    return data
      ? [
          { title: "Trang chủ", href: "/home" },
          { title: "Sản phẩm", href: "/products" },
          { title: data.name },
        ]
      : [];
  }, [data]);

  const desItems = useMemo(
    (): DescriptionsProps["items"] =>
      data
        ? [
            {
              key: 7,
              label: "Dòng sản phẩm",
              children: <ProductProductLines uuid={uuid} />,
            },
          ]
        : [],
    [data]
  );

  const [openPopupAttribute, setOpenPopupAttribute] = useState<boolean>(false);

  const { token } = theme.useToken();

  const [priceInfo, setPriceInfo] = useState<DiscountInfo>();

  return (
    <>
      {data && (
        <>
          <Flex vertical gap={10}>
            <Breadcrumb items={breadCrumbItems} />
            <Row gutter={[100, 10]} style={{ padding: 40 }}>
              <Col md={{ span: 24 }} xl={{ span: 12 }}>
                <Badge.Ribbon
                  text={priceInfo && priceInfo.discountLabel}
                  color="#ef4444" // Tailwind red-500 hex code
                  className="font-bold shadow-md"
                  placement="start"
                >
                  <ProductImage uuid={uuid} avatar={data?.photoUrl} />
                </Badge.Ribbon>
              </Col>
              <Col md={{ span: 24 }} xl={{ span: 12 }} style={{ padding: 20 }}>
                <Flex vertical gap={50}>
                  <Card>
                    <Flex vertical gap={20}>
                      <Title level={4} className="!mb-0">
                        {data?.name}
                      </Title>
                      {data && (
                        <ProductPriceInfo
                          product={data}
                          onGetPriceInfo={(info) => setPriceInfo(info)}
                        />
                      )}
                      <Flex>
                        {ConvertUtil.getProductStatusLabel(data.status)}
                      </Flex>
                      <Descriptions
                        column={2}
                        layout="horizontal"
                        bordered={false}
                        items={desItems}
                      />
                    </Flex>
                  </Card>
                  <ProductRating uuid={uuid} />
                  <Flex gap={10}>
                    <BTNBuy toolTipTitle="Mua ngay" productUUID={uuid}>
                      Mua ngay
                    </BTNBuy>
                    <BTNAddToCart
                      toolTipTitle="Thêm vào giỏ hàng"
                      productUUID={uuid}
                    >
                      Thêm vào giỏ hàng
                    </BTNAddToCart>
                    <BTNDetail
                      shape="default"
                      color="orange"
                      toolTipColor="orange"
                      toolTipTitle="Nhấn để xem thông số sản phẩm"
                      onClick={() => setOpenPopupAttribute(true)}
                    >
                      Thông số
                    </BTNDetail>
                  </Flex>
                </Flex>
              </Col>
            </Row>
            <Card title="Đánh giá">
              <ProductReviews uuid={uuid} />
            </Card>
          </Flex>
          <PopupProductAttribute
            onClose={() => setOpenPopupAttribute(false)}
            uuid={uuid}
            open={openPopupAttribute}
          />
          <Flex vertical gap={40}>
            <Typography style={{ fontWeight: 500, fontSize: 30 }}>
              Có thể bạn quan tâm
            </Typography>
            <ProductRecommendation productUUID={uuid} />
          </Flex>
        </>
      )}
    </>
  );
};

export default PageProductDetail;

//#endregion
