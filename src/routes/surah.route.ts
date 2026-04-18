import { Router } from 'express';
import {
  getAllSurahs,
  getSurahById,
  getSurahAyahs,
} from '../controllers/surah.controller';

const router = Router();

router.get('/', getAllSurahs);
router.get('/:id', getSurahById);
router.get('/:id/ayahs', getSurahAyahs);

export default router;
