'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Target, Plus, Rocket, Filter, Search } from 'lucide-react';
import { useGoalStore } from '@/store/goalStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { GoalCard } from '@/components/dashboard/goals/GoalCard';
import { GoalDialog } from '@/components/dashboard/goals/GoalDialog';
import { cn } from '@/lib/utils';

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
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageHeader 
          title="Strategic Goals"
          description="Track objectives, monitor progress, and align your team's efforts."
          className="p-0 bg-transparent border-none"
        />
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search goals..." 
              className="pl-9 w-64 bg-card/50 border-border/50 focus:bg-card focus:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold tracking-tight"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 size-4" />
            New Initiative
          </Button>
        </div>
      </div>

      {goals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-20 text-center border-dashed bg-card/30 backdrop-blur-sm border-2 border-border/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              <Rocket className="size-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-heading font-bold mb-3 tracking-tight">No Strategic Goals Yet</CardTitle>
            <CardDescription className="text-lg max-w-md mx-auto mb-8">
              Strategic goals help you focus on what matters most. Launch your first initiative to start tracking progress.
            </CardDescription>
            <Button size="lg" className="rounded-full px-8 font-bold" onClick={() => setOpen(true)}>
              <Plus className="mr-2 size-5" />
              Create First Goal
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((goal, index) => (
            <div 
              key={goal.id} 
              className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <GoalCard 
                goal={goal} 
                workspaceId={workspaceId}
                isAdmin={isAdmin}
                onDelete={(id) => deleteGoal(workspaceId, id)}
              />
            </div>
          ))}
        </div>
      )}

      <GoalDialog 
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}