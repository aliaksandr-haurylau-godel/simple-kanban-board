import React, { useState } from 'react';
import { Column as ColumnType, Task, ColumnId } from '../types';
import { Card } from './Card';

interface ColumnProps {
  column: ColumnType;
  onMoveTask: (taskId: string, sourceColumnId: ColumnId, destColumnId: ColumnId, destIndex: number) => void;
  onOpenAddModal: (columnId: ColumnId) => void;
  onOpenEditModal: (task: Task) => void;
}

export const Column: React.FC<ColumnProps> = ({ column, onMoveTask, onOpenAddModal, onOpenEditModal }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId') as ColumnId;
    
    const cards = Array.from(e.currentTarget.querySelectorAll('.kanban-card'));
    const dropTarget = e.target as HTMLElement;
    const dropCard = dropTarget.closest('.kanban-card');
    let destIndex = column.tasks.length;

    if(dropCard) {
        const dropCardIndex = cards.indexOf(dropCard);
        destIndex = dropCardIndex;
    }
    
    onMoveTask(taskId, sourceColumnId, column.id, destIndex);
  };

  const columnColors: Record<ColumnId, string> = {
    todo: 'border-blue-500',
    inprogress: 'border-yellow-500',
    done: 'border-green-500'
  }

  return (
    <div 
        className={`bg-gray-200/50 dark:bg-gray-800/50 rounded-xl shadow-lg flex flex-col h-full border-t-4 ${columnColors[column.id]}`}
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{column.title} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{column.tasks.length}</span></h2>
        <button 
          onClick={() => onOpenAddModal(column.id)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded-full"
          aria-label={`Add task to ${column.title}`}
        >
            <PlusIcon/>
        </button>
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-grow p-4 space-y-4 min-h-[200px] transition-colors duration-300 ${isDragOver ? 'bg-gray-300/50 dark:bg-gray-700/50' : ''}`}
      >
        {column.tasks.map((task) => (
          <Card key={task.id} task={task} sourceColumnId={column.id} onOpenEditModal={onOpenEditModal} />
        ))}
         {isDragOver && <div className="h-1 bg-blue-500 rounded-full w-full"></div>}
      </div>
    </div>
  );
};

const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
)