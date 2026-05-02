'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LayoutDashboard, Target, CheckSquare, Megaphone, TrendingUp } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useGoalStore } from '@/store/goalStore';
import { useActionItemStore } from '@/store/actionItemStore';
import { useAnnouncementStore } from '@/store/announcementStore';

import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { StatCard } from '@/components/dashboard/overview/StatCard';
import { RecentAnnouncements } from '@/components/dashboard/overview/RecentAnnouncements';

export default function WorkspaceOverview() {
  const { workspaceId } = useParams();
  const { currentWorkspace } = useWorkspaceStore();
  const { goals, fetchGoals } = useGoalStore();
  const { items, fetchItems } = useActionItemStore();
  const { announcements, fetchAnnouncements } = useAnnouncementStore();

  useEffect(() => {
    if (workspaceId) {
      fetchGoals(workspaceId);
      fetchItems(workspaceId);
      fetchAnnouncements(workspaceId);
    }
  }, [workspaceId]);

  if (!currentWorkspace) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  const completedGoals = goals.filter((g) => g.status === 'COMPLETED').length;
  const completedItems = items.filter((i) => i.status === 'DONE').length;
  const completionRate = items.length > 0 ? Math.round((completedItems / items.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        icon={LayoutDashboard}
        title={currentWorkspace.name}
        subtitle="Workspace Overview"
        description="Monitor your team's progress and stay updated with recent activity."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Goals" 
          value={goals.length} 
          subtitle={`${completedGoals} goals achieved`} 
          icon={Target}
          color="primary"
        />
        <StatCard 
          title="Action Items" 
          value={items.length} 
          subtitle={`${completedItems} tasks completed`} 
          icon={CheckSquare}
          color="success"
        />
        <StatCard 
          title="Completion" 
          value={`${completionRate}%`} 
          subtitle="Overall task velocity" 
          icon={TrendingUp}
          color="warning"
        />
        <StatCard 
          title="Announcements" 
          value={announcements.length} 
          subtitle="Team updates posted" 
          icon={Megaphone}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentAnnouncements 
            announcements={announcements} 
            workspaceId={workspaceId} 
          />
        </div>
        <div className="flex flex-col gap-6">
          {/* We could add a "Quick Links" or "Team Members" card here later */}
        </div>
      </div>
    </div>
  );
}