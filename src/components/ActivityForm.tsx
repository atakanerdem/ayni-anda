import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface ActivityFormProps {
    onStartActivity: (activity: string) => void;
    isDisabled: boolean;
}

interface ActivityOption {
    _id: string;
    name: string;
    count: number;
}

export default function ActivityForm({ onStartActivity, isDisabled }: ActivityFormProps) {
    const [activity, setActivity] = useState('');
    const [allActivities, setAllActivities] = useState<ActivityOption[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<ActivityOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Tüm aktiviteleri yükle
    useEffect(() => {
        const fetchAllActivities = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/activities/all');
                setAllActivities(response.data);
            } catch (error) {
                console.error('Error fetching all activities:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllActivities();
    }, []);

    // Kullanıcı yazdıkça filtreleme işlemi
    useEffect(() => {
        if (activity.trim() === '') {
            setFilteredActivities([]);
            return;
        }

        const filtered = allActivities.filter(item =>
            item.name.toLowerCase().includes(activity.toLowerCase())
        );
        setFilteredActivities(filtered);
    }, [activity, allActivities]);

    // Dropdown dışına tıklandığında kapat
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (activity.trim()) {
            onStartActivity(activity.trim());
            setActivity('');
            setShowDropdown(false);
        }
    };

    const handleActivitySelect = (selectedActivity: string) => {
        setActivity(selectedActivity);
        setShowDropdown(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Şu an ne yapıyorsun?</h2>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-4 relative">
                    <div className="flex-grow relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={activity}
                            onChange={(e) => setActivity(e.target.value)}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="Aktiviteni buraya yaz..."
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={isDisabled}
                        />

                        {showDropdown && !isDisabled && (
                            <div
                                ref={dropdownRef}
                                className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto bottom-full mb-1"
                            >
                                {isLoading ? (
                                    <div className="flex justify-center items-center p-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                                    </div>
                                ) : filteredActivities.length > 0 ? (
                                    <ul className="py-1">
                                        {filteredActivities.map((option) => (
                                            <li
                                                key={option._id}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                                onClick={() => handleActivitySelect(option.name)}
                                            >
                                                <span>{option.name}</span>
                                                {option.count > 0 && (
                                                    <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
                                                        {option.count} kişi
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : activity.trim() !== '' && (
                                    <div className="p-4 text-gray-500">
                                        Eşleşen aktivite bulunamadı
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

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