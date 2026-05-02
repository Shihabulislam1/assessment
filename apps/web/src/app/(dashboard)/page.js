'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Plus } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { CreateWorkspaceDialog } from '@/components/dashboard/workspaces/CreateWorkspaceDialog';
import { Button } from '@/components/ui/button';

export default function DashboardHome() {
  const { user } = useAuthStore();
  const { workspaces, isLoading } = useWorkspaceStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (workspaces.length > 0) {
      router.replace(`/workspace/${workspaces[0].id}`);
    }
  }, [user, workspaces, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-xl shadow-primary/10 ring-1 ring-primary/20">
          <Plus className="size-10" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase text-foreground">No workspaces yet</h1>
        <p className="text-muted-foreground max-w-md mb-8 font-medium leading-relaxed">
          Ready to skyrocket your team's productivity? Create your first workspace to start tracking goals and action items.
        </p>
        <CreateWorkspaceDialog 
          trigger={
            <Button size="lg" className="h-14 px-10 rounded-2xl font-black tracking-widest text-sm uppercase shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
              Launch First Workspace
            </Button>
          } 
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-sm uppercase tracking-widest text-muted-foreground animate-pulse">Redirecting...</p>
      </div>
    </div>
  );
}