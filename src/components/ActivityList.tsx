import React from 'react';

interface ActivityListProps {
    activities: Activity[];
    currentActivity: string | null;
    onEndActivity: () => void;
}

export default function ActivityList({ activities, currentActivity, onEndActivity }: ActivityListProps) {
    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Aktif Aktiviteler</h2>
                {currentActivity && (
                    <div className="flex items-center">
                        <span className="mr-2 text-gray-600">Şu anki aktiviten: <strong>{currentActivity}</strong></span>
                        <button
                            onClick={onEndActivity}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                            Bitir
                        </button>
                    </div>
                )}
            </div>

            {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Henüz hiç aktivite yok.</p>
            ) : (
                <ul className="space-y-3">
                    {activities.map((activity, index) => (
                        <li
                            key={activity._id || activity.name}
                            className="flex justify-between items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                            <div className="flex items-center">
                                <span className="text-lg font-medium text-gray-800">{activity.name}</span>
                                {index < 3 && (
                                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                                        TREND
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
                                    {activity.count}
                                </div>
                                <span className="ml-2 text-sm text-gray-500">kişi</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
} 