import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function SocketHandler(
    req: NextApiRequest,
    res: NextApiResponse & {
        socket: {
            server: NetServer & {
                io?: SocketIOServer;
            };
        };
    }
) {
    if (res.socket.server.io) {
        console.log('Socket is already running');
        res.end();
        return;
    }

    const io = new SocketIOServer(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('startActivity', (activity: string) => {
            io.emit('activityUpdate', { name: activity, action: 'start' });
        });

        socket.on('endActivity', (activity: string) => {
            io.emit('activityUpdate', { name: activity, action: 'end' });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    console.log('Socket server initialized');
    res.end();
} 