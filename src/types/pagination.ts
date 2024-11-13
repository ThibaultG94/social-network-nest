export interface PaginationParams {
    page: number;
    limit: number;
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }