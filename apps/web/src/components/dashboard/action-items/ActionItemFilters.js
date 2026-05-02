'use client';

import { Search, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ActionItemFilters({ 
  searchQuery, 
  setSearchQuery, 
  filter, 
  setFilter, 
  isLoading 
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/20 p-2 rounded-2xl border relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/20 overflow-hidden">
          <div className="h-full bg-primary animate-progress origin-left" />
        </div>
      )}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input 
          placeholder="Search tasks..." 
          className="pl-10 h-10 border-none bg-transparent focus-visible:ring-0 shadow-none" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Separator orientation="vertical" className="h-6 hidden sm:block" />
      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
        <div className="flex items-center gap-1">
          {isLoading && <Clock className="size-3 text-primary animate-pulse" />}
          <Select value={filter.status} onValueChange={(v) => setFilter({ ...filter, status: v })}>
            <SelectTrigger className="w-[140px] h-9 border-none bg-transparent shadow-none hover:bg-accent rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent rounded="xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="IN_REVIEW">In Review</SelectItem>
              <SelectItem value="DONE">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={filter.priority} onValueChange={(v) => setFilter({ ...filter, priority: v })}>
          <SelectTrigger className="w-[140px] h-9 border-none bg-transparent shadow-none hover:bg-accent rounded-lg">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent rounded="xl">
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
