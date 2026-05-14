'use client';

import React from 'react';
import { useFeedingStore, FeedType } from '@/lib/useFeedingStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface FeedCompositionChartProps {
  logs: any[];
}

const COLORS = ['#006B3F', '#2FBF71', '#88B04B', '#FFD700', '#FF8C00', '#9370DB'];

export const FeedCompositionChart: React.FC<FeedCompositionChartProps> = ({ logs }) => {
  const dataMap: Record<string, number> = {};
  
  logs.forEach(log => {
    dataMap[log.feedType] = (dataMap[log.feedType] || 0) + log.portionKg;
  });

  const data = Object.entries(dataMap).map(([name, value]) => ({ name, value }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-[#DDE7E1] rounded-xl shadow-lg">
          <p className="text-xs font-black text-[#17211B]">{payload[0].name}</p>
          <p className="text-xs font-bold text-[#006B3F]">{payload[0].value.toFixed(1)} Kg</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="circle"
            formatter={(value) => <span className="text-[10px] font-bold text-[#68746D] uppercase ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
