'use client';

import { useParams, useRouter } from 'next/navigation';
import { 
  Settings, 
  LogOut, 
  ShieldCheck
} from 'lucide-react';

import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

import { GeneralSettingsForm } from '@/components/dashboard/settings/GeneralSettingsForm';
import { TeamMemberList } from '@/components/dashboard/settings/TeamMemberList';

export default function WorkspaceSettingsPage() {
  const { workspaceId } = useParams();
  const router = useRouter();
  const { currentWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const { logout, user } = useAuthStore();
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary mb-1">
          <Settings className="size-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Configuration</span>
        </div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="text-muted-foreground">
          Manage your workspace identity, appearance, and team members.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <GeneralSettingsForm 
            workspaceId={workspaceId} 
            initialData={currentWorkspace} 
            onUpdate={fetchWorkspaces} 
          />

          <TeamMemberList 
            members={currentWorkspace?.members} 
            isAdmin={currentWorkspace?.members?.find(m => m.userId === user?.id)?.role === 'ADMIN'}
            onInviteSuccess={fetchWorkspaces}
          />
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-muted/30 border border-muted-foreground/10 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-foreground">
              <LogOut className="size-5" />
              <span className="font-bold text-sm">Account</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Log out of your current session on this device.
            </p>
            <Button 
              variant="outline" 
              className="w-full h-10 rounded-xl font-bold border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
          
          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="size-5" />
              <span className="font-bold text-sm">Workspace Security</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Your workspace is protected with enterprise-grade encryption. Members can only access goals and action items within this specific workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}