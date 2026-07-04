'use client';

import React, { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'pending', label: 'Tertunda' },
  { id: 'completed', label: 'Selesai' },
  { id: 'overdue', label: 'Jatuh Tempo' },
] as const;

const SORT_OPTIONS = [
  { id: 'date', name: 'Tenggat Waktu (Terdekat)' },
  { id: 'priority', name: 'Prioritas (Tertinggi)' },
  { id: 'created', name: 'Tanggal Dibuat (Terbaru)' },
] as const;

const PRIORITY_OPTIONS = [
  { id: null, name: 'Semua Prioritas' },
  { id: 'high', name: 'Tinggi (High)' },
  { id: 'medium', name: 'Sedang (Medium)' },
  { id: 'low', name: 'Rendah (Low)' },
] as const;

const TaskFilters: React.FC = () => {
  const { filters, setFilters, resetFilters, tasks } = useTaskStore();
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Kumpulkan kategori unik dari semua task
  const categories = Array.from(
    new Set(tasks.map((t) => t.category).filter(Boolean))
  );

  // Cek apakah ada filter aktif (selain default)
  const isFilterActive =
    filters.priority !== null ||
    filters.category !== null ||
    filters.sortBy !== 'date' ||
    filters.status !== 'all' ||
    filters.searchQuery !== '';

  return (
    <div className="flex flex-col gap-4">
      {/* ── Row 1: Tabs + Action Buttons ── */}
      <div className="flex items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilters({ status: tab.id })}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border whitespace-nowrap transition-all ${
                filters.status === tab.id
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Filter Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search Input */}
          {showSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder="Cari tugas..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ searchQuery: e.target.value })}
                autoFocus
                className="w-44 px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters({ searchQuery: '' })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setFilters({ searchQuery: '' });
            }}
            className={`p-2 border rounded-xl transition ${
              filters.searchQuery
                ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
                : 'text-gray-400 hover:text-white border-white/10 hover:bg-white/5'
            }`}
            title="Cari"
          >
            <Search size={16} />
          </button>

          {/* Filter & Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`p-2 border rounded-xl transition ${
                isFilterActive || showDropdown
                  ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
                  : 'text-gray-400 hover:text-white border-white/10 hover:bg-white/5'
              }`}
              title="Filter & Urutan"
            >
              <SlidersHorizontal size={16} />
            </button>

            {showDropdown && (
              <>
                {/* Overlay klik luar */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />

                <div className="absolute right-0 mt-2 w-64 bg-[#1e293b]/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl z-50 text-white animate-in fade-in slide-in-from-top-2 duration-150">

                  {/* Urutkan */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                      Urutkan
                    </h4>
                    <div className="space-y-1.5 text-xs text-gray-300">
                      {SORT_OPTIONS.map((opt) => (
                        <label
                          key={opt.id}
                          className="flex items-center gap-2 cursor-pointer py-1 px-1.5 hover:bg-white/5 rounded transition hover:text-white"
                        >
                          <input
                            type="radio"
                            name="sortBy"
                            checked={filters.sortBy === opt.id}
                            onChange={() => setFilters({ sortBy: opt.id })}
                            className="accent-indigo-500"
                          />
                          <span>{opt.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <hr className="border-white/5 mb-4" />

                  {/* Filter Prioritas */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                      Filter Prioritas
                    </h4>
                    <div className="space-y-1.5 text-xs text-gray-300">
                      {PRIORITY_OPTIONS.map((opt) => (
                        <label
                          key={String(opt.id)}
                          className="flex items-center gap-2 cursor-pointer py-1 px-1.5 hover:bg-white/5 rounded transition hover:text-white"
                        >
                          <input
                            type="radio"
                            name="priorityFilter"
                            checked={filters.priority === opt.id}
                            onChange={() => setFilters({ priority: opt.id })}
                            className="accent-indigo-500"
                          />
                          <span>{opt.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <hr className="border-white/5 mb-4" />

                  {/* Filter Kategori */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                      Filter Kategori
                    </h4>
                    <select
                      value={filters.category ?? 'all'}
                      onChange={(e) =>
                        setFilters({
                          category: e.target.value === 'all' ? null : e.target.value,
                        })
                      }
                      className="w-full bg-[#0b1326] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="all">Semua Kategori</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          #{cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reset */}
                  {isFilterActive && (
                    <>
                      <hr className="border-white/5 mb-3" />
                      <button
                        onClick={() => {
                          resetFilters();
                        }}
                        className="w-full text-xs text-rose-400 hover:text-rose-300 font-semibold py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl transition"
                      >
                        Reset Filter
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Active Filter Badges ── */}
      {(filters.priority || filters.category || filters.searchQuery) && (
        <div className="flex flex-wrap gap-2">
          {filters.searchQuery && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/15 border border-indigo-500/30 rounded-full text-[11px] text-indigo-300 font-medium">
              Cari: &quot;{filters.searchQuery}&quot;
              <button onClick={() => setFilters({ searchQuery: '' })}>
                <X size={11} />
              </button>
            </span>
          )}
          {filters.priority && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-[11px] text-amber-300 font-medium">
              Prioritas: {filters.priority}
              <button onClick={() => setFilters({ priority: null })}>
                <X size={11} />
              </button>
            </span>
          )}
          {filters.category && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/15 border border-sky-500/30 rounded-full text-[11px] text-sky-300 font-medium">
              #{filters.category}
              <button onClick={() => setFilters({ category: null })}>
                <X size={11} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
