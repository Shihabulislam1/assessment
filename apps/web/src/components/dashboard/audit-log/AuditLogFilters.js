import { Filter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export const AuditLogFilters = ({ filter, setFilter, isLoading }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/20 p-2 rounded-2xl border">
      <div className="flex items-center gap-2 flex-1 w-full sm:w-auto px-2">
        <Filter className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filters:</span>
      </div>
      <Separator orientation="vertical" className="h-6 hidden sm:block" />
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Select 
          value={filter.entity} 
          onValueChange={(v) => setFilter({ ...filter, entity: v })} 
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl bg-background border-none shadow-sm">
            <SelectValue placeholder="All Entities" />
          </SelectTrigger>
          <SelectContent rounded="xl">
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="Workspace">Workspace</SelectItem>
            <SelectItem value="Goal">Goal</SelectItem>
            <SelectItem value="Milestone">Milestone</SelectItem>
            <SelectItem value="ActionItem">Action Item</SelectItem>
            <SelectItem value="Announcement">Announcement</SelectItem>
            <SelectItem value="Comment">Comment</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={filter.action} 
          onValueChange={(v) => setFilter({ ...filter, action: v })} 
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl bg-background border-none shadow-sm">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent rounded="xl">
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
