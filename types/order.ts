export interface Order {
    _id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    company: string;
    comments: string;
    copies: number;
    specs: Array<{[key:string]: string}>;
    upload_status: string;
    order_status: string;
    submitted_at: string;
    is_student: boolean;
    id: string;
    file_url: string;
    isRejected?: boolean;
    product_name?: string;
}

export interface Orders {
    status: string;
    data: {
        orders: Array<Order>;
    };
    pagination: {
        total: number;
        limit: number;
        skip: number;
        returned: number;
    }
}