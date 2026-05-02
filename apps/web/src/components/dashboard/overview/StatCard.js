'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StatCard({ title, value, subtitle, icon: Icon, color = "primary" }) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    success: "text-green-600 bg-green-600/10",
    warning: "text-orange-600 bg-orange-600/10",
    destructive: "text-red-600 bg-red-600/10",
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg border-muted/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        {Icon && (
          <div className={`p-2 rounded-xl ${colorMap[color] || colorMap.primary}`}>
            <Icon className="size-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
