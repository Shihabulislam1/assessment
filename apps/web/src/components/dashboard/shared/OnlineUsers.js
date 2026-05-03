'use client';

import React from 'react';
import { useSocketStore } from '@/store/socketStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function OnlineUsers() {
  const { onlineUsers } = useSocketStore();
  const { currentWorkspace } = useWorkspaceStore();

  const activeMembers = currentWorkspace?.members?.filter(m => onlineUsers.includes(m.userId)) || [];

  return (
    <div className="flex items-center -space-x-2 overflow-hidden px-2">
      <TooltipProvider>
        {activeMembers.map((member) => (
          <Tooltip key={member.userId}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="size-8 border-2 border-background ring-2 ring-transparent transition-all hover:ring-primary/50 cursor-pointer">
                  <AvatarImage src={member.user?.avatarUrl} alt={member.user?.name} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                    {member.user?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-background rounded-full shadow-sm" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="rounded-lg px-2 py-1 bg-background border shadow-xl">
              <p className="text-[10px] font-black text-black dark:text-white/80 uppercase tracking-wider">{member.user?.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>

      {onlineUsers.length > activeMembers.length && (
        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-[10px] font-bold border-2 border-background ml-1">
          +{onlineUsers.length - activeMembers.length}
        </div>
      )}

      {onlineUsers.length === 0 && (
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-50 px-2">
          Presence Tracking Active
        </span>
      )}
    </div>
  );
}
