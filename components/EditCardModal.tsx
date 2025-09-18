// FIX: Implemented the EditCardModal component to allow task editing and deletion. The original file content was corrupted.
import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface EditCardModalProps {
  task: Task;
  onClose: () => void;
  onUpdateCard: (task: Task) => void;
  onDeleteCard: (taskId: string) => void;
}

export const EditCardModal: React.FC<EditCardModalProps> = ({ task, onClose, onUpdateCard, onDeleteCard }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setIsConfirmingDelete(false); // Reset confirmation state when task changes
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onUpdateCard({ ...task, title, description });
    }
  };

  const handleConfirmDelete = () => {
    onDeleteCard(task.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-between items-center">
            {isConfirmingDelete ? (
              <div className="w-full flex justify-between items-center">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Are you sure?</p>
                <div className="flex justify-end gap-3">
                   <button type="button" onClick={() => setIsConfirmingDelete(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <TrashIcon /> Delete
                </button>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Update Task
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};


const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);
