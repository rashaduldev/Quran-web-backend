import { Request, Response, NextFunction } from 'express';
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
export declare function getAllSurahs(_req: Request, res: Response, next: NextFunction): Promise<void>;
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
export declare function getSurahById(req: Request, res: Response, next: NextFunction): Promise<void>;
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
export declare function getSurahAyahs(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=surah.controller.d.ts.map