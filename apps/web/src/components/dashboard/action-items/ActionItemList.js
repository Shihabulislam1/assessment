'use client';

import { Plus, MoreVertical, Trash2, Clock, User, ChevronRight, Calendar, Target, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { PRIORITY_STYLES, STATUS_CONFIG } from './ActionItemCard';

export function ActionItemList({ items, onStatusToggle, onDelete, isLoading }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateStr, status) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date() && !['DONE', 'CANCELLED'].includes(status);
  };

  return (
    <div className={`flex flex-col gap-3 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
      {items.map((item) => (
        <Card key={item.id} className="group relative border-transparent hover:border-border transition-all hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="flex items-center gap-4 p-4">
            <Button 
              variant="outline" 
              size="icon" 
              className={`size-6 rounded-full transition-all border-2 ${item.status === 'DONE' ? 'bg-primary border-primary text-primary-foreground' : 'hover:border-primary'}`}
              onClick={() => onStatusToggle(item)}
            >
              {item.status === 'DONE' ? <Plus className="size-3 rotate-45" /> : <Plus className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </Button>
            
            <div className="flex flex-1 flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-semibold tracking-tight leading-none text-lg truncate ${item.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>
                  {item.title}
                </span>
                {item.goal && (
                  <Badge variant="outline" className="h-5 px-1.5 text-[9px] uppercase tracking-tighter bg-primary/5 border-primary/20 text-primary flex items-center gap-1">
                    <Target className="size-2.5" />
                    {item.goal.title}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                <div className="flex items-center gap-1.5">
                  <div className={`size-2 rounded-full ${STATUS_CONFIG[item.status]?.dot}`} />
                  <span className="text-xs font-medium text-muted-foreground">{STATUS_CONFIG[item.status]?.label}</span>
                </div>
                <Badge variant="outline" className={`h-5 px-2 text-[10px] uppercase font-bold tracking-tight rounded-md ${PRIORITY_STYLES[item.priority]?.color}`}>
                  {item.priority}
                </Badge>
                {item.dueDate && (
                  <div className={`flex items-center gap-1.5 text-xs ${isOverdue(item.dueDate, item.status) ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                    <Calendar className="size-3" />
                    <span>{formatDate(item.dueDate)}</span>
                    {isOverdue(item.dueDate, item.status) && <AlertCircle className="size-3 ml-0.5" />}
                  </div>
                )}
                {item.assignee && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border">
                    <User className="size-3" />
                    <span className="font-medium">{item.assignee.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                    <MoreVertical className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" rounded="xl">
                  <DropdownMenuItem className="flex items-center gap-2" onClick={() => onStatusToggle(item)}>
                    <Clock className="size-4" />
                    Update Status
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User className="size-4" />
                    Assign Member
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2 text-destructive focus:text-destructive" onClick={() => onDelete(item.id)}>
                    <Trash2 className="size-4" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" className="size-8 rounded-lg text-primary">
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
