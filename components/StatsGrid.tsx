'use client';

import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { CheckCircle2, Clock, AlertTriangle, LayoutList } from 'lucide-react';

const StatsGrid: React.FC = () => {
  const { getStats } = useTaskStore();
  const stats = getStats();

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const circleR = 22;
  const circleCircumference = 2 * Math.PI * circleR;
  const circleOffset = circleCircumference - (completionRate / 100) * circleCircumference;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

      {/* ── Card 1: Total Tugas ── */}
      <div className="relative overflow-hidden glass-panel rounded-2xl p-4 md:p-5 bg-gradient-to-br from-indigo-600/30 to-indigo-600/5 hover:scale-[1.02] transition-transform duration-200 ease-in-out shadow-lg hover:shadow-xl cursor-default">
        <div className="p-2 rounded-xl bg-indigo-500/20 w-fit mb-2">
          <LayoutList size={18} className="text-indigo-400" />
        </div>
        <p className="text-xs md:text-sm text-gray-400 font-medium mb-2">Total Tugas</p>
        <p className="text-3xl md:text-4xl font-bold text-white leading-none">{stats.total}</p>
        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-20 bg-indigo-400" />
      </div>

      {/* ── Card 2: Selesai (dengan Circle Progress) ── */}
      <div className="relative overflow-hidden glass-panel rounded-2xl p-4 md:p-5 bg-gradient-to-br from-emerald-600/30 to-emerald-600/5 hover:scale-[1.02] transition-transform duration-200 ease-in-out shadow-lg hover:shadow-xl cursor-default">
        <div className="p-2 rounded-xl bg-emerald-500/20 w-fit mb-2">
          <CheckCircle2 size={18} className="text-emerald-400" />
        </div>
        <p className="text-xs md:text-sm text-gray-400 font-medium mb-2">Selesai</p>

        {/* Angka + Circle sejajar */}
        <div className="flex items-center justify-between">
          <p className="text-3xl md:text-4xl font-bold text-white leading-none">
            {stats.completed}
          </p>

          {/* SVG Circle Progress */}
          <div className="relative w-14 h-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
              {/* Track */}
              <circle
                cx="28" cy="28" r={circleR}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="5"
                fill="transparent"
              />
              {/* Progress */}
              <circle
                cx="28" cy="28" r={circleR}
                stroke="#34d399"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={circleCircumference}
                strokeDashoffset={circleOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* Persentase di tengah */}
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-400">
              {completionRate}%
            </span>
          </div>
        </div>

        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-20 bg-emerald-400" />
      </div>

      {/* ── Card 3: Tertunda ── */}
      <div className="relative overflow-hidden glass-panel rounded-2xl p-4 md:p-5 bg-gradient-to-br from-amber-600/30 to-amber-600/5 hover:scale-[1.02] transition-transform duration-200 ease-in-out shadow-lg hover:shadow-xl cursor-default">
        <div className="p-2 rounded-xl bg-amber-500/20 w-fit mb-2">
          <Clock size={18} className="text-amber-400" />
        </div>
        <p className="text-xs md:text-sm text-gray-400 font-medium mb-2">Tertunda</p>
        <p className="text-3xl md:text-4xl font-bold text-white leading-none">{stats.pending}</p>
        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-20 bg-amber-400" />
      </div>

      {/* ── Card 4: Jatuh Tempo ── */}
      <div className="relative overflow-hidden glass-panel rounded-2xl p-4 md:p-5 bg-gradient-to-br from-rose-600/30 to-rose-600/5 hover:scale-[1.02] transition-transform duration-200 ease-in-out shadow-lg hover:shadow-xl cursor-default">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-xl bg-rose-500/20 w-fit mb-2">
            <AlertTriangle size={18} className="text-rose-400" />
          </div>
          {stats.overdue > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-rose-400 bg-rose-400/10">
              Perhatian!
            </span>
          )}
        </div>
        <p className="text-xs md:text-sm text-gray-400 font-medium mb-2">Jatuh Tempo</p>
        <p className="text-3xl md:text-4xl font-bold text-white leading-none">{stats.overdue}</p>
        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-20 bg-rose-400" />
      </div>

    </div>
  );
};

export default StatsGrid;
