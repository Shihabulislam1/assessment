'use client';

import { useState } from 'react';
import { Target, FileText, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export function GoalDialog({ open, onOpenChange, onSubmit, isLoading }) {
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ title: '', description: '', dueDate: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-primary/20 bg-card/95 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
              <Target className="size-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-heading font-bold tracking-tight">Establish New Goal</DialogTitle>
            <DialogDescription className="text-muted-foreground/80">
              Define a clear, actionable objective for your team to pursue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                <Target className="size-3.5" />
                Goal Title
              </label>
              <Input
                id="title"
                placeholder="e.g., Q3 Market Penetration"
                className="h-11 bg-muted/30 border-border/50 focus:bg-background focus:ring-primary/20 transition-all"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                <FileText className="size-3.5" />
                Strategic Context
              </label>
              <Textarea
                id="description"
                placeholder="Provide detailed context and desired outcomes..."
                className="min-h-[120px] bg-muted/30 border-border/50 focus:bg-background focus:ring-primary/20 transition-all resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                <Calendar className="size-3.5" />
                Target Completion Date
              </label>
              <Input
                id="dueDate"
                type="datetime-local"
                className="h-11 bg-muted/30 border-border/50 focus:bg-background focus:ring-primary/20 transition-all"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/50">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[140px] shadow-lg shadow-primary/20 font-bold tracking-tight"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="size-4" />
                  Create Initiative
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

