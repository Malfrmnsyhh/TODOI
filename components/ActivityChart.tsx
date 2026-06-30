'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useTaskStore } from '@/store/taskStore';

export default function ActivityChart() {
  const { tasks } = useTaskStore();

  const getChartData = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      const label = d.toLocaleDateString('id-ID', { weekday: 'short' });

      const completedCount = tasks.filter((task) => {
        if (!task.isCompleted || !task.updatedAt) return false;
        return new Date(task.updatedAt).toDateString() === d.toDateString();
      }).length;

      const createdCount = tasks.filter((task) => {
        return new Date(task.createdAt).toDateString() === d.toDateString();
      }).length;

      return {
        name: label,
        'Selesai': completedCount,
        'Baru': createdCount,
      };
    });
  };

  // Fallback demo data when no tasks exist
  const demoData = [
    { name: 'Min', Selesai: 2, Baru: 3 },
    { name: 'Sen', Selesai: 4, Baru: 5 },
    { name: 'Sel', Selesai: 3, Baru: 4 },
    { name: 'Rab', Selesai: 5, Baru: 6 },
    { name: 'Kam', Selesai: 4, Baru: 2 },
    { name: 'Jum', Selesai: 6, Baru: 5 },
    { name: 'Sab', Selesai: 7, Baru: 8 },
  ];

  const displayData = tasks.length === 0 ? demoData : getChartData();

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBaru" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="Selesai"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSelesai)"
            />
            <Area
              type="monotone"
              dataKey="Baru"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBaru)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs mt-3 text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full inline-block" />
          <span>Selesai</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block" />
          <span>Tugas Baru</span>
        </div>
      </div>
    </div>
  );
}
