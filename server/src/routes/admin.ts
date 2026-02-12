import { Router } from 'express';
import multer from 'multer';
import { importPlayers } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import os from 'os';

const router = Router();
const upload = multer({ dest: os.tmpdir() });

router.post('/import-players', authenticate, upload.single('file'), importPlayers);

export default router;
