import React, { useState, useEffect, useCallback } from 'react';
import { Board } from './components/Board';
import { Header } from './components/Header';
import { AddCardModal } from './components/AddCardModal';
import { EditCardModal } from './components/EditCardModal';
import { Column, Task, ColumnId } from './types';
import { INITIAL_COLUMNS } from './constants';
import { generateTasks } from './services/geminiService';

type Theme = 'light' | 'dark';

const App = () => {
  const [columns, setColumns] = useState<Record<ColumnId, Column>>(() => {
    const savedColumns = localStorage.getItem('kanban-board');
    return savedColumns ? JSON.parse(savedColumns) : INITIAL_COLUMNS;
  });

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [targetColumn, setTargetColumn] = useState<ColumnId>('todo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as Theme;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    localStorage.setItem('kanban-board', JSON.stringify(columns));
  }, [columns]);

  const handleAddTask = (title: string, description: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
    };
    setColumns(prev => ({
        ...prev,
        [targetColumn]: {
            ...prev[targetColumn],
            tasks: [...prev[targetColumn].tasks, newTask]
        }
    }));
    setAddModalOpen(false);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setColumns(prevColumns => {
      const columnIdWithTask = (Object.keys(prevColumns) as ColumnId[]).find(
        columnId => prevColumns[columnId].tasks.some(task => task.id === updatedTask.id)
      );
  
      if (!columnIdWithTask) {
        return prevColumns;
      }
  
      const newTasks = prevColumns[columnIdWithTask].tasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      );
  
      return {
        ...prevColumns,
        [columnIdWithTask]: {
          ...prevColumns[columnIdWithTask],
          tasks: newTasks,
        },
      };
    });
    setEditingTask(null);
    setEditModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setColumns(prevColumns => {
      const columnIdWithTask = (Object.keys(prevColumns) as ColumnId[]).find(
        columnId => prevColumns[columnId].tasks.some(task => task.id === taskId)
      );

      if (!columnIdWithTask) {
        return prevColumns;
      }
      
      const newTasks = prevColumns[columnIdWithTask].tasks.filter(task => task.id !== taskId);
      
      const newColumns = {
        ...prevColumns,
        [columnIdWithTask]: {
          ...prevColumns[columnIdWithTask],
          tasks: newTasks
        }
      };
      
      return newColumns;
    });
    setEditingTask(null);
    setEditModalOpen(false);
  };

  const openAddModal = (columnId: ColumnId) => {
    setTargetColumn(columnId);
    setAddModalOpen(true);
  };
  
  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  };

  const handleMoveTask = useCallback((taskId: string, sourceColumnId: ColumnId, destColumnId: ColumnId, destIndex: number) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      const sourceCol = { ...newColumns[sourceColumnId], tasks: [...newColumns[sourceColumnId].tasks] };
      const destCol = sourceColumnId === destColumnId ? sourceCol : { ...newColumns[destColumnId], tasks: [...newColumns[destColumnId].tasks]};
      
      const taskIndex = sourceCol.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prev;
      
      const [movedTask] = sourceCol.tasks.splice(taskIndex, 1);
      destCol.tasks.splice(destIndex, 0, movedTask);

      newColumns[sourceColumnId] = sourceCol;
      newColumns[destColumnId] = destCol;
      
      return newColumns;
    });
  }, []);

  const handleGenerateTasks = async (goal: string) => {
    setIsGenerating(true);
    try {
      const newTasks = await generateTasks(goal);
      setColumns(prev => {
        const tasksWithUniqueIds = newTasks.map(task => ({
          ...task,
          id: `task-${Date.now()}-${Math.random()}`
        }));
        return {
          ...prev,
          todo: {
            ...prev.todo,
            tasks: [...prev.todo.tasks, ...tasksWithUniqueIds],
          },
        };
      });
    } catch (error) {
      console.error("Failed to generate tasks:", error);
      alert("There was an error generating tasks. Please check the console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans overflow-x-auto transition-colors duration-300">
       <div className="bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
            <Header onGenerateTasks={handleGenerateTasks} isGenerating={isGenerating} theme={theme} toggleTheme={toggleTheme} />
       </div>
      <main className="p-4 sm:p-6 lg:p-8">
        <Board 
          columns={columns} 
          onMoveTask={handleMoveTask} 
          onOpenAddModal={openAddModal} 
          onOpenEditModal={openEditModal} 
        />
      </main>
      {isAddModalOpen && (
        <AddCardModal
          onClose={() => setAddModalOpen(false)}
          onAddCard={handleAddTask}
        />
      )}
      {isEditModalOpen && editingTask && (
        <EditCardModal
          task={editingTask}
          onClose={() => setEditModalOpen(false)}
          onUpdateCard={handleUpdateTask}
          onDeleteCard={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default App;