'use client';

import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { apiFetch } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AvatarUpload() {
  const { user, setUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const data = await apiFetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      setUser({ avatarUrl: data.avatarUrl });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload avatar: ' + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '??';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 transition-all group-hover:border-primary/50 relative">
          <Avatar className="w-full h-full">
            <AvatarImage src={user?.avatarUrl} alt={user?.name} className="object-cover" />
            <AvatarFallback className="text-xl bg-primary/5">{initials}</AvatarFallback>
          </Avatar>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Camera className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
      
      <div className="text-center">
        <h3 className="text-sm font-medium">Profile Picture</h3>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 5MB.</p>
      </div>
    </div>
  );
}
