"use client";
import BTNAdd from "@/core/component/btnAdd";
import BTNDelete from "@/core/component/btnDelete";
import BTNReload from "@/core/component/btnReload";
import FMRagDocumentCreate from "@component/fmRagDocumentCreate";
import { EmbeddingVectorData } from "@data/chatData";
import { useDeleteBusinessDocument, useGetBusinessDocuments } from "@hook/chatHook/chatHook";
import { Breadcrumb, Flex, Popconfirm, Table, TableProps } from "antd";
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

//#region page
const DocumentRagPage: React.FC = () => {
    const router = useRouter();
    const { data: items, isFetching, refetch } = useGetBusinessDocuments();
    const { mutate: deleteMutate } = useDeleteBusinessDocument(refetch);

    const tableColumns = useMemo<TableProps<EmbeddingVectorData>["columns"]>(
        () => [
            {
                title: "Id",
                dataIndex: "id",
                key: "id",
                fixed: "left",
            },
            {
                title: "Text",
                dataIndex: "text",
                key: "text",
            },
            {
                title: "Thao tác",
                key: "action",
                render: (r) => (
                    <Flex gap={10} wrap>
                        <Popconfirm title="Xóa?" onConfirm={() => deleteMutate(r.id)}>
                            <BTNDelete />
                        </Popconfirm>
                    </Flex>
                ),
            },
        ],
        [router, deleteMutate]
    );

    const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(
        () => [{ title: "Trang chủ", href: "/home" }, { title: "RAG Documents" }],
        []
    );

    const [openFormCreate, setOpenFormCreate] = useState(false);

    return (
        <>
            <Flex vertical gap={40}>
                <Breadcrumb items={breadCrumbItems} />
                <Flex vertical gap={10}>
                    <Flex gap={10}>
                        <BTNAdd
                            toolTipTitle="Thêm"
                            onClick={() => setOpenFormCreate(true)}
                        />
                        <BTNReload
                            loading={isFetching}
                            onClick={() => refetch()}
                            toolTipTitle="Tải lại trạng"
                        />
                    </Flex>
                    <Table
                        size="small"
                        rowKey="uuid"
                        columns={tableColumns}
                        dataSource={items}
                        loading={isFetching}
                        scroll={{ x: "max-content" }}
                    />
                </Flex>
            </Flex>
            <FMRagDocumentCreate
                open={openFormCreate}
                onCreated={() => {
                    refetch();
                    setOpenFormCreate(false);
                }}
                onCancle={() => {
                    setOpenFormCreate(false);
                }}
            />
        </>
    );
};

export default DocumentRagPage;

//#endregion
