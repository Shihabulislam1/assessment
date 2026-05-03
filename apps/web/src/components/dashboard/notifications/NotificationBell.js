'use client';

import React from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/store/notificationStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-10 rounded-xl hover:bg-primary/5">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 size-4 bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center rounded-full border-2 border-background animate-in zoom-in duration-300">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 rounded-2xl p-2 shadow-2xl border-muted-foreground/10" align="end" sideOffset={8}>
        <DropdownMenuGroup>
          <div className="flex items-center justify-between px-3 py-2">
            <DropdownMenuLabel className="p-0 text-sm font-bold">Notifications</DropdownMenuLabel>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                className="h-auto p-0 text-xs font-bold text-primary hover:bg-transparent" 
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
              >
                Mark all as read
              </Button>
            )}
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="-mx-2 mb-2" />
        <DropdownMenuGroup className="max-h-[400px] overflow-y-auto space-y-1">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-3 rounded-xl cursor-pointer transition-all focus:bg-accent",
                  !n.isRead ? "bg-primary/5 font-medium" : ""
                )}
                onSelect={(e) => {
                  e.preventDefault();
                  if (!n.isRead) markAsRead(n.id);
                }}
              >
                <div className="flex w-full justify-between gap-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{n.type}</span>
                  <span className="text-[10px] text-muted-foreground opacity-70">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm leading-tight">{n.content}</p>
                {n.linkUrl && (
                  <Link 
                    href={n.linkUrl} 
                    className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View details <ExternalLink className="size-2.5" />
                  </Link>
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
