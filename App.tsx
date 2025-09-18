import React, { useState, useEffect, useCallback } from 'react';
import { Board } from './components/Board';
import { Header } from './components/Header';
import { AddCardModal } from './components/AddCardModal';
import { EditCardModal } from './components/EditCardModal';
import { SettingsModal } from './components/SettingsModal';
import { Column, Task, ColumnId, GoogleTaskList } from './types';
import { EMPTY_COLUMNS } from './constants';
import { generateTasks as generateWithGemini } from './services/geminiService';
import * as GoogleTasks from './services/googleTasksService';

type Theme = 'light' | 'dark';
type ListMapping = Record<ColumnId, string | undefined>;

const App = () => {
  const [columns, setColumns] = useState<Record<ColumnId, Column>>(EMPTY_COLUMNS);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [targetColumn, setTargetColumn] = useState<ColumnId>('todo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth state
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [tokenClient, setTokenClient] = useState<any>(null);

  // Google Tasks state
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [listMapping, setListMapping] = useState<ListMapping>(() => {
    const savedMapping = localStorage.getItem('kanban-list-mapping');
    return savedMapping ? JSON.parse(savedMapping) : { todo: undefined, inprogress: undefined, done: undefined };
  });

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

  // FIX: Explicitly convert the result to a boolean to match the prop type. The logical AND operator `&&` on strings returns a string, not a boolean, which caused a type error.
  const isConfigured = !!(listMapping.todo && listMapping.inprogress && listMapping.done);

  const loadBoard = useCallback(async () => {
    if (!isConfigured) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
        const [todoTasks, inprogressTasks, doneTasks] = await Promise.all([
            GoogleTasks.listTasks(listMapping.todo!),
            GoogleTasks.listTasks(listMapping.inprogress!),
            GoogleTasks.listTasks(listMapping.done!),
        ]);

        setColumns({
            todo: { ...EMPTY_COLUMNS.todo, tasks: todoTasks },
            inprogress: { ...EMPTY_COLUMNS.inprogress, tasks: inprogressTasks },
            done: { ...EMPTY_COLUMNS.done, tasks: doneTasks },
        });

    } catch (error) {
        console.error("Failed to load tasks:", error);
        alert("Could not load tasks. You may need to sign in again.");
        handleSignOut();
    } finally {
        setIsLoading(false);
    }
  }, [listMapping, isConfigured]);

  // --- Google Auth ---
  useEffect(() => {
    const google = (window as any).google;
    // FIX: Access environment variables via the global window object to avoid potential scoping issues in the browser.
    const clientId = (window as any).process?.env?.GOOGLE_CLIENT_ID;

    if (google && clientId) {
        const client = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/userinfo.profile',
            callback: (tokenResponse: any) => {
                if (tokenResponse && tokenResponse.access_token) {
                    GoogleTasks.setToken(tokenResponse.access_token);
                    setIsSignedIn(true);
                }
            },
        });
        setTokenClient(client);
    } else if (google) {
        console.error("Google Client ID (GOOGLE_CLIENT_ID) is not configured for this environment. Google Sign-In will not function.");
    }
  }, []);

  useEffect(() => {
    const checkPreviousSignIn = async () => {
      const token = localStorage.getItem('google_auth_token');
      if (token) {
        try {
          const profile = await GoogleTasks.getUserProfile(token);
          setUserName(profile.name || 'User');
          GoogleTasks.setToken(token);
          setIsSignedIn(true);
        } catch (error) {
          // Token is likely expired or invalid
          localStorage.removeItem('google_auth_token');
        }
      }
    };
    checkPreviousSignIn();
  }, []);

  useEffect(() => {
    const setupBoard = async () => {
        if(isSignedIn) {
            const profile = await GoogleTasks.getUserProfile();
            setUserName(profile.name || 'User');
            const fetchedLists = await GoogleTasks.listTaskLists();
            setTaskLists(fetchedLists);
            if(isConfigured){
                loadBoard();
            } else {
                setSettingsModalOpen(true);
            }
        }
    }
    setupBoard();
  }, [isSignedIn, isConfigured, loadBoard]);

  const handleSignIn = () => {
    if (tokenClient) {
        tokenClient.requestAccessToken();
    } else {
        alert("Google Sign-In is not configured correctly. Please contact support.");
    }
  };

  const handleSignOut = () => {
    GoogleTasks.clearToken();
    setIsSignedIn(false);
    setUserName('');
    setColumns(EMPTY_COLUMNS);
  };
  
  const handleSaveSettings = (mapping: ListMapping) => {
    localStorage.setItem('kanban-list-mapping', JSON.stringify(mapping));
    setListMapping(mapping);
    setSettingsModalOpen(false);
  }

  // --- Task Operations ---
  const handleAddTask = async (title: string, description: string) => {
    const taskListId = listMapping[targetColumn];
    if (!taskListId) return;

    const newTask = await GoogleTasks.createTask(taskListId, { title, notes: description });
    setColumns(prev => ({
        ...prev,
        [targetColumn]: {
            ...prev[targetColumn],
            tasks: [...prev[targetColumn].tasks, newTask]
        }
    }));
    setAddModalOpen(false);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    const columnIdWithTask = (Object.keys(columns) as ColumnId[]).find(
      columnId => columns[columnId].tasks.some(task => task.id === updatedTask.id)
    );
    const taskListId = listMapping[columnIdWithTask!];
    if (!taskListId) return;

    const savedTask = await GoogleTasks.updateTask(taskListId, updatedTask.id, { title: updatedTask.title, notes: updatedTask.description });
    
    setColumns(prevColumns => {
      const newTasks = prevColumns[columnIdWithTask!].tasks.map(task =>
        task.id === savedTask.id ? savedTask : task
      );
      return {
        ...prevColumns,
        [columnIdWithTask!]: { ...prevColumns[columnIdWithTask!], tasks: newTasks },
      };
    });
    setEditingTask(null);
    setEditModalOpen(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    const columnIdWithTask = (Object.keys(columns) as ColumnId[]).find(
      columnId => columns[columnId].tasks.some(task => task.id === taskId)
    );
    const taskListId = listMapping[columnIdWithTask!];
    if (!taskListId) return;

    await GoogleTasks.deleteTask(taskListId, taskId);

    setColumns(prevColumns => {
      const newTasks = prevColumns[columnIdWithTask!].tasks.filter(task => task.id !== taskId);
      return {
        ...prevColumns,
        [columnIdWithTask!]: { ...prevColumns[columnIdWithTask!], tasks: newTasks },
      };
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

  const handleMoveTask = useCallback(async (taskId: string, sourceColumnId: ColumnId, destColumnId: ColumnId, destIndex: number) => {
    const sourceListId = listMapping[sourceColumnId];
    const destListId = listMapping[destColumnId];
    if (!sourceListId || !destListId) return;

    // Optimistic UI update
    const movedTask = columns[sourceColumnId].tasks.find(t => t.id === taskId);
    if (!movedTask) return;

    setColumns(prev => {
        const newColumns = { ...prev };
        const sourceCol = { ...newColumns[sourceColumnId], tasks: [...newColumns[sourceColumnId].tasks] };
        const destCol = sourceColumnId === destColumnId ? sourceCol : { ...newColumns[destColumnId], tasks: [...newColumns[destColumnId].tasks]};
        const taskIndex = sourceCol.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return prev;
        const [taskToMove] = sourceCol.tasks.splice(taskIndex, 1);
        destCol.tasks.splice(destIndex, 0, taskToMove);
        newColumns[sourceColumnId] = sourceCol;
        newColumns[destColumnId] = destCol;
        return newColumns;
    });

    try {
        await GoogleTasks.moveTask(taskId, sourceListId, destListId);
        // Optional: re-fetch to ensure consistency if order matters, but for now optimistic is fine.
    } catch (error) {
        console.error("Failed to move task:", error);
        // Revert UI on failure
        loadBoard();
        alert("Failed to move the task. Please try again.");
    }
  }, [columns, listMapping, loadBoard]);

  const handleGenerateTasks = async (goal: string) => {
    if (!listMapping.todo) {
      alert("Please configure your 'Backlog' column in settings before generating tasks.");
      return;
    }
    setIsGenerating(true);
    try {
      const newTasksData = await generateWithGemini(goal);
      const createdTasks = await Promise.all(
        newTasksData.map(task => GoogleTasks.createTask(listMapping.todo!, {title: task.title, notes: task.description}))
      );
      
      setColumns(prev => ({
        ...prev,
        todo: {
          ...prev.todo,
          tasks: [...prev.todo.tasks, ...createdTasks],
        },
      }));

    } catch (error) {
      console.error("Failed to generate and add tasks:", error);
      alert("There was an error generating tasks. Please check the console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
      if (!isSignedIn) {
          return <div className="text-center p-10"><h2 className="text-2xl font-semibold">Please sign in to view your board.</h2></div>
      }
      if (isLoading) {
          return <div className="text-center p-10"><h2 className="text-2xl font-semibold">Loading your board...</h2></div>
      }
      if (!isConfigured) {
          return <div className="text-center p-10"><h2 className="text-2xl font-semibold">Please configure your board from settings.</h2></div>
      }
      return (
        <Board 
          columns={columns} 
          onMoveTask={handleMoveTask} 
          onOpenAddModal={openAddModal} 
          onOpenEditModal={openEditModal} 
        />
      );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans overflow-x-auto transition-colors duration-300">
       <div className="bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
            <Header 
                onGenerateTasks={handleGenerateTasks} 
                isGenerating={isGenerating} 
                theme={theme} 
                toggleTheme={toggleTheme}
                isSignedIn={isSignedIn}
                userName={userName}
                onSignIn={handleSignIn}
                onSignOut={handleSignOut}
                onOpenSettings={() => setSettingsModalOpen(true)}
                isConfigured={isConfigured}
            />
       </div>
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
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
      {isSettingsModalOpen && isSignedIn && (
        <SettingsModal 
            onClose={() => setSettingsModalOpen(false)}
            onSave={handleSaveSettings}
            taskLists={taskLists}
            currentMapping={listMapping}
        />
      )}
    </div>
  );
};

export default App;