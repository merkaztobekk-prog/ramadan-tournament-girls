import express from 'express';
import { getNextIftar } from '../controllers/iftarController';

const router = express.Router();

router.get('/next', getNextIftar);

export default router;
