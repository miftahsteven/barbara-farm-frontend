'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { GrowthLog } from '@/lib/useGrowthStore';

interface GrowthLineChartProps {
  logs: GrowthLog[];
}

export const GrowthLineChart: React.FC<GrowthLineChartProps> = ({ logs }) => {
  // Sort logs by date for the chart
  const data = [...logs].sort((a, b) => new Date(a.weighDate).getTime() - new Date(b.weighDate).getTime()).map(l => ({
    date: new Date(l.weighDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    weight: l.weightKg,
    adg: l.adgKgPerDay
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-[#DDE7E1] rounded-2xl shadow-xl">
          <p className="text-xs font-bold text-[#68746D] uppercase tracking-widest mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm font-black text-[#17211B]">Berat: {payload[0].value} Kg</p>
            {payload[1] && <p className="text-xs font-bold text-[#006B3F]">ADG: {payload[1].value} Kg/hari</p>}
          </div>
        </div>
      );
    }
    return null;
  };

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);

  return (
    <div className="w-full h-[320px] mt-4">
      {isMounted && (
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#006B3F" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#006B3F" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDE7E1" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#68746D', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#68746D', fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="weight" 
              stroke="#006B3F" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorWeight)"
              dot={{ r: 4, fill: '#006B3F', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#2FBF71', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
