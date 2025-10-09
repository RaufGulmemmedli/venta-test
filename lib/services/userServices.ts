import { axiosInstance } from "@/lib/axios";

export interface User {
  id: number;
  name: string;
  finCode: string;
  serialNumber: string;
  phoneNumber: string;
  internalNumber: string;
  email: string;
  password: string;
  role?: string;
  status?: string;
  company?: string;
  position?: string;
  structureCode?: string;
  desk?: string;
  image?: string;
}

export interface CreateUserRequest {
  name: string;
  finCode: string;
  serialNumber: string;
  phoneNumber: string;
  internalNumber: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: number;
  role?: string;
  status?: string;
  company?: string;
  position?: string;
  structureCode?: string;
  desk?: string;
  image?: string;
}

export interface UserListResponse {
  items: User[];
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export const userService = {
  // Create a new user
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await axiosInstance.post<User>('Users/create', data);
    return response.data;
  },

  // Get all users with pagination
  getAllUsers: async (params: UserParams = {}): Promise<UserListResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.set('PageNumber', String(params.pageNumber ?? 1));
    searchParams.set('PageSize', String(params.pageSize ?? 10));
    
    if (params.search) {
      searchParams.set('SearchTerm', params.search);
    }
    
    if (typeof params.isActive === 'boolean') {
      searchParams.set('IsActive', String(params.isActive));
    }

    const url = `Users/get-all-with-pagination?${searchParams.toString()}`;
    const response = await axiosInstance.get<any>(url);
    const responseValue = response.data?.responseValue;

    const items: User[] = Array.isArray(responseValue?.items)
      ? responseValue.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          finCode: item.finCode,
          serialNumber: item.serialNumber,
          phoneNumber: item.phoneNumber,
          internalNumber: item.internalNumber,
          email: item.email,
          password: item.password || '',
          role: item.role,
          status: item.status,
          company: item.company,
          position: item.position,
          structureCode: item.structureCode,
          desk: item.desk,
          image: item.image
        }))
      : [];

    return {
      items,
      pageNumber: responseValue?.pageNumber ?? 1,
      totalPages: responseValue?.totalPages ?? 1,
      pageSize: responseValue?.pageSize ?? items.length,
      totalCount: responseValue?.totalCount ?? items.length,
      hasPreviousPage: responseValue?.hasPreviousPage ?? false,
      hasNextPage: responseValue?.hasNextPage ?? false,
    };
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User | null> => {
    try {
      const response = await axiosInstance.get<any>(`Users/get-by-id?id=${id}`);
      const responseValue = response.data?.responseValue;
      
      if (!responseValue) return null;

      return {
        id: responseValue.id,
        name: responseValue.name,
        finCode: responseValue.finCode,
        serialNumber: responseValue.serialNumber,
        phoneNumber: responseValue.phoneNumber,
        internalNumber: responseValue.internalNumber,
        email: responseValue.email,
        password: responseValue.password || '',
        role: responseValue.role,
        status: responseValue.status,
        company: responseValue.company,
        position: responseValue.position,
        structureCode: responseValue.structureCode,
        desk: responseValue.desk,
        image: responseValue.image
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Update user
  updateUser: async (data: UpdateUserRequest): Promise<User> => {
    const response = await axiosInstance.put<User>('Users/update', data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await axiosInstance.delete(`Users/delete?id=${id}`);
  },

  // Activate/Deactivate user
  toggleUserStatus: async (id: number, isActive: boolean): Promise<void> => {
    await axiosInstance.patch(`Users/toggle-status?id=${id}&isActive=${isActive}`);
  },

  // Change user password
  changePassword: async (id: number, newPassword: string): Promise<void> => {
    await axiosInstance.patch(`Users/change-password`, { id, newPassword });
  }
};
