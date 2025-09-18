import React from 'react';
import { Task, ColumnId } from '../types';

interface CardProps {
  task: Task;
  sourceColumnId: ColumnId;
  onOpenEditModal: (task: Task) => void;
}

export const Card: React.FC<CardProps> = ({ task, sourceColumnId, onOpenEditModal }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('sourceColumnId', sourceColumnId);
    e.currentTarget.classList.add('opacity-50', 'scale-105');
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'scale-105');
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onOpenEditModal(task)}
      className="kanban-card bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 border border-gray-200 dark:border-gray-600"
    >
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{task.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
    </div>
  );
};