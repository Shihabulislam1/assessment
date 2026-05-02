'use client';

import { Trash2, Pin, MessageSquare, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export function AnnouncementCard({ announcement, isAdmin, onDelete }) {
  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-sm ${announcement.isPinned ? 'border-l-4 border-l-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={announcement.author?.avatarUrl} alt={announcement.author?.name} />
              <AvatarFallback>{announcement.author?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-none">{announcement.author?.name}</span>
              <span className="text-xs text-muted-foreground mt-1">{new Date(announcement.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {announcement.isPinned && (
              <Badge variant="outline" className="gap-1 border-primary/20 bg-primary/5 text-primary">
                <Pin className="size-3" />
                Pinned
              </Badge>
            )}
            {isAdmin && (
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(announcement.id)}>
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
        <CardTitle className="mt-4">{announcement.title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-sm prose dark:prose-invert max-w-none text-foreground/90" dangerouslySetInnerHTML={{ __html: announcement.content }} />
      </CardContent>
      <Separator />
      <CardFooter className="py-3 flex items-center gap-4 text-muted-foreground">
        <div className="flex items-center gap-1 text-xs">
          <MessageSquare className="size-3" />
          <span>{announcement._count?.comments || 0} comments</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Heart className="size-3" />
          <span>{announcement._count?.reactions || 0} reactions</span>
        </div>
      </CardFooter>
    </Card>
  );
}
