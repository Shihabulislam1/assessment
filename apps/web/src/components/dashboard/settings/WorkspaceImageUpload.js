'use client';

import React, { useRef, useState } from 'react';
import { Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export function WorkspaceImageUpload({ workspaceId, currentImageUrl, onUpdate }) {
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
      const data = await apiFetch(`/api/upload/workspace/${workspaceId}/image`, {
        method: 'POST',
        body: formData,
      });

      if (onUpdate) await onUpdate(data.imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload workspace image: ' + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/5">
      <div className="relative group size-20 rounded-2xl overflow-hidden bg-primary/5 border border-primary/10 flex items-center justify-center">
        {currentImageUrl ? (
          <img src={currentImageUrl} alt="Workspace" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="size-8 text-primary/20" />
        )}
        
        <button
          type="button"
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
      
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">Workspace Image</h3>
        <p className="text-xs text-muted-foreground">This image will represent your team in the sidebar.</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-bold text-primary hover:underline mt-1 w-fit"
        >
          {currentImageUrl ? 'Change Image' : 'Upload Image'}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
