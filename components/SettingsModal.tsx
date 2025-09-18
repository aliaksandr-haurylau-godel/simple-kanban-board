import React, { useState } from 'react';
import { GoogleTaskList, ColumnId } from '../types';

type ListMapping = Record<ColumnId, string | undefined>;

interface SettingsModalProps {
  onClose: () => void;
  onSave: (mapping: ListMapping) => void;
  taskLists: GoogleTaskList[];
  currentMapping: ListMapping;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSave, taskLists, currentMapping }) => {
  const [mapping, setMapping] = useState<ListMapping>(currentMapping);

  const handleSelectChange = (columnId: ColumnId, taskListId: string) => {
    setMapping(prev => ({ ...prev, [columnId]: taskListId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapping.todo && mapping.inprogress && mapping.done) {
      onSave(mapping);
    } else {
        alert("Please select a task list for all columns.");
    }
  };

  const renderSelect = (columnId: ColumnId, label: string) => (
    <div className="mb-4">
      <label htmlFor={columnId} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{label}</label>
      <select
        id={columnId}
        value={mapping[columnId] || ''}
        onChange={(e) => handleSelectChange(columnId, e.target.value)}
        className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>Select a list...</option>
        {taskLists.map(list => (
          <option key={list.id} value={list.id}>{list.title}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Configure Your Board</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Map your Google Task lists to the Kanban columns.</p>
        <form onSubmit={handleSubmit}>
          {renderSelect('todo', 'Backlog Column')}
          {renderSelect('inprogress', 'In Progress Column')}
          {renderSelect('done', 'Done Column')}
          
          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
