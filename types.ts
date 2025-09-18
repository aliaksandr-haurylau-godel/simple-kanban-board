export interface Task {
  id: string;
  title: string;
  description: string; // Mapped from 'notes' field in Google Tasks API
}

export type ColumnId = 'todo' | 'inprogress' | 'done';

export interface Column {
  id: ColumnId;
  title: string;
  tasks: Task[];
}

export interface GoogleTaskList {
  id: string;
  title:string;
}
