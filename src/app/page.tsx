'use client';

import { useEffect, useState } from 'react';
import ActivityForm from '@/components/ActivityForm';
import ActivityList from '@/components/ActivityList';
import axios from 'axios';
import { pusherClient, ACTIVITY_CHANNEL, ACTIVITY_UPDATE_EVENT } from '@/lib/pusher';
import dynamic from 'next/dynamic';

// Dynamic import of ActivityMap with SSR disabled
const ActivityMap = dynamic(
  () => import('@/components/ActivityMap'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-lg p-4 h-80 flex items-center justify-center">
        <p className="text-gray-500">Harita yükleniyor...</p>
      </div>
    )
  }
);

// Define the Activity interface locally
interface Activity {
  _id?: string;
  name: string;
  count: number;
  location?: {
    lat: number;
    lng: number;
  } | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Location type
interface Location {
  lat: number;
  lng: number;
}

// Map activity type for markers
interface MapActivity {
  _id?: string;
  name: string;
  lat: number;
  lng: number;
  count: number;
}

// Aktiviteleri sıralama fonksiyonu
const sortActivitiesByCount = (activities: Activity[]) => {
  return [...activities].sort((a, b) => b.count - a.count);
};

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Konum izni ve kullanıcı konumunu alma
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log("Konum alındı:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Konum hatası:", error);
          setLocationError(
            error.code === 1
              ? "Konum izni verilmedi."
              : "Konum bilgisi alınamadı."
          );
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationError("Tarayıcınız konum servislerini desteklemiyor.");
    }
  }, []);

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
      location?: Location | null;
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
            count: data.count,
            location: data.location || updatedActivities[existingActivityIndex].location
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
            count: data.count,
            location: data.location
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
        action: 'start',
        location: userLocation // Kullanıcı konumunu gönder
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

  // Harita için aktiviteleri hazırla
  const prepareMapActivities = (): MapActivity[] => {
    return activities
      .filter(activity => activity.location && activity.location.lat && activity.location.lng)
      .map(activity => ({
        _id: activity._id,
        name: activity.name,
        lat: activity.location!.lat,
        lng: activity.location!.lng,
        count: activity.count
      }));
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
      />

      {locationError ? (
        <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Konum Haritası</h2>
          <p className="text-yellow-700">{locationError}</p>
          <p className="mt-2 text-sm text-gray-600">
            Haritayı görmek için konum izni vermeniz gerekmektedir. Tarayıcı ayarlarından konum iznini etkinleştirebilirsiniz.
          </p>
        </div>
      ) : (
        <ActivityMap activities={prepareMapActivities()} />
      )}
    </div>
  );
}
