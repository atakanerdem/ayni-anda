'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Define ActivityLocation interface
interface ActivityLocation {
    _id?: string;
    name: string;
    lat: number;
    lng: number;
    count: number;
}

interface ActivityMapProps {
    activities: ActivityLocation[];
}

export default function ActivityMap({ activities }: ActivityMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    // Initialize Leaflet only on client side
    useEffect(() => {
        // Set mounted state to true
        setIsMounted(true);

        // Fix for Leaflet marker icons
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    }, []);

    // Create marker icon using useMemo to prevent recreating on each render
    const markerIcon = useMemo(() => L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }), []);

    // Show loading state when component is not mounted (only on client side)
    if (!isMounted) {
        return (
            <div className="bg-gray-100 rounded-lg p-4 h-80 flex items-center justify-center">
                <p className="text-gray-500">Harita yükleniyor...</p>
            </div>
        );
    }

    const defaultCenter = { lat: 39.9334, lng: 32.8597 }; // Ankara merkezi

    return (
        <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Aktivite Haritası</h2>
            <div className="h-96 rounded-lg overflow-hidden shadow-inner">
                <MapContainer
                    center={defaultCenter}
                    zoom={6}
                    className="h-full w-full"
                    attributionControl={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {activities.map((activity) => (
                        <Marker
                            key={activity._id || `${activity.lat}-${activity.lng}-${activity.name}`}
                            position={[activity.lat, activity.lng]}
                            icon={markerIcon}
                        >
                            <Popup>
                                <div className="text-center">
                                    <p className="font-semibold text-base">{activity.name}</p>
                                    <p className="text-sm text-indigo-600 font-medium">{activity.count} kişi</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
} 