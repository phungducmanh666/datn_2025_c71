"use client";
import BTNDetail from "@component/btnDetail";
import BTNReload from "@component/btnReload";
import StaffInfo from "@component/staffInfo";
import { PromotionRES, PromotionStatus } from "@data/promotionData";
import useTablePagination from "@hook/antdTableHook";
import { usePromotions } from "@hook/promotionHook/promotionHook";
import { ConvertUtil } from "@util/convertUtil";
import { Flex, Table, TableProps, Tabs, TabsProps, Tag } from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const getPromotionStatusLabel = (status: PromotionStatus): string => {
    switch (status) {
        case PromotionStatus.ALL:
            return "Tất cả";
        case PromotionStatus.DRAFT:
            return "Nháp";
        case PromotionStatus.ENABLE:
            return "Enable";
        case PromotionStatus.DISABLE:
            return "Disable";
        default:
            return `${status}`; // Fallback nếu cần
    }
};

//#region page
const PagePromotion: React.FC = () => {
    const router = useRouter();

    const [currentStatus, setCurrentStatus] = useState<PromotionStatus>(
        PromotionStatus.ALL
    );

    const { pagination, requestParams, handleTableChange, setPagination } =
        useTablePagination();

    const {
        data: items,
        isFetching,
        refetch,
    } = usePromotions(currentStatus, requestParams);


    useEffect(() => {
        if (items?.total !== pagination.total) {
            setPagination((prev) => ({ ...prev, total: items?.total || 0 }));
        }
    }, [items, pagination.total, setPagination]);

    const handleTabChange = (key: string) => {
        setCurrentStatus(key as PromotionStatus);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const tabItems: TabsProps["items"] = useMemo(() => {
        const allStatuses = Object.values(PromotionStatus);

        return allStatuses.map((status) => ({
            key: status,
            label: getPromotionStatusLabel(status),
        }));
    }, []);

    const tableColumns = useMemo<TableProps<PromotionRES>["columns"]>(
        () => [
            {
                title: "STT",
                key: "stt", // Một key độc nhất
                width: 60, // Đặt chiều rộng nhỏ cho cột STT
                render: (text, record, index) => index + 1, // Dùng index + 1 để bắt đầu từ 1
            },
            {
                sorter: true,
                title: "Tên chương trình",
                dataIndex: "title",
                key: "title",
            },
            {
                title: "Nhân viên",
                key: "staff",
                render: (_, record: PromotionRES) => <StaffInfo uuid={record.staffUUID} />
            },
            {
                title: "Hiệu lực",
                key: "isRunning",
                align: 'center',
                render: (_, record) => {
                    const now = new Date(); // Thời gian hiện tại
                    const start = new Date(record.startAt);
                    const end = new Date(record.endAt);
                    const isEnable = record.status === 'ENABLE';

                    // Logic kiểm tra đang chạy
                    const isRunning = isEnable && now >= start && now <= end;

                    if (isRunning) {
                        return <Tag color="processing" bordered={false}>🔥 Đang diễn ra</Tag>;
                    }

                    // Logic mở rộng để hiển thị trạng thái chi tiết hơn (Optional)
                    if (!isEnable) {
                        return <Tag color="default" bordered={false}>Đang tắt</Tag>;
                    }
                    if (now < start) {
                        return <Tag color="warning" bordered={false}>Sắp diễn ra</Tag>;
                    }
                    if (now > end) {
                        return <Tag color="error" bordered={false}>Đã kết thúc</Tag>;
                    }

                    return <Tag>N/A</Tag>;
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
                title: "Ngày bắt đầu",
                dataIndex: "startAt",
                key: "startAt",
                render: (date: string) => ConvertUtil.convertVietNamDate(date),
            },
            {
                sorter: true,
                title: "Ngày kết thúc",
                dataIndex: "endAt",
                key: "endAt",
                render: (date: string) => ConvertUtil.convertVietNamDate(date),
            },

            {
                sorter: true,
                title: "Trạng thái",
                dataIndex: "status",
                key: "status",
                render: (status: PromotionStatus) => getPromotionStatusLabel(status)
            },

            {
                title: "Loại khuyến mãi",
                key: "tt",
                render: (r: PromotionRES) => (
                    <Flex>
                        {ConvertUtil.getPromotionType(r)}
                    </Flex>
                ),
            },
            {
                title: "Thao tác",
                key: "action",
                render: (r) => (
                    <Flex gap={10} wrap>
                        <BTNDetail onClick={() => router.push(`/promotions/${r.id}`)} />
                    </Flex>
                ),
            },
        ],
        [router]
    );

    const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(
        () => [{ title: "Trang chủ", href: "/home" }, { title: "Chương trình khuyến mại" }],
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
                            rowKey="id"
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

export default PagePromotion;
