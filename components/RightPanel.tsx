'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, LogOut } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { useRouter } from 'next/navigation';
import ActivityChart from './ActivityChart';

export default function RightPanel() {
  const { tasks, user, setUser, setTasks } = useTaskStore();
  const router = useRouter();
  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getDaysInMonth = () => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();
    const numDaysPrev = new Date(year, month, 0).getDate();

    const datesList: { date: number; isCurrentMonth: boolean; fullDate: Date }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      datesList.push({
        date: numDaysPrev - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, numDaysPrev - i),
      });
    }

    for (let i = 1; i <= numDays; i++) {
      datesList.push({ date: i, isCurrentMonth: true, fullDate: new Date(year, month, i) });
    }

    const remaining = 42 - datesList.length;
    for (let i = 1; i <= remaining; i++) {
      datesList.push({ date: i, isCurrentMonth: false, fullDate: new Date(year, month + 1, i) });
    }

    return datesList;
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setTasks([]);
      router.push('/login');
    } catch (err) {
      console.error('Logout gagal:', err);
    }
  };

  const dates = getDaysInMonth();
  const today = new Date();

  return (
    <aside className="w-80 h-full flex flex-col p-6 bg-[#0b1326] border-l border-white/10 hidden lg:flex flex-shrink-0">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-8 text-gray-400">
        <div>
          {user && (
            <button
              onClick={handleLogout}
              title="Logout"
              className="hover:text-red-400 transition flex items-center gap-1.5 text-xs font-medium"
            >
              <LogOut size={14} />
              Logout
            </button>
          )}
        </div>
        <button className="hover:text-white transition relative">
          <Bell size={20} />
          {tasks.filter((t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()).length > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Dynamic Calendar */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-white font-semibold text-sm">
            {monthNames[month]} {year}
          </h3>
          <div className="flex gap-1 text-gray-400">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="hover:text-white p-1 rounded hover:bg-white/5 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="hover:text-white p-1 rounded hover:bg-white/5 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-xs">
          {days.map((day) => (
            <div key={day} className="text-gray-500 font-medium py-1">{day}</div>
          ))}

          {dates.map((item, i) => {
            const isToday =
              item.fullDate.toDateString() === today.toDateString();

            const hasTask = tasks.some((task) => {
              if (!task.dueDate || task.isCompleted) return false;
              return new Date(task.dueDate).toDateString() === item.fullDate.toDateString();
            });

            return (
              <div key={i} className="relative py-0.5">
                <div
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-full mx-auto transition-all
                    ${isToday ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/40' : ''}
                    ${!item.isCurrentMonth ? 'text-gray-700' : isToday ? '' : 'text-gray-300 hover:bg-white/10 cursor-pointer'}
                  `}
                >
                  {item.date}
                </div>
                {hasTask && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Chart */}
      <div className="mt-6 flex-1 glass-panel rounded-2xl p-5 flex flex-col min-h-0">
        <h3 className="text-white font-semibold mb-4 text-sm">Activity History</h3>
        <div className="flex-1">
          <ActivityChart />
        </div>
      </div>
    </aside>
  );
}
