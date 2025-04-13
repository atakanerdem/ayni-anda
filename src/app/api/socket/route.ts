import { NextRequest, NextResponse } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export async function GET(req: NextRequest) {
    // In App router, we need to create a custom server for socket.io
    // This is a placeholder for compatibility
    return NextResponse.json({ message: 'Socket.io server is running' });
}

// Needed for Socket.io
export const dynamic = 'force-dynamic'; 