'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Megaphone,
  History,
  BarChart3,
  Settings,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { WorkspaceSwitcher } from './dashboard/workspaces/WorkspaceSwitcher';

export function AppSidebar({ workspaceId }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navLinks = [
    { href: `/workspace/${workspaceId}`, label: 'Overview', icon: LayoutDashboard },
    { href: `/workspace/${workspaceId}/goals`, label: 'Goals', icon: Target },
    { href: `/workspace/${workspaceId}/items`, label: 'Action Items', icon: CheckSquare },
    { href: `/workspace/${workspaceId}/announcements`, label: 'Announcements', icon: Megaphone },
    { href: `/workspace/${workspaceId}/audit-log`, label: 'Audit Log', icon: History },
    { href: `/workspace/${workspaceId}/analytics`, label: 'Analytics', icon: BarChart3 },
    { href: `/workspace/${workspaceId}/settings`, label: 'Settings', icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-2 group-data-[collapsible=icon]:p-1">
        <WorkspaceSwitcher />
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:px-1">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={link.label} size="lg" className="group-data-[collapsible=icon]:!size-12 group-data-[collapsible=icon]:justify-center data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary/90 data-active:hover:text-primary-foreground transition-all duration-200">
                      <Link href={link.href} className="flex items-center gap-4 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                        <Icon className="size-6" data-icon="inline-start" />
                        <span className="text-base font-semibold group-data-[collapsible=icon]:hidden">{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <Separator />
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:p-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-12">
              <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
                <Avatar className="size-10 border border-border/50 shadow-sm">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span className="truncate font-bold text-sm leading-tight">{user?.name}</span>
                  <span className="truncate text-[11px] text-muted-foreground leading-tight opacity-70">{user?.email}</span>
                </div>
              </div>
              <div className="group-data-[collapsible=icon]:scale-110">
                <ThemeToggle />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
