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
    // Multiple locations support
    locations: [{
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        },
        count: {
            type: Number,
            default: 1
        }
    }],
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