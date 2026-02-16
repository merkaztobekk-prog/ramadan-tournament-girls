import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Iftar } from '../models/Iftar';

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

const seedIftar = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ramadan-tournament';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Path to data file
        const dataPath = path.join(__dirname, '../data/iftar_times.json');

        if (fs.existsSync(dataPath)) {
            const iftarData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            console.log(`Found ${iftarData.length} Iftar times.`);

            // Clear existing data
            await Iftar.deleteMany({});
            console.log('Cleared existing Iftar times.');

            // Insert new data
            await Iftar.insertMany(iftarData);
            console.log(`Inserted ${iftarData.length} Iftar times.`);
        } else {
            console.error(`Data file not found at ${dataPath}`);
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedIftar();
