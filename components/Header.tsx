import React, { useState } from 'react';

interface HeaderProps {
    onGenerateTasks: (goal: string) => void;
    isGenerating: boolean;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGenerateTasks, isGenerating, theme, toggleTheme }) => {
    const [goal, setGoal] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (goal.trim() && !isGenerating) {
            onGenerateTasks(goal);
            setGoal('');
        }
    };

    return (
        <header className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Gemini Kanban
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Organize your projects with AI-powered task generation.</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="w-full sm:w-auto flex gap-2">
                    <input 
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="e.g., Launch new marketing campaign"
                        className="flex-grow bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        disabled={isGenerating}
                    />
                    <button 
                        type="submit"
                        disabled={isGenerating || !goal.trim()}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70 transition-colors flex items-center gap-2"
                    >
                        {isGenerating ? <SpinnerIcon /> : <SparklesIcon />}
                        <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
                    </button>
                </form>
            </div>
        </header>
    );
};

const SparklesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm6 0a1 1 0 011 1v1h1a1 1 0 010 2h-1v1a1 1 0 01-2 0V6h-1a1 1 0 010-2h1V3a1 1 0 011-1zM5 12a1 1 0 011 1v1h1a1 1 0 010 2h-1v1a1 1 0 01-2 0v-1H3a1 1 0 010-2h1v-1a1 1 0 011-1zm6 0a1 1 0 011 1v1h1a1 1 0 010 2h-1v1a1 1 0 01-2 0v-1h-1a1 1 0 010-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const SpinnerIcon: React.FC = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const MoonIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
)

const SunIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
)