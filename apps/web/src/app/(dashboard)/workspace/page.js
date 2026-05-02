'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';

export default function WorkspaceIndex() {
  const router = useRouter();
  const { workspaces, fetchWorkspaces, workspacesInit } = useWorkspaceStore();
  const { user, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized && user && !workspacesInit) {
      fetchWorkspaces();
    }
  }, [initialized, user, workspacesInit]);

  useEffect(() => {
    if (!initialized || !workspacesInit) return;
    if (workspaces.length > 0) {
      router.replace(`/workspace/${workspaces[0].id}`);
    }
  }, [workspaces, workspacesInit, initialized]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}