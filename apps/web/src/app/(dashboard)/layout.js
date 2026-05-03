'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Separator } from '@/components/ui/separator';
import { useSocket } from '@/hooks/useSocket';
import { useGoalStore } from '@/store/goalStore';
import { useActionItemStore } from '@/store/actionItemStore';
import { useAnnouncementStore } from '@/store/announcementStore';
import { useNotificationStore } from '@/store/notificationStore';
import { NotificationBell } from '@/components/dashboard/notifications/NotificationBell';
import { OnlineUsers } from '@/components/dashboard/shared/OnlineUsers';
import { SocketStatus } from '@/components/dashboard/shared/SocketStatus';

export default function DashboardLayout({ children }) {
  const { user, initialized } = useAuthStore();
  const { workspaces, currentWorkspace, fetchWorkspaces, setCurrentWorkspace } = useWorkspaceStore();
  const router = useRouter();
  const pathname = usePathname();
  const { workspaceId } = useParams();
  const socketRef = useSocket(workspaceId);

  useEffect(() => {
    const socket = socketRef.current;
    if (socket && user) {
      useGoalStore.getState().subscribeToSocket(socket);
      useActionItemStore.getState().subscribeToSocket(socket);
      useAnnouncementStore.getState().subscribeToSocket(socket);

      socket.on('notification:new', (notification) => {
        useNotificationStore.getState().addNotification(notification);
      });

      return () => {
        useGoalStore.getState().unsubscribeFromSocket(socket);
        useActionItemStore.getState().unsubscribeFromSocket(socket);
        useAnnouncementStore.getState().unsubscribeFromSocket(socket);
        socket.off('notification:new');
      };
    }
  }, [socketRef, workspaceId, user]);

  useEffect(() => {
    if (user) {
      useNotificationStore.getState().fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (workspaces.length === 0) {
      fetchWorkspaces();
    }
  }, [user, initialized, router]);

  useEffect(() => {
    if (!initialized) return;
    if (!workspaceId) return;
    if (workspaces.length > 0) {
      const ws = workspaces.find((w) => w.id === workspaceId);
      if (ws) setCurrentWorkspace(ws);
    }
  }, [workspaceId, workspaces, initialized]);

  if (!workspaceId) return <div className="p-8">No workspace selected.</div>;

  return (
    <SidebarProvider style={{
      '--primary': currentWorkspace?.accentColor,
      '--sidebar-primary': currentWorkspace?.accentColor,
      '--ring': currentWorkspace?.accentColor
    }}>
      <AppSidebar workspaceId={workspaceId} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 transition-[width,height,padding] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 group-has-[[data-collapsible=icon]]/sidebar-wrapper:px-2">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 group-has-[[data-collapsible=icon]]/sidebar-wrapper:ml-0" />
            <Separator orientation="vertical" className="mr-2 h-4 group-has-[[data-collapsible=icon]]/sidebar-wrapper:hidden" />
            <span className="font-heading font-medium text-sm">
              {pathname.split('/').pop().replace('-', ' ').toUpperCase() || 'DASHBOARD'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <OnlineUsers />
            <Separator orientation="vertical" className="h-12 mx-1" />
            <SocketStatus />
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background/50">
          <div className="mx-auto max-w-7xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}