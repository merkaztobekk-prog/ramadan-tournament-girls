import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Match } from '../models/Match';
import { News } from '../models/News';

// Load environment variables from server/.env
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

const seedData = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ramadan-tournament-girls';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Paths to data files (adjusted for execution from server root or scripts dir)
        // Assuming we run this from project root or server root. Let's try absolute path based on known structure
        // c:\Users\amirl\OneDrive\Documents\GitHub\ramadan-tournament\data
        // server/src/scripts -> ../../../data
        const dataDir = path.join(__dirname, '../../../data');

        console.log(`Looking for data in: ${dataDir}`);

        // Read Matches
        const matchesPath = path.join(dataDir, 'matches.json');
        if (fs.existsSync(matchesPath)) {
            const matchesData = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));
            console.log(`Found ${matchesData.length} matches in JSON.`);

            // Clear existing matches
            await Match.deleteMany({});
            console.log('Cleared existing matches.');

            // Map fields to match Schema (snake_case to camelCase)
            const mappedMatches = matchesData.map((m: any) => ({
                id: m.id,
                date: m.date,
                location: m.location,
                phase: m.phase,
                team1Id: m.team1_id,
                team2Id: m.team2_id,
                score1: m.score1,
                score2: m.score2
            }));

            // Insert new matches
            await Match.insertMany(mappedMatches);
            console.log(`Inserted ${matchesData.length} matches.`);
        } else {
            console.warn(`matches.json not found at ${matchesPath}`);
        }

        // Read News
        const newsPath = path.join(dataDir, 'news.json');
        if (fs.existsSync(newsPath)) {
            const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
            console.log(`Found ${newsData.length} news items in JSON.`);

            // Clear existing news
            await News.deleteMany({});
            console.log('Cleared existing news.');

            // Insert new news
            await News.insertMany(newsData);
            console.log(`Inserted ${newsData.length} news items.`);
        } else {
            console.warn(`news.json not found at ${newsPath}`);
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
