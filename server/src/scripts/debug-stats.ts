import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { StatsService } from '../services/StatsService';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const runDebug = async () => {
    try {
        console.log('Connecting to database...');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('\n--- Calculating Standings ---');
        const standings = await StatsService.calculateStandings();
        console.log(JSON.stringify(standings, null, 2));

        console.log('\n--- Calculating Top Scorers ---');
        const topScorers = await StatsService.calculateTopScorers();
        console.log(JSON.stringify(topScorers, null, 2));

        console.log('\n--- Calculating Player Stats ---');
        const playerStats = await StatsService.calculatePlayerStats();
        console.log(JSON.stringify(playerStats, null, 2));

    } catch (error) {
        console.error('Debug script error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

runDebug();
