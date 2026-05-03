'use client';

import React, { useState } from 'react';
import { History, Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { RichTextEditor } from '../shared/RichTextEditor';

export function GoalActivityLog({ workspaceId, goalId, activities }) {
  const { currentWorkspace } = useWorkspaceStore();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postActivity = async () => {
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    if (!strippedContent) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/workspaces/${workspaceId}/goals/${goalId}/activities`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setContent('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedActivities = [...(activities || [])].reverse();
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activities]);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="border-b bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          <CardTitle className="text-lg">Activity Feed</CardTitle>
        </div>
      </CardHeader>

      <div 
        ref={scrollRef}
        className="flex-1 min-h-[400px] overflow-y-auto p-4 flex flex-col gap-6 scroll-smooth"
      >
        {sortedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <p className="text-sm italic">No activity yet.</p>
          </div>
        ) : (
          sortedActivities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <Avatar className="size-8">
                <AvatarImage src={activity.user?.avatarUrl} alt={activity.user?.name} />
                <AvatarFallback>
                  {activity.user?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{activity.user?.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">
                    {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div 
                  className="p-3 rounded-lg bg-muted text-sm leading-relaxed rich-text-content"
                  dangerouslySetInnerHTML={{ __html: activity.content }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t bg-muted/50 flex flex-col gap-3">
        <RichTextEditor 
          value={content}
          onChange={setContent}
          placeholder="Write an update..."
          members={currentWorkspace?.members || []}
        />
        <div className="flex justify-end">
          <Button 
            onClick={postActivity}
            disabled={isSubmitting || !content.replace(/<[^>]*>/g, '').trim()}
            className="gap-2"
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Post Update
          </Button>
        </div>
      </div>
      <style jsx global>{`
        .rich-text-content h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
        .rich-text-content h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
        .rich-text-content h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
        .rich-text-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .rich-text-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
        .rich-text-content blockquote { border-left: 4px solid hsl(var(--primary)); padding-left: 1rem; font-style: italic; margin-bottom: 1rem; }
        .rich-text-content pre { background-color: hsl(var(--muted)); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; font-family: monospace; }
        .rich-text-content p { margin-bottom: 0.5rem; }
        .rich-text-content p:last-child { margin-bottom: 0; }
        .rich-text-content a { color: hsl(var(--primary)); text-decoration: underline; }
        .rich-text-content img { max-width: 100%; height: auto; border-radius: 0.5rem; }
        .rich-text-content .mention {
           background-color: hsl(var(--primary) / 0.15);
           color: hsl(var(--primary));
           padding: 0.1rem 0.3rem;
           border-radius: 0.25rem;
           font-weight: 500;
           display: inline-block;
        }
      `}</style>
    </Card>
  );
}
