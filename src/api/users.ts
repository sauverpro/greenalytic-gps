import apiClient from './client';

export interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  tel?: string;
  company?: string;
  address?: string;
  role: 'admin' | 'user';
  limitCar?: number;
  createdAt?: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  name?: string;
  email?: string;
  tel?: string;
  company?: string;
  address?: string;
  role?: 'admin' | 'user';
  limitCar?: number;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  tel?: string;
  company?: string;
  address?: string;
  role?: 'admin' | 'user';
  limitCar?: number;
}

export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>('/api/users');
  return response.data;
}

export async function getUser(id: number): Promise<User> {
  const response = await apiClient.get<User>(`/api/users/${id}`);
  return response.data;
}

export async function createUser(userData: CreateUserData): Promise<User> {
  const response = await apiClient.post<User>('/api/users', userData);
  return response.data;
}

export async function updateUser(id: number, userData: UpdateUserData): Promise<User> {
  const response = await apiClient.put<User>(`/api/users/${id}`, userData);
  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/api/users/${id}`);
}
