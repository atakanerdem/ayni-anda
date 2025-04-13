import { NextResponse } from 'next/server';

export async function GET() {
    // In App router, we need to create a custom server for socket.io
    // This is a placeholder for compatibility
    return NextResponse.json({ message: 'Socket.io server is running' });
}

// Needed for Socket.io
export const dynamic = 'force-dynamic'; 