import mongoose from 'mongoose';

// Mongoose için global tip tanımlaması
interface GlobalWithMongoose {
    mongoose?: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayni-anda';

// TypeScript için globalThis kullanımı
const globalWithMongoose = globalThis as unknown as GlobalWithMongoose;
let cached = globalWithMongoose.mongoose;

if (!cached) {
    cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
    if (cached?.conn) {
        return cached.conn;
    }

    if (!cached?.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    cached!.conn = await cached!.promise;
    return cached!.conn;
} 