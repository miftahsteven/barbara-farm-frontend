import { create } from 'zustand';
import { apiFetch } from './useAuthStore';
import { toast } from 'sonner';
import { Cattle } from './useCattleStore';

export interface Investor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  profitSharePercent: number;
  notes?: string;
  cattles?: Cattle[];
  _count?: {
    cattles: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface InvestorState {
  investors: Investor[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchInvestors: () => Promise<void>;
  addInvestor: (newInvestor: Partial<Investor>) => Promise<Investor | null>;
  updateInvestor: (id: string, updatedInvestor: Partial<Investor>) => Promise<Investor | null>;
  deleteInvestor: (id: string) => Promise<boolean>;
  getInvestorById: (id: string) => Promise<Investor | null>;
}

export const useInvestorStore = create<InvestorState>((set, get) => ({
  investors: [],
  isLoading: false,
  error: null,

  fetchInvestors: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiFetch('/investors');
      if (!response.ok) throw new Error('Gagal mengambil data investor');
      const data = await response.json();
      set({ investors: Array.isArray(data) ? data : [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      console.error('Error fetching investors:', err);
    }
  },

  addInvestor: async (newInvestor) => {
    set({ isLoading: true });
    try {
      const response = await apiFetch('/investors', {
        method: 'POST',
        body: JSON.stringify(newInvestor)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal menambahkan investor');
      }
      const data = await response.json();
      set((state) => ({ 
        investors: [data, ...state.investors],
        isLoading: false 
      }));
      toast.success('Investor berhasil ditambahkan');
      return data;
    } catch (err: any) {
      set({ isLoading: false });
      toast.error(err.message);
      return null;
    }
  },

  updateInvestor: async (id, updatedInvestor) => {
    set({ isLoading: true });
    try {
      const response = await apiFetch(`/investors/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(updatedInvestor)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal memperbarui data investor');
      }
      const data = await response.json();
      set((state) => ({
        investors: state.investors.map((inv) => inv.id === id ? data : inv),
        isLoading: false
      }));
      toast.success('Data investor berhasil diperbarui');
      return data;
    } catch (err: any) {
      set({ isLoading: false });
      toast.error(err.message);
      return null;
    }
  },

  deleteInvestor: async (id) => {
    set({ isLoading: true });
    try {
      const response = await apiFetch(`/investors/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal menghapus investor');
      }
      set((state) => ({
        investors: state.investors.filter((inv) => inv.id !== id),
        isLoading: false
      }));
      toast.success('Investor berhasil dihapus');
      return true;
    } catch (err: any) {
      set({ isLoading: false });
      toast.error(err.message);
      return false;
    }
  },

  getInvestorById: async (id) => {
    try {
      const response = await apiFetch(`/investors/${encodeURIComponent(id)}`);
      if (!response.ok) throw new Error('Investor tidak ditemukan');
      return await response.json();
    } catch (err) {
      console.error('Error fetching investor details:', err);
      return null;
    }
  }
}));
