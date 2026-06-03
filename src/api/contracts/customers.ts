import type { CustomerMaster, CreateCustomerInput } from "@/domain/entities/customer";

export interface ApiResponse<T> {
  data: T;
  meta?: { page?: number; total?: number; correlation_id?: string };
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export interface ListCustomersQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CustomerDto extends CustomerMaster {}

export interface CreateCustomerRequest extends CreateCustomerInput {}

export interface CreateCustomerResponse extends ApiResponse<CustomerDto> {}

export interface GetCustomerResponse extends ApiResponse<CustomerDto & {
  opportunities_count: number;
}> {}

export interface ListCustomersResponse extends ApiResponse<CustomerDto[]> {}

/** REST: GET /api/v1/customers/:customerId */
export type GetCustomerContract = (customerId: string) => Promise<GetCustomerResponse>;

/** REST: POST /api/v1/customers */
export type CreateCustomerContract = (body: CreateCustomerRequest) => Promise<CreateCustomerResponse>;
