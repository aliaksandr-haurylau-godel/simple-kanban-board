
import React from 'react';
import { Column as ColumnType, Task, ColumnId } from '../types';
import { Column } from './Column';

interface BoardProps {
  columns: Record<ColumnId, ColumnType>;
  onMoveTask: (taskId: string, sourceColumnId: ColumnId, destColumnId: ColumnId, destIndex: number) => void;
  onOpenAddModal: (columnId: ColumnId) => void;
  onOpenEditModal: (task: Task) => void;
}

export const Board: React.FC<BoardProps> = ({ columns, onMoveTask, onOpenAddModal, onOpenEditModal }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {(Object.keys(columns) as ColumnId[]).map(columnId => (
        <Column
          key={columnId}
          column={columns[columnId]}
          onMoveTask={onMoveTask}
          onOpenAddModal={onOpenAddModal}
          onOpenEditModal={onOpenEditModal}
        />
      ))}
    </div>
  );
};
