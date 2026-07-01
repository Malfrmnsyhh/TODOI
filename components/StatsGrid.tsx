'use client';

import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { CheckCircle2, Clock, AlertTriangle, LayoutList } from 'lucide-react';

const StatsGrid: React.FC = () => {
  const { getStats } = useTaskStore();
  const stats = getStats();

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const cards = [
    {
      label: 'Total Tugas',
      value: stats.total,
      icon: LayoutList,
      gradient: 'from-indigo-600/30 to-indigo-600/5',
      iconBg: 'bg-indigo-500/20',
      iconColor: 'text-indigo-400',
      badge: null,
    },
    {
      label: 'Selesai',
      value: stats.completed,
      icon: CheckCircle2,
      gradient: 'from-emerald-600/30 to-emerald-600/5',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      badge: stats.total > 0 ? `${completionRate}%` : null,
      badgeColor: 'text-emerald-400 bg-emerald-400/10',
    },
    {
      label: 'Tertunda',
      value: stats.pending,
      icon: Clock,
      gradient: 'from-amber-600/30 to-amber-600/5',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      badge: null,
    },
    {
      label: 'Jatuh Tempo',
      value: stats.overdue,
      icon: AlertTriangle,
      gradient: 'from-rose-600/30 to-rose-600/5',
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-400',
      badge: stats.overdue > 0 ? 'Perhatian!' : null,
      badgeColor: 'text-rose-400 bg-rose-400/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`
              relative overflow-hidden glass-panel rounded-2xl p-4 md:p-5
              bg-gradient-to-br ${card.gradient}
              hover:scale-[1.02] transition-transform duration-200
            `}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon size={18} className={card.iconColor} />
              </div>
              {card.badge && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                  {card.badge}
                </span>
              )}
            </div>

            {/* Value */}
            <p className="text-3xl md:text-4xl font-bold text-white leading-none mb-1">
              {card.value}
            </p>
            <p className="text-xs md:text-sm text-gray-400 font-medium">{card.label}</p>

            {/* Decorative glow */}
            <div
              className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-20 ${card.iconColor.replace('text-', 'bg-')}`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default StatsGrid;
