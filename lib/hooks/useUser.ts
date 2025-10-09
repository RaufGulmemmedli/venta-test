import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, User, CreateUserRequest, UpdateUserRequest, UserParams } from '@/lib/services/userServices';
import { toast } from 'sonner';

export const useUsers = (params: UserParams = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getAllUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('İstifadəçi uğurla yaradıldı!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'İstifadəçi yaradılarkən xəta baş verdi');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateUser(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      toast.success('İstifadəçi məlumatları uğurla yeniləndi!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'İstifadəçi yenilənərkən xəta baş verdi');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('İstifadəçi uğurla silindi!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'İstifadəçi silinərkən xəta baş verdi');
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => 
      userService.toggleUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('İstifadəçi statusu uğurla dəyişdirildi!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Status dəyişdirilərkən xəta baş verdi');
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) => 
      userService.changePassword(id, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Şifrə uğurla dəyişdirildi!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Şifrə dəyişdirilərkən xəta baş verdi');
    },
  });
};

// Custom hook for user management with local state
export const useUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);

  const params: UserParams = {
    pageNumber,
    pageSize,
    search: searchTerm || undefined,
    isActive: isActiveFilter,
  };

  const usersQuery = useUsers(params);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setPageNumber(1); // Reset to first page when searching
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPageNumber(page);
  }, []);

  const handleFilterChange = useCallback((isActive: boolean | undefined) => {
    setIsActiveFilter(isActive);
    setPageNumber(1); // Reset to first page when filtering
  }, []);

  return {
    users: usersQuery.data?.items || [],
    pagination: {
      pageNumber: usersQuery.data?.pageNumber || 1,
      totalPages: usersQuery.data?.totalPages || 1,
      pageSize: usersQuery.data?.pageSize || 10,
      totalCount: usersQuery.data?.totalCount || 0,
      hasPreviousPage: usersQuery.data?.hasPreviousPage || false,
      hasNextPage: usersQuery.data?.hasNextPage || false,
    },
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    searchTerm,
    setSearchTerm: handleSearch,
    pageNumber,
    setPageNumber: handlePageChange,
    isActiveFilter,
    setIsActiveFilter: handleFilterChange,
    refetch: usersQuery.refetch,
  };
};
