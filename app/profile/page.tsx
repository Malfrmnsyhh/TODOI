'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/store/taskStore';
import { supabase } from '@/lib/supabase';
import { Loader, Camera, ArrowLeft, Save, User } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useTaskStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setName(user.name || '');
    setBio(user.bio || '');
    setAvatarUrl(user.photoUrl || null);
  }, [user, router]);

  const getInitials = (n: string) =>
    n.split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2) || 'U';

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      setMessage({ type: 'error', text: 'Ukuran foto maksimal 2MB.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatar')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatar').getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      setAvatarUrl(publicUrl);
      setMessage({ type: 'success', text: 'Foto berhasil di-upload! Jangan lupa simpan.' });
    } catch (err) {
      console.error('Upload error:', err);
      setMessage({ type: 'error', text: 'Gagal upload foto. Coba lagi.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Nama tidak boleh kosong.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim(), photoUrl: avatarUrl }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan profil');

      setUser(data.user);
      setMessage({ type: 'success', text: 'Profil berhasil disimpan!' });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] flex flex-col items-center justify-center p-6">
      {/* Background orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-8"
        >
          <ArrowLeft size={18} />
          <span>Kembali ke Dashboard</span>
        </Link>

        <div className="bg-[#1e293b]/60 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-8">Edit Profil</h1>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="relative w-28 h-28 rounded-full cursor-pointer group"
              onClick={handleAvatarClick}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border-2 border-indigo-500/50"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-indigo-500/50">
                  {getInitials(name)}
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                  <Loader size={24} className="text-white animate-spin" />
                ) : (
                  <Camera size={24} className="text-white" />
                )}
              </div>
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2">
              Klik foto untuk mengubah (PNG/JPG, maks 2MB)
            </p>
          </div>

          {/* Feedback Message */}
          {message && (
            <div
              className={`mb-6 p-3 rounded-lg text-sm border ${
                message.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-500">
                <User size={16} />
                <span>{user?.email}</span>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nama</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap kamu"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ceritakan sedikit tentang dirimu..."
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition resize-none"
              />
              <p className="text-xs text-gray-600 mt-1 text-right">{bio.length}/200</p>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader size={18} className="animate-spin" /> Menyimpan...</>
            ) : (
              <><Save size={18} /> Simpan Perubahan</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
