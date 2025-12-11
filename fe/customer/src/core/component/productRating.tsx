import { useReviews } from "@hook/orderHook/reviewHook";
import { Rate } from "antd";
import React, { useMemo } from "react";

interface ProductRatingProps {
  uuid: string;
}

const ProductRating: React.FC<ProductRatingProps> = ({ uuid }) => {
  const { data: reviews } = useReviews(uuid);

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    let totalStar = 0;

    reviews.map((item) => {
      totalStar += item.star;
    });

    return totalStar / reviews.length;
  }, [reviews]);

  return <Rate style={{ fontSize: "1rem" }} disabled value={averageRating} />;
};

export default ProductRating;
