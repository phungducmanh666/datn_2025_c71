import { AttributeData } from "@data/productData";
import { useProductAttributes } from "@hook/productHook/productHook";
import {
  Descriptions,
  Drawer,
  Flex,
  Spin,
  Tabs,
  Tag,
  theme,
  Typography,
} from "antd";
import { useMemo } from "react";

//#region comps
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
            <Tag key={val.uuid}>{val.value}</Tag>
          ))
        ) : (
          <span style={{ fontSize: "0.5rem" }}>Chưa cập nhật</span>
        )}
      </Flex>
    ),
    span: 2,
  }));

  const { token } = theme.useToken();

  return (
    <Descriptions
      items={items}
      bordered={true}
      size="small"
      column={2}
      labelStyle={{
        width: 200,
        textAlign: "left",
        color: token.colorText,
        fontWeight: "bold",
        fontSize: "0.9rem",
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
        key: gr.uuid, // key cho Tab
        label: gr.name, // label (tiêu đề) cho Tab
        children: <AttributeRows attributes={gr.attributes} />, // nội dung bên trong Tab
      })) ?? [],
    [data]
  );

  // Không cần 'allKeys' để mở mặc định như Collapse

  if (isFetching) return <Spin />;

  return (
    <Flex vertical gap={10}>
      {items && items.length > 0 ? (
        <Tabs
          defaultActiveKey={items[0]?.key} // Mặc định chọn tab đầu tiên
          items={items}
          style={{
            width: 500,
            maxWidth: "100%",
          }}
          // Có thể thêm các props khác của Tabs như tabPosition="top" (mặc định)
        />
      ) : (
        <Typography>Chưa cập nhật</Typography>
      )}
    </Flex>
  );
};

//#endregion

//#region comp

interface PopupProductAttributeProps {
  uuid: string;
  open: boolean;
  onClose?: () => any;
}

const PopupProductAttribute: React.FC<PopupProductAttributeProps> = ({
  uuid,
  open,
  onClose,
}) => {
  return (
    <Drawer
      open={open}
      width={500}
      style={{
        overflow: "auto",
      }}
      footer={null}
      title="Thông số sản phẩm"
      onClose={() => {
        onClose?.();
      }}
    >
      <ProductAttribute uuid={uuid} />
    </Drawer>
  );
};

export default PopupProductAttribute;

//#endregion
