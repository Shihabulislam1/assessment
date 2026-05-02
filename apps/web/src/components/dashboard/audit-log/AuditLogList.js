import { User, Tag, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ACTION_CONFIG = {
  CREATE: { label: 'Create', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  UPDATE: { label: 'Update', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  DELETE: { label: 'Delete', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  ADD_MEMBER: { label: 'Add Member', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  UPDATE_ROLE: { label: 'Update Role', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  REMOVE_MEMBER: { label: 'Remove Member', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

export const AuditLogList = ({ logs, isLoading }) => {
  if (logs.length === 0 && !isLoading) {
    return (
      <Card className="border-dashed bg-muted/5 rounded-3xl py-16 flex flex-col items-center justify-center text-center">
        <div className="size-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
          <History className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-heading font-bold">No logs found</h3>
        <p className="text-muted-foreground max-w-xs mt-2">
          No activity has been recorded yet or your filters are too restrictive.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <div className="col-span-2">Action</div>
        <div className="col-span-2">Entity</div>
        <div className="col-span-4">Entity ID</div>
        <div className="col-span-2">User</div>
        <div className="col-span-2 text-right">Date</div>
      </div>
      <div className={`flex flex-col gap-3 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        {logs.map((log) => (
          <Card key={log.id} className="border-muted/20 hover:border-primary/20 transition-all rounded-2xl overflow-hidden group hover:shadow-md">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-4 lg:p-5">
                <div className="col-span-2">
                  <Badge variant="outline" className={`rounded-lg py-1 px-3 border-transparent ${ACTION_CONFIG[log.action]?.color || 'bg-muted text-muted-foreground'}`}>
                    {ACTION_CONFIG[log.action]?.label || log.action}
                  </Badge>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Tag className="size-3 text-muted-foreground" />
                  <span className="text-sm font-semibold">{log.entity}</span>
                </div>
                <div className="col-span-4 flex items-center gap-2">
                  <code className="text-xs bg-muted/50 px-2 py-1 rounded-md text-muted-foreground font-mono truncate">
                    {log.entityId}
                  </code>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="size-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{log.user?.name || 'System'}</span>
                </div>
                <div className="col-span-2 text-right flex lg:block items-center justify-between">
                  <span className="lg:hidden text-xs font-bold uppercase text-muted-foreground tracking-widest">Date</span>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">{new Date(log.createdAt).toLocaleDateString()}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
