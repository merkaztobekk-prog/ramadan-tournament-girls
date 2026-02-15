import mongoose, { Schema, Document } from 'mongoose';

export interface IBannedWord extends Document {
    word: string;
    language?: string;
    createdAt: Date;
}

const bannedWordSchema = new Schema<IBannedWord>({
    word: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    language: {
        type: String,
        enum: ['en', 'he', 'other'],
        default: 'other',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const BannedWord = mongoose.model<IBannedWord>('BannedWord', bannedWordSchema);
