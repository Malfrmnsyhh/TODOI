import { Task } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// fetch all tasks
export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  } catch (error) {
    console.error('Fetch tasks error:', error);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tasks');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }
}

// create task
export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(task),
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
}

// Delete task
export async function updateTask(id: string, task: Partial<Task>): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(task),
  });
  if(!response.ok) throw new Error('failed to update task');
  return response.json();
}

// delete task
export async function deleteTask(id: string): Promise<void> {
  const response = await fetch (`${API_URL}/tasks/${id}`, { 
    method: 'DELETE',
  });
  if(!response.ok) throw new Error('failed to delete task');
}