'use client';

import { CheckSquare } from 'lucide-react';

export default function AuthHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 text-primary mb-6 shadow-sm border border-primary/20">
        <CheckSquare className="size-8" />
      </div>
      <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
        FredoCloud
      </h1>
      <p className="text-muted-foreground mt-2 font-medium">
        {subtitle || 'Strategic Goal & Task Management'}
      </p>
    </div>
  );
}
