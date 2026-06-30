'use client';

import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Search, SlidersHorizontal } from 'lucide-react';

const TaskFilters: React.FC = () => {
  const { filters, setFilters } = useTaskStore();

  const tabs = [
    { id: 'all', label: 'All Tasks' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
      
      {/* Tabs */}
      <div className="flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilters({ status: tab.id as any })}
            className={`pb-4 text-sm font-medium transition-all relative ${
              filters.status === tab.id
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {filters.status === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)]"></div>
            )}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="w-full md:w-64 pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-gray-500 transition-all"
          />
        </div>
        
        <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-lg">
          <SlidersHorizontal size={16} />
          <span className="hidden md:inline">Filter</span>
        </button>
      </div>

    </div>
  );
};

export default TaskFilters;
