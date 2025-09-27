export interface Order {
  id: string;
  created_at: number;
  currency: string;
  amount: number;
  payment_status: string;
  line_items?: { data: any[] };
  charges?: { data: Charge[] };
  customer_info?: { name?: string; email?: string; phone?: string; customer_id?: string };
}
export interface ChargePM {
  service_name?: string;
  type?: string;
  brand?: string;
  last4?: string;
}

export interface Charge {
  id: string;
  status: string;
  description?: string;
  amount: number;
  paid_at?: number;
  payment_method?: ChargePM;
  subscription_id?: string;
}