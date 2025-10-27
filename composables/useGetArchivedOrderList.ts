import type {Orders} from "../types/order";
import { useApi } from "./useApi";

export const useGetArchivedOrderList = (limit: number = 50, skip: number = 0) => {
    const {orderUrl} = useApi();
    
    const url = `${orderUrl}/archived-orders/?limit=${limit}&skip=${skip}`;
    console.log('Fetching archived orders:', url);   
    
    const {data, error, refresh} = useFetch<Orders>(url, {
        lazy: true,
        server: false,
    });
    
    return {
        data,
        error,
        refresh
    }
}
