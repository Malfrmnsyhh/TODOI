'use client';

import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
} from 'lucide-react';

const StatsCard: React.FC = () => {
  const { getStats } = useTaskStore();
  const stats = getStats();

  const statItems = [
    { label: 'Total', value: stats.total, icon: ListTodo, color: 'blue' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'green' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'yellow' },
    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'red' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statItems.map(({ label, value, icon: Icon, color }) => {
        const colors = {
          blue: 'bg-blue-50 text-blue-600',
          green: 'bg-green-50 text-green-600',
          yellow: 'bg-yellow-50 text-yellow-600',
          red: 'bg-red-50 text-red-600',
        };

        return (
          <div key={label} className={`${colors[color as keyof typeof colors]} rounded-lg p-4 text-center`}>
            <Icon size={24} className="mx-auto mb-2" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm font-medium opacity-75">{label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCard;
