import type { OrderData } from "./order";
export interface Section {
  id: string;
  title: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  orders?: OrderData[];
}
