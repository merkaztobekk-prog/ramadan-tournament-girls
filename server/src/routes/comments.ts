import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getComments, createComment } from '../controllers/commentController';

const router = Router();

// Rate limiter: 3 comments per 5 minutes per IP
const commentLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // max 3 requests per windowMs
    message: { error: 'יותר מדי תגובות. נסה שוב בעוד מספר דקות.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.get('/:matchId', getComments);
router.post('/', commentLimiter, createComment);

export default router;
