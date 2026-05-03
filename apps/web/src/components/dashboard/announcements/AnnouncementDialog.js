'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '../shared/RichTextEditor';
import { useWorkspaceStore } from '@/store/workspaceStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function AnnouncementDialog({ open, onOpenChange, onSubmit, isLoading }) {
  const { currentWorkspace } = useWorkspaceStore();
  const [form, setForm] = useState({ title: '', content: '', isPinned: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ title: '', content: '', isPinned: false });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>
              Share important information with your team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="ann-title" className="text-sm font-medium">Title</label>
              <Input 
                id="ann-title" 
                placeholder="E.g., Office closed on Monday" 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                required 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="ann-content" className="text-sm font-medium">Content</label>
              <RichTextEditor 
                value={form.content} 
                onChange={(val) => setForm({ ...form, content: val })} 
                placeholder="Write your announcement..." 
                members={currentWorkspace?.members || []}
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="pinned" 
                className="rounded border-gray-300" 
                checked={form.isPinned} 
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} 
              />
              <label htmlFor="pinned" className="text-sm font-medium cursor-pointer">Pin to top</label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Publishing...' : 'Publish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
