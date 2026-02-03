import mongoose, { Schema, model, models } from 'mongoose';

const SubmissionSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    contestant: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    scores: {
        content: Number,
        pronunciation: Number,
        fluency: Number,
        expression: Number,
        impression: Number,
    },
    totalScore: {
        type: Number,
        required: true,
    },
    finalGrade: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Number,
        default: () => Date.now(),
    },
});

// Prevent model recompilation error in development
const Submission = models.Submission || model('Submission', SubmissionSchema);

export default Submission;
