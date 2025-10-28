import type {Order, Orders} from "../types/order";
import { useApi } from "./useApi";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

export const useGetOrderList = () => {
    const {orderUrl} = useApi();
    const { authenticatedUseFetch } = useAuthenticatedFetch();
    console.log(orderUrl);   
    
    const {data,error} = authenticatedUseFetch<Orders>(`${orderUrl}/orders/`,
        {
            key: 'current-order-list-data',
            lazy: true,
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