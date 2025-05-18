import React from 'react';

interface Activity {
    _id?: string;
    name: string;
    count: number;
}

interface ActivityListProps {
    activities: Activity[];
    isLoading: boolean;
}

export default function ActivityList({ activities, isLoading }: ActivityListProps) {
    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Aktif Aktiviteler</h2>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : activities.length === 0 ? (
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