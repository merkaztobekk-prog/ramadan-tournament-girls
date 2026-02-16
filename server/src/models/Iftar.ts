import mongoose, { Schema, Document } from 'mongoose';

export interface IIftar extends Document {
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    islam_data: string; // e.g. "1 Ramadan 1447"
}

const iftarSchema = new Schema<IIftar>({
    date: { type: String, required: true, unique: true },
    time: { type: String, required: true },
    islam_data: { type: String, required: true }
});

export const Iftar = mongoose.model<IIftar>('Iftar', iftarSchema);
