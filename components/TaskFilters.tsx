'use client';

import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { SlidersHorizontal } from 'lucide-react';

const TaskFilters: React.FC = () => {
  const { filters, setFilters } = useTaskStore();

  const tabs = [
    { id: 'all', label: 'Semua Tugas' },
    { id: 'pending', label: 'Belum Selesai' },
    { id: 'completed', label: 'Selesai' },
  ];

  return (
    <div className="flex flex-col">
      {/* Tabs & Filter Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilters({ status: tab.id as any })}
              className={`text-sm font-semibold transition-all relative ${
                filters.status === tab.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {filters.status === tab.id && (
                <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-indigo-400"></div>
              )}
            </button>
          ))}
        </div>
        
        <button className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
          <SlidersHorizontal size={14} />
          <span>Filter</span>
        </button>
      </div>
    </div>
  );
};

export default TaskFilters;
