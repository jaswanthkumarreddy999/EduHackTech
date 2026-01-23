const mongoose = require('mongoose');

// Team member sub-schema
const teamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Member name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Member email is required'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['leader', 'member'],
        default: 'member'
    },
    college: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    }
}, { _id: false });

const registrationSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teamName: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true,
        maxlength: [50, 'Team name cannot exceed 50 characters']
    },
    teamMembers: {
        type: [teamMemberSchema],
        validate: {
            validator: function (members) {
                return members && members.length > 0;
            },
            message: 'At least one team member is required'
        }
    },
    locality: {
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, default: 'India', trim: true }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    submission: {
        type: String,
        default: ''
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate registration
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

// Index for efficient queries
registrationSchema.index({ event: 1, status: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
