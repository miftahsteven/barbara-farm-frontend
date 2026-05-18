import { create } from 'zustand';
import { apiFetch } from './useAuthStore';
import { toast } from 'sonner';

// Aligning interface with Prisma schema
export interface Cattle {
  id: string;
  eartagNo?: string;
  name?: string;
  breed: string;
  gender: string;
  originType: string;
  originName?: string;
  entryDate: string;
  birthDate?: string;
  estimatedAgeMonths?: number;
  initialWeightKg: number;
  purchasePrice: number;
  photoUrl?: string;
  pen: string;
  status: string;
  notes?: string;
  qrUrl?: string;
  damId?: string;
  damAlias?: string;
  isDam?: boolean;
  dam?: Cattle;
  latestWeightKg?: number;
  archiveReason?: string;
  investorId?: string;
  investor?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profitSharePercent: number;
  };
  insurance?: {
    id: string;
    cattleId: string;
    coverageType: string;
    coveragePercent: number;
    sumAssured: number;
    premiumCost: number;
    premiumPaymentType: string;
    duration: string;
    startDate: string;
    endDate?: string;
    status: string;
    notes?: string;
  };
  sale?: {
    id: string;
    cattleId: string;
    saleDate: string;
    finalWeightKg: number;
    salePrice: number;
    destination: string;
    buyerName?: string;
    buyerPhone?: string;
    deliveryAddress?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    downPayment: number;
    purchasePrice: number;
    totalFeedCost: number;
    totalMedicalCost: number;
    additionalOperationalCost: number;
    totalProductionCost: number;
    projectedProfit: number;
    marginPercent: number;
    sellingPricePerKg: number;
    totalAdg: number;
    status: string;
    notes?: string;
    weighProofUrl?: string;
    paymentProofUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ScanHistoryItem {
  id: string;
  cattleId: string;
  name: string;
  status: 'success' | 'failed';
  timestamp: number;
}

interface CattleState {
  cattle: Cattle[];
  scanHistory: ScanHistoryItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    status: string;
    breed: string;
    pen: string;
    gender: string;
  };
  viewMode: 'card' | 'table';
  
  // Actions
  fetchCattle: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilter: (key: string, value: string) => void;
  setViewMode: (mode: 'card' | 'table') => void;
  addCattle: (newCattle: Partial<Cattle>) => Promise<Cattle>;
  updateCattle: (id: string, updatedCattle: Partial<Cattle>) => Promise<Cattle>;
  archiveCattle: (id: string, reason: string) => Promise<void>;
  unarchiveCattle: (id: string) => Promise<void>;
  deleteCattle: (id: string) => Promise<void>;
  addToScanHistory: (item: Omit<ScanHistoryItem, 'id' | 'timestamp'>) => void;
}

export const useCattleStore = create<CattleState>((set, get) => ({
  cattle: [],
  scanHistory: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: {
    status: 'ALL',
    breed: 'ALL',
    pen: 'ALL',
    gender: 'ALL',
  },
  viewMode: 'card',

  fetchCattle: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiFetch('/cattle');
      if (!response.ok) throw new Error('Failed to fetch cattle data');
      const data = await response.json();
      set({ cattle: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),

  setViewMode: (mode) => set({ viewMode: mode }),

  addCattle: async (newCattle) => {
    const response = await apiFetch('/cattle', {
      method: 'POST',
      body: JSON.stringify(newCattle)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error?.message || 'Failed to create cattle');
    }
    const data = await response.json();
    set((state) => ({ cattle: [data, ...state.cattle] }));
    return data;
  },

  updateCattle: async (id, updatedCattle) => {
    const response = await apiFetch(`/cattle/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedCattle)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update cattle');
    }
    const data = await response.json();
    set((state) => ({
      cattle: state.cattle.map((c) => c.id === id ? data : c)
    }));
    return data;
  },

  archiveCattle: async (id: string, reason: string) => {
    try {
      const response = await apiFetch(`/cattle/${encodeURIComponent(id)}/archive`, {
        method: 'PUT',
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        const updated = await response.json();
        set((state) => ({
          cattle: state.cattle.map((c) => (c.id === id ? updated : c))
        }));
        toast.success(`Sapi ${id} berhasil diarsipkan`);
      }
    } catch (error) {
      console.error('Error archiving cattle:', error);
      toast.error('Gagal mengarsipkan sapi');
    }
  },

  unarchiveCattle: async (id: string) => {
    try {
      const response = await apiFetch(`/cattle/${encodeURIComponent(id)}/unarchive`, {
        method: 'PUT'
      });
      if (response.ok) {
        const updated = await response.json();
        set((state) => ({
          cattle: state.cattle.map((c) => (c.id === id ? updated : c))
        }));
        toast.success(`Sapi ${id} telah diaktifkan kembali`);
      }
    } catch (error) {
      console.error('Error unarchiving cattle:', error);
      toast.error('Gagal mengaktifkan kembali sapi');
    }
  },

  deleteCattle: async (id) => {
    // Implement delete if available on backend, for now just remove from state (or archive)
    set((state) => ({
      cattle: state.cattle.filter((c) => c.id !== id)
    }));
  },

  addToScanHistory: (item) => {
    const newItem: ScanHistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    
    set((state) => {
      const newHistory = [newItem, ...state.scanHistory].slice(0, 10);
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cattle_scan_history', JSON.stringify(newHistory));
      }
      return { scanHistory: newHistory };
    });
  },
}));

// Initialize scan history from localStorage if available
if (typeof window !== 'undefined') {
  const savedHistory = localStorage.getItem('cattle_scan_history');
  if (savedHistory) {
    try {
      const parsed = JSON.parse(savedHistory);
      useCattleStore.setState({ scanHistory: parsed });
    } catch (e) {
      console.error('Failed to parse scan history', e);
    }
  }
}
