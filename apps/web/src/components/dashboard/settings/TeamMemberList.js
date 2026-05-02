import { Users, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useParams } from 'next/navigation';
import { InviteMemberDialog } from './InviteMemberDialog';

export const TeamMemberList = ({ members, isAdmin, onInviteSuccess }) => {
  const { workspaceId } = useParams();

  return (
    <Card className="border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Team Members</CardTitle>
              <CardDescription>Collaborators in this workspace.</CardDescription>
            </div>
          </div>
          {isAdmin && (
            <InviteMemberDialog 
              workspaceId={workspaceId} 
              onInviteSuccess={onInviteSuccess} 
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {members?.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-muted-foreground/5 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <User className="size-5" />
                </div>
                <div>
                  <p className="font-bold text-sm tracking-tight">{m.user.name}</p>
                  <p className="text-xs text-muted-foreground font-medium">{m.user.email}</p>
                </div>
              </div>
              <Badge variant={m.role === 'ADMIN' ? 'default' : 'outline'} className="rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest">
                {m.role}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
