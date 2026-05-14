import { create } from 'zustand';
import { apiFetch } from './useAuthStore';
import { toast } from 'sonner';
import { Cattle } from './useCattleStore';

export type SaleDestination = 'Jagal' | 'Reseller' | 'Konsumen Langsung' | 'Mitra' | 'Lainnya';
export type PaymentMethod = 'Cash' | 'Transfer' | 'Tempo' | 'DP';
export type PaymentStatus = 'Lunas' | 'DP' | 'Belum Lunas';
export type SaleStatus = 'Draft' | 'Final' | 'Dibatalkan';

export interface CattleSale {
  id: string;
  cattleId: string;
  saleDate: string;
  finalWeightKg: number;
  salePrice: number;
  destination: SaleDestination;
  buyerName?: string;
  buyerPhone?: string;
  deliveryAddress?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  downPayment?: number;
  purchasePrice: number;
  totalFeedCost: number;
  totalMedicalCost: number;
  additionalOperationalCost: number;
  totalProductionCost: number;
  projectedProfit: number;
  marginPercent: number;
  sellingPricePerKg?: number;
  totalAdg?: number;
  status: SaleStatus;
  notes?: string;
  weighProofUrl?: string;
  paymentProofUrl?: string;
  cattle?: Cattle;
  createdAt: string;
  updatedAt: string;
}

interface SalesState {
  sales: CattleSale[];
  isLoading: boolean;
  error: string | null;
  fetchSales: () => Promise<void>;
  addSale: (sale: Partial<CattleSale>) => Promise<boolean>;
  updateSale: (id: string, sale: Partial<CattleSale>) => Promise<boolean>;
  deleteSale: (id: string) => Promise<boolean>;
  getSaleById: (id: string) => CattleSale | undefined;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  isLoading: false,
  error: null,
  
  fetchSales: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiFetch('/sales');
      if (response.ok) {
        const data = await response.json();
        set({ sales: Array.isArray(data) ? data : [] });
      } else {
        throw new Error('Failed to fetch sales data');
      }
    } catch (error: any) {
      console.error('Error fetching sales:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addSale: async (saleData) => {
    try {
      const response = await apiFetch('/sales', {
        method: 'POST',
        body: JSON.stringify(saleData)
      });
      if (response.ok) {
        const data = await response.json();
        set((state) => ({ sales: [data, ...state.sales] }));
        toast.success('Data penjualan berhasil disimpan');
        return true;
      } else {
        const err = await response.json();
        toast.error(err.message || 'Gagal menyimpan data penjualan');
        return false;
      }
    } catch (error) {
      toast.error('Gagal menghubungkan ke server');
      return false;
    }
  },

  updateSale: async (id, saleData) => {
    try {
      const response = await apiFetch(`/sales/${id}`, {
        method: 'PUT',
        body: JSON.stringify(saleData)
      });
      if (response.ok) {
        const updated = await response.json();
        set((state) => ({
          sales: state.sales.map(sale => sale.id === id ? updated : sale)
        }));
        toast.success('Data penjualan berhasil diperbarui');
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Gagal memperbarui data penjualan');
      return false;
    }
  },

  deleteSale: async (id) => {
    try {
      const response = await apiFetch(`/sales/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        set((state) => ({
          sales: state.sales.filter(sale => sale.id !== id)
        }));
        toast.success('Data penjualan berhasil dihapus');
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Gagal menghapus data penjualan');
      return false;
    }
  },

  getSaleById: (id) => get().sales.find(s => s.id === id)
}));
