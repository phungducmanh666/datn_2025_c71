import { useStaff } from '@hook/userHook/staffHook';
import { Flex } from 'antd';
import Link from 'antd/es/typography/Link';
import React from 'react';

interface StaffInfoProps {
    uuid: string
}

const StaffInfo: React.FC<StaffInfoProps> = ({ uuid }) => {

    const { data, isFetching, refetch } = useStaff(uuid);
    if (isFetching) return <></>

    return <Flex vertical gap={10}>
        {data && <Link href={`/staffs/${uuid}`}>{`${data.firstName} ${data.lastName}`}</Link>}
    </Flex>

};

export default StaffInfo;