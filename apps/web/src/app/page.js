'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function Home() {
  const { user, initialized } = useAuthStore();
  const { workspaces, fetchWorkspaces, workspacesInit } = useWorkspaceStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (user) {
      if (!workspacesInit) {
        fetchWorkspaces();
        return;
      }
      if (workspaces.length > 0) {
        router.push(`/workspace/${workspaces[0].id}`);
      } else {
        router.push('/workspace');
      }
    } else {
      router.push('/login');
    }
  }, [initialized, user, workspaces, workspacesInit]);

  return <LoadingSpinner />;
}