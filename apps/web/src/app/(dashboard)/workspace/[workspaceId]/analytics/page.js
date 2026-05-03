'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  BarChart3, 
  Download, 
  Target, 
  CheckSquare, 
  Clock, 
  Zap,
  TrendingUp,
  PieChart as PieChartIcon
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { StatCard } from '@/components/dashboard/overview/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AnalyticsPage() {
  const { workspaceId } = useParams();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [summaryData, chartsData] = await Promise.all([
        apiFetch(`/api/workspaces/${workspaceId}/analytics/summary`),
        apiFetch(`/api/workspaces/${workspaceId}/analytics/charts`)
      ]);
      setSummary(summaryData);
      setCharts(chartsData);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) fetchData();
  }, [workspaceId]);

  const handleExport = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/workspaces/${workspaceId}/analytics/export`, {
        credentials: 'include',
      });
      const blob = await res.blob();
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `workspace-data-${workspaceId}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <PageHeader 
        icon={BarChart3}
        title="Analytics & Insights"
        subtitle="Performance Metrics"
        description="Visualize your team's productivity, goal progression, and task distribution."
      >
        <Button variant="outline" className="rounded-xl border-dashed" onClick={handleExport}>
          <Download className="mr-2 size-4" />
          Export Workspace Data
        </Button>
      </PageHeader>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Goals" 
          value={summary?.totalGoals || 0} 
          subtitle="Strategic initiatives" 
          icon={Target}
          color="primary"
        />
        <StatCard 
          title="Completed" 
          value={summary?.completedGoals || 0} 
          subtitle={`${summary?.completionRate || 0}% success rate`} 
          icon={CheckSquare}
          color="success"
        />
        <StatCard 
          title="Overdue" 
          value={summary?.overdueGoals || 0} 
          subtitle="Requires attention" 
          icon={Clock}
          color="destructive"
        />
        <StatCard 
          title="Done This Week" 
          value={summary?.itemsDoneThisWeek || 0} 
          subtitle="Team velocity" 
          icon={Zap}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Goal Completion Chart */}
        <Card className="lg:col-span-2 border-muted/20 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              <div>
                <CardTitle>Goal Completion Trend</CardTitle>
                <CardDescription>Completed goals over the last 6 months</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.goalCompletion || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="completed" 
                  fill="var(--primary)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-muted/20 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="size-5 text-primary" />
              <div>
                <CardTitle>Goal Status</CardTitle>
                <CardDescription>Current state of all goals</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={charts?.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="border-muted/20 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-primary" />
              <div>
                <CardTitle>Task Priority</CardTitle>
                <CardDescription>Distribution of action items</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={charts?.priorityDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.priorityDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}