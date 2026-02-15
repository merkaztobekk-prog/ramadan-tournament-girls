import mongoose from 'mongoose';
import { BannedWord } from '../models/BannedWord';
import { config } from '../config/env';

const englishBannedWords = [
    // Common profanity
    'fuck', 'shit', 'damn', 'hell', 'ass', 'bitch', 'bastard', 'crap',
    'dick', 'cock', 'pussy', 'whore', 'slut', 'cunt', 'piss',
    // Bigoted terms
    'nigger', 'nigga', 'faggot', 'fag', 'retard', 'retarded', 'chink',
    'spic', 'kike', 'dyke', 'tranny',
    // Variations
    'fuk', 'fck', 'sht', 'btch', 'cnt',
];

const hebrewBannedWords = [
    // Hebrew profanity and slurs
    'זין', 'כוס', 'שרמוטה', 'בן זונה', 'זונה', 'חרא', 'מניאק',
    'קוקסינל', 'לעזאזל', 'טמבל', 'דפוק', 'מזדיין', 'ארס',
    'כושי', 'ערס', 'פרייר', 'חארות', 'שמוק', 'מפגר',
    'זבל', 'זיין', 'מזיין', 'מצוצן', 'חתיכת', 'דביל',
];

const seedBannedWords = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('Connected to MongoDB');

        // Clear existing banned words
        await BannedWord.deleteMany({});
        console.log('Cleared existing banned words');

        // Insert English words
        const englishWords = englishBannedWords.map(word => ({
            word,
            language: 'en',
        }));

        // Insert Hebrew words
        const hebrewWords = hebrewBannedWords.map(word => ({
            word,
            language: 'he',
        }));

        await BannedWord.insertMany([...englishWords, ...hebrewWords]);
        console.log(`✅ Seeded ${englishWords.length} English and ${hebrewWords.length} Hebrew banned words`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding banned words:', error);
        process.exit(1);
    }
};

seedBannedWords();
