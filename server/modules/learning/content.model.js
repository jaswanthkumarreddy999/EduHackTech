const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['video', 'text'], required: true },
    content: { type: String, default: '' }, // Video URL or Text body
    duration: { type: Number, default: 0 }, // In minutes
    isPreview: { type: Boolean, default: false } // Allow free preview
}, { _id: true });

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    lessons: [lessonSchema]
}, { _id: true });

const courseContentSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        unique: true
    },
    modules: [moduleSchema],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CourseContent', courseContentSchema);
