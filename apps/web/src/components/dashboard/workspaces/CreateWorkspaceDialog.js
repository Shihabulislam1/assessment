'use client';

import { useState } from 'react';
import { Plus, Layout, Type, Palette, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkspaceStore } from '@/store/workspaceStore';

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Violet', value: '#8b5cf6' },
];

export function CreateWorkspaceDialog({ trigger, open: externalOpen, onOpenChange: setExternalOpen }) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0].value);
  const { createWorkspace, isLoading } = useWorkspaceStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createWorkspace({
        name: name.trim(),
        description: description.trim(),
        accentColor,
      });
      setOpen(false);
      setName('');
      setDescription('');
      setAccentColor(ACCENT_COLORS[0].value);
    } catch (err) {
      console.error('Failed to create workspace:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild nativeButton={false}>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Create Workspace</DialogTitle>
          <DialogDescription>
            Workspaces are where your team collaborates on goals and action items.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-bold flex items-center gap-2">
                <Layout className="size-4 text-primary" />
                Workspace Name
              </label>
              <Input
                id="name"
                placeholder="Engineering Team"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 rounded-xl bg-muted/30 border-muted-foreground/10 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-bold flex items-center gap-2">
                <Type className="size-4 text-primary" />
                Description (Optional)
              </label>
              <Input
                id="description"
                placeholder="Planning and execution for the eng team"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-11 rounded-xl bg-muted/30 border-muted-foreground/10 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2">
                <Palette className="size-4 text-primary" />
                Accent Color
              </label>
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setAccentColor(color.value)}
                    className={`size-8 rounded-full transition-all hover:scale-110 active:scale-95 ${accentColor === color.value
                        ? 'ring-2 ring-primary ring-offset-2 scale-110'
                        : 'opacity-70 hover:opacity-100'
                      }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                'Create Workspace'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
