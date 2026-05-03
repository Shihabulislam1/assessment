'use client';

import React from 'react';
import { Calendar, User, Target, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGoalStore } from '@/store/goalStore';

import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';

export function GoalDetailHeader({ goal, workspaceId }) {
  const { updateGoal } = useGoalStore();
  const { currentWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  
  const progress = goal.milestones?.length > 0 
    ? goal.milestones.reduce((acc, m) => acc + m.progress, 0) / goal.milestones.length 
    : 0;

  const isCompleted = goal.status === 'COMPLETED';
  const isAdmin = currentWorkspace?.members?.some((m) => m.user?.id === user?.id && m.role === 'ADMIN');

  const handleStatusChange = (newStatus) => {
    updateGoal(workspaceId, goal.id, { status: newStatus });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={`/workspace/${workspaceId}/goals`} className="hover:underline">Goals</Link>
          <ChevronRight className="size-4" />
          <span>Detail</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{goal.title}</h1>
          <Select disabled={!isAdmin} value={goal.status} onValueChange={handleStatusChange}>
            <SelectTrigger className={cn(
              "w-[140px]",
              isCompleted ? "text-emerald-600 bg-emerald-50 border-emerald-200" : ""
            )}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOT_STARTED">Not Started</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-muted-foreground max-w-3xl">{goal.description}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{Math.round(progress)}%</div>
            <Progress value={progress} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Owner</CardTitle>
            <User className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg font-semibold">{goal.owner?.name}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Due Date</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg font-semibold">
              {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : 'No deadline'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
