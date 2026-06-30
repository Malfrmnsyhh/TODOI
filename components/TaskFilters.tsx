'use client';

import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Search, SlidersHorizontal } from 'lucide-react';

const TaskFilters: React.FC = () => {
  const { filters, setFilters } = useTaskStore();

  const tabs = [
    { id: 'all', label: 'Semua' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Selesai' },
    { id: 'overdue', label: 'Lewat Waktu' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilters({ status: tab.id as 'all' | 'pending' | 'completed' | 'overdue' })}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filters.status === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
          <input
            type="text"
            placeholder="Cari tugas..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-gray-500 transition-all"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-lg flex-shrink-0">
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>
    </div>
  );
};

export default TaskFilters;
