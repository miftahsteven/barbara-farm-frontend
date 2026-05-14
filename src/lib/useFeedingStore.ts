import { create } from 'zustand';
import { apiFetch } from './useAuthStore';
import { toast } from 'sonner';
import { Cattle } from './useCattleStore';

export type FeedType = 'HIJAUAN' | 'KONSENTRAT' | 'FERMENTASI' | 'SILASE' | 'MINERAL' | 'TAMBAHAN';
export type FeedingTarget = 'SAPI' | 'KELOMPOK';
export type FeedingTime = 'Pagi' | 'Siang' | 'Sore' | 'Malam';

export interface FeedingGroup {
  id: string;
  name: string;
  description?: string;
}

export interface FeedingLog {
  id: string;
  feedingDate: string;
  feedingTime: FeedingTime;
  targetType: FeedingTarget;
  cattleId?: string;
  groupId?: string;
  feedType: FeedType;
  feedName: string;
  portionKg: number;
  costPerKg: number;
  totalCost: number;
  notes?: string;
  status: 'Posted' | 'Draft' | 'Voided';
  createdBy: string;
  cattle?: Cattle;
  group?: FeedingGroup;
  createdAt: string;
  updatedAt: string;
}

interface FeedingState {
  logs: FeedingLog[];
  isLoading: boolean;
  error: string | null;
  fetchLogs: () => Promise<void>;
  addLog: (log: Partial<FeedingLog>) => Promise<boolean>;
  updateLog: (id: string, log: Partial<FeedingLog>) => Promise<boolean>;
  deleteLog: (id: string) => Promise<boolean>;
}

export const useFeedingStore = create<FeedingState>((set, get) => ({
  logs: [],
  isLoading: false,
  error: null,
  
  fetchLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiFetch('/feed');
      if (response.ok) {
        const data = await response.json();
        set({ logs: Array.isArray(data) ? data : [] });
      } else {
        throw new Error('Failed to fetch feeding logs');
      }
    } catch (error: any) {
      console.error('Error fetching feeding logs:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addLog: async (logData) => {
    try {
      const response = await apiFetch('/feed', {
        method: 'POST',
        body: JSON.stringify(logData)
      });
      if (response.ok) {
        const data = await response.json();
        set((state) => ({ logs: [data, ...state.logs] }));
        toast.success('Data pakan berhasil disimpan');
        return true;
      } else {
        const err = await response.json();
        toast.error(err.message || 'Gagal menyimpan data');
        return false;
      }
    } catch (error) {
      toast.error('Gagal menghubungkan ke server');
      return false;
    }
  },

  updateLog: async (id, logData) => {
    try {
      const response = await apiFetch(`/feed/${id}`, {
        method: 'PUT',
        body: JSON.stringify(logData)
      });
      if (response.ok) {
        const updated = await response.json();
        set((state) => ({
          logs: state.logs.map(log => log.id === id ? updated : log)
        }));
        toast.success('Data pakan berhasil diperbarui');
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Gagal memperbarui data');
      return false;
    }
  },

  deleteLog: async (id) => {
    try {
      const response = await apiFetch(`/feed/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        set((state) => ({
          logs: state.logs.filter(log => log.id !== id)
        }));
        toast.success('Data pakan berhasil dihapus');
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Gagal menghapus data');
      return false;
    }
  }
}));
