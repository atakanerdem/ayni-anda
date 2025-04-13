import React, { useState } from 'react';

interface ActivityFormProps {
    onStartActivity: (activity: string) => void;
    isDisabled: boolean;
}

export default function ActivityForm({ onStartActivity, isDisabled }: ActivityFormProps) {
    const [activity, setActivity] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (activity.trim()) {
            onStartActivity(activity.trim());
            setActivity('');
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Şu an ne yapıyorsun?</h2>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                        placeholder="Aktiviteni buraya yaz..."
                        className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isDisabled}
                    />

                    <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={!activity.trim() || isDisabled}
                    >
                        {isDisabled ? 'Zaten Aktif Bir Aktiviten Var' : 'Başlat'}
                    </button>
                </div>
            </form>

            <p className="mt-4 text-gray-500 text-sm">
                Şu anda ne yapıyorsan buraya yazabilirsin. Aynı aktiviteyi yapan başka biri varsa, sayı artacak!
            </p>
        </div>
    );
} 