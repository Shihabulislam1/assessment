import { Button } from '@/components/ui/button';

export const AuditLogPagination = ({ pagination, onPageChange, isLoading, totalLogs }) => {
  return (
    <div className="flex items-center justify-between mt-6 bg-muted/10 p-4 rounded-2xl border border-dashed">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-bold text-foreground">{totalLogs}</span> of <span className="font-bold text-foreground">{pagination.total}</span> total logs
      </p>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={pagination.page <= 1 || isLoading} 
          onClick={() => onPageChange(pagination.page - 1)}
          className="rounded-xl h-9"
        >
          Previous
        </Button>
        <div className="flex items-center gap-1 px-3 py-1 bg-background rounded-lg border text-xs font-bold">
          {pagination.page} / {pagination.pages}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={pagination.page >= pagination.pages || isLoading} 
          onClick={() => onPageChange(pagination.page + 1)}
          className="rounded-xl h-9"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
