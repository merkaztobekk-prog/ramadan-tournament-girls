import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
    matchId: number;
    author: string;
    content: string;
    createdAt: Date;
}

const commentSchema = new Schema<IComment>({
    matchId: {
        type: Number,
        required: true,
        index: true,
    },
    author: {
        type: String,
        default: 'Anonymous',
        trim: true,
        maxlength: 100,
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
