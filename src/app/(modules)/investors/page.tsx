'use client';

import React, { useState } from 'react';
import { useInvestorStore, Investor } from '@/lib/useInvestorStore';
import { useCattleStore } from '@/lib/useCattleStore';
import { useSalesStore } from '@/lib/useSalesStore';
import { 
  Plus, Users, Coins, Briefcase, ChevronRight, X, Edit, Trash2, 
  Search, Phone, Mail, MapPin, DollarSign, Beef, Award, ArrowUpRight 
} from 'lucide-react';
import { toast } from 'sonner';

export default function InvestorsPage() {
  const { investors, fetchInvestors, addInvestor, updateInvestor, deleteInvestor } = useInvestorStore();
  const { cattle, fetchCattle } = useCattleStore();
  const { sales, fetchSales } = useSalesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    profitSharePercent: 70,
    notes: ''
  });

  React.useEffect(() => {
    fetchInvestors();
    fetchCattle();
    fetchSales();
  }, [fetchInvestors, fetchCattle, fetchSales]);

  // Calculations
  const activeEntrustedCattle = cattle.filter(c => c.investorId && c.status !== 'ARSIP');
  
  // Calculate total profit shared with investors to date
  const totalProfitShared = React.useMemo(() => {
    return sales.reduce((acc, sale) => {
      if (sale.status !== 'Final') return acc;
      const cow = cattle.find(c => c.id === sale.cattleId);
      if (!cow || !cow.investorId) return acc;
      
      const investor = investors.find(inv => inv.id === cow.investorId);
      const sharePercent = investor ? investor.profitSharePercent : 70;
      const profit = sale.projectedProfit || 0;
      
      return acc + (profit * (sharePercent / 100));
    }, 0);
  }, [sales, cattle, investors]);

  // Filtered Investors
  const filteredInvestors = investors.filter(inv => 
    inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.phone.includes(searchQuery)
  );

  const handleOpenAddModal = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      profitSharePercent: 70,
      notes: ''
    });
    setEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (inv: Investor, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({
      id: inv.id,
      name: inv.name,
      email: inv.email,
      phone: inv.phone,
      address: inv.address || '',
      profitSharePercent: inv.profitSharePercent,
      notes: inv.notes || ''
    });
    setEditMode(true);
    setIsModalOpen(true);
  };

  const handleOpenDetail = async (inv: Investor) => {
    const detail = await useInvestorStore.getState().getInvestorById(inv.id);
    if (detail) {
      setSelectedInvestor(detail);
      setIsDetailOpen(true);
    } else {
      toast.error('Gagal memuat detail investor');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus investor ini?')) {
      const success = await deleteInvestor(id);
      if (success) {
        if (selectedInvestor?.id === id) {
          setIsDetailOpen(false);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode) {
      const result = await updateInvestor(formData.id, formData);
      if (result) {
        setIsModalOpen(false);
        // Refresh detail if open
        if (selectedInvestor && selectedInvestor.id === formData.id) {
          handleOpenDetail(result);
        }
      }
    } else {
      const result = await addInvestor(formData);
      if (result) {
        setIsModalOpen(false);
      }
    }
  };

  // Helper to calculate single investor statistics
  const getInvestorStats = (inv: Investor) => {
    const invCows = cattle.filter(c => c.investorId === inv.id);
    const activeCows = invCows.filter(c => c.status !== 'ARSIP');
    const soldCows = sales.filter(s => {
      const c = invCows.find(cow => cow.id === s.cattleId);
      return c && s.status === 'Final';
    });

    const totalProfit = soldCows.reduce((acc, curr) => acc + (curr.projectedProfit || 0), 0);
    const investorShare = totalProfit * (inv.profitSharePercent / 100);

    return {
      activeCount: activeCows.length,
      soldCount: soldCows.length,
      investorShare
    };
  };

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen bg-[#F7FAF8]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#17211B] tracking-tight">Kemitraan Investor</h1>
          <p className="text-[#68746D]">Kelola penitipan modal sapi, sistem bagi hasil, dan profit sharing peternak.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-black transition-all shadow-lg shadow-[#006B3F]/20 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          Tambah Investor
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-[#DDE7E1] shadow-sm flex flex-col group hover:border-[#006B3F] transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006B3F] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-[0.2em] mb-1">Total Mitra Investor</p>
          <p className="text-2xl font-black text-[#17211B]">{investors.length} <span className="text-xs font-normal text-[#68746D]">Orang</span></p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-[#DDE7E1] shadow-sm flex flex-col group hover:border-[#006B3F] transition-all">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Beef className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-[0.2em] mb-1">Sapi Titipan Aktif</p>
          <p className="text-2xl font-black text-[#17211B]">{activeEntrustedCattle.length} <span className="text-xs font-normal text-[#68746D]">Ekor</span></p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-[#DDE7E1] shadow-sm flex flex-col group hover:border-[#006B3F] transition-all">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Coins className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-[0.2em] mb-1">Bagi Hasil Investor (Lunas/Final)</p>
          <p className="text-2xl font-black text-emerald-600">Rp {totalProfitShared.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Investors List (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-[#17211B] flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-[#006B3F]" />
              Daftar Investor Aktif
            </h2>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#68746D]" />
              <input 
                type="text" 
                placeholder="Cari investor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DDE7E1] rounded-2xl text-sm font-bold focus:outline-none focus:border-[#006B3F]"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredInvestors.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-[2rem] border border-[#DDE7E1]">
                <Users className="w-12 h-12 text-[#DDE7E1] mx-auto mb-4" />
                <p className="font-bold text-[#17211B]">Belum ada investor terdaftar</p>
                <p className="text-xs text-[#68746D] mt-1">Daftarkan mitra investor baru Anda untuk memulai pencatatan.</p>
              </div>
            ) : (
              filteredInvestors.map(inv => {
                const stats = getInvestorStats(inv);
                return (
                  <div 
                    key={inv.id} 
                    onClick={() => handleOpenDetail(inv)}
                    className="bg-white p-6 rounded-[2rem] border border-[#DDE7E1] hover:border-[#006B3F] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#F7FAF8] rounded-2xl flex items-center justify-center text-[#006B3F] font-black border border-[#DDE7E1]">
                        {inv.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-[#17211B] flex items-center gap-2">
                          {inv.name}
                          <span className="px-2 py-0.5 bg-emerald-50 text-[#006B3F] text-[10px] rounded-full border border-emerald-100 font-bold">
                            Share {inv.profitSharePercent}%
                          </span>
                        </h4>
                        <p className="text-xs text-[#68746D] flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {inv.phone}</span>
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {inv.email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-border-neutral">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-[#68746D]">Kepemilikan</p>
                        <p className="text-sm font-black text-[#17211B]">{stats.activeCount} Sapi Aktif <span className="font-normal text-xs text-[#68746D]">({stats.soldCount} terjual)</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#68746D]">Estimasi Profit Share</p>
                        <p className="text-sm font-black text-[#006B3F]">Rp {stats.investorShare.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex items-center gap-1.5 pl-2">
                        <button 
                          onClick={(e) => handleOpenEditModal(inv, e)}
                          className="p-2 hover:bg-[#F7FAF8] text-[#68746D] hover:text-[#006B3F] rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(inv.id, e)}
                          className="p-2 hover:bg-red-50 text-[#68746D] hover:text-red-600 rounded-xl transition-all"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-[#DDE7E1] group-hover:text-[#006B3F] transition-all ml-1" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Business Custody Insights Sidebar (Right Column) */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm">
             <h3 className="text-lg font-black text-[#17211B] mb-6">Investasi & Kemitraan</h3>
             <div className="space-y-6">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
                   <div className="p-2 bg-emerald-100 text-[#006B3F] rounded-xl self-start"><Award className="w-4 h-4" /></div>
                   <div>
                     <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1">Skema Bagi Hasil</p>
                     <p className="text-xs font-bold text-[#17211B] leading-relaxed">Secara default, Barbara Farm menerapkan pembagian laba bersih 70% Investor / 30% Pengelola Kandang setelah dikurangi biaya operasional.</p>
                   </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-xl self-start"><ArrowUpRight className="w-4 h-4" /></div>
                   <div>
                     <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1">Bobot & Nilai ROI</p>
                     <p className="text-xs font-bold text-[#17211B] leading-relaxed">Semakin tinggi ADG (Average Daily Gain) sapi, semakin cepat bobot potong tercapai, sehingga memperkecil rasio FCR pakan dan melipatgandakan net profit share.</p>
                   </div>
                </div>
             </div>
          </section>
        </div>
      </div>

      {/* --- ADD / EDIT INVESTOR MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#17211B]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] border border-[#DDE7E1] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-[#DDE7E1] flex items-center justify-between bg-white">
              <h3 className="text-xl font-black text-[#17211B]">{editMode ? 'Edit Data Investor' : 'Tambah Investor Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#F7FAF8] rounded-xl text-[#68746D] hover:text-[#17211B] transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Nama Lengkap</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Contoh: Steven Barbara"
                  className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Email</label>
                  <input 
                    type="email" required
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="investor@example.com"
                    className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">No. Telepon / WA</label>
                  <input 
                    type="tel" required
                    value={formData.phone}
                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+62 812-XXXX-XXXX"
                    className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Bagi Hasil Investor (%)</label>
                <div className="relative">
                  <input 
                    type="number" required min="1" max="100"
                    value={formData.profitSharePercent}
                    onChange={e => setFormData(p => ({ ...p, profitSharePercent: Number(e.target.value) }))}
                    placeholder="70"
                    className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#68746D]">%</span>
                </div>
                <p className="text-[10px] text-[#68746D]">Persentase keuntungan bersih penjualan sapi yang diberikan kepada investor.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Alamat Rumah</label>
                <input 
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                  placeholder="Nama jalan, perumahan, kota..."
                  className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-medium focus:outline-none focus:border-[#006B3F]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Catatan Khusus</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Detail perjanjian titip pakan, dll..."
                  rows={3}
                  className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-medium focus:outline-none focus:border-[#006B3F]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#DDE7E1]">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3.5 font-bold text-[#68746D] hover:text-[#17211B] transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3.5 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-black transition-all shadow-lg shadow-[#006B3F]/20"
                >
                  {editMode ? 'Simpan Perubahan' : 'Daftarkan Investor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- INVESTOR DETAIL DRAWER / POPUP --- */}
      {isDetailOpen && selectedInvestor && (
        <div className="fixed inset-0 z-50 bg-[#17211B]/40 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-[#F7FAF8] w-full max-w-2xl h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
            
            {/* Detail Header */}
            <div className="px-8 py-6 bg-white border-b border-[#DDE7E1] flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-[#17211B]">{selectedInvestor.name}</h3>
                <p className="text-xs text-[#68746D] mt-0.5">ID: {selectedInvestor.id}</p>
              </div>
              <button 
                onClick={() => setIsDetailOpen(false)} 
                className="p-2 hover:bg-[#F7FAF8] rounded-xl text-[#68746D] hover:text-[#17211B] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detail Body */}
            <div className="p-8 space-y-8 flex-1">
              {/* Profile Card */}
              <div className="bg-white p-6 rounded-[2rem] border border-[#DDE7E1] space-y-4 shadow-sm">
                <h4 className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Informasi Kontak & Perjanjian</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-bold text-[#17211B]">
                  <div className="flex items-center gap-2 text-[#68746D] font-normal">
                    <Phone className="w-4 h-4 text-[#006B3F] flex-shrink-0" />
                    <span className="text-[#17211B] font-bold">{selectedInvestor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#68746D] font-normal">
                    <Mail className="w-4 h-4 text-[#006B3F] flex-shrink-0" />
                    <span className="text-[#17211B] font-bold">{selectedInvestor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#68746D] font-normal col-span-1 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-[#006B3F] flex-shrink-0" />
                    <span className="text-[#17211B] font-bold">{selectedInvestor.address || 'Alamat belum diisi'}</span>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 col-span-1 sm:col-span-2 flex items-center justify-between">
                    <span className="text-xs text-[#006B3F] font-bold uppercase tracking-wider">Persentase Bagi Hasil</span>
                    <span className="text-xl font-black text-[#006B3F]">{selectedInvestor.profitSharePercent}%</span>
                  </div>
                </div>
                {selectedInvestor.notes && (
                  <div className="p-4 bg-page-background rounded-2xl text-xs font-medium text-[#68746D] leading-relaxed">
                    <span className="font-bold text-[#17211B] block mb-1">Catatan Internal:</span>
                    {selectedInvestor.notes}
                  </div>
                )}
              </div>

              {/* Sapi Kepemilikan List */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-[#17211B] flex items-center gap-2.5">
                  <Beef className="w-5 h-5 text-[#006B3F]" />
                  Ternak yang Dititipkan ({selectedInvestor.cattles?.length || 0})
                </h3>

                {/* Sapi Aktif */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Sapi Sedang Dipelihara (Aktif)</h4>
                  {(() => {
                    const activeCows = selectedInvestor.cattles?.filter(c => c.status !== 'ARSIP') || [];
                    if (activeCows.length === 0) {
                      return <p className="text-xs text-[#68746D] italic">Tidak ada sapi aktif saat ini.</p>;
                    }
                    return activeCows.map(cow => (
                      <div key={cow.id} className="bg-white p-5 rounded-[1.5rem] border border-[#DDE7E1] flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#F7FAF8] rounded-xl flex items-center justify-center border border-[#DDE7E1] text-[#006B3F] font-black overflow-hidden flex-shrink-0">
                            {cow.photoUrl ? <img src={cow.photoUrl} className="w-full h-full object-cover" alt="" /> : cow.breed.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-[#17211B] text-sm">{cow.id}</p>
                            <p className="text-[10px] text-[#68746D]">{cow.breed} • Kandang: {cow.pen}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#68746D]">Bobot Saat Ini</p>
                          <p className="text-sm font-black text-[#17211B]">{cow.latestWeightKg || cow.initialWeightKg} Kg <span className="text-[10px] text-[#68746D] font-normal">(Awal: {cow.initialWeightKg} Kg)</span></p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Sapi Terjual & Hasil Laporan Keuntungan */}
                <div className="space-y-3 pt-4">
                  <h4 className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Sapi Terjual & Bagi Hasil</h4>
                  {(() => {
                    const soldCows = selectedInvestor.cattles?.filter(c => c.sale && c.sale.status === 'Final') || [];
                    if (soldCows.length === 0) {
                      return <p className="text-xs text-[#68746D] italic">Belum ada sapi yang terjual.</p>;
                    }
                    return soldCows.map(cow => {
                      const sale = cow.sale!;
                      const profit = sale.projectedProfit || 0;
                      const invShare = profit * (selectedInvestor.profitSharePercent / 100);
                      const farmShare = profit - invShare;
                      
                      return (
                        <div key={cow.id} className="bg-white p-6 rounded-[2rem] border border-[#DDE7E1] space-y-4 shadow-sm">
                          <div className="flex items-center justify-between border-b border-border-neutral pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#F7FAF8] rounded-xl flex items-center justify-center border border-[#DDE7E1] text-[#006B3F] font-black overflow-hidden flex-shrink-0">
                                {cow.photoUrl ? <img src={cow.photoUrl} className="w-full h-full object-cover" alt="" /> : cow.breed.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-[#17211B] text-sm">{cow.id}</p>
                                <p className="text-[10px] text-[#68746D]">Terjual kepada: {sale.buyerName || '-'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-[#68746D]">Tanggal Jual</p>
                              <p className="text-xs font-bold text-[#17211B]">{new Date(sale.saleDate).toLocaleDateString('id-ID')}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                            <div className="p-3.5 bg-page-background rounded-2xl">
                              <span className="text-[9px] font-bold text-[#68746D] uppercase block mb-1">Harga Jual</span>
                              <span className="font-bold text-[#17211B] text-xs">Rp {sale.salePrice.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="p-3.5 bg-page-background rounded-2xl">
                              <span className="text-[9px] font-bold text-[#68746D] uppercase block mb-1">Total Biaya</span>
                              <span className="font-bold text-red-600 text-xs">Rp {sale.totalProductionCost.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="p-3.5 bg-[#EAF6F0] rounded-2xl border border-emerald-50">
                              <span className="text-[9px] font-bold text-[#006B3F] uppercase block mb-1">Net Profit</span>
                              <span className="font-black text-[#006B3F] text-xs">+Rp {profit.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
                              <span className="text-[9px] font-bold text-blue-700 uppercase block mb-1">Bagi Hasil ({selectedInvestor.profitSharePercent}%)</span>
                              <span className="font-black text-blue-700 text-xs">+Rp {invShare.toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
            
            {/* Detail Footer */}
            <div className="p-6 bg-white border-t border-[#DDE7E1] flex gap-3 sticky bottom-0">
              <button 
                onClick={(e) => handleOpenEditModal(selectedInvestor, e)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-[#DDE7E1] hover:bg-[#F7FAF8] text-[#17211B] rounded-2xl font-bold transition-all"
              >
                <Edit className="w-4 h-4 text-[#006B3F]" />
                Edit Investor
              </button>
              <button 
                onClick={(e) => handleDelete(selectedInvestor.id, e)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-red-200 hover:bg-red-50 text-red-600 rounded-2xl font-bold transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Investor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
