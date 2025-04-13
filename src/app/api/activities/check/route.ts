import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ActivityModel from '@/lib/models/Activity';

// GET - Bir aktiviteyi kontrol et
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // URL'den aktivite adını al
        const url = new URL(req.url);
        const name = url.searchParams.get('name');

        if (!name) {
            return NextResponse.json(
                { error: 'Activity name is required' },
                { status: 400 }
            );
        }

        // Aktiviteyi bul
        const activity = await ActivityModel.findOne({ name });

        if (activity) {
            return NextResponse.json({
                exists: true,
                count: activity.count,
                _id: activity._id,
                name: activity.name
            });
        } else {
            return NextResponse.json({
                exists: false,
                count: 0
            });
        }
    } catch (error) {
        console.error('Error checking activity:', error);
        return NextResponse.json(
            { error: 'Failed to check activity' },
            { status: 500 }
        );
    }
}

// Make sure this route is dynamic
export const dynamic = 'force-dynamic'; 