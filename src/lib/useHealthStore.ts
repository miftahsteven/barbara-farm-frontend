import { create } from 'zustand';
import { apiFetch } from './useAuthStore';
import { toast } from 'sonner';

export type MedicalSeverity = 'mild' | 'moderate' | 'severe' | 'emergency';
export type MedicalStatus = 'active' | 'treatment' | 'recovered' | 'closed';
export type ActionType = 'checkup' | 'vaccination' | 'deworming' | 'medicine' | 'wound_care';

export interface MedicalRecord {
  id: string;
  cattleId: string;
  checkDate: string;
  symptoms: string;
  diagnosis?: string;
  severity: MedicalSeverity;
  bodyTemperature?: number;
  appetite: 'normal' | 'reduced' | 'none';
  stoolCondition: 'normal' | 'soft' | 'watery' | 'bloody' | 'hard';
  actionType: ActionType;
  medicineName?: string;
  dosage?: string;
  withdrawalDays?: number;
  safeToSellDate?: string;
  nextCheckupDate?: string;
  status: MedicalStatus;
  recoveryDate?: string;
  notes?: string;
  photoUrl?: string;
  officerName?: string;
  createdAt: string;
  cattle?: {
    name: string;
    breed: string;
    pen: string;
    photoUrl: string;
  };
}

interface HealthState {
  records: MedicalRecord[];
  isLoading: boolean;
  fetchRecords: () => Promise<void>;
  fetchRecordsByCattleId: (cattleId: string) => Promise<MedicalRecord[]>;
  addRecord: (record: any) => Promise<MedicalRecord | void>;
  updateRecord: (id: string, data: any) => Promise<MedicalRecord | void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  records: [],
  isLoading: false,
  
  fetchRecords: async () => {
    set({ isLoading: true });
    try {
      const response = await apiFetch('/health');
      if (response.ok) {
        const data = await response.json();
        set({ records: Array.isArray(data) ? data : [] });
      }
    } catch (error) {
      console.error('Error fetching health records:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRecordsByCattleId: async (cattleId) => {
    try {
      const response = await apiFetch(`/health/cattle/${encodeURIComponent(cattleId)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching cattle health records:', error);
    }
    return [];
  },

  addRecord: async (recordData) => {
    try {
      const response = await apiFetch('/health', {
        method: 'POST',
        body: JSON.stringify(recordData)
      });
      if (response.ok) {
        const data = await response.json();
        set((state) => ({ records: [data, ...state.records] }));
        toast.success('Pemeriksaan berhasil dicatat');
        return data;
      } else {
        const err = await response.json();
        toast.error(err.message || 'Gagal menyimpan data');
      }
    } catch (error) {
      
      toast.error('Gagal menghubungkan ke server');
    }
  },

  updateRecord: async (id, data) => {
    try {
      const response = await apiFetch(`/health/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const updated = await response.json();
        set((state) => ({
          records: state.records.map(r => r.id === id ? { ...r, ...updated } : r)
        }));
        toast.success('Data berhasil diperbarui');
        return updated;
      }
    } catch (error) {
      
      toast.error('Gagal memperbarui data');
    }
  },

  deleteRecord: async (id) => {
    try {
      const response = await apiFetch(`/health/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        set((state) => ({ records: state.records.filter(r => r.id !== id) }));
        toast.success('Data kesehatan berhasil dihapus');
      }
    } catch (error) {
      
      toast.error('Gagal menghapus data');
    }
  }
}));
