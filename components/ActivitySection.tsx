'use client';

import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const demoData = [
  { name: 'Min', Selesai: 2, Baru: 3 },
  { name: 'Sen', Selesai: 4, Baru: 5 },
  { name: 'Sel', Selesai: 3, Baru: 4 },
  { name: 'Rab', Selesai: 5, Baru: 6 },
  { name: 'Kam', Selesai: 4, Baru: 2 },
  { name: 'Jum', Selesai: 6, Baru: 5 },
  { name: 'Sab', Selesai: 7, Baru: 8 },
];

export default function ActivitySection() {
  const { tasks, getStats } = useTaskStore();
  const stats = getStats();
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

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

      return { name: label, Selesai: completedCount, Baru: createdCount };
    });
  };

  const displayData = tasks.length === 0 ? demoData : getChartData();

  // Count streak
  const streak = (() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const hasCompleted = tasks.some(
        (t) =>
          t.isCompleted &&
          t.updatedAt &&
          new Date(t.updatedAt).toDateString() === d.toDateString()
      );
      if (hasCompleted) count++;
      else if (i > 0) break;
    }
    return count;
  })();

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base md:text-2xl font-bold text-white">Aktivitas 7 Hari</h2>
          <p className="text-xs text-gray-500 mt-0.5">Tugas selesai & dibuat per hari</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Streak badge */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
            <span className="text-amber-400 text-base">🔥</span>
            <span className="text-amber-400 font-semibold text-sm">{streak} hari streak</span>
          </div>
          {/* Completion rate */}
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
            <span className="text-indigo-400 font-semibold text-sm">{completionRate}% selesai</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-44 md:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSelesai" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradBaru" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
            />
            <Area type="monotone" dataKey="Selesai" stroke="#6366f1" strokeWidth={2} fill="url(#gradSelesai)" />
            <Area type="monotone" dataKey="Baru" stroke="#3b82f6" strokeWidth={2} fill="url(#gradBaru)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-5 mt-3 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-indigo-500 rounded-full inline-block" />
          <span>Selesai</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-blue-500 rounded-full inline-block" />
          <span>Tugas Baru</span>
        </div>
      </div>
    </div>
  );
}
