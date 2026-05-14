"use client"

import * as React from "react"
import { TrendingUp, Users, AlertCircle, DollarSign, Activity, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { dashboardMetrics } from "@/lib/dummy-data"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import FarmMap from "@/components/dashboard/FarmMap"

import { useGrowthStore } from "@/lib/useGrowthStore"
import { useCattleStore } from "@/lib/useCattleStore"

export default function DashboardPage() {
  const { logs, fetchLogs } = useGrowthStore();
  const { cattle, fetchCattle } = useCattleStore();

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    fetchLogs();
    fetchCattle();
  }, [fetchLogs, fetchCattle]);

  const chartData = React.useMemo(() => {
    if (!cattle.length) return [];
    
    const result = [];
    const now = new Date();
    let lastAvg = 0;

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = d.toLocaleString('id-ID', { month: 'short' });
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      let totalWeight = 0;
      let count = 0;
      
      cattle.forEach(c => {
         // For historical accuracy, we should technically check if cattle was in farm at that time.
         // But for simplicity, we find its latest weight up to that month.
         const cLogs = logs.filter(l => l.cattleId === c.id && new Date(l.weighDate) <= endOfMonth)
                           .sort((a,b) => new Date(b.weighDate).getTime() - new Date(a.weighDate).getTime());
         
         if (cLogs.length > 0) {
           totalWeight += cLogs[0].weightKg;
           count++;
         } else if (c.initialWeightKg > 0) {
           totalWeight += c.initialWeightKg;
           count++;
         }
      });
      
      const avg = count > 0 ? Math.round(totalWeight / count) : lastAvg;
      lastAvg = avg;
      
      result.push({
        name: mName,
        weight: avg
      });
    }
    
    return result;
  }, [logs, cattle]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Dashboard Peternakan</h1>
        <p className="text-text-secondary mt-1 text-sm sm:text-base">
          Pantau kondisi ternak, aktivitas kandang, dan performa produksi secara real-time.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardMetrics.map((metric, i) => {
          const icons = [Users, TrendingUp, AlertCircle, DollarSign]
          const Icon = icons[i]
          return (
            <Card key={i} variant="metric">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-full bg-soft-green-surface flex items-center justify-center text-primary-green mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  {i === 2 && <Badge variant="warning">Perhatian</Badge>}
                </div>
                <p className="text-sm font-medium text-text-secondary">{metric.label}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <h3 className="text-2xl font-bold text-text-primary">{metric.value}</h3>
                  {metric.suffix && <span className="text-sm text-text-secondary">{metric.suffix}</span>}
                </div>
                <p className="text-xs text-text-secondary mt-2 flex items-center">
                  <Activity className="h-3 w-3 mr-1 opacity-70" />
                  {metric.trend}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <FarmMap />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Grafik Berat Rata-rata (6 Bulan)</CardTitle>
            <CardDescription>Tren kenaikan berat badan rata-rata seluruh sapi aktif</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDE5E1" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #DDE5E1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#006B3F" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#006B3F', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#2FBF71', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Kandang</CardTitle>
            <CardDescription>Tugas dan jadwal hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Pemberian Pakan Pagi", time: "06:00", status: "Selesai", type: "success" },
                { title: "Pembersihan Kandang B", time: "08:30", status: "Selesai", type: "success" },
                { title: "Vaksinasi PMK (Kandang A)", time: "09:00", status: "Berjalan", type: "primary" },
                { title: "Pemberian Pakan Sore", time: "15:00", status: "Menunggu", type: "neutral" },
                { title: "Pengecekan Kesehatan Rutin", time: "16:30", status: "Menunggu", type: "neutral" },
              ].map((task, i) => (
                <div key={i} className="flex items-start justify-between border-b border-border-neutral last:border-0 pb-4 last:pb-0">
                  <div className="flex space-x-3">
                    <div className="mt-0.5"><FileText className="h-4 w-4 text-text-secondary" /></div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{task.title}</p>
                      <p className="text-xs text-text-secondary">{task.time}</p>
                    </div>
                  </div>
                  <Badge variant={task.type as any}>{task.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
