'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, CheckSquare, BarChart2, Settings, Plus } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';

interface SidebarProps {
  onNewTask: () => void;
}

export default function Sidebar({ onNewTask }: SidebarProps) {
  const { user } = useTaskStore();

  // Get initials from user name (e.g. "John Doe" -> "JD")
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true },
    { name: 'My Tasks', icon: CheckSquare, active: false },
    { name: 'Analytics', icon: BarChart2, active: false },
    { name: 'Settings', icon: Settings, active: false },
  ];

  return (
    <aside className="w-64 h-full flex flex-col p-6 border-r border-white/10 bg-[#0b1326] flex-shrink-0 hidden md:flex">
      {/* Brand & Profile */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-6">TODOI</h2>

        {/* Profile card - clickable, links to /profile */}
        <Link
          href="/profile"
          className="flex items-center gap-3 p-3 rounded-xl glass-panel-light hover:border-indigo-500/40 hover:bg-white/5 transition-all group"
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-indigo-500/30 group-hover:border-indigo-500 transition-colors">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {getInitials(user?.name)}
              </div>
            )}
          </div>

          {/* Name & tagline */}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-indigo-400 truncate">
              {user?.bio ? user.bio : 'Edit profil →'}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              item.active
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={18} />
            {item.name}
          </button>
        ))}
      </nav>

      {/* Action Button */}
      <button
        onClick={onNewTask}
        className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-semibold"
      >
        <Plus size={20} />
        Create New Task
      </button>
    </aside>
  );
}
