import { Router } from 'express';
import { searchAyahs } from '../controllers/search.controller';

const router = Router();

router.get('/', searchAyahs);

export default router;
