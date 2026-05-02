'use client';

import { Megaphone, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function RecentAnnouncements({ announcements, workspaceId }) {
  return (
    <Card className="border-muted/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-heading flex items-center gap-2">
          <Megaphone className="size-5 text-primary" />
          Recent Announcements
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="group">
          <Link href={`/workspace/${workspaceId}/announcements`} className="flex items-center gap-1">
            View All
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Megaphone className="size-12 text-muted/30 mb-4" />
            <p className="text-muted-foreground">No announcements yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="flex flex-col gap-1 p-4 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-muted/20">
                <p className="font-semibold text-lg leading-snug">{a.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span className="font-medium text-foreground/70">{a.author?.name}</span>
                  <span>&middot;</span>
                  <span>{new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
