'use client';

import { useState } from 'react';

import { ChevronsUpDown, Plus, Check, Layout } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { CreateWorkspaceDialog } from './CreateWorkspaceDialog';
import { cn } from '@/lib/utils';

export function WorkspaceSwitcher() {
  const router = useRouter();
  const { workspaceId } = useParams();
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleSelect = (workspace) => {
    setCurrentWorkspace(workspace);
    router.push(`/workspace/${workspace.id}`);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-4 w-full p-2.5 rounded-xl hover:bg-accent transition-all text-left outline-none group border border-transparent hover:border-border/40 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-12">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 shrink-0 transition-transform group-hover:scale-105 group-data-[collapsible=icon]:size-12 overflow-hidden">
              {currentWorkspace?.imageUrl ? (
                <img src={currentWorkspace.imageUrl} alt={currentWorkspace.name} className="w-full h-full object-cover" />
              ) : (
                <Layout className="size-6" />
              )}
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="font-heading font-bold text-base truncate leading-tight">
                {currentWorkspace?.name || 'Workspace'}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black leading-none opacity-70">
                Switch Team
              </span>
            </div>
            <ChevronsUpDown className="size-5 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 rounded-2xl p-2 shadow-2xl border-muted-foreground/10 animate-in slide-in-from-top-1 duration-200"
          align="start"
          sideOffset={8}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
              Workspaces
            </DropdownMenuLabel>
            <div className="space-y-1 mb-2">
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => handleSelect(ws)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                    ws.id === workspaceId ? "bg-primary/5 text-primary font-bold" : "hover:bg-accent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {ws.imageUrl ? (
                      <img src={ws.imageUrl} alt={ws.name} className="size-6 rounded-md object-cover border border-muted-foreground/10" />
                    ) : (
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: ws.accentColor || '#6366f1' }}
                      />
                    )}
                    <span className="truncate max-w-[140px]">{ws.name}</span>
                  </div>
                  {ws.id === workspaceId && <Check className="size-4" />}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="-mx-2 mb-2" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                console.log('Create Team Selected (onSelect)');
                setIsCreateDialogOpen(true);
              }}
              onClick={() => {
                console.log('Create Team Selected (onClick)');
                setIsCreateDialogOpen(true);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-primary hover:bg-primary/5 font-bold"
            >
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Plus className="size-4" />
              </div>
              <span>Create New Team</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
