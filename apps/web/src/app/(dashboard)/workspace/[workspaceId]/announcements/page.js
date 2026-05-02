'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Megaphone } from 'lucide-react';
import { useAnnouncementStore } from '@/store/announcementStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { AnnouncementCard } from '@/components/dashboard/announcements/AnnouncementCard';
import { AnnouncementDialog } from '@/components/dashboard/announcements/AnnouncementDialog';

export default function AnnouncementsPage() {
  const { workspaceId } = useParams();
  const { announcements, fetchAnnouncements, createAnnouncement, deleteAnnouncement, isLoading } = useAnnouncementStore();
  const { currentWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (workspaceId) fetchAnnouncements(workspaceId);
  }, [workspaceId]);

  const handleSubmit = async (formData) => {
    await createAnnouncement(workspaceId, formData);
    setOpen(false);
  };

  const isAdmin = currentWorkspace?.members?.some((m) => m.user.id === user?.id && m.role === 'ADMIN');

  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        title="Announcements"
        description="Stay updated with the latest workspace news."
        action={isAdmin ? {
          label: "Post Announcement",
          onClick: () => setOpen(true)
        } : null}
      />

      {announcements.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <Megaphone className="size-12 text-muted-foreground mb-4" />
          <CardTitle>No announcements yet</CardTitle>
          <CardDescription>Announcements will appear here when they are posted.</CardDescription>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {announcements.map((ann) => (
            <AnnouncementCard 
              key={ann.id} 
              announcement={ann} 
              isAdmin={isAdmin}
              onDelete={(id) => deleteAnnouncement(workspaceId, id)}
            />
          ))}
        </div>
      )}

      <AnnouncementDialog 
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}