import { OrderLineData } from '@data/orderData';
import { useCheckDuHangHoaChoDonHang, useComfirmOrder } from '@hook/orderHook/orderHook';
import { Button, Spin } from 'antd';
import React from 'react';

interface BTNShippingOrderProps {
    uuid: string,
    items: OrderLineData[],
}

const BTNShippingOrder: React.FC<BTNShippingOrderProps> = ({ uuid, items }) => {


    const { mutate: updateStatusMutate, isPending: isComfirming } =
        useComfirmOrder(() => { });

    const { data: isDuHangHoa, isPending } = useCheckDuHangHoaChoDonHang(items);


    if (isPending) return <Spin />

    if (isDuHangHoa)
        return <Button
            key={1}
            size="small"
            type="primary"
            onClick={() => updateStatusMutate({ uuid, status: "shipping" })}
        >
            Giao hàng
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

export default BTNShippingOrder;