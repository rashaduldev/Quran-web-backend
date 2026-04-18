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
exports.searchAyahs = searchAyahs;
const zod_1 = require("zod");
const quranService = __importStar(require("../services/quran.service"));
const errorHandler_1 = require("../middleware/errorHandler");
const searchSchema = zod_1.z.object({
    q: zod_1.z.string().min(2, 'Query must be at least 2 characters').max(100),
    page: zod_1.z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: zod_1.z.string().optional().transform((v) => {
        const n = v ? parseInt(v, 10) : 20;
        return Math.min(Math.max(n, 1), 50);
    }),
});
async function searchAyahs(req, res, next) {
    try {
        const parsed = searchSchema.safeParse(req.query);
        if (!parsed.success) {
            throw new errorHandler_1.AppError(400, parsed.error.issues[0].message);
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
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=search.controller.js.map