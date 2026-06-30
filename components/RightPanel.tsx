'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Bell, Search } from 'lucide-react';

export default function RightPanel() {
  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  
  // Dummy calendar data to match screenshot
  const dates = [
    25, 26, 27, 28, 29, 30, 1,
    2, 3, 4, 5, 6, 7, 8,
    9, 10, 11, 12, 13, 14, 15,
    16, 17, 18, 19, 20, 21, 22,
    23, 24, 25, 26, 27, 28, 29,
    30, 31, 1, 2, 3, 4, 5
  ];

  return (
    <aside className="w-80 h-full flex flex-col p-6 bg-[#0b1326] border-l border-white/10 hidden lg:flex flex-shrink-0">
      {/* Top Icons */}
      <div className="flex justify-end gap-4 mb-8 text-gray-400">
        <button className="hover:text-white transition"><Search size={20} /></button>
        <button className="hover:text-white transition relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>
      </div>

      {/* Calendar Widget */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-semibold">October 2023</h3>
          <div className="flex gap-2 text-gray-400">
            <button className="hover:text-white"><ChevronLeft size={18} /></button>
            <button className="hover:text-white"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-xs">
          {/* Days Header */}
          {days.map(day => (
            <div key={day} className="text-gray-500 font-medium">{day}</div>
          ))}
          
          {/* Dates */}
          {dates.map((date, i) => {
            const isToday = date === 24 && i > 20; // Just picking a date
            const isCurrentMonth = i > 5 && i < 37;
            
            return (
              <div 
                key={i} 
                className={`
                  w-7 h-7 flex items-center justify-center rounded-full mx-auto
                  ${isToday ? 'bg-indigo-600 text-white font-bold' : ''}
                  ${!isCurrentMonth ? 'text-gray-600' : isToday ? '' : 'text-gray-300 hover:bg-white/10 cursor-pointer'}
                `}
              >
                {date}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Productivity Chart Placeholder */}
      <div className="mt-8 flex-1 glass-panel rounded-2xl p-5 flex flex-col">
        <h3 className="text-white font-semibold mb-4">Activity History</h3>
        <div className="flex-1 border border-dashed border-white/20 rounded-xl flex items-center justify-center text-gray-500 text-sm">
          Chart Coming Soon
        </div>
      </div>
    </aside>
  );
}
