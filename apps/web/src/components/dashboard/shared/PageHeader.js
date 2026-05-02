'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageHeader({ 
  icon: Icon, 
  title, 
  description, 
  subtitle, 
  action, 
  children 
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b pb-6">
      <div className="flex flex-col gap-1">
        {subtitle && (
          <div className="flex items-center gap-2 text-primary mb-1">
            {Icon && <Icon className="size-5" />}
            <span className="text-xs font-bold uppercase tracking-widest">{subtitle}</span>
          </div>
        )}
        <h1 className="font-heading text-4xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground max-w-lg mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {action && (
          <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20" onClick={action.onClick}>
            <Plus className="mr-2 size-4" />
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
