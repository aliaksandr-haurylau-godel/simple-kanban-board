
export interface Task {
  id: string;
  title: string;
  description: string;
}

export type ColumnId = 'todo' | 'inprogress' | 'done';

export interface Column {
  id: ColumnId;
  title: string;
  tasks: Task[];
}
