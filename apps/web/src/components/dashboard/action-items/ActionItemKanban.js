'use client';

import { Plus, User } from 'lucide-react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionItemCard, STATUS_CONFIG, PRIORITY_STYLES } from './ActionItemCard';
import { useState } from 'react';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export function ActionItemKanban({ 
  items, 
  onDragEnd, 
  onDragOver, 
  onStatusToggle, 
  onDelete, 
  onQuickAdd,
  isLoading 
}) {
  const [activeItem, setActiveItem] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const item = items.find(i => i.id === active.id);
    setActiveItem(item);
  };

  const handleDragEndInternal = (event) => {
    setActiveItem(null);
    onDragEnd(event);
  };

  return (
    <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={onDragOver}
        onDragEnd={handleDragEndInternal}
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto pb-4 items-start">
          {COLUMNS.map((status) => {
            const columnItems = items.filter((i) => i.status === status);
            return (
              <div key={status} className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex items-center justify-between px-3 py-2 bg-muted/10 rounded-xl border border-transparent border-b-border">
                  <div className="flex items-center gap-2">
                    <div className={`size-2.5 rounded-full ${STATUS_CONFIG[status]?.dot} shadow-[0_0_8px] shadow-${STATUS_CONFIG[status]?.dot}/40`} />
                    <h3 className="font-heading text-sm font-bold tracking-tight uppercase">
                      {STATUS_CONFIG[status]?.label}
                    </h3>
                  </div>
                  <Badge variant="outline" className="rounded-full size-6 flex items-center justify-center p-0 text-[10px] font-bold bg-muted/50">
                    {columnItems.length}
                  </Badge>
                </div>
                
                <SortableContext 
                  id={status}
                  items={columnItems.map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-3 min-h-[500px]">
                    {columnItems.map((item) => (
                      <ActionItemCard 
                        key={item.id} 
                        item={item} 
                        isSortable={true}
                        onClick={onStatusToggle} 
                      />
                    ))}
                    
                    <Button 
                      variant="ghost" 
                      className="w-full h-10 border-2 border-dashed border-muted/50 hover:border-primary/20 hover:bg-primary/5 rounded-xl text-muted-foreground hover:text-primary transition-all group" 
                      onClick={() => onQuickAdd(status)}
                    >
                      <Plus className="size-4 mr-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold uppercase tracking-wider">Quick Add</span>
                    </Button>
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeItem ? (
            <Card className="w-[280px] rotate-3 shadow-2xl border-primary/20 scale-105 pointer-events-none ring-2 ring-primary/20 bg-card">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className={`h-4 px-1.5 text-[8px] uppercase font-black tracking-widest rounded-sm ${PRIORITY_STYLES[activeItem.priority]?.color}`}>
                    {activeItem.priority}
                  </Badge>
                </div>
                <CardTitle className="text-[15px] font-semibold tracking-tight leading-tight">
                  {activeItem.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex -space-x-2">
                    <div className="size-6 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                      <User className="size-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
