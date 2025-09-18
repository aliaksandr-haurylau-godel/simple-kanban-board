import { Column, ColumnId } from './types';

export const EMPTY_COLUMNS: Record<ColumnId, Column> = {
  todo: {
    id: 'todo',
    title: 'Backlog',
    tasks: [],
  },
  inprogress: {
    id: 'inprogress',
    title: 'In Progress',
    tasks: [],
  },
  done: {
    id: 'done',
    title: 'Done',
    tasks: [],
  },
};
