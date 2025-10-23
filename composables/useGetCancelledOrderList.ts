import type {Orders} from "../types/order";
import { useApi } from "./useApi";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

export const useGetCancelledOrderList = () => {
    const {orderUrl} = useApi();
    const { authenticatedUseFetch } = useAuthenticatedFetch();
    console.log(orderUrl);   
    
    const {data, error} = authenticatedUseFetch<Orders>(`${orderUrl}/cancelled-orders`,
        {
            key: 'cancelled-order-list-data',
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
