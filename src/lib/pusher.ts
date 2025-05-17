import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance
export const pusherServer = new Pusher({
    appId: "1994048",
    key: "66f7eb0fa2377b786634",
    secret: "1c93674995fe62f1d10c",
    cluster: "eu",
    useTLS: true,
});

// Client-side Pusher instance
export const pusherClient = new PusherClient(
    "66f7eb0fa2377b786634",
    {
        cluster: "eu",
    }
);

// Kanal ve olay isimleri için sabitler
export const ACTIVITY_CHANNEL = 'activity-channel';
export const ACTIVITY_UPDATE_EVENT = 'activity-update'; 