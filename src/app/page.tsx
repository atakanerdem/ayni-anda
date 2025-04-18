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
      try {
        console.log('Initializing socket connection...');
        const newSocket = io();

        newSocket.on('connect', () => {
          console.log('Socket connected:', newSocket.id);

          // Bağlantı kurulduktan sonra aktiviteleri talep et
          newSocket.emit('getActivities');
        });

        // Tüm aktivite güncellemelerini dinle
        newSocket.on('activitiesUpdate', (updatedActivities) => {
          console.log('Activities updated:', updatedActivities);
          setActivities(updatedActivities);
          setIsLoading(false);
        });

        setSocket(newSocket);

        return () => {
          console.log('Disconnecting socket');
          newSocket.disconnect();
        };
      } catch (error) {
        console.error('Socket initialization error:', error);
        // Socket bağlantısı başarısız olursa, API'den aktiviteleri al
        fetchActivities();
      }
    };

    initSocket();
  }, []);

  // Sayfa yüklendiğinde localStorage'dan aktivite bilgisini al
  useEffect(() => {
    const savedActivity = localStorage.getItem('currentActivity');
    console.log('Saved activity from localStorage:', savedActivity);

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

  // Fallback olarak API'den aktiviteleri al
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
      setCurrentActivity(name);
      localStorage.setItem('currentActivity', name);

      // Socket üzerinden aktivite başlat
      if (socket && socket.connected) {
        socket.emit('startActivity', name);
      } else {
        // Socket bağlantısı yoksa API'yi kullan
        await axios.post('/api/activities', {
          name,
          action: 'start'
        });
        fetchActivities();
      }
    } catch (error) {
      console.error('Error starting activity:', error);
    }
  };

  // End the current activity
  const handleEndActivity = async () => {
    if (!currentActivity) return;

    try {
      // Socket üzerinden aktivite bitir
      if (socket && socket.connected) {
        socket.emit('endActivity', currentActivity);
      } else {
        // Socket bağlantısı yoksa API'yi kullan
        await axios.post('/api/activities', {
          name: currentActivity,
          action: 'end'
        });
        fetchActivities();
      }

      // Önce localStorage'dan kaldır
      console.log('Removing activity from localStorage:', currentActivity);
      localStorage.removeItem('currentActivity');

      // Sonra state'i temizle
      setCurrentActivity(null);
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
