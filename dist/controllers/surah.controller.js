"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSurahs = getAllSurahs;
exports.getSurahById = getSurahById;
exports.getSurahAyahs = getSurahAyahs;
const zod_1 = require("zod");
const quranService = __importStar(require("../services/quran.service"));
const errorHandler_1 = require("../middleware/errorHandler");
const surahIdSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});
const surahIdRangeSchema = surahIdSchema.refine((data) => data.id >= 1 && data.id <= 114, { message: 'Surah ID must be between 1 and 114', path: ['id'] });
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
async function getAllSurahs(_req, res, next) {
    try {
        const surahs = await quranService.getAllSurahs();
        res.json({ success: true, data: surahs, total: surahs.length });
    }
    catch (error) {
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
async function getSurahById(req, res, next) {
    try {
        const parsed = surahIdRangeSchema.safeParse(req.params);
        if (!parsed.success) {
            throw new errorHandler_1.AppError(400, parsed.error.issues[0].message);
        }
        const { id } = parsed.data;
        const surah = await quranService.getSurahById(id);
        res.json({ success: true, data: surah });
    }
    catch (error) {
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
async function getSurahAyahs(req, res, next) {
    try {
        const parsed = surahIdRangeSchema.safeParse(req.params);
        if (!parsed.success) {
            throw new errorHandler_1.AppError(400, parsed.error.issues[0].message);
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
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=surah.controller.js.map