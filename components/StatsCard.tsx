'use client';

import React from 'react';
import { useTaskStore } from '@/store/taskStore';

const StatsCard: React.FC = () => {
  const { getStats } = useTaskStore();
  const stats = getStats();
  
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  // SVG Circle calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Total Tasks */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
        <p className="text-gray-400 font-medium mb-4">Total Tasks</p>
        <div className="flex items-end gap-3">
          <h2 className="text-5xl font-bold text-white">{stats.total}</h2>
          <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md font-medium mb-1">
            +12% vs last week
          </span>
        </div>
      </div>

      {/* In Progress */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
        <p className="text-gray-400 font-medium mb-4">In Progress</p>
        <div className="flex items-end justify-between">
          <h2 className="text-5xl font-bold text-white">{stats.pending}</h2>
          
          {/* Decorative circles */}
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50"></div>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 backdrop-blur-sm"></div>
          </div>
        </div>
      </div>1 

      {/* Completion Rate */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-gray-400 font-medium mb-4">Completion<br/>Rate</p>
          <h2 className="text-4xl font-bold text-white">{completionRate}%</h2>
        </div>
        
        {/* Circular Progress */}
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#6366f1"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
        </div>
      </div>

    </div>
  );
};

export default StatsCard;
