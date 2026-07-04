"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Plus,
  BarChart2,
  User,
} from "lucide-react";

interface MobileNavProps {
  onNewTask: () => void;
}

export default function MobileNav({ onNewTask }: MobileNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/task", icon: CheckSquare, label: "Tugas" },
    { href: "/profile", icon: User, label: "Profil" },
    {
      href: "/analytics",
      icon: BarChart2,
      label: "Analitik",
    },
  ];

  return (
    <nav className="md:hidden flex-shrink-0 flex items-center justify-around bg-[#111827] border-t border-white/10 px-2 py-2 safe-area-inset-bottom">
      {/* First 2 items */}
      {navItems.slice(0, 2).map((item) => {
        const isActive =
          pathname === item.href ||
          pathname.startsWith(item.href.split("?")[0]);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              isActive ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}

      {/* Center FAB - New Task */}
      <button
        onClick={onNewTask}
        className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/40 hover:bg-indigo-500 transition-all active:scale-95"
      >
        <Plus size={24} className="text-white" />
      </button>

      {/* Last 2 items */}
      {navItems.slice(2).map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              isActive ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
