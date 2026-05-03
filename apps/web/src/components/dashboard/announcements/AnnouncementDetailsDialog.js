'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, X, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAnnouncementStore } from '@/store/announcementStore';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { RichTextEditor } from '@/components/dashboard/shared/RichTextEditor';

export function AnnouncementDetailsDialog({ workspaceId, announcementId, open, onOpenChange }) {
  const { fetchAnnouncementById, currentAnnouncement, addComment, toggleReaction } = useAnnouncementStore();
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && announcementId) {
      setIsLoading(true);
      fetchAnnouncementById(workspaceId, announcementId).finally(() => setIsLoading(false));
    }
  }, [open, announcementId, workspaceId, fetchAnnouncementById]);

  const handleAddComment = async () => {
    if (!commentContent.trim() || commentContent === '<p><br></p>') return;
    setIsSubmitting(true);
    try {
      await addComment(workspaceId, announcementId, { content: commentContent });
      setCommentContent('');
      // Store will be updated via websocket, but we could also manually refresh
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleReaction = async (emoji) => {
    try {
      const existingOtherReaction = currentAnnouncement?.reactions?.find(
        (r) => r.user.id === user?.id && r.emoji !== emoji
      );

      if (existingOtherReaction) {
        await toggleReaction(workspaceId, announcementId, existingOtherReaction.emoji);
      }

      await toggleReaction(workspaceId, announcementId, emoji);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  if (!announcementId) return null;

  const EMOJIS = ['👍', '❤️', '🚀', '😄', '🎉', '👀'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl min-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-border/50 shadow-2xl rounded-none sm:rounded-none">
        {isLoading || !currentAnnouncement ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <span className="text-sm text-muted-foreground font-medium">Loading announcement...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[90vh] flex flex-col w-full">
            <DialogHeader className="p-8 pb-6 border-b bg-muted/10 shrink-0">
              <div className="flex flex-col gap-4">
                <DialogTitle className="text-2xl font-bold tracking-tight">{currentAnnouncement.title}</DialogTitle>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 border-2 border-background shadow-sm">
                    <AvatarImage src={currentAnnouncement.author?.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary">{currentAnnouncement.author?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{currentAnnouncement.author?.name}</span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {new Date(currentAnnouncement.createdAt).toLocaleDateString(undefined, {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="px-8 py-6">
              <div
                className="text-base leading-relaxed rich-text-content mb-10"
                dangerouslySetInnerHTML={{ __html: currentAnnouncement.content }}
              />

              <div className="flex items-center gap-2 mb-8 flex-wrap">
                {EMOJIS.map(emoji => {
                  const reactionCount = currentAnnouncement.reactions?.filter(r => r.emoji === emoji).length || 0;
                  const hasReacted = currentAnnouncement.reactions?.some((r) => r.user.id === user?.id && r.emoji === emoji);

                  return (
                    <Button
                      key={emoji}
                      variant={hasReacted ? 'secondary' : 'outline'}
                      size="sm"
                      className={`gap-1.5 rounded-full px-4 h-9 transition-all hover:scale-105 shadow-sm ${hasReacted ? 'bg-primary/15 border-primary/30 text-primary hover:bg-primary/25' : 'hover:border-primary/40 bg-background'}`}
                      onClick={() => handleToggleReaction(emoji)}
                    >
                      <span className="text-lg leading-none">{emoji}</span>
                      {reactionCount > 0 && <span className="text-sm font-semibold">{reactionCount}</span>}
                    </Button>
                  );
                })}
                <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-full">
                  <MessageSquare className="size-4" />
                  {currentAnnouncement.comments?.length || 0} comments
                </div>
              </div>

              <Separator className="my-8" />

              <div className="space-y-8 max-w-4xl mx-auto">
                <h3 className="font-semibold text-lg tracking-tight flex items-center gap-2">
                  Discussion
                  <span className="bg-primary/10 text-primary text-xs py-0.5 px-2 rounded-full">
                    {currentAnnouncement.comments?.length || 0}
                  </span>
                </h3>

                {currentAnnouncement.comments?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted rounded-xl bg-muted/5">
                    <MessageSquare className="size-10 text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground font-medium">No comments yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {currentAnnouncement.comments?.map((comment) => (
                      <div key={comment.id} className="flex gap-4 group">
                        <Avatar className="size-10 border-2 border-background shadow-sm mt-1 shrink-0">
                          <AvatarImage src={comment.author?.avatarUrl} />
                          <AvatarFallback className="bg-primary/10 text-primary">{comment.author?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm truncate">{comment.author?.name}</span>
                            <span className="text-xs text-muted-foreground font-medium shrink-0">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="bg-muted/40 p-4 rounded-2xl rounded-tl-sm border border-border/50 text-sm shadow-sm transition-colors group-hover:bg-muted/60 text-foreground/90 leading-relaxed">
                            <div
                              className="rich-text-content-small"
                              dangerouslySetInnerHTML={{ __html: comment.content }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 bg-muted/20 border-t backdrop-blur-sm mt-auto shrink-0">
              <div className="flex gap-4 max-w-4xl mx-auto">
                <Avatar className="size-10 hidden sm:block border-2 border-background shadow-sm shrink-0">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary">{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3 relative">
                  <div className="rounded-xl border border-border/50 shadow-sm focus-within:ring-1 focus-within:ring-primary/50 transition-shadow bg-background">
                    <RichTextEditor
                      value={commentContent}
                      onChange={setCommentContent}
                      placeholder="Write a thoughtful comment..."
                      members={currentWorkspace?.members || []}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground hidden sm:block">Markdown and mentions (@) supported</span>
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!commentContent.trim() || commentContent === '<p><br></p>' || isSubmitting}
                      className="gap-2 rounded-full px-6 shadow-sm hover:shadow transition-all ml-auto"
                    >
                      {isSubmitting ? 'Posting...' : (
                        <>
                          Post Comment
                          <Send className="size-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
      <style jsx global>{`
        .rich-text-content-small p { margin-bottom: 0.35rem; }
        .rich-text-content-small p:last-child { margin-bottom: 0; }
        .rich-text-content-small a { color: hsl(var(--primary)); text-decoration: underline; font-weight: 500; }
        .rich-text-content-small strong { font-weight: 600; color: hsl(var(--foreground)); }
        .rich-text-content-small pre { background: hsl(var(--muted)); padding: 0.5rem; border-radius: 0.5rem; overflow-x: auto; margin: 0.5rem 0; font-size: 0.85em; }
        .rich-text-content-small code { background: hsl(var(--muted)); padding: 0.15rem 0.3rem; border-radius: 0.25rem; font-size: 0.85em; }
        .rich-text-content-small blockquote { border-left: 3px solid hsl(var(--primary)/0.3); padding-left: 0.75rem; color: hsl(var(--muted-foreground)); font-style: italic; margin: 0.5rem 0; }
        .rich-text-content-small ul { list-style-type: disc; padding-left: 1.25rem; margin: 0.5rem 0; }
        .rich-text-content-small ol { list-style-type: decimal; padding-left: 1.25rem; margin: 0.5rem 0; }
      `}</style>
    </Dialog>
  );
}
