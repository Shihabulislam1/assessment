'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ActionItemDialog({ open, onOpenChange, onSubmit, goals = [], initialData = null, isLoading = false }) {
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    priority: 'MEDIUM', 
    status: 'TODO',
    dueDate: '', 
    goalId: '' 
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'MEDIUM',
        status: initialData.status || 'TODO',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 16) : '',
        goalId: initialData.goalId || ''
      });
    } else {
      setForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', goalId: '' });
    }
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">
              {initialData ? 'Edit Action Item' : 'Create Action Item'}
            </DialogTitle>
            <DialogDescription>
              {initialData ? 'Update the details of your task.' : 'Fill in the details below to add a new task to your workspace.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-sm font-semibold">Title</label>
              <Input 
                id="title" 
                placeholder="What needs to be done?" 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                required 
                className="h-11 rounded-lg" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-semibold">Description</label>
              <Textarea 
                id="description" 
                placeholder="Provide more context..." 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                className="min-h-[100px] rounded-lg resize-none" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Priority</label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="h-11 rounded-lg">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent rounded="xl">
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="h-11 rounded-lg">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent rounded="xl">
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="dueDate" className="text-sm font-semibold">Due Date</label>
              <Input 
                id="dueDate" 
                type="datetime-local" 
                value={form.dueDate} 
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })} 
                className="h-11 rounded-lg" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Related Goal (Optional)</label>
              <Select value={form.goalId} onValueChange={(v) => setForm({ ...form, goalId: v })}>
                <SelectTrigger className="h-11 rounded-lg">
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent rounded="xl">
                  <SelectItem value="none">No specific goal</SelectItem>
                  {goals.map(goal => (
                    <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl px-8">
              {isLoading ? 'Saving...' : (initialData ? 'Update Task' : 'Create Task')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
