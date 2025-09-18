import { Task, GoogleTaskList } from '../types';

const API_BASE_URL = 'https://tasks.googleapis.com/tasks/v1';
const USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
let accessToken: string | null = null;

export const setToken = (token: string) => {
    accessToken = token;
    // Persist token to handle page reloads
    localStorage.setItem('google_auth_token', token);
};

export const clearToken = () => {
    accessToken = null;
    localStorage.removeItem('google_auth_token');
}

const getHeaders = () => {
    if (!accessToken) {
        throw new Error("Not authenticated");
    }
    return {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };
};

const mapGoogleTaskToTask = (googleTask: any): Task => ({
    id: googleTask.id,
    title: googleTask.title,
    description: googleTask.notes || '',
});

export const getUserProfile = async (tokenOverride?: string) => {
    const token = tokenOverride || accessToken;
    if (!token) throw new Error("Not authenticated");
    const response = await fetch(USER_INFO_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Failed to fetch user profile");
    return await response.json();
};

export const listTaskLists = async (): Promise<GoogleTaskList[]> => {
    const response = await fetch(`${API_BASE_URL}/users/@me/lists`, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch task lists");
    const data = await response.json();
    return data.items || [];
};

export const listTasks = async (taskListId: string): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/lists/${taskListId}/tasks`, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch tasks");
    const data = await response.json();
    return (data.items || []).map(mapGoogleTaskToTask);
};

export const createTask = async (taskListId: string, task: { title: string, notes: string }): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/lists/${taskListId}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error("Failed to create task");
    const data = await response.json();
    return mapGoogleTaskToTask(data);
};

export const updateTask = async (taskListId: string, taskId: string, task: { title: string, notes: string }): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/lists/${taskListId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error("Failed to update task");
    const data = await response.json();
    return mapGoogleTaskToTask(data);
};

export const deleteTask = async (taskListId: string, taskId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/lists/${taskListId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete task");
};

// Moving a task between lists in Google Tasks API is a create-then-delete operation.
export const moveTask = async (taskId: string, sourceListId: string, destListId: string): Promise<void> => {
    if (sourceListId === destListId) {
        // Simple move within the same list (not implemented, as drag-and-drop handles this)
        return;
    }
    
    // 1. Get the original task
    const taskResponse = await fetch(`${API_BASE_URL}/lists/${sourceListId}/tasks/${taskId}`, { headers: getHeaders() });
    if (!taskResponse.ok) throw new Error("Failed to get task to move");
    const taskData = await taskResponse.json();

    // 2. Create a new task in the destination list
    await createTask(destListId, { title: taskData.title, notes: taskData.notes });

    // 3. Delete the old task from the source list
    await deleteTask(sourceListId, taskId);
};
