import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ActivityModel from '@/lib/models/Activity';

// GET all activities
export async function GET() {
    try {
        await connectToDatabase();

        const activities = await ActivityModel.find({ count: { $gt: 0 } })
            .sort({ count: -1, createdAt: -1 })
            .limit(50);

        return NextResponse.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activities' },
            { status: 500 }
        );
    }
}

// POST to create or update an activity
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const data = await req.json();
        const { name, action } = data;

        if (!name) {
            return NextResponse.json(
                { error: 'Activity name is required' },
                { status: 400 }
            );
        }

        // Find the activity
        let activity = await ActivityModel.findOne({ name });

        if (activity) {
            // Update the count based on action
            if (action === 'start') {
                activity.count += 1;
            } else if (action === 'end') {
                activity.count = Math.max(0, activity.count - 1);
            }

            activity.updatedAt = new Date();
            await activity.save();
        } else if (action === 'start') {
            // Eğer normal sorguda bulunamadıysa, count=0 olan aktiviteleri de kontrol et
            activity = await ActivityModel.findOne({ name, count: 0 });

            if (activity) {
                // Count=0 olan aktiviteyi tekrar kullan
                activity.count = 1;
                activity.updatedAt = new Date();
                await activity.save();
            } else {
                // Hiç aktivite bulunamadıysa yeni oluştur
                activity = await ActivityModel.create({
                    name,
                    count: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        }

        return NextResponse.json(activity);
    } catch (error) {
        console.error('Error updating activity:', error);
        return NextResponse.json(
            { error: 'Failed to update activity' },
            { status: 500 }
        );
    }
}

// Make sure this route is dynamic
export const dynamic = 'force-dynamic'; 