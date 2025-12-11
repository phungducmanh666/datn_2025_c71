"use client";

import BTNBack from "@component/btnBack";
import InputCurrency from "@component/inputCurrency";
import { ProductInfoData, ProductMetaData } from "@data/productData";
import {
  useCatalogBrands,
  useCatalogProductLines,
  useCatalogs,
} from "@hook/productHook/catalogHook";
import {
  useCheckProductName,
  useCreateProduct,
} from "@hook/productHook/productHook";
import {
  Button,
  Checkbox,
  Col,
  Flex,
  Form,
  Input,
  Radio,
  Row,
  Steps,
  Upload,
} from "antd";
import { useForm } from "antd/es/form/Form";
import Title from "antd/es/typography/Title";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";

//#region context
interface CatalogContextType {
  catalogUUID?: string;
  brandUUID?: string;
  productLineUUIDs: string[];
  setCatalogUUID: (uuid?: string) => void;
  setBrandUUID: (uuid?: string) => void;
  setProductLineUUIDs: (uuids: string[]) => void;
}

const CatalogContext = React.createContext<CatalogContextType | undefined>(
  undefined
);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [catalogUUID, setCatalogUUID] = useState<string>();
  const [brandUUID, setBrandUUID] = useState<string>();
  const [productLineUUIDs, setProductLineUUIDs] = useState<string[]>([]);

  return (
    <CatalogContext.Provider
      value={{
        catalogUUID,
        brandUUID,
        productLineUUIDs,
        setCatalogUUID,
        setBrandUUID,
        setProductLineUUIDs,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalogContext = () => {
  const context = React.useContext(CatalogContext);
  if (!context)
    throw new Error("useCatalogContext must be used within CatalogProvider");
  return context;
};

//#endregion

//#region catalog selector
const CatalogSelector = ({ next }: { next: () => any }) => {
  const { catalogUUID, setCatalogUUID, brandUUID } = useCatalogContext();
  const { data: catalogs } = useCatalogs({ sort: "name,ASC" });

  // khi catalogs thay đổi, nếu catalogUUID hiện tại không tồn tại trong danh sách, set lại cái đầu tiên
  useEffect(() => {
    if (!catalogs?.items?.length) return;
    if (!catalogUUID || !catalogs.items.some((c) => c.uuid === catalogUUID)) {
      setCatalogUUID(catalogs.items[0].uuid); // chỉ set khi cần
    }
  }, [catalogs, catalogUUID, setCatalogUUID]);

  return (
    <Flex vertical gap={30}>
      <Flex vertical gap={10}>
        <Title level={5}>Danh mục</Title>
        <Radio.Group
          value={catalogUUID}
          options={catalogs?.items.map((c) => ({
            label: c.name,
            value: c.uuid,
          }))}
          onChange={(e) => setCatalogUUID(e.target.value)}
        />
      </Flex>
      <CatalogBrandSelector />
      <Flex justify="end">
        {catalogUUID && brandUUID && (
          <Button type="primary" onClick={next}>
            Tiếp
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

const CatalogBrandSelector = () => {
  const { catalogUUID, brandUUID, setBrandUUID } = useCatalogContext();
  const { data: brands, refetch } = useCatalogBrands(catalogUUID);

  useEffect(() => {
    refetch();
  }, [catalogUUID]);

  useEffect(() => {
    if (!brands?.items?.length) return;
    if (!brandUUID || !brands.items.some((b) => b.uuid === brandUUID)) {
      setBrandUUID(brands.items[0].uuid); // chỉ set khi cần
    }
  }, [brands, brandUUID, setBrandUUID]);

  return (
    <Flex vertical gap={30}>
      <Flex vertical gap={10}>
        <Title level={5}>Thương hiệu</Title>
        <Radio.Group
          value={brandUUID}
          options={brands?.items.map((b) => ({ label: b.name, value: b.uuid }))}
          onChange={(e) => setBrandUUID(e.target.value)}
        />
      </Flex>
      <CatalogProductLineSelector />
    </Flex>
  );
};

const CatalogProductLineSelector = () => {
  const { catalogUUID, brandUUID, productLineUUIDs, setProductLineUUIDs } =
    useCatalogContext();
  const { data: lines, refetch } = useCatalogProductLines(
    catalogUUID!,
    brandUUID!,
    {}
  );

  useEffect(() => {
    refetch();
  }, [catalogUUID, brandUUID]);

  useEffect(() => {
    if (!lines?.items?.length) {
      if (productLineUUIDs.length > 0) setProductLineUUIDs([]);
      return;
    }

    const validUUIDs = productLineUUIDs.filter((uuid) =>
      lines.items.some((l) => l.uuid === uuid)
    );

    // chỉ set khi khác với state hiện tại
    if (validUUIDs.length !== productLineUUIDs.length) {
      setProductLineUUIDs(
        validUUIDs.length > 0 ? validUUIDs : [lines.items[0].uuid]
      );
    }
  }, [lines, productLineUUIDs, setProductLineUUIDs]);

  return (
    <Flex vertical gap={10}>
      <Title level={5}>Dòng sản phẩm</Title>
      <Checkbox.Group
        value={productLineUUIDs}
        options={lines?.items.map((l) => ({ label: l.name, value: l.uuid }))}
        onChange={(checked) => setProductLineUUIDs(checked as string[])}
      />
    </Flex>
  );
};
//#endregion

//#region product info
interface ProductInfoProps {
  pre: () => any;
}

interface FormProps {
  name: string;
  price: number;
  file: File;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ pre }) => {
  const [form] = useForm<FormProps>();
  const [fileList, setFileList] = useState<any[]>([]);
  const [isNameExists, setIsNameExists] = useState(false);
  const router = useRouter();
  const [isCreated, setIsCreated] = useState(false);

  const { catalogUUID, brandUUID, productLineUUIDs } = useCatalogContext();

  const { mutate: checkName, isPending: checking } = useCheckProductName(
    (exists) => {
      if (exists) {
        setIsNameExists(true);
        form.setFields([{ name: "name", errors: ["Tên đã được sử dụng"] }]);
      } else {
        setIsNameExists(false);
      }
    }
  );

  const debouncedHandle = useMemo(
    () =>
      debounce((values: FormProps) => {
        if (values.name) checkName(values.name);
        else
          form.setFields([
            { name: "name", errors: ["Tên không được để trống"] },
          ]);
      }, 500),
    [checkName]
  );

  const handleValuesChange = () => debouncedHandle(form.getFieldsValue());

  const handleUploadChange = (info: any) => {
    const latestFile = info.fileList.slice(-1)[0];
    setFileList(info.fileList.slice(-1));
    form.setFieldsValue({ file: latestFile?.originFileObj || null });
  };

  useEffect(() => () => debouncedHandle.cancel(), [debouncedHandle]);

  const { mutate: createMutate, isPending: creating } = useCreateProduct(
    (data) => {
      setIsCreated(true);
      router.push(`/products/${data.uuid}`);
    }
  );

  const handleCreateProduct = () => {
    form.validateFields().then((values) => {
      const metadata: ProductMetaData = {
        catalogUUID: catalogUUID!,
        brandUUID: brandUUID!,
        productLineUUIDS: productLineUUIDs ?? [],
      };
      const info: ProductInfoData = {
        name: values.name,
        price: values.price,
        photo: values.file,
      };
      createMutate({
        metadata,
        info,
      });
    });
  };

  // Kiểm tra button disabled
  const isDisabled = useMemo(() => {
    const values = form.getFieldsValue();
    const errors = form.getFieldsError();
    const hasError = errors.some((f) => f.errors.length > 0);
    const invalid =
      !values.name ||
      !values.price ||
      values.price <= 0 ||
      !values.file ||
      hasError ||
      isNameExists;

    return invalid;
  }, [form, isNameExists, checking]);

  return (
    <Flex vertical gap={40}>
      <Flex>
        <BTNBack onClick={pre} size="middle" />
      </Flex>
      <Title level={5}>Thông tin sản phẩm</Title>
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <Row gutter={[10, 10]}>
          <Col md={{ span: 24 }} lg={{ span: 12 }}>
            <Form.Item
              name="name"
              label="Tên sản phẩm"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input showCount placeholder="Nhập tên" />
            </Form.Item>
          </Col>
          <Col md={{ span: 24 }} lg={{ span: 12 }}>
            <Form.Item
              name="price"
              label="Giá bán"
              rules={[{ required: true, message: "Vui lòng nhập giá" }]}
            >
              <InputCurrency placeholder="Nhập giá" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Ảnh"
          name="file"
          getValueFromEvent={(e) => e?.fileList?.[0]?.originFileObj || null}
          rules={[{ required: true, message: "Vui lòng chọn ảnh" }]}
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={handleUploadChange}
            maxCount={1}
          >
            {fileList.length >= 1 ? null : <FaPlus />}
          </Upload>
        </Form.Item>
      </Form>
      <Flex justify="end">
        <Button
          type="primary"
          onClick={handleCreateProduct}
          disabled={isDisabled}
          loading={checking || creating || isCreated}
        >
          Thêm sản phẩm
        </Button>
      </Flex>
    </Flex>
  );
};

//#endregion

//#region page
interface PageCreateProductContentProps {}

const PageCreateProductContent: React.FC<
  PageCreateProductContentProps
> = ({}) => {
  const [current, setCurrent] = useState(0);

  const stepItems = [
    {
      title: "Chọn danh mục",
      content: <CatalogSelector next={() => setCurrent((pre) => pre + 1)} />,
    },
    {
      title: "Nhập thông tin sản phảm",
      content: (
        <div style={{ padding: 29 }}>
          <ProductInfo pre={() => setCurrent((pre) => pre - 1)} />
        </div>
      ),
    },
  ];

  return (
    <Flex vertical gap={30} justify="space-between" style={{ padding: 10 }}>
      <Steps current={current} size="small" items={stepItems} />
      <div style={{ padding: "50px" }}>{stepItems[current].content}</div>
    </Flex>
  );
};

//#endregion

interface PageCreateProductProps {}

const PageCreateProduct: React.FC<PageCreateProductProps> = ({}) => {
  return (
    <Flex vertical gap={10}>
      <CatalogProvider>
        <PageCreateProductContent />
      </CatalogProvider>
    </Flex>
  );
};

export default PageCreateProduct;
