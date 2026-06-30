'use client';

import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Search, Filter, RotateCcw } from 'lucide-react';

const TaskFilters: React.FC = () => {
  const { filters, setFilters, resetFilters } = useTaskStore();

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.searchQuery}
          onChange={(e) => setFilters({ searchQuery: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-semibold mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({
                status: e.target.value as any,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-semibold mb-1">Priority</label>
          <select
            value={filters.priority || ''}
            onChange={(e) =>
              setFilters({
                priority: e.target.value ? (e.target.value as any) : null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold mb-1">Category</label>
          <select
            value={filters.category || ''}
            onChange={(e) =>
              setFilters({
                category: e.target.value || null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All</option>
            <option value="general">General</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="shopping">Shopping</option>
            <option value="health">Health</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-semibold mb-1">Sort by</label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({
                sortBy: e.target.value as any,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="date">Due Date</option>
            <option value="priority">Priority</option>
            <option value="created">Created</option>
          </select>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetFilters}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold text-sm"
      >
        <RotateCcw size={16} />
        Reset Filters
      </button>
    </div>
  );
};

export default TaskFilters;
