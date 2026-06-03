/** customer_master — parent entity; one customer, many opportunities */

export type CustomerType =
  | "Individual"
  | "Proprietorship"
  | "Partnership"
  | "Private Limited"
  | "Fleet Operator"
  | "Institution";

export interface CustomerMaster {
  customer_id: string;
  name: string;
  mobile: string;
  email: string | null;
  address: string | null;
  customer_type: CustomerType;
  /** Normalized mobile for duplicate matching */
  mobile_normalized: string;
  created_at: string;
  updated_at: string;
}

export type CreateCustomerInput = Pick<
  CustomerMaster,
  "name" | "mobile" | "email" | "address" | "customer_type"
>;
