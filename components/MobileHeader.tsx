"use client";

import React from "react";
import Link from "next/link";
import { useTaskStore } from "@/store/taskStore";
import { Settings } from "lucide-react";

export default function MobileHeader() {
  const { user } = useTaskStore();

  const getInitials = (n?: string) =>
    (n || "U")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0b1326] flex-shrink-0 z-20">
      {/* Kiri: Avatar → ke /profile */}
      <Link
        href="/profile"
        className="flex-shrink-0 active:opacity-70 transition-opacity"
      >
        {user?.photoUrl ? (
          <img
            src={user.photoUrl}
            alt="Profil"
            className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/50"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold border-2 border-indigo-500/50">
            {getInitials(user?.name)}
          </div>
        )}
      </Link>

      {/* Tengah: Nama App */}
      <span className="text-white font-bold text-base tracking-widest">
        TODOI
      </span>

      {/* Kanan: Ikon Pengaturan → ke /settings */}
      <Link
        href="/settings"
        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition"
      >
        <Settings size={20} />
      </Link>
    </header>
  );
}
