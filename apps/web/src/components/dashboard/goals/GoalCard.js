'use client';

import { Trash2, Calendar, User, Milestone, ArrowRight, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function GoalCard({ goal, workspaceId, isAdmin, onDelete }) {
  const progress = goal.milestones?.length > 0 
    ? goal.milestones.reduce((acc, m) => acc + m.progress, 0) / goal.milestones.length 
    : 0;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex flex-col gap-1">
          <Badge variant={goal.status === 'COMPLETED' ? 'success' : 'secondary'} className="w-fit">
            {goal.status}
          </Badge>
          <CardTitle className="text-xl">{goal.title}</CardTitle>
        </div>
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(goal.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <CardDescription className="line-clamp-2 mb-4">
          {goal.description || 'No description provided.'}
        </CardDescription>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <User className="size-3.5" />
              {goal.owner?.name}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/workspace/${workspaceId}/goals/${goal.id}`}>
            View Details
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

