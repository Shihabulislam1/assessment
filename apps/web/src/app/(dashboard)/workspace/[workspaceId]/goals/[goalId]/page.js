'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGoalStore } from '@/store/goalStore';
import { GoalDetailHeader } from '@/components/dashboard/goals/GoalDetailHeader';
import { MilestoneSection } from '@/components/dashboard/goals/MilestoneSection';
import { GoalActivityLog } from '@/components/dashboard/goals/GoalActivityLog';
import { Skeleton } from '@/components/ui/skeleton';

export default function GoalDetailPage() {
  const { workspaceId, goalId } = useParams();
  const { currentGoal, fetchGoalById, isLoading } = useGoalStore();

  useEffect(() => {
    if (workspaceId && goalId) {
      fetchGoalById(workspaceId, goalId);
    }
  }, [workspaceId, goalId, fetchGoalById]);

  if (isLoading && !currentGoal) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-6 w-3/4 rounded-xl" />
        </div>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Skeleton className="h-40 w-full rounded-[2.5rem]" />
            <Skeleton className="h-40 w-full rounded-[2.5rem]" />
          </div>
          <Skeleton className="h-[600px] w-full rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  if (!currentGoal) return null;

  return (
    <div className="flex flex-col gap-8">
      <GoalDetailHeader goal={currentGoal} workspaceId={workspaceId} />
      
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <MilestoneSection 
            workspaceId={workspaceId} 
            goalId={goalId} 
            milestones={currentGoal.milestones} 
          />
        </div>

        <div className="lg:sticky lg:top-24">
          <GoalActivityLog 
            workspaceId={workspaceId} 
            goalId={goalId} 
            activities={currentGoal.activities} 
          />
        </div>
      </div>
    </div>
  );
}
