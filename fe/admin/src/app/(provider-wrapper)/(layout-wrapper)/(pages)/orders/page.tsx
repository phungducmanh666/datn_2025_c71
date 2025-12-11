"use client";
import BTNDetail from "@component/btnDetail";
import BTNReload from "@component/btnReload";
import CustomerInfo from "@component/customerInfo";
import { OrderData, OrderStatus } from "@data/orderData";
import useTablePagination from "@hook/antdTableHook";
import { useOrders } from "@hook/orderHook/orderHook";
import { ConvertUtil } from "@util/convertUtil";
import { Flex, Table, TableProps, Tabs, TabsProps, Typography } from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const getOrderStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.ALL:
      return "Tất cả";
    case OrderStatus.PENDING:
      return "Đang chờ xử lý";
    case OrderStatus.PROCESSING:
      return "Đang chuẩn bị hàng";
    case OrderStatus.CANCLED:
      return "Đã hủy";
    case OrderStatus.SHIPPING:
      return "Đang giao hàng";
    case OrderStatus.SUCCESS:
      return "Thành công";
    case OrderStatus.RETURNING:
      return "Đang hoàn trả";
    case OrderStatus.RETURNED:
      return "Đã hoàn trả";
    default:
      return `${status}`; // Fallback nếu cần
  }
};

//#region page
const PageOrder: React.FC = () => {
  const router = useRouter();

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(
    OrderStatus.ALL
  );

  const { pagination, requestParams, handleTableChange, setPagination } =
    useTablePagination();

  const {
    data: items,
    isFetching,
    refetch,
  } = useOrders(currentStatus, undefined, requestParams);

  console.log(items);


  useEffect(() => {
    if (items?.total !== pagination.total) {
      setPagination((prev) => ({ ...prev, total: items?.total || 0 }));
    }
  }, [items, pagination.total, setPagination]);

  const handleTabChange = (key: string) => {
    setCurrentStatus(key as OrderStatus);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const tabItems: TabsProps["items"] = useMemo(() => {
    const allStatuses = Object.values(OrderStatus);

    return allStatuses.map((status) => ({
      key: status,
      label: getOrderStatusLabel(status),
    }));
  }, []);

  const tableColumns = useMemo<TableProps<OrderData>["columns"]>(
    () => [
      {
        title: "STT",
        key: "stt", // Một key độc nhất
        width: 60, // Đặt chiều rộng nhỏ cho cột STT
        render: (text, record, index) => index + 1, // Dùng index + 1 để bắt đầu từ 1
      },
      {
        sorter: true,
        title: "Khách hàng",
        dataIndex: "customerUUID",
        key: "customerUUID",
        render: (customerUUID: string) =>
          !!customerUUID ? (
            <CustomerInfo uuid={customerUUID} />
          ) : (
            <Typography
              style={{
                fontSize: "0.7rem",
              }}
            >
              Ẩn danh
            </Typography>
          ),
      },
      {
        sorter: true,
        title: "Tổng tiền",
        dataIndex: "totalAmount", // Vẫn giữ để antd biết field nào để sort mặc định
        key: "totalAmount",
        render: (originalAmount: number, record: OrderData) => {
          const totalSaved = record.totalSaved || 0;
          const finalAmount = originalAmount - totalSaved;

          // Nếu có giảm giá (totalSaved > 0)
          if (totalSaved > 0) {
            return (
              <div className="mt-1">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    {/* Giá mới: Đỏ, Đậm, To */}
                    <span className="text-xl font-bold text-red-600">
                      {ConvertUtil.formatVNCurrency(finalAmount)}
                    </span>
                    {/* Giá cũ: Xám, Nhỏ, Gạch ngang */}
                    <span className="text-xs text-gray-400 line-through decoration-gray-400">
                      {ConvertUtil.formatVNCurrency(originalAmount)}
                    </span>
                  </div>

                  {/* Badge tiết kiệm tiền: Nền đỏ nhạt, chữ đỏ */}
                  <div className="flex items-center mt-1">
                    <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      Tiết kiệm {ConvertUtil.formatVNCurrency(totalSaved)}
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          // Nếu không có giảm giá, chỉ hiện giá gốc
          return (
            <span className="font-medium text-gray-900">
              {ConvertUtil.formatVNCurrency(originalAmount)}
            </span>
          );
        },
      },
      {
        sorter: true,
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date: string) => ConvertUtil.convertVietNamDate(date),
      },
      {
        sorter: true,
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status: string) => ConvertUtil.getOrderStatusLabel(status),
      },
      {
        title: "Phương thức thanh toán",
        key: "tt",
        render: (r: OrderData) => (
          <Flex>
            {ConvertUtil.getOrderPaymentMethodComponent(r.paymentMethod)}
          </Flex>
        ),
      },
      {
        title: "Thanh toán",
        key: "thanhToan",
        render: (r: OrderData) => ConvertUtil.getOrderThanhToanLabel(r),
      },
      {
        title: "Thao tác",
        key: "action",
        render: (r) => (
          <Flex gap={10} wrap>
            <BTNDetail onClick={() => router.push(`/orders/${r.uuid}`)} />
          </Flex>
        ),
      },
    ],
    [router]
  );

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(
    () => [{ title: "Trang chủ", href: "/home" }, { title: "Đơn hàng" }],
    []
  );

  return (
    <>
      <Flex vertical gap={40}>
        <Breadcrumb items={breadCrumbItems} />
        <Flex vertical gap={10}>
          <Tabs
            size="small"
            tabPosition="top"
            type="card"
            defaultActiveKey={currentStatus}
            items={tabItems}
            onChange={handleTabChange}
          />
          <Flex flex={1} vertical gap={20}>
            <BTNReload
              loading={isFetching}
              onClick={() => refetch()}
              toolTipTitle="Tải lại trang"
            />
            <Table
              size="small"
              rowKey="uuid"
              columns={tableColumns}
              dataSource={items?.items}
              loading={isFetching}
              pagination={pagination}
              onChange={handleTableChange}
              scroll={{ x: "max-content" }}
            />
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default PageOrder;
