'use client';

import { useEffect, useState } from 'react';
import ActivityForm from '@/components/ActivityForm';
import ActivityList from '@/components/ActivityList';
import axios from 'axios';
import { pusherClient, ACTIVITY_CHANNEL, ACTIVITY_UPDATE_EVENT } from '@/lib/pusher';

// Define the Activity interface locally
interface Activity {
  _id?: string;
  name: string;
  count: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Aktiviteleri sıralama fonksiyonu
const sortActivitiesByCount = (activities: Activity[]) => {
  return [...activities].sort((a, b) => b.count - a.count);
};

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Pusher connection
  useEffect(() => {
    // Pusher kanalına abone ol
    const channel = pusherClient.subscribe(ACTIVITY_CHANNEL);
    console.log('Pusher kanalına abone olundu:', ACTIVITY_CHANNEL);

    // Aktivite güncellemeleri dinle
    channel.bind(ACTIVITY_UPDATE_EVENT, (data: {
      name: string;
      count: number;
      _id: string;
      action: string;
    }) => {
      console.log('Activity update received via Pusher:', data);

      // Var olan aktiviteleri güncelle
      setActivities(prevActivities => {
        // Mevcut aktiviteler listesinde bu aktivite var mı kontrol et
        const existingActivityIndex = prevActivities.findIndex(
          activity => activity.name === data.name || activity._id === data._id
        );

        // Eğer aktivite zaten varsa ve sayısı sıfırdan büyükse güncelle
        if (existingActivityIndex > -1 && data.count > 0) {
          const updatedActivities = [...prevActivities];
          updatedActivities[existingActivityIndex] = {
            ...updatedActivities[existingActivityIndex],
            count: data.count
          };
          return sortActivitiesByCount(updatedActivities);
        }
        // Eğer aktivite varsa ve sayısı sıfır olmuşsa listeden çıkar
        else if (existingActivityIndex > -1 && data.count <= 0) {
          const filteredActivities = prevActivities.filter(activity =>
            activity.name !== data.name && activity._id !== data._id
          );
          return sortActivitiesByCount(filteredActivities);
        }
        // Eğer aktivite listede yoksa ve sayı sıfırdan büyükse listeye ekle
        else if (existingActivityIndex === -1 && data.count > 0) {
          return sortActivitiesByCount([...prevActivities, {
            _id: data._id,
            name: data.name,
            count: data.count
          }]);
        }

        // Herhangi bir değişiklik yoksa mevcut listeyi döndür
        return prevActivities;
      });
    });

    return () => {
      // Temizleme
      console.log('Pusher bağlantısı kapatılıyor');
      channel.unbind_all();
      pusherClient.unsubscribe(ACTIVITY_CHANNEL);
    };
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
      // API'den gelen sıralı verileri doğrudan kullan
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
      setIsLoading(true);
      const response = await axios.post('/api/activities', {
        name,
        action: 'start'
      });

      setCurrentActivity(name);
      // localStorage'a kaydet
      localStorage.setItem('currentActivity', name);

      // Aktiviteyi hemen ekle
      const newActivity = response.data;
      setActivities(prevActivities => {
        const existingIndex = prevActivities.findIndex(a => a.name === newActivity.name);
        if (existingIndex > -1) {
          // Varolan aktiviteyi güncelle
          const updatedActivities = [...prevActivities];
          updatedActivities[existingIndex] = newActivity;
          return sortActivitiesByCount(updatedActivities);
        } else {
          // Yeni aktivite ekle
          return sortActivitiesByCount([...prevActivities, newActivity]);
        }
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error starting activity:', error);
      setIsLoading(false);
    }
  };

  // End the current activity
  const handleEndActivity = async () => {
    if (!currentActivity) return;

    try {
      setIsLoading(true);
      const response = await axios.post('/api/activities', {
        name: currentActivity,
        action: 'end'
      });

      // Önce localStorage'dan kaldır
      console.log('Removing activity from localStorage:', currentActivity);
      localStorage.removeItem('currentActivity');

      // Sonra state'i temizle
      setCurrentActivity(null);

      // Aktiviteyi hemen güncelle
      const updatedActivity = response.data;
      setActivities(prevActivities => {
        // Eğer sayı sıfır olmuşsa, aktiviteyi kaldır
        if (updatedActivity.count <= 0) {
          return sortActivitiesByCount(prevActivities.filter(a => a.name !== updatedActivity.name));
        }

        // Değilse güncelle
        const existingIndex = prevActivities.findIndex(a => a.name === updatedActivity.name);
        if (existingIndex > -1) {
          const newActivities = [...prevActivities];
          newActivities[existingIndex] = updatedActivity;
          return sortActivitiesByCount(newActivities);
        }

        return prevActivities;
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error ending activity:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
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

      {currentActivity && (
        <div className="bg-white p-4 rounded-lg shadow-md border border-indigo-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-700">Şu anki aktiviten:</h2>
              <p className="text-xl font-bold text-indigo-600">{currentActivity}</p>
            </div>
            <button
              onClick={handleEndActivity}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Bitir
            </button>
          </div>
        </div>
      )}

      <ActivityList
        activities={activities}
        isLoading={isLoading}
        currentActivity={currentActivity}
      />
    </div>
  );
}
