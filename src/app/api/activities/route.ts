import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ActivityModel from '@/lib/models/Activity';
import { pusherServer, ACTIVITY_CHANNEL, ACTIVITY_UPDATE_EVENT } from '@/lib/pusher';

// Location type definition
interface Location {
    lat: number;
    lng: number;
}

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
        const { name, action, location } = data as { name: string; action: string; location?: Location };

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

                // Add or update location
                if (location) {
                    const existingLocationIndex = activity.locations.findIndex(
                        (loc: Location) => loc.lat === location.lat && loc.lng === location.lng
                    );

                    if (existingLocationIndex > -1) {
                        // Update existing location count
                        activity.locations[existingLocationIndex].count += 1;
                    } else {
                        // Add new location
                        activity.locations.push({
                            lat: location.lat,
                            lng: location.lng,
                            count: 1
                        });
                    }
                }
            } else if (action === 'end') {
                activity.count = Math.max(0, activity.count - 1);

                // Decrease location count if location is provided
                if (location) {
                    const locationIndex = activity.locations.findIndex(
                        (loc: Location) => loc.lat === location.lat && loc.lng === location.lng
                    );

                    if (locationIndex > -1) {
                        activity.locations[locationIndex].count = Math.max(0, activity.locations[locationIndex].count - 1);

                        // Remove location if count is 0
                        if (activity.locations[locationIndex].count === 0) {
                            activity.locations.splice(locationIndex, 1);
                        }
                    }
                }
            }

            activity.updatedAt = new Date();
            await activity.save();
        } else {
            // Create new activity
            activity = await ActivityModel.create({
                name,
                count: 1,
                locations: location ? [{
                    lat: location.lat,
                    lng: location.lng,
                    count: 1
                }] : [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        // Pusher ile aktivite güncellemesi yayınla
        await pusherServer.trigger(
            ACTIVITY_CHANNEL,
            ACTIVITY_UPDATE_EVENT,
            {
                name: activity.name,
                count: activity.count,
                _id: activity._id,
                locations: activity.locations,
                action
            }
        );

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