import { create } from 'zustand';
import { apiFetch } from './useAuthStore';
import { toast } from 'sonner';

export type GrowthStatus = 'excellent' | 'normal' | 'slow' | 'attention';

export interface GrowthLog {
  id: string;
  cattleId: string;
  weighDate: string;
  weightKg: number;
  chestCircumferenceCm?: number;
  heightCm?: number;
  bcs: number;
  notes?: string;
  weightGainKg?: number;
  daysFromPrevious?: number;
  adgKgPerDay?: number;
  status: GrowthStatus;
  createdAt: string;
}

interface GrowthState {
  logs: GrowthLog[];
  isLoading: boolean;
  fetchLogs: () => Promise<void>;
  fetchLogsByCowId: (cowId: string) => Promise<GrowthLog[]>;
  addLog: (log: any) => Promise<GrowthLog | void>;
  deleteLog: (id: string) => Promise<void>;
}

export const useGrowthStore = create<GrowthState>((set, get) => ({
  logs: [],
  isLoading: false,
  
  fetchLogs: async () => {
    set({ isLoading: true });
    try {
      const response = await apiFetch('/growth');
      if (response.ok) {
        const data = await response.json();
        set({ logs: data });
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchLogsByCowId: async (cowId) => {
    try {
      const response = await apiFetch(`/growth/cattle/${encodeURIComponent(cowId)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching cow logs:', error);
    }
    return [];
  },

  addLog: async (newLogData) => {
    try {
      const response = await apiFetch('/growth', {
        method: 'POST',
        body: JSON.stringify(newLogData)
      });
      if (response.ok) {
        const data = await response.json();
        set((state) => ({ logs: [data, ...state.logs] }));
        toast.success('Log timbang berhasil disimpan');
        return data;
      } else {
        const err = await response.json();
        toast.error(err.message || 'Gagal menyimpan log');
      }
    } catch (error) {
      console.error('Error adding log:', error);
      toast.error('Gagal menghubungkan ke server');
    }
  },

  deleteLog: async (id) => {
    try {
      const response = await apiFetch(`/growth/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        set((state) => ({ logs: state.logs.filter(l => l.id !== id) }));
        toast.success('Log berhasil dihapus');
      }
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  }
}));
