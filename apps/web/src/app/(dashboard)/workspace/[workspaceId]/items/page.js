'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { 
  CheckSquare,
  List, 
  LayoutGrid, 
  Plus
} from 'lucide-react';

import { useActionItemStore } from '@/store/actionItemStore';
import { useGoalStore } from '@/store/goalStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { ActionItemFilters } from '@/components/dashboard/action-items/ActionItemFilters';
import { ActionItemList } from '@/components/dashboard/action-items/ActionItemList';
import { ActionItemKanban } from '@/components/dashboard/action-items/ActionItemKanban';
import { ActionItemDialog } from '@/components/dashboard/action-items/ActionItemDialog';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export default function ActionItemsPage() {
  const { workspaceId } = useParams();
  const { items, fetchItems, createItem, updateItem, deleteItem, isLoading } = useActionItemStore();
  const { goals, fetchGoals } = useGoalStore();
  const { viewMode, setViewMode } = useUIStore();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({ status: 'all', priority: 'all', sort: 'createdAt' });

  useEffect(() => {
    if (workspaceId) {
      fetchItems(workspaceId, filter);
      fetchGoals(workspaceId);
    }
  }, [workspaceId, filter]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filter.status === 'all' || item.status === filter.status;
      const matchesPriority = filter.priority === 'all' || item.priority === filter.priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [items, searchQuery, filter.status, filter.priority]);

  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeItem = items.find(i => i.id === activeId);
    const isOverAColumn = COLUMNS.includes(overId);
    const overItem = !isOverAColumn ? items.find(i => i.id === overId) : null;

    if (isOverAColumn && activeItem.status !== overId) {
      updateItem(workspaceId, activeId, { status: overId });
    } else if (overItem && activeItem.status !== overItem.status) {
      updateItem(workspaceId, activeId, { status: overItem.status });
    }
  }, [items, updateItem, workspaceId]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    // Position updates could be handled here if backend supported it
  };

  const handleSubmit = async (formData) => {
    const payload = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      goalId: (formData.goalId === 'none' || formData.goalId === '') ? null : formData.goalId
    };
    await createItem(workspaceId, payload);
    setOpen(false);
  };

  const handleStatusToggle = async (item) => {
    const sequence = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    const currentIndex = sequence.indexOf(item.status);
    const nextStatus = currentIndex === -1 || currentIndex === sequence.length - 1 
      ? sequence[0] 
      : sequence[currentIndex + 1];
    
    await updateItem(workspaceId, item.id, { status: nextStatus });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <PageHeader 
        icon={CheckSquare}
        title="Action Items"
        subtitle="Workspace Tasks"
        description="Organize, track, and complete your team's essential tasks with precision."
        action={{
          label: "New Task",
          onClick: () => setOpen(true)
        }}
      >
        <div className="flex items-center rounded-xl border bg-muted/30 p-1 shadow-sm">
          <Button 
            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-9 px-3 rounded-lg"
            onClick={() => setViewMode('list')}
          >
            <List className="mr-2 size-4" />
            List
          </Button>
          <Button 
            variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-9 px-3 rounded-lg"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="mr-2 size-4" />
            Board
          </Button>
        </div>
      </PageHeader>

      <ActionItemFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
        isLoading={isLoading}
      />

      {isLoading && items.length === 0 ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse border border-transparent" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed bg-muted/10 rounded-3xl">
          <div className="size-20 bg-muted/20 rounded-full flex items-center justify-center mb-6">
            <CheckSquare className="size-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-heading mb-2">Clear Horizon</CardTitle>
          <CardDescription className="text-lg max-w-sm mx-auto">
            No tasks found matching your filters. Start fresh by creating a new action item.
          </CardDescription>
          <Button variant="outline" className="mt-8 rounded-xl" onClick={() => setOpen(true)}>
            <Plus className="mr-2 size-4" />
            Create First Task
          </Button>
        </Card>
      ) : viewMode === 'list' ? (
        <ActionItemList 
          items={filteredItems}
          onStatusToggle={handleStatusToggle}
          onDelete={(id) => deleteItem(workspaceId, id)}
          isLoading={isLoading}
        />
      ) : (
        <ActionItemKanban 
          items={filteredItems}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onStatusToggle={handleStatusToggle}
          onDelete={(id) => deleteItem(workspaceId, id)}
          onQuickAdd={(status) => {
            // Quick add could pre-populate status, but for now just open dialog
            setOpen(true);
          }}
          isLoading={isLoading}
        />
      )}

      <ActionItemDialog 
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        goals={goals}
        isLoading={isLoading}
      />
    </div>
  );
}