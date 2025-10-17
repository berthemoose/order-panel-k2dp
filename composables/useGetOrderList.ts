import type {Order, Orders} from "../types/order";
import { useApi } from "./useApi";

export const useGetOrderList = () => {
    const {orderUrl} = useApi();
    console.log(orderUrl);   
    
    const {data,error} = useFetch<Orders>(`${orderUrl}/orders`,
        {
            key: 'current-order-list-data',
            lazy: true,
            server: true,
            getCachedData() {
                return undefined;
            },
        }
    );
    
    return {
        data,
        error
    }
}