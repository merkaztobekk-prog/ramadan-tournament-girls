import { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { BannedWord } from '../models/BannedWord';

// Helper function to censor content
const censorContent = async (content: string): Promise<string> => {
    const bannedWords = await BannedWord.find({});
    let censoredContent = content;

    bannedWords.forEach(({ word }) => {
        // Escape special regex characters
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Use Unicode-aware pattern that works with Hebrew and other languages
        // Match word at word boundaries (spaces, punctuation, start/end of string)
        const regex = new RegExp(`(?:^|\\s|[.,!?;:])${escapedWord}(?=$|\\s|[.,!?;:])`, 'giu');
        censoredContent = censoredContent.replace(regex, (match) => {
            // Preserve the leading space/punctuation, only censor the word
            const leadingChar = match.match(/^[\s.,!?;:]/)?.[0] || '';
            return leadingChar + '*'.repeat(match.length - leadingChar.length);
        });
    });

    return censoredContent;
};

export const getComments = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;

        const comments = await Comment.find({ matchId: parseInt(matchId) })
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

export const createComment = async (req: Request, res: Response) => {
    try {
        const { matchId, author, content } = req.body;

        if (!matchId || !content) {
            return res.status(400).json({ error: 'matchId and content are required' });
        }

        if (content.length > 1000) {
            return res.status(400).json({ error: 'Comment is too long (max 1000 characters)' });
        }

        // Censor both the content and author name
        const censoredContent = await censorContent(content);
        const censoredAuthor = author ? await censorContent(author) : 'Anonymous';

        const comment = new Comment({
            matchId,
            author: censoredAuthor,
            content: censoredContent,
        });

        await comment.save();
        res.status(201).json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
};
