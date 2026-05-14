import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: string;
  twoFactorEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  requires2FA: boolean;
  requiresSetup2FA: boolean;
  tempUserId: string | null;
  qrCodeUrl: string | null;
  setAuth: (user: User, token: string) => void;
  setRequires2FA: (userId: string) => void;
  setRequiresSetup2FA: (userId: string) => void;
  setQrCodeUrl: (url: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      requires2FA: false,
      requiresSetup2FA: false,
      tempUserId: null,
      qrCodeUrl: null,
      setAuth: (user, token) => set({ user, token, requires2FA: false, requiresSetup2FA: false, tempUserId: null, qrCodeUrl: null }),
      setRequires2FA: (userId) => set({ requires2FA: true, requiresSetup2FA: false, tempUserId: userId }),
      setRequiresSetup2FA: (userId) => set({ requires2FA: false, requiresSetup2FA: true, tempUserId: userId }),
      setQrCodeUrl: (url) => set({ qrCodeUrl: url }),
      logout: () => set({ user: null, token: null, requires2FA: false, requiresSetup2FA: false, tempUserId: null, qrCodeUrl: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const API_URL = typeof window !== 'undefined' 
  ? `http://${window.location.hostname}:3001/api` 
  : 'http://localhost:3001/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
  }

  return response;
};
