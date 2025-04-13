'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import ActivityForm from '@/components/ActivityForm';
import ActivityList from '@/components/ActivityList';
import axios from 'axios';

// Define the Activity interface locally
interface Activity {
  _id?: string;
  name: string;
  count: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Socket.io connection
  useEffect(() => {
    const initSocket = async () => {
      // Initialize socket connection
      await fetch('/api/socket');

      const newSocket = io();

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      newSocket.on('activityUpdate', ({ name, action }) => {
        console.log('Activity update received:', name, action);
        // Fetch the latest activities when an update is received
        fetchActivities();
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    };

    initSocket();
  }, []);

  // Sayfa yüklendiğinde localStorage'dan aktivite bilgisini al
  useEffect(() => {
    const savedActivity = localStorage.getItem('currentActivity');
    console.log('Saved activity from localStorage:', savedActivity);

    // localStorage kontrolü
    console.log('All localStorage keys:', Object.keys(localStorage));

    if (savedActivity) {
      // API'den aktiviteyi kontrol et
      const checkActivity = async () => {
        try {
          const response = await axios.get(`/api/activities/check?name=${encodeURIComponent(savedActivity)}`);
          const { exists, count } = response.data;

          // Eğer aktivite hala aktifse (count > 0) göster, değilse localStorage'dan temizle
          if (exists && count > 0) {
            setCurrentActivity(savedActivity);
          } else {
            console.log('Activity no longer active, removing from localStorage');
            localStorage.removeItem('currentActivity');
            setCurrentActivity(null);
          }
        } catch (error) {
          console.error('Error checking activity:', error);
          // Hata durumunda varsayılan davranışı uygula
          setCurrentActivity(savedActivity);
        }
      };

      checkActivity();
    } else {
      // Aktivite yoksa state'i temizle
      setCurrentActivity(null);
    }

    const currentActivity = localStorage.getItem('currentActivity');

    // Sayfa kapandığında veya yenilendiğinde
    const handleBeforeUnload = () => {
      console.log('Page is unloading/refreshing');
      // Bu işlemler senkron olmalı, localStorage kullanılmalı
      if (currentActivity) {
        console.log('Setting unload flag for:', currentActivity);
        localStorage.setItem('activityUnloaded', 'true');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Aktivite değiştiğinde localStorage'a kaydet
  useEffect(() => {
    console.log('Current activity changed:', currentActivity);
    if (currentActivity) {
      localStorage.setItem('currentActivity', currentActivity);
    } else {
      localStorage.removeItem('currentActivity');
    }
  }, [currentActivity]);

  // Fetch activities on initial load
  useEffect(() => {
    fetchActivities();
  }, []);

  // Fetch activities from the API
  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/activities');
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new activity
  const handleStartActivity = async (name: string) => {
    try {
      await axios.post('/api/activities', {
        name,
        action: 'start'
      });

      setCurrentActivity(name);
      // localStorage'a kaydet
      localStorage.setItem('currentActivity', name);

      // Emit socket event
      if (socket) {
        socket.emit('startActivity', name);
      }

      fetchActivities();
    } catch (error) {
      console.error('Error starting activity:', error);
    }
  };

  // End the current activity
  const handleEndActivity = async () => {
    if (!currentActivity) return;

    try {
      await axios.post('/api/activities', {
        name: currentActivity,
        action: 'end'
      });

      // Emit socket event
      if (socket) {
        socket.emit('endActivity', currentActivity);
      }

      // Önce localStorage'dan kaldır
      console.log('Removing activity from localStorage:', currentActivity);
      localStorage.removeItem('currentActivity');

      // Sonra state'i temizle
      setCurrentActivity(null);

      fetchActivities();
    } catch (error) {
      console.error('Error ending activity:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-800 mb-3">Aynı Anda</h1>
        <p className="text-gray-600 text-lg">
          Şu an neler yapıyorsun? Aynı anda aynı şeyleri yapan kaç kişi var?
        </p>
      </div>

      <ActivityForm
        onStartActivity={handleStartActivity}
        isDisabled={!!currentActivity}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <ActivityList
          activities={activities}
          currentActivity={currentActivity}
          onEndActivity={handleEndActivity}
        />
      )}
    </div>
  );
}
