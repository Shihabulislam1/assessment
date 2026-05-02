'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { History, Download } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/button';

import { AuditLogFilters } from '@/components/dashboard/audit-log/AuditLogFilters';
import { AuditLogList } from '@/components/dashboard/audit-log/AuditLogList';
import { AuditLogSkeleton } from '@/components/dashboard/audit-log/AuditLogSkeleton';
import { AuditLogPagination } from '@/components/dashboard/audit-log/AuditLogPagination';

export default function AuditLogPage() {
  const { workspaceId } = useParams();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filter, setFilter] = useState({ entity: 'all', action: 'all' });
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async (page = 1, f = filter) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ 
        page, 
        entity: f.entity === 'all' ? '' : f.entity, 
        action: f.action === 'all' ? '' : f.action 
      }).toString();
      const data = await apiFetch(`/api/workspaces/${workspaceId}/audit-log?${params}`);
      setLogs(data.logs || []);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) fetchLogs(1, filter);
  }, [workspaceId, filter]);

  const handleExport = () => {
    const params = new URLSearchParams({
      entity: filter.entity === 'all' ? '' : filter.entity,
      action: filter.action === 'all' ? '' : filter.action
    }).toString();
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/workspaces/${workspaceId}/audit-log/export?${params}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <PageHeader 
        icon={History}
        title="Audit Log"
        subtitle="Security & Activity"
        description="Monitor all administrative actions and data changes within your workspace."
      >
        <Button variant="outline" size="lg" className="rounded-xl border-dashed" onClick={handleExport}>
          <Download className="mr-2 size-4" />
          Export CSV
        </Button>
      </PageHeader>

      <AuditLogFilters 
        filter={filter} 
        setFilter={setFilter} 
        isLoading={isLoading} 
      />

      {isLoading && logs.length === 0 ? (
        <AuditLogSkeleton />
      ) : (
        <>
          <AuditLogList logs={logs} isLoading={isLoading} />
          {logs.length > 0 && (
            <AuditLogPagination 
              pagination={pagination} 
              onPageChange={fetchLogs} 
              isLoading={isLoading}
              totalLogs={logs.length}
            />
          )}
        </>
      )}
    </div>
  );
}