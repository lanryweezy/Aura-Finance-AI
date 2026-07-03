import React, { useState, useRef, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function useDragAndDrop<T extends { id: string }>(
  items: T[],
  onReorder: (reordered: T[]) => void
) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverItem(id);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const fromIndex = items.findIndex(i => i.id === draggedItem);
    const toIndex = items.findIndex(i => i.id === targetId);

    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...items];
    const [removed] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, removed);

    onReorder(reordered);
    setDraggedItem(null);
    setDragOverItem(null);
  }, [draggedItem, items, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
  }, []);

  const getDragProps = useCallback((id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => handleDragStart(e, id),
    onDragOver: (e: React.DragEvent) => handleDragOver(e, id),
    onDrop: (e: React.DragEvent) => handleDrop(e, id),
    onDragEnd: handleDragEnd,
    className: `transition-all ${draggedItem === id ? 'opacity-50 scale-95' : ''} ${dragOverItem === id ? 'border-brand-cyan border-2' : ''}`,
  }), [draggedItem, dragOverItem, handleDragStart, handleDragOver, handleDrop, handleDragEnd]);

  return { getDragProps, draggedItem, dragOverItem };
}
