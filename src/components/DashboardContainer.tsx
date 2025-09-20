import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useDashboardLayout } from '@/hooks/use-dashboard-layout';
import { Grip } from 'lucide-react';

interface DashboardItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const DashboardItem = ({ id, children, className = '' }: DashboardItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`opacity-50 ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${className}`}
      {...attributes}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="absolute -left-8 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded-lg"
        aria-label="Drag to reorder"
      >
        <Grip className="size-4 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
};

interface DashboardContainerProps {
  children: React.ReactNode;
}

const DashboardContainer = ({ children }: DashboardContainerProps) => {
  const { visibleWidgets, updateWidgetPosition } = useDashboardLayout();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = visibleWidgets.findIndex(item => item.id === active.id);
      const newIndex = visibleWidgets.findIndex(item => item.id === over?.id);
      
      updateWidgetPosition(active.id as string, newIndex);
    }

    setActiveId(null);
  };

  const items = visibleWidgets.map(widget => widget.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-12">
          {children}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activeId ? (
          <div className="glass-card p-4 rounded-xl shadow-2xl">
            <div className="text-foreground font-medium">
              Dragging widget...
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export { DashboardContainer, DashboardItem };