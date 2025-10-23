import type {Orders} from "../types/order";
import { useApi } from "./useApi";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

export const useGetArchivedOrderList = (limit: number = 50, skip: number = 0) => {
    const {orderUrl} = useApi();
    const { authenticatedUseFetch } = useAuthenticatedFetch();
    
    const url = `${orderUrl}/archived-orders?limit=${limit}&skip=${skip}`;
    console.log('Fetching archived orders:', url);   
    
    const {data, error, refresh} = authenticatedUseFetch<Orders>(url,
        {
            key: `archived-order-list-${skip}-${limit}`,
            lazy: true,
            server: false,
            getCachedData(key) {
                return undefined;
            },
        }
    );
    
    return {
        data,
        error,
        refresh
    }
}
