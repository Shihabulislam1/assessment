'use client';

import { Trash2, Calendar, User, Milestone, ArrowRight, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function GoalCard({ goal, workspaceId, isAdmin, onDelete }) {
  const progress = goal.milestones?.length > 0 
    ? goal.milestones.reduce((acc, m) => acc + m.progress, 0) / goal.milestones.length 
    : 0;

  const isCompleted = goal.status === 'COMPLETED';
  const isInProgress = goal.status === 'IN_PROGRESS';

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Decorative background element */}
      <div className="absolute -right-8 -top-8 size-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between">
          <Badge 
            variant={isCompleted ? 'success' : isInProgress ? 'default' : 'secondary'}
            className={cn(
              "font-medium tracking-wide uppercase text-[10px] px-2 py-0.5",
              isCompleted && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
              isInProgress && "bg-primary/10 text-primary border-primary/20",
              !isCompleted && !isInProgress && "bg-muted/50 text-muted-foreground border-muted/20"
            )}
          >
            {goal.status?.replace('_', ' ')}
          </Badge>
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(goal.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
        <CardTitle className="mt-4 font-heading text-xl font-bold tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
          {goal.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted-foreground/80">
          {goal.description || 'No description provided.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4 relative">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 text-muted-foreground">
              <User className="size-3.5" />
              <span>{goal.owner?.name || 'Unassigned'}</span>
            </div>
            {goal.dueDate && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>{new Date(goal.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Target className={cn("size-3.5", isCompleted ? "text-emerald-500" : "text-primary")} />
                <span className="font-semibold text-foreground/90 uppercase tracking-tighter">Overall Progress</span>
              </div>
              <span className={cn("font-bold tabular-nums", isCompleted ? "text-emerald-500" : "text-primary")}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/50 border border-border/50">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 ease-out rounded-full relative",
                  isCompleted ? "bg-emerald-500" : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              >
                {/* Progress bar glow/shine effect */}
                {!isCompleted && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-progress" />
                )}
              </div>
            </div>
            {goal.milestones?.length === 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 italic mt-1">
                <Milestone className="size-3" />
                <span>Set milestones to track detailed progress</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-5 relative">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs font-bold uppercase tracking-widest border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group/btn" 
          asChild
        >
          <a href={`/workspace/${workspaceId}/goals/${goal.id}`}>
            View Full Objectives
            <ArrowRight className="ml-2 size-3.5 transition-transform group-hover/btn:translate-x-1" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

