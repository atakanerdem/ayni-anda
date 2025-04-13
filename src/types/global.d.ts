import mongoose from 'mongoose';

declare global {
    var mongoose: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };

    interface Activity {
        _id?: string;
        name: string;
        count: number;
        createdAt?: Date;
        updatedAt?: Date;
    }
} 