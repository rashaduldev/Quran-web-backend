"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSurahs = getAllSurahs;
exports.getSurahById = getSurahById;
exports.searchAyahs = searchAyahs;
exports.getCacheStats = getCacheStats;
exports.clearCache = clearCache;
const axios_1 = __importDefault(require("axios"));
const node_cache_1 = __importDefault(require("node-cache"));
const logger_1 = require("../middleware/logger");
const BASE_URL = 'https://api.alquran.cloud/v1';
const TRANSLATION_EDITION = 'en.asad';
const ARABIC_EDITION = 'quran-uthmani';
const cache = new node_cache_1.default({ stdTTL: 86400, checkperiod: 3600 });
async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios_1.default.get(url, { timeout: 15000 });
            return response.data;
        }
        catch (error) {
            if (i === retries - 1)
                throw error;
            await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        }
    }
    throw new Error('Max retries exceeded');
}
async function getAllSurahs() {
    const cacheKey = 'all_surahs';
    const cached = cache.get(cacheKey);
    if (cached)
        return cached;
    logger_1.logger.info('Fetching all surahs from API');
    const response = await fetchWithRetry(`${BASE_URL}/surah`);
    const surahs = response.data.map((s) => ({
        number: s.number,
        name: s.name,
        englishName: s.englishName,
        englishNameTranslation: s.englishNameTranslation,
        numberOfAyahs: s.numberOfAyahs,
        revelationType: s.revelationType,
    }));
    cache.set(cacheKey, surahs);
    return surahs;
}
async function getSurahById(id) {
    const cacheKey = `surah_${id}`;
    const cached = cache.get(cacheKey);
    if (cached)
        return cached;
    logger_1.logger.info(`Fetching surah ${id} from API`);
    const [arabicRes, translationRes] = await Promise.all([
        fetchWithRetry(`${BASE_URL}/surah/${id}/${ARABIC_EDITION}`),
        fetchWithRetry(`${BASE_URL}/surah/${id}/${TRANSLATION_EDITION}`),
    ]);
    const arabicData = arabicRes.data;
    const translationData = translationRes.data;
    const ayahs = arabicData.ayahs.map((ayah, idx) => ({
        number: ayah.number,
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        juz: ayah.juz,
        manzil: ayah.manzil,
        page: ayah.page,
        ruku: ayah.ruku,
        hizbQuarter: ayah.hizbQuarter,
        sajda: ayah.sajda,
        translation: translationData.ayahs[idx]?.text ?? '',
    }));
    const surah = {
        number: arabicData.number,
        name: arabicData.name,
        englishName: arabicData.englishName,
        englishNameTranslation: arabicData.englishNameTranslation,
        numberOfAyahs: arabicData.numberOfAyahs,
        revelationType: arabicData.revelationType,
        ayahs,
    };
    cache.set(cacheKey, surah);
    return surah;
}
async function searchAyahs(query, page = 1, limit = 20) {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery || normalizedQuery.length < 2) {
        return { results: [], total: 0 };
    }
    const cacheKey = `search_${normalizedQuery}_${page}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached)
        return cached;
    logger_1.logger.info(`Searching ayahs for: "${normalizedQuery}"`);
    try {
        const response = await fetchWithRetry(`${BASE_URL}/search/${encodeURIComponent(normalizedQuery)}/all/${TRANSLATION_EDITION}`);
        const matches = response.data.matches || [];
        const total = response.data.count || matches.length;
        const surahNumbers = [...new Set(matches.map((m) => m.surah.number))];
        const surahCache = new Map();
        await Promise.all(surahNumbers.slice(0, 10).map(async (surahNum) => {
            try {
                const surahData = await getSurahById(surahNum);
                surahCache.set(surahNum, surahData);
            }
            catch (error) {
                logger_1.logger.error(`Error fetching surah ${surahNum}:`, error);
            }
        }));
        const allResults = matches.map((match) => {
            const surahData = surahCache.get(match.surah.number);
            const arabicAyah = surahData?.ayahs.find((a) => a.numberInSurah === match.numberInSurah);
            return {
                surahNumber: match.surah.number,
                surahName: match.surah.name,
                surahEnglishName: match.surah.englishName,
                ayahNumber: match.number,
                ayahNumberInSurah: match.numberInSurah,
                arabicText: arabicAyah?.text ?? '',
                translation: match.text,
            };
        });
        const start = (page - 1) * limit;
        const paginatedResults = allResults.slice(start, start + limit);
        const result = { results: paginatedResults, total };
        cache.set(cacheKey, result, 7200);
        return result;
    }
    catch (error) {
        logger_1.logger.error('Search API error:', error);
        return { results: [], total: 0 };
    }
}
function getCacheStats() {
    return cache.getStats();
}
function clearCache() {
    cache.flushAll();
}
//# sourceMappingURL=quran.service.js.map