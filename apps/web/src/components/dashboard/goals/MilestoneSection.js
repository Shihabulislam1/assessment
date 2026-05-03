'use client';

import React, { useState } from 'react';
import { Plus, Check, Trash2, Milestone as MilestoneIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

export function MilestoneSection({ workspaceId, goalId, milestones, onUpdate }) {
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addMilestone = async () => {
    if (!newTitle.trim()) return;
    setIsAdding(true);
    try {
      await apiFetch(`/api/workspaces/${workspaceId}/goals/${goalId}/milestones`, {
        method: 'POST',
        body: JSON.stringify({ title: newTitle }),
      });
      setNewTitle('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const updateProgress = async (milestoneId, newProgress) => {
    try {
      await apiFetch(`/api/workspaces/${workspaceId}/goals/${goalId}/milestones/${milestoneId}`, {
        method: 'PUT',
        body: JSON.stringify({ progress: Math.min(100, Math.max(0, newProgress)) }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteMilestone = async (milestoneId) => {
    try {
      await apiFetch(`/api/workspaces/${workspaceId}/goals/${goalId}/milestones/${milestoneId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <MilestoneIcon className="size-5 text-primary" />
        <h2 className="text-xl font-semibold">Key Milestones</h2>
      </div>

      <div className="grid gap-4">
        {milestones?.map((m) => (
          <Card key={m.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
              <CardTitle className="text-base font-bold">{m.title}</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={() => deleteMilestone(m.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{m.progress}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={m.progress} className="h-2 flex-1" />
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="size-7"
                      onClick={() => updateProgress(m.id, m.progress - 10)}
                    >
                      -
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="size-7"
                      onClick={() => updateProgress(m.id, m.progress + 10)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex gap-2 p-2 rounded-lg bg-muted/50 border border-dashed">
          <Input 
            placeholder="New milestone title..." 
            className="border-none bg-transparent h-9 focus-visible:ring-0"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMilestone()}
          />
          <Button 
            size="sm"
            onClick={addMilestone}
            disabled={isAdding || !newTitle.trim()}
          >
            {isAdding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4 mr-2" />}
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
