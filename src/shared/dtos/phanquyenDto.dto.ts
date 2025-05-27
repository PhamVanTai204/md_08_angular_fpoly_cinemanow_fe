// Định nghĩa interface cho User
export interface User {
  _id: string;
  user_name: string;
  email: string;
  url_image?: string;
  role: number;
  role_name?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  tokens?: string[];
  gender?: number;
  phone_number?: number;
  date_of_birth?: string;
  full_name?: string;
  isActive?: boolean;
  phone?: string;
  location?: string; // Thành phố/khu vực
  cinema_id?: string; // ID của rạp
  cinema_name?: string; // Tên rạp cụ thể
}

// Response từ API khi lấy danh sách user theo role
export interface UsersByRoleResponse {
  code: number;
  error: string | null;
  data: {
    users: User[];
    totalUsers: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

// Response chung từ API
export interface ApiResponse {
  code: number;
  error: string | null;
  data: User[] | User | any;
}

// Định nghĩa interface cho phân trang
export interface PaginationParams {
  page: number;
  limit: number;
}

// Định nghĩa interface cho filter
export interface UserFilter extends PaginationParams {
  role?: number;
  searchTerm?: string;
  location?: string; // Thành phố/khu vực  
  cinema_name?: string; // Tên rạp cụ thể
}

// Định nghĩa interface cho user mới/cập nhật
export interface UserCreateUpdate {
  user_name: string;
  email: string;
  password?: string;
  url_image?: string;
  role: number;
  phone?: string;
  isActive?: boolean;
  location?: string; // Có thể là thành phố hoặc tên rạp tùy context
  cinema_id?: string; // ID của rạp
  cinema_name?: string; // Tên rạp cụ thể
}