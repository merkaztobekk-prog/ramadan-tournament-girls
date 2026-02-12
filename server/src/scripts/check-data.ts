import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Match } from '../models/Match';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkData = async () => {
    try {
        console.log('Connecting to database...');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        console.log(`Database Name: ${mongoose.connection.name}`);

        console.log('\n--- Checking Matches ---');
        const totalMatches = await Match.countDocuments();
        console.log(`Total Matches: ${totalMatches}`);

        const playedMatches = await Match.countDocuments({ score1: { $ne: null }, score2: { $ne: null } });
        console.log(`Played Matches (score is set): ${playedMatches}`);

        const groupMatches = await Match.find({ phase: 'group' }).limit(5);
        console.log('Sample Group Matches:', JSON.stringify(groupMatches, null, 2));

    } catch (error) {
        console.error('Debug script error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

checkData();
