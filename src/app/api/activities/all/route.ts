import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ActivityModel from '@/lib/models/Activity';

// GET - Tüm aktiviteleri getir (count=0 olanlar dahil)
export async function GET() {
    try {
        await connectToDatabase();

        // Tüm aktiviteleri al
        const activities = await ActivityModel.find({})
            .sort({ count: -1, updatedAt: -1 })
            .limit(100);

        // Sadece isimleri ve ID'leri dön
        const activityNames = activities.map(activity => ({
            _id: activity._id,
            name: activity.name,
            count: activity.count
        }));

        return NextResponse.json(activityNames);
    } catch (error) {
        console.error('Error fetching all activities:', error);
        return NextResponse.json(
            { error: 'Failed to fetch all activities' },
            { status: 500 }
        );
    }
}

// Make sure this route is dynamic
export const dynamic = 'force-dynamic'; 