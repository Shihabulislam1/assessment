'use client';

import { Calendar, User, Target, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const PRIORITY_STYLES = {
  URGENT: { label: 'Urgent', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  HIGH: { label: 'High', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  LOW: { label: 'Low', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
};

export const STATUS_CONFIG = {
  TODO: { label: 'To Do', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', dot: 'bg-slate-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-primary/10 text-primary border-primary/20', dot: 'bg-primary' },
  IN_REVIEW: { label: 'In Review', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', dot: 'bg-amber-500' },
  DONE: { label: 'Completed', color: 'bg-green-500/10 text-green-500 border-green-500/20', dot: 'bg-green-500' },
  CANCELLED: { label: 'Cancelled', color: 'bg-slate-500/5 text-slate-400 border-slate-500/10', dot: 'bg-slate-300' },
};

export function ActionItemCard({ item, onClick, isSortable = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id, disabled: !isSortable });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date() && !['DONE', 'CANCELLED'].includes(item.status);
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`group cursor-default border-transparent hover:border-primary/20 hover:shadow-md transition-all rounded-xl relative overflow-hidden bg-card shadow-sm ${isDragging ? 'ring-2 ring-primary/20' : ''}`}
    >
      {isSortable && (
        <div 
          {...attributes} 
          {...listeners} 
          className="absolute left-0 top-0 bottom-0 w-1.5 bg-muted group-hover:bg-primary/40 cursor-grab active:cursor-grabbing flex items-center justify-center transition-colors"
        >
          <GripVertical className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      
      <div onClick={() => onClick?.(item)} className={isSortable ? "pl-1.5" : ""}>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between mb-2">
            <Badge variant="outline" className={`h-4 px-1.5 text-[8px] uppercase font-black tracking-widest rounded-sm ${PRIORITY_STYLES[item.priority]?.color}`}>
              {item.priority}
            </Badge>
            {item.dueDate && (
              <span className={`text-[10px] flex items-center gap-1 ${isOverdue(item.dueDate) ? 'text-destructive font-bold' : 'text-muted-foreground font-medium'}`}>
                <Calendar className="size-2.5" />
                {formatDate(item.dueDate)}
              </span>
            )}
          </div>
          <CardTitle className="text-[15px] font-semibold tracking-tight leading-tight group-hover:text-primary transition-colors">
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {item.description && (
            <p className="text-[12px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {item.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex -space-x-2">
              {item.assignee ? (
                <div className="size-6 rounded-full border-2 border-background bg-muted flex items-center justify-center" title={item.assignee.name}>
                  <User className="size-3 text-muted-foreground" />
                </div>
              ) : (
                <div className="size-6 rounded-full border-2 border-dashed border-muted-foreground/30 bg-transparent flex items-center justify-center text-muted-foreground/30">
                  <User className="size-3" />
                </div>
              )}
            </div>
            {item.goal && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-primary/70 uppercase tracking-tighter">
                <Target className="size-2.5" />
                <span className="max-w-[80px] truncate">{item.goal.title}</span>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
