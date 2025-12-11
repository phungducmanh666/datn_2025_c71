"use client";

import AvatarServer from "@component/avatarServer";
import BTNDetail from "@component/btnDetail";
import BTNDropDown from "@component/btnDropDown";
import ImageSever from "@component/imageServer";
import ProductPriceInfo, { DiscountInfo } from "@component/infoPrice";
import PopupProductAttribute from "@component/popupProductAttributes";
import PopupProductJsonInfo from "@component/popupProductJsonInfo";
import ProductNumber from "@component/productNumber";
import ReviewStatistics from "@component/reviewStatistics";
import { ReviewData } from "@data/orderData";
import { useReviews } from "@hook/orderHook/reviewHook";
import {
  useProduct,
  useProductImages,
  useProductProductLines,
} from "@hook/productHook/productHook";
import {
  useUpdateItemProfile,
} from "@hook/recommendationHook/recommendationHook";
import { useCustomer } from "@hook/userHook/customerHook";
import { ConvertUtil } from "@util/convertUtil";
import {
  Badge,
  Button,
  Card,
  Carousel,
  Col,
  Descriptions,
  DescriptionsProps,
  Flex,
  MenuProps,
  Rate,
  Row,
  Spin,
  Typography,
  theme
} from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import Title from "antd/es/typography/Title";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

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
            padding: "10px 0"
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
            <Flex vertical gap={5}>
              <Flex gap={10}>
                <AvatarServer src={customer.photoUrl} size={"small"} />
                <Title
                  level={5}
                >{`${customer.firstName} ${customer.lastName}`}</Title>
              </Flex>
              <Rate value={review.star} style={{ fontSize: "1rem" }} disabled />
            </Flex>
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
    <>
      <Card title="Đánh giá">
        {reviews && <ReviewStatistics data={reviews} />}

        <Flex vertical gap={10}>
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <Review key={review.createdAt} review={review} />
            ))
          ) : (
            <Typography>Chưa có đánh giá nào</Typography>
          )}
        </Flex>
      </Card>
    </>
  );
};

//#endregion

//#region page
interface PageProductDetailProps { }

const PageProductDetail: React.FC<PageProductDetailProps> = ({ }) => {
  const router = useRouter();
  const { slug: uuid } = useParams<{ slug: string }>();
  const { data, isFetching, refetch } = useProduct(uuid);
  const [promotionId, setPromotionId] = useState<number | null>(null);
  const [priceInfo, setPriceInfo] = useState<DiscountInfo>();

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
            key: 6,
            label: "Tồn kho",
            children: <ProductNumber uuid={uuid} />,
          },
          {
            key: 7,
            label: "Dòng sản phẩm",
            children: <ProductProductLines uuid={uuid} />,
          },
          {
            key: 1,
            label: "Mã sản phẩm",
            children: ConvertUtil.formatUUID(data.uuid),
          },
        ]
        : [],
    [data]
  );

  const menuItems: MenuProps["items"] = [
    {
      key: 1,
      label: "Quản lý hình ảnh",
      onClick: () => router.push(`/products/${uuid}/images`),
    },
    {
      key: 2,
      label: "Quản lý thuộc tính",
      onClick: () => router.push(`/products/${uuid}/attributes`),
    },
    {
      key: 3,
      label: "Cập nhật thông tin",
      onClick: () => router.push(`/products/${uuid}/info`),
    },
  ];

  const [openPopupAttribute, setOpenPopupAttribute] = useState<boolean>(false);
  const [openPopupJsonInfo, setOpenPopupJsonInfo] = useState<boolean>(false);

  const { token } = theme.useToken();
  const { mutate: updateItemProfile, isPending } = useUpdateItemProfile();

  if (!data) return <></>

  return (
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
            <Flex vertical gap={20}>
              <Card>
                <Flex vertical gap={20}>
                  <Title level={4} className="!mb-0">{data?.name}</Title>
                  {data &&
                    <ProductPriceInfo product={data} onGetPriceInfo={(info) => setPriceInfo(info)} />
                  }
                  <Flex>{ConvertUtil.getProductStatusLabel(data.status)}</Flex>
                  <Descriptions
                    column={2}
                    layout="horizontal"
                    bordered={false}
                    items={desItems}
                  />
                </Flex>
              </Card>

              <Card title="Thao tác" size="small">
                <Flex vertical gap={10} wrap>
                  <Flex gap={10}>
                    <BTNDropDown items={menuItems} />
                    <BTNDetail
                      shape="default"
                      color="orange"
                      toolTipColor="orange"
                      toolTipTitle="Nhấn để xem thông số sản phẩm"
                      onClick={() => setOpenPopupAttribute(true)}
                    >
                      Xem thông số
                    </BTNDetail>
                  </Flex>
                  <Flex gap={20}>
                    <BTNDetail
                      shape="default"
                      color="cyan"
                      toolTipColor="orange"
                      toolTipTitle="Nhấn để xem thông tin sản phẩm dạng json"
                      onClick={() => setOpenPopupJsonInfo(true)}
                    >
                      View Json Data
                    </BTNDetail>
                    <BTNDetail
                      shape="default"
                      color="cyan"
                      toolTipColor="orange"
                      toolTipTitle="Nhấn để xem thông tin sản phẩm dạng json"
                      onClick={() => updateItemProfile(uuid)}
                    >
                      Cập nhật đặc trưng gợi ý sản phẩm
                    </BTNDetail>
                  </Flex>
                </Flex>
              </Card>
              <Flex vertical gap={10} style={{ marginTop: 10 }}></Flex>
            </Flex>
          </Col>
        </Row>
        <ProductReviews uuid={uuid} />
      </Flex>
      <PopupProductAttribute
        onClose={() => setOpenPopupAttribute(false)}
        uuid={uuid}
        open={openPopupAttribute}
      />
      <PopupProductJsonInfo
        onClose={() => setOpenPopupJsonInfo(false)}
        uuid={uuid}
        open={openPopupJsonInfo}
      />
    </>
  );
};

export default PageProductDetail;

//#endregion
