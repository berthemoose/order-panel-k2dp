/* TODO:
 * check if the typing of this is aligned throughout the entire pipeline
 */

export interface OrderItem {
  id: string;
  cart_item_id: string;
  product_name: string;
  price: number;
  base_price: number;
  values: { [key: string]: string | number | boolean };
  file_url: string;
  upload_status?: string;
}

export interface CustomerInfo {
  name: string;
  surname: string;
  email: string;
  phone: string;
  company: string;
}

export interface DeliveryAddress {
  street: string;
  number: string;
  code: string;
  city: string;
}

export interface DeliveryOption {
  name: string;
  description: string;
  price: number;
  time?: string;
  id: string;
}

export interface OrderData {
  _id: string;
  items: OrderItem[];
  customer_info: CustomerInfo;
  delivery_address?: DeliveryAddress;
  delivery_option?: DeliveryOption;
  delivery_method: "delivery" | "pickup";
  total: number;
  submitted_at: string;
  is_student: boolean;
  payment_intent_id: string;
  payment_status:
    | "pending"
    | "processing"
    | "succeeded"
    | "failed"
    | "canceled"
    | "requires_action"
    | "requires_payment_method"
    | "refunded";
  payment: any; // big stripe payment object
  upload_status: "pending" | "uploaded" | "failed";
}

export interface Orders {
  status: string;
  data: {
    orders: OrderData[];
  };
  pagination: {
    total: number;
    limit: number;
    skip: number;
    returned: number;
  };
}
