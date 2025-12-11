import { OrderLineData } from '@data/orderData';
import { useCheckDuHangHoaChoDonHang, useComfirmOrder } from '@hook/orderHook/orderHook';
import { Button, Spin } from 'antd';
import React from 'react';

interface BTNComfirmOrderProps {
    uuid: string,
    items: OrderLineData[],
}

const BTNComfirmOrder: React.FC<BTNComfirmOrderProps> = ({ uuid, items }) => {


    const { mutate: updateStatusMutate, isPending: isComfirming } =
        useComfirmOrder(() => { });

    const { data: isDuHangHoa, isPending } = useCheckDuHangHoaChoDonHang(items);


    if (isPending) return <Spin />

    if (isDuHangHoa)
        return <Button
            key={1}
            size="small"
            type="primary"
            onClick={() => updateStatusMutate({ uuid, status: "comfirm" })}
        >
            Xác nhận
        </Button>

    return <Button
        key={1}
        size="small"
        type="primary"
        variant='solid'
        color='danger'
        disabled
    >
        Không đủ hàng hóa
    </Button>

};

export default BTNComfirmOrder;