"use client";

import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import ImageSever from "@component/imageServer";
import { AttributeGroupData, ProductData } from "@data/productData";
import { ProductAPI } from "@net/productNet/product";
import { useQueries } from "@tanstack/react-query"; // GIẢ ĐỊNH IMPORT NÀY
import { LocalStorageUtil } from "@util/localStorageUtil";
import { Card, Collapse, CollapseProps, Empty, Flex, Spin } from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import React, { useEffect, useMemo, useState } from "react";
import { FaBoxes } from "react-icons/fa";

interface ProductComparisonTableProps {
  products: ProductData[];
}

/**
 * Component hiển thị bảng so sánh các thuộc tính của sản phẩm.
 * Sử dụng useQueries để gọi nhiều hook một cách an toàn.
 */
const ProductComparisonTable: React.FC<ProductComparisonTableProps> = ({
  products,
}) => {
  // 1. CHUYỂN VIỆC GỌI QUERY LÊN CẤP CAO NHẤT (Sử dụng useQueries)
  const productQueries = products.map((product) => ({
    queryKey: ["productAttributes", product.uuid],
    queryFn: (): Promise<AttributeGroupData[]> =>
      ProductAPI.getAttributes(product.uuid),
    staleTime: 0,
  }));

  const comparisonQueries = useQueries({ queries: productQueries });

  // 2. Xử lý trạng thái tải và lỗi
  const isLoading = comparisonQueries.some((query) => query.isLoading);
  const isError = comparisonQueries.some((query) => query.isError);

  // Tạo mảng dữ liệu đã chuẩn hóa: kết hợp sản phẩm với kết quả query
  const comparisonData = products.map((product, index) => ({
    productUUID: product.uuid,
    data: comparisonQueries[index].data as AttributeGroupData[] | undefined,
  }));

  if (isLoading) {
    return (
      <Flex justify="center" align="middle" className="h-40">
        <Spin size="large" tip="Đang tải thuộc tính sản phẩm..." />
      </Flex>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg border border-red-300">
        Đã xảy ra lỗi khi tải thuộc tính của một số sản phẩm.
      </div>
    );
  }

  // 3. Chuẩn hóa Dữ liệu Thuộc tính để So sánh (Giữ nguyên logic)

  // a. Tập hợp tất cả Attribute Group và Attribute từ TẤT CẢ sản phẩm
  const allGroupsMap = new Map<
    string,
    { uuid: string; name: string; allAttributes: Map<string, string> }
  >(); // Key: groupName

  comparisonData.forEach((data) => {
    const attributeGroups = data.data || [];
    attributeGroups.forEach((group) => {
      const groupKey = group.name;

      if (!allGroupsMap.has(groupKey)) {
        allGroupsMap.set(groupKey, {
          uuid: group.uuid,
          name: group.name,
          allAttributes: new Map(),
        });
      }

      group.attributes.forEach((attribute) => {
        const attributeKey = attribute.name;
        allGroupsMap
          .get(groupKey)
          ?.allAttributes.set(attributeKey, attribute.uuid);
      });
    });
  });

  const allGroups = Array.from(allGroupsMap.values());

  // b. Map dữ liệu thuộc tính cho từng sản phẩm
  const productAttributesMap = new Map<
    string,
    Map<string, Map<string, string>>
  >(); // Key: productUUID -> groupName -> attributeName -> value

  comparisonData.forEach((data) => {
    const productUUID = data.productUUID;
    const attributeGroups = data.data || [];
    const productMap = new Map<string, Map<string, string>>();

    attributeGroups.forEach((group) => {
      const groupKey = group.name;
      const attributeMap = new Map<string, string>();

      group.attributes.forEach((attribute) => {
        const attributeKey = attribute.name;
        const value =
          attribute.attribute_values.length > 0
            ? attribute.attribute_values[0].value
            : "Không có giá trị";
        attributeMap.set(attributeKey, value);
      });

      productMap.set(groupKey, attributeMap);
    });

    productAttributesMap.set(productUUID, productMap);
  });

  // 4. Render Bảng So sánh
  const getComparisonItems = (): CollapseProps["items"] => {
    return allGroups.map((group, index) => {
      // Đã thêm key cho item Collapse
      const groupKey = group.uuid || `group-${index}`;

      const groupContent = (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left font-semibold w-1/4">
                Thuộc tính
              </th>
              {products.map((p) => (
                <th key={p.uuid} className="py-2 px-4 text-center w-1/4">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from(group.allAttributes.keys()).map(
              (attributeName, attrIndex) => {
                // Đã thêm key cho hàng (row)
                const rowKey = `${groupKey}-${attributeName}`;

                const values = products.map((product, prodIndex) => {
                  const productMap = productAttributesMap.get(product.uuid);
                  const attributeMap = productMap?.get(group.name);
                  const value = attributeMap?.get(attributeName) || "Không có";

                  // Đã thêm key cho ô (cell)
                  const cellKey = `${rowKey}-cell-${prodIndex}`;

                  // Xử lý giá trị boolean (icon)
                  if (value.toLowerCase() === "có") {
                    return (
                      <div
                        key={cellKey}
                        className="flex justify-center text-green-500 font-bold"
                      >
                        <CheckOutlined /> CÓ
                      </div>
                    );
                  }
                  if (value.toLowerCase() === "không") {
                    return (
                      <div
                        key={cellKey}
                        className="flex justify-center text-red-500 font-bold"
                      >
                        <CloseOutlined /> KHÔNG
                      </div>
                    );
                  }

                  return (
                    <div key={cellKey} className="text-center">
                      {value}
                    </div>
                  );
                });

                return (
                  <tr
                    key={rowKey}
                    className="border-b hover:bg-yellow-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-gray-700 w-1/4">
                      {attributeName}
                    </td>
                    {values.map((v) => (
                      // Giá trị v đã được gán key ở trên nên chỉ cần render
                      <td key={v.key} className="py-3 px-4 w-1/4 align-top">
                        {v}
                      </td>
                    ))}
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      );

      return {
        key: groupKey,
        label: (
          <div className="flex items-center text-lg font-semibold text-gray-800">
            <FaBoxes className="mr-3 text-blue-500" />
            {group.name}
          </div>
        ),
        children: groupContent,
        showArrow: true,
      };
    });
  };

  if (allGroups.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Không tìm thấy thuộc tính nào để so sánh cho các sản phẩm đã chọn."
      />
    );
  }

  return (
    <Collapse
      items={getComparisonItems()}
      // Mở tất cả collapse theo mặc định
      defaultActiveKey={allGroups.map((g, i) => g.uuid || `group-${i}`)}
      className="comparison-collapse border-none"
    />
  );
};

// --- Component Chính: PageCompareProducts (Giữ nguyên logic chính) ---

interface PageCompareProductsProps {}

const PageCompareProducts: React.FC<PageCompareProductsProps> = ({}) => {
  const [products, setProducts] = useState<ProductData[]>([]);

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(
    () => [
      { title: "Trang chủ", href: "/home" },
      { title: "So sánh sản phẩm" },
    ],
    []
  );

  useEffect(() => {
    // Lấy danh sách sản phẩm từ LocalStorage
    setProducts(LocalStorageUtil.getCompareProducts());
  }, []);

  if (products.length === 0) {
    // ... (logic Empty State)
    return (
      <Flex vertical gap={50}>
        <Breadcrumb items={breadCrumbItems} />
        <Flex
          vertical
          gap={20}
          className="p-6 bg-white rounded-lg shadow-lg min-h-[300px] justify-center items-center"
        >
          <h1 className="text-2xl font-bold text-gray-800">So Sánh Sản Phẩm</h1>
          <Empty
            description={
              <span className="text-lg">
                Bạn chưa chọn sản phẩm nào để so sánh.
              </span>
            }
            imageStyle={{ height: 60 }}
          />
          <p className="text-gray-500">
            Vui lòng thêm sản phẩm vào danh sách so sánh.
          </p>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex vertical gap={50}>
      <Breadcrumb items={breadCrumbItems} />
      <div className="p-6 min-h-screen">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900 border-b pb-3">
          So Sánh Sản Phẩm ({products.length})
        </h1>
        <Flex vertical gap={20}>
          {/* Hàng Tiêu đề (Header Row) */}
          <div
            className="grid gap-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200"
            style={{
              gridTemplateColumns: `repeat(${products.length}, 1fr)`,
            }}
          >
            {products.map((product) => (
              <Card
                key={product.uuid} // Đã thêm key
                className="col-span-1 text-center border-none shadow-none"
                bodyStyle={{ padding: "0" }}
              >
                <Flex vertical align="center" gap={8}>
                  <div className="w-full h-32 overflow-hidden flex justify-center items-center rounded-lg bg-gray-100 p-2">
                    <ImageSever
                      src={
                        product.photoUrl || "https://via.placeholder.com/150"
                      }
                      alt={product.name}
                      className="object-contain max-h-full max-w-full rounded-md"
                    />
                  </div>
                  <h2 className="text-base font-semibold text-gray-800 mt-2 line-clamp-2">
                    {product.name}
                  </h2>
                  <p className="text-lg font-bold text-blue-600">
                    {product.price.toLocaleString("vi-VN")} VNĐ
                  </p>
                </Flex>
              </Card>
            ))}
          </div>

          {/* Bảng So sánh Thuộc tính (Comparison Table) */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <ProductComparisonTable products={products} />
          </div>
        </Flex>
      </div>
    </Flex>
  );
};

export default PageCompareProducts;
