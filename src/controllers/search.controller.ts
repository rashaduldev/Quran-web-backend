import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as quranService from '../services/quran.service';
import { AppError } from '../middleware/errorHandler';

const searchSchema = z.object({
  q: z.string().min(2, 'Query must be at least 2 characters').max(100),
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => {
    const n = v ? parseInt(v, 10) : 20;
    return Math.min(Math.max(n, 1), 50);
  }),
});

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search ayahs by translation text
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description: Search query (searches in English translation)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Search results
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
 *                     $ref: '#/components/schemas/SearchResult'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       400:
 *         description: Invalid query
 */
export async function searchAyahs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0].message);
    }

    const { q, page, limit } = parsed.data;
    const { results, total } = await quranService.searchAyahs(q, page, limit);

    res.json({
      success: true,
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      query: q,
    });
  } catch (error) {
    next(error);
  }
}
