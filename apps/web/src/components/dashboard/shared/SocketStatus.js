'use client';

import { useSocketStore } from '@/store/socketStore';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SocketStatus() {
  const { isConnected } = useSocketStore();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center p-2 rounded-full hover:bg-muted transition-colors cursor-help">
            {isConnected ? (
              <Wifi className="size-4 text-emerald-500 animate-pulse" />
            ) : (
              <WifiOff className="size-4 text-destructive" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            Real-time: {isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
