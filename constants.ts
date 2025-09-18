
import { Column, ColumnId } from './types';

export const INITIAL_COLUMNS: Record<ColumnId, Column> = {
  todo: {
    id: 'todo',
    title: 'Backlog',
    tasks: [
      { id: 'task-1', title: 'Design the landing page', description: 'Create mockups in Figma.' },
      { id: 'task-2', title: 'Setup project repository', description: 'Initialize Git and push to GitHub.' },
    ],
  },
  inprogress: {
    id: 'inprogress',
    title: 'In Progress',
    tasks: [
        { id: 'task-3', title: 'Develop the authentication flow', description: 'Implement login and signup functionality.' },
    ],
  },
  done: {
    id: 'done',
    title: 'Done',
    tasks: [
      { id: 'task-4', title: 'Choose a tech stack', description: 'Decided on React, TypeScript, and Tailwind.' },
    ],
  },
};
