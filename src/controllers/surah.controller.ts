import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as quranService from '../services/quran.service';
import { AppError } from '../middleware/errorHandler';

const surahIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

const surahIdRangeSchema = surahIdSchema.refine(
  (data) => data.id >= 1 && data.id <= 114,
  { message: 'Surah ID must be between 1 and 114', path: ['id'] }
);

/**
 * @swagger
 * /api/surahs:
 *   get:
 *     summary: Get all 114 surahs
 *     tags: [Surahs]
 *     responses:
 *       200:
 *         description: List of all surahs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Surah'
 *       500:
 *         description: Server error
 */
export async function getAllSurahs(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const surahs = await quranService.getAllSurahs();
    res.json({ success: true, data: surahs, total: surahs.length });
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/surahs/{id}:
 *   get:
 *     summary: Get a surah by number with all ayahs and translations
 *     tags: [Surahs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 114
 *         description: Surah number (1-114)
 *     responses:
 *       200:
 *         description: Surah detail with ayahs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SurahDetail'
 *       400:
 *         description: Invalid surah ID
 *       404:
 *         description: Surah not found
 */
export async function getSurahById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = surahIdRangeSchema.safeParse(req.params);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0].message);
    }

    const { id } = parsed.data;
    const surah = await quranService.getSurahById(id);
    res.json({ success: true, data: surah });
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/surahs/{id}/ayahs:
 *   get:
 *     summary: Get all ayahs of a specific surah
 *     tags: [Surahs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 114
 *     responses:
 *       200:
 *         description: List of ayahs
 */
export async function getSurahAyahs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = surahIdRangeSchema.safeParse(req.params);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0].message);
    }

    const { id } = parsed.data;
    const surah = await quranService.getSurahById(id);
    res.json({
      success: true,
      data: surah.ayahs,
      total: surah.ayahs.length,
      surah: {
        number: surah.number,
        name: surah.name,
        englishName: surah.englishName,
        numberOfAyahs: surah.numberOfAyahs,
      },
    });
  } catch (error) {
    next(error);
  }
}
