import mongoose from 'mongoose';

// Define the Activity schema
const ActivitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    count: {
        type: Number,
        default: 1,
    },
    // Konum bilgisi için
    location: {
        type: {
            lat: {
                type: Number,
                required: false,
                default: null
            },
            lng: {
                type: Number,
                required: false,
                default: null
            }
        },
        required: false,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Create and export the Activity model
export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema); 