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
