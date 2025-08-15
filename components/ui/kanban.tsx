"use client"

import React, { createContext, useContext, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface KanbanColumn {
  id: string
  title: string
  color?: string
}

interface KanbanItem {
  id: string
  content: React.ReactNode
  columnId: string
}

interface KanbanContextType {
  columns: KanbanColumn[]
  items: KanbanItem[]
  activeId: string | null
  onDragEnd: (event: DragEndEvent) => void
}

const KanbanContext = createContext<KanbanContextType | null>(null)

interface KanbanProviderProps {
  children: React.ReactNode
  columns: KanbanColumn[]
  items: KanbanItem[]
  onItemMove: (itemId: string, newColumnId: string) => void
}

export function KanbanProvider({ children, columns, items, onItemMove }: KanbanProviderProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const activeItem = items.find(item => item.id === active.id)
    if (!activeItem) return

    // Check if dropped on a column
    const overColumnId = over.id as string
    const targetColumn = columns.find(col => col.id === overColumnId)
    
    if (targetColumn && activeItem.columnId !== overColumnId) {
      onItemMove(activeItem.id, overColumnId)
    }
    
    setActiveId(null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const activeItem = items.find(item => item.id === active.id)
    if (!activeItem) return

    const overColumnId = over.id as string
    const targetColumn = columns.find(col => col.id === overColumnId)
    
    if (targetColumn && activeItem.columnId !== overColumnId) {
      // Visual feedback could be added here
    }
  }

  return (
    <KanbanContext.Provider value={{ columns, items, activeId, onDragEnd: handleDragEnd }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex gap-4 h-full overflow-x-auto">
          {children}
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="opacity-50 rotate-3 transform">
              {items.find(item => item.id === activeId)?.content}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </KanbanContext.Provider>
  )
}

interface KanbanColumnProps {
  column: KanbanColumn
  children?: React.ReactNode
  className?: string
}

export function KanbanColumn({ column, children, className }: KanbanColumnProps) {
  const context = useContext(KanbanContext)
  if (!context) throw new Error('KanbanColumn must be used within KanbanProvider')

  const { items } = context
  const columnItems = items.filter(item => item.columnId === column.id)

  const {
    setNodeRef,
    isOver,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  })

  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        'h-full min-w-80 flex flex-col',
        column.color,
        isOver && 'ring-2 ring-blue-500 ring-opacity-50',
        className
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="truncate">{column.title}</span>
          <Badge variant="secondary" className="ml-2 flex-shrink-0">
            {columnItems.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-3 pt-0 overflow-y-auto">
        <SortableContext items={columnItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {children}
            {columnItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No items</p>
              </div>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  )
}

interface KanbanItemProps {
  item: KanbanItem
  children?: React.ReactNode
  className?: string
}

export function KanbanItem({ item, children, className }: KanbanItemProps) {
  const context = useContext(KanbanContext)
  if (!context) throw new Error('KanbanItem must be used within KanbanProvider')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: 'item',
      item,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50"
      >
        <div className="h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300" />
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn('cursor-grab active:cursor-grabbing', className)}
    >
      {children || item.content}
    </div>
  )
}

// Hook to use kanban context
export function useKanban() {
  const context = useContext(KanbanContext)
  if (!context) {
    throw new Error('useKanban must be used within KanbanProvider')
  }
  return context
}

