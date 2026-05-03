'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { useGoalStore } from '@/store/goalStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { GoalCard } from '@/components/dashboard/goals/GoalCard';
import { GoalDialog } from '@/components/dashboard/goals/GoalDialog';
import { Empty } from '@/components/ui/empty';

export default function GoalsPage() {
  const { workspaceId } = useParams();
  const { goals, fetchGoals, createGoal, deleteGoal, isLoading } = useGoalStore();
  const { currentWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (workspaceId) fetchGoals(workspaceId);
  }, [workspaceId]);

  const handleSubmit = async (formData) => {
    await createGoal(workspaceId, formData);
    setOpen(false);
  };

  const isAdmin = currentWorkspace?.members?.some((m) => m.user.id === user?.id && m.role === 'ADMIN');

  const filteredGoals = goals.filter(g => 
    g.title.toLowerCase().includes(search.toLowerCase()) || 
    g.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        title="Strategic Goals"
        description="Track objectives, monitor progress, and align your team's efforts."
        action={{
          label: "New Goal",
          onClick: () => setOpen(true),
          icon: <Plus className="mr-2 size-4" />
        }}
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search goals..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {goals.length === 0 ? (
        <Empty
          title="No Strategic Goals"
          description="Strategic goals help you focus on what matters most. Launch your first initiative to start tracking progress."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 size-4" />
              Create First Goal
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((goal) => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              workspaceId={workspaceId}
              isAdmin={isAdmin}
              onDelete={(id) => deleteGoal(workspaceId, id)}
            />
          ))}
        </div>
      )}

      <GoalDialog 
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        members={currentWorkspace?.members || []}
      />
    </div>
  );
}