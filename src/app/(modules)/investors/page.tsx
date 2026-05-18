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

  // Dynamic breeding investment model calculator (Investor net share)
  const getBreedingProfit = (cow: any, isSold: boolean) => {
    if (!cow.entryDate) return 0;
    const entryDate = new Date(cow.entryDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - entryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.max(1, Math.floor(diffDays / 365)) || 1;
    const activeYears = Math.min(6, years);
    
    const pedetProfit = activeYears * 2400000;
    const afkerProfit = isSold ? 3600000 : 0;
    return pedetProfit + afkerProfit;
  };

  // Dynamic breeding model fee for Barbara Farm (Management share)
  const getBarbaraBreedingRevenue = (cow: any, isSold: boolean) => {
    if (!cow.entryDate) return 0;
    const entryDate = new Date(cow.entryDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - entryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.max(1, Math.floor(diffDays / 365)) || 1;
    const activeYears = Math.min(6, years);
    
    const pedetFee = activeYears * 1600000;
    const afkerFee = isSold ? 2400000 : 0;
    return pedetFee + afkerFee;
  };

  // Calculations
  const activeEntrustedCattle = cattle.filter(c => c.investorId && c.status !== 'ARSIP');
  
  // Helper to calculate single investor statistics
  const getInvestorStats = React.useCallback((inv: Investor) => {
    const invCows = cattle.filter(c => c.investorId === inv.id);
    const activeCows = invCows.filter(c => c.status !== 'ARSIP');
    const soldCows = sales.filter(s => {
      const c = invCows.find(cow => cow.id === s.cattleId);
      return c && s.status === 'Final';
    });

    let investorShare = 0;
    let barbaraRevenue = 0;
    
    invCows.forEach(cow => {
      const isSold = sales.some(s => s.cattleId === cow.id && s.status === 'Final') || cow.status === 'TERJUAL';
      if (cow.isDam || cow.gender === 'BETINA') {
        investorShare += getBreedingProfit(cow, isSold);
        barbaraRevenue += getBarbaraBreedingRevenue(cow, isSold);
      } else if (isSold) {
        const sale = sales.find(s => s.cattleId === cow.id && s.status === 'Final');
        if (sale) {
          const profit = sale.projectedProfit || 0;
          investorShare += profit * (inv.profitSharePercent / 100);
          barbaraRevenue += profit * (1 - inv.profitSharePercent / 100);
        }
      }
    });

    return {
      activeCount: activeCows.length,
      soldCount: soldCows.length,
      investorShare,
      barbaraRevenue
    };
  }, [cattle, sales]);

  // Synchronized overall metrics (Investor and Barbara Farm shares)
  const { totalProfitShared, totalBarbaraRevenue } = React.useMemo(() => {
    let investorTotal = 0;
    let barbaraTotal = 0;
    
    investors.forEach(inv => {
      const stats = getInvestorStats(inv);
      investorTotal += stats.investorShare;
      barbaraTotal += stats.barbaraRevenue;
    });
    
    return {
      totalProfitShared: investorTotal,
      totalBarbaraRevenue: barbaraTotal
    };
  }, [investors, getInvestorStats]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-[0.2em] mb-1">Bagi Hasil Investor (Lunas)</p>
          <p className="text-2xl font-black text-emerald-600">Rp {totalProfitShared.toLocaleString('id-ID')}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-[#DDE7E1] shadow-sm flex flex-col group hover:border-[#C19A5B] transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#C19A5B]/5 rounded-full blur-xl pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C19A5B] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-amber-100/30">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-[0.2em] mb-1">Pendapatan Kelola Barbara Farm</p>
          <p className="text-2xl font-black text-[#C19A5B]">Rp {totalBarbaraRevenue.toLocaleString('id-ID')}</p>
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
                        <p className="text-xs text-[#68746D]">Laba Investor</p>
                        <p className="text-sm font-black text-[#006B3F]">Rp {stats.investorShare.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#68746D]">Barbara Revenue</p>
                        <p className="text-sm font-black text-[#C19A5B]">Rp {stats.barbaraRevenue.toLocaleString('id-ID')}</p>
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
          {/* Section 1: Proyeksi ROI Breeding */}
          <section className="bg-white p-5 sm:p-6 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-[#C19A5B] rounded-full" />
              <h3 className="text-base sm:text-lg font-black text-[#17211B] tracking-tight">Proyeksi ROI Breeding (6 Tahun)</h3>
            </div>
            
            <div className="overflow-x-auto border border-[#DDE7E1] rounded-2xl mb-4 shadow-sm scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse min-w-[280px]">
                <thead>
                  <tr className="bg-[#17211B] text-white font-black">
                    <th className="px-3 py-3 uppercase tracking-wider text-[10px]">Sumber Hasil</th>
                    <th className="px-2 py-3 uppercase tracking-wider text-right text-[10px] whitespace-nowrap">Per Unit</th>
                    <th className="px-3 py-3 uppercase tracking-wider text-right text-emerald-400 text-[10px] whitespace-nowrap">Est. (5 Unit)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE7E1] font-bold text-[#17211B]">
                  <tr className="hover:bg-[#F7FAF8] transition-colors">
                    <td className="px-3 py-3 font-bold text-[11px] leading-tight">Penjualan Pedet (Net)</td>
                    <td className="px-2 py-3 text-right text-[#68746D] text-[11px] whitespace-nowrap">2,4 Jt / Thn</td>
                    <td className="px-3 py-3 text-right font-black text-[11px] whitespace-nowrap">Rp 72 Jt</td>
                  </tr>
                  <tr className="hover:bg-[#F7FAF8] transition-colors">
                    <td className="px-3 py-3 font-bold text-[11px] leading-tight">Indukan Afker</td>
                    <td className="px-2 py-3 text-right text-[#68746D] text-[11px] whitespace-nowrap">3,6 Jt <span className="text-[9px] block font-normal text-gray-400">(Nett)</span></td>
                    <td className="px-3 py-3 text-right font-black text-[11px] whitespace-nowrap">Rp 18 Jt</td>
                  </tr>
                  <tr className="bg-emerald-50/50 font-black">
                    <td className="px-3 py-3 text-[#006B3F] font-black text-[11px] leading-tight">Total Return</td>
                    <td className="px-2 py-3 text-right text-[#006B3F] font-black text-[11px] whitespace-nowrap">18 Jt / Ekor</td>
                    <td className="px-3 py-3 text-right text-[#006B3F] text-xs font-black whitespace-nowrap">Rp 90 Jt</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-center py-2">
              <span className="inline-block text-[#C19A5B] font-black text-[10px] sm:text-xs uppercase tracking-widest bg-[#C19A5B]/10 px-4 py-2.5 rounded-xl border border-[#C19A5B]/20">
                Return On Investment: 20.83% Per Tahun
              </span>
            </div>
          </section>

          {/* Section 2: Logika Perhitungan Laba */}
          <section className="bg-white p-5 sm:p-6 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-[#006B3F] rounded-full" />
              <h3 className="text-lg font-black text-[#17211B] tracking-tight">Logika Perhitungan Laba</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-black text-[#17211B] mb-2">Skema Profit Pedet</h4>
                <p className="text-xs text-[#68746D] leading-relaxed font-medium">
                  Sapi akan beranak setiap tahun selama 6 tahun masa investasi. Berikut adalah rincian pembagian hasil untuk investor:
                </p>
              </div>

              {/* Box 1: Calculation per Unit */}
              <div className="p-5 bg-[#F4F2EE] rounded-2xl border border-[#E4E2DE] space-y-2">
                <span className="text-[10px] font-black text-[#68746D] uppercase tracking-wider block">Perhitungan Per Ekor Pedet:</span>
                <p className="text-xs font-black text-[#17211B]">
                  Harga Jual - Fee (40%) = Investor Net
                </p>
                <div className="h-px bg-[#DDE7E1] my-2" />
                <p className="text-xs font-mono text-[#006B3F] font-bold">
                  Rp 4.000.000 - Rp 1.600.000 = Rp 2.400.000
                </p>
              </div>

              {/* Box 2: Hasil Bersih Highlight */}
              <div className="p-6 bg-[#0B251A] rounded-2xl text-center space-y-1 relative overflow-hidden shadow-lg border border-[#006B3F]/10">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#C19A5B]/10 rounded-full blur-xl pointer-events-none" />
                <span className="text-[10px] font-black text-[#C19A5B] uppercase tracking-widest block">Hasil Bersih</span>
                <p className="text-4xl font-black text-[#C19A5B] tracking-tight">2,4 JT</p>
                <span className="text-[10px] font-bold text-white/70 block uppercase tracking-wider">Per Ekor Pedet / Tahun</span>
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
                </div>
                {/* Investor Financial Board inside Drawer */}
                {(() => {
                  const stats = getInvestorStats(selectedInvestor);
                  const totalCapital = (selectedInvestor.cattles || []).reduce((sum, c) => sum + (c.purchasePrice || 0), 0);
                  
                  return (
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="p-4 bg-[#F4F2EE] rounded-2xl border border-[#E4E2DE] text-center">
                        <span className="text-[9px] text-[#68746D] font-bold uppercase tracking-wider block mb-1">Modal Awal</span>
                        <span className="text-xs sm:text-sm font-black text-[#17211B] whitespace-nowrap">Rp {totalCapital.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                        <span className="text-[9px] text-[#006B3F] font-bold uppercase tracking-wider block mb-1">Laba Bersih</span>
                        <span className="text-xs sm:text-sm font-black text-[#006B3F] whitespace-nowrap">Rp {stats.investorShare.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                        <span className="text-[9px] text-[#C19A5B] font-bold uppercase tracking-wider block mb-1">Barbara Revenue</span>
                        <span className="text-xs sm:text-sm font-black text-[#C19A5B] whitespace-nowrap">Rp {stats.barbaraRevenue.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  );
                })()}
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
                    return activeCows.map(cow => {
                      const isBreeding = cow.isDam || cow.gender === 'BETINA';
                      const breedingProfit = isBreeding ? getBreedingProfit(cow, false) : 0;
                      return (
                        <div key={cow.id} className="bg-white p-5 rounded-[1.5rem] border border-[#DDE7E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#F7FAF8] rounded-xl flex items-center justify-center border border-[#DDE7E1] text-[#006B3F] font-black overflow-hidden flex-shrink-0">
                              {cow.photoUrl ? <img src={cow.photoUrl} className="w-full h-full object-cover" alt="" /> : cow.breed.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-[#17211B] text-sm flex items-center gap-2">
                                {cow.id}
                                <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold ${isBreeding ? 'bg-[#C19A5B]/10 text-[#C19A5B] border border-[#C19A5B]/20' : 'bg-emerald-50 text-[#006B3F] border border-emerald-100'}`}>
                                  {isBreeding ? 'Breeding (6 Thn)' : 'Penggemukan'}
                                </span>
                              </p>
                              <p className="text-[10px] text-[#68746D]">{cow.breed} • Kandang: {cow.pen}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-dashed border-[#DDE7E1]">
                            <div className="text-left sm:text-right">
                              <p className="text-xs text-[#68746D]">Bobot Saat Ini</p>
                              <p className="text-sm font-black text-[#17211B]">{cow.latestWeightKg || cow.initialWeightKg} Kg <span className="text-[10px] text-[#68746D] font-normal">(Awal: {cow.initialWeightKg} Kg)</span></p>
                            </div>
                            {isBreeding && (
                              <div className="flex gap-4 border-l border-[#DDE7E1] pl-4">
                                <div className="text-right">
                                  <p className="text-xs text-[#006B3F] font-bold">Laba Investor</p>
                                  <p className="text-sm font-black text-[#006B3F]">Rp {breedingProfit.toLocaleString('id-ID')}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-[#C19A5B] font-bold">Barbara Fee</p>
                                  <p className="text-sm font-black text-[#C19A5B]">Rp {getBarbaraBreedingRevenue(cow, false).toLocaleString('id-ID')}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
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
                      const isBreeding = cow.isDam || cow.gender === 'BETINA';
                      
                      if (isBreeding) {
                        const totalBagiHasil = getBreedingProfit(cow, true);
                        const entryDate = new Date(cow.entryDate);
                        const saleDate = new Date(sale.saleDate);
                        const diffTime = Math.abs(saleDate.getTime() - entryDate.getTime());
                        const activeYears = Math.min(6, Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365))));
                        
                        return (
                          <div key={cow.id} className="bg-white p-6 rounded-[2rem] border border-[#DDE7E1] space-y-4 shadow-sm animate-in fade-in duration-200">
                            <div className="flex items-center justify-between border-b border-border-neutral pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#F7FAF8] rounded-xl flex items-center justify-center border border-[#DDE7E1] text-[#006B3F] font-black overflow-hidden flex-shrink-0">
                                  {cow.photoUrl ? <img src={cow.photoUrl} className="w-full h-full object-cover" alt="" /> : cow.breed.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-black text-[#17211B] text-sm flex items-center gap-2">
                                    {cow.id}
                                    <span className="px-2 py-0.5 bg-[#C19A5B]/10 text-[#C19A5B] text-[9px] rounded-full border border-[#C19A5B]/20 font-bold">
                                      Breeding (6 Thn) - Selesai Kontrak
                                    </span>
                                  </p>
                                  <p className="text-[10px] text-[#68746D]">Afker Indukan dijual kepada: {sale.buyerName || '-'}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-[#68746D]">Tanggal Jual</p>
                                <p className="text-xs font-bold text-[#17211B]">{new Date(sale.saleDate).toLocaleDateString('id-ID')}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                              <div className="p-3 bg-[#F4F2EE] rounded-2xl border border-[#E4E2DE]">
                                <span className="text-[9px] font-bold text-[#68746D] uppercase block mb-1">Hasil Pedet ({activeYears} Pedet)</span>
                                <span className="font-bold text-[#17211B] text-xs">Rp {(activeYears * 2400000).toLocaleString('id-ID')}</span>
                              </div>
                              <div className="p-3 bg-[#F4F2EE] rounded-2xl border border-[#E4E2DE]">
                                <span className="text-[9px] font-bold text-[#68746D] uppercase block mb-1">Hasil Afker Indukan</span>
                                <span className="font-bold text-[#17211B] text-xs">Rp 3.600.000</span>
                              </div>
                              <div className="p-3 bg-[#EAF6F0] rounded-2xl border border-emerald-50">
                                <span className="text-[9px] font-bold text-[#006B3F] uppercase block mb-1">Total Payout Investor</span>
                                <span className="font-black text-[#006B3F] text-xs">Rp {totalBagiHasil.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                                <span className="text-[9px] font-bold text-[#C19A5B] uppercase block mb-1">Barbara Revenue (40%)</span>
                                <span className="font-black text-[#C19A5B] text-xs">Rp {getBarbaraBreedingRevenue(cow, true).toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      const profit = sale.projectedProfit || 0;
                      const invShare = profit * (selectedInvestor.profitSharePercent / 100);
                      
                      return (
                        <div key={cow.id} className="bg-white p-6 rounded-[2rem] border border-[#DDE7E1] space-y-4 shadow-sm">
                          <div className="flex items-center justify-between border-b border-border-neutral pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#F7FAF8] rounded-xl flex items-center justify-center border border-[#DDE7E1] text-[#006B3F] font-black overflow-hidden flex-shrink-0">
                                {cow.photoUrl ? <img src={cow.photoUrl} className="w-full h-full object-cover" alt="" /> : cow.breed.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-[#17211B] text-sm flex items-center gap-2">
                                  {cow.id}
                                  <span className="px-2 py-0.5 bg-emerald-50 text-[#006B3F] text-[9px] rounded-full border border-emerald-100 font-bold">
                                    Penggemukan
                                  </span>
                                </p>
                                <p className="text-[10px] text-[#68746D]">Terjual kepada: {sale.buyerName || '-'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-[#68746D]">Tanggal Jual</p>
                              <p className="text-xs font-bold text-[#17211B]">{new Date(sale.saleDate).toLocaleDateString('id-ID')}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                            <div className="p-2.5 bg-[#F4F2EE] rounded-2xl">
                              <span className="text-[9px] font-bold text-[#68746D] uppercase block mb-1">Harga Jual</span>
                              <span className="font-bold text-[#17211B] text-xs">Rp {sale.salePrice.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="p-2.5 bg-[#F4F2EE] rounded-2xl">
                              <span className="text-[9px] font-bold text-[#68746D] uppercase block mb-1">Total Biaya</span>
                              <span className="font-bold text-red-600 text-xs">Rp {sale.totalProductionCost.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="p-2.5 bg-[#EAF6F0] rounded-2xl border border-emerald-50">
                              <span className="text-[9px] font-bold text-[#006B3F] uppercase block mb-1">Net Profit</span>
                              <span className="font-black text-[#006B3F] text-xs">+Rp {profit.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="p-2.5 bg-blue-50 rounded-2xl border border-blue-100">
                              <span className="text-[9px] font-bold text-blue-700 uppercase block mb-1">Bagi Hasil ({selectedInvestor.profitSharePercent}%)</span>
                              <span className="font-black text-blue-700 text-xs">+Rp {invShare.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-100">
                              <span className="text-[9px] font-bold text-[#C19A5B] uppercase block mb-1">Barbara Fee ({100 - selectedInvestor.profitSharePercent}%)</span>
                              <span className="font-black text-[#C19A5B] text-xs">+Rp {(profit - invShare).toLocaleString('id-ID')}</span>
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
