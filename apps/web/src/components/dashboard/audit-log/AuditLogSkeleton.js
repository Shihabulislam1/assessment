import { Card, CardContent } from '@/components/ui/card';

export const AuditLogSkeleton = () => (
  <div className="flex flex-col gap-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <Card key={i} className="border-muted/20 rounded-2xl overflow-hidden shadow-sm">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="col-span-2">
              <div className="h-7 w-24 rounded-lg bg-muted animate-pulse" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <div className="size-4 rounded bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            </div>
            <div className="col-span-4">
              <div className="h-6 w-full rounded-md bg-muted animate-pulse" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <div className="size-7 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            </div>
            <div className="col-span-2">
              <div className="h-4 w-16 ml-auto rounded bg-muted animate-pulse hidden lg:block" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
