// types/api.ts
export interface ApiError {
  error: string;
  errors?: Array<{ msg: string; param: string }>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
