import axios from 'axios';
import NodeCache from 'node-cache';
import { logger } from '../middleware/logger';
import type {
  AlQuranApiResponse,
  AlQuranSurah,
  AlQuranSurahDetail,
  AlQuranAyah,
  Surah,
  SurahWithAyahs,
  AyahWithTranslation,
  SearchResult,
} from '../types/quran.types';

const BASE_URL = 'https://api.alquran.cloud/v1';
const TRANSLATION_EDITION = 'en.asad'; 
const ARABIC_EDITION = 'quran-uthmani';

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

async function fetchWithRetry<T>(url: string, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get<T>(url, { timeout: 15000 });
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

export async function getAllSurahs(): Promise<Surah[]> {
  const cacheKey = 'all_surahs';
  const cached = cache.get<Surah[]>(cacheKey);
  if (cached) return cached;

  logger.info('Fetching all surahs from API');
  const response = await fetchWithRetry<AlQuranApiResponse<AlQuranSurah[]>>(
    `${BASE_URL}/surah`
  );

  const surahs: Surah[] = response.data.map((s) => ({
    number: s.number,
    name: s.name,
    englishName: s.englishName,
    englishNameTranslation: s.englishNameTranslation,
    numberOfAyahs: s.numberOfAyahs,
    revelationType: s.revelationType as 'Meccan' | 'Medinan',
  }));

  cache.set(cacheKey, surahs);
  return surahs;
}

export async function getSurahById(id: number): Promise<SurahWithAyahs> {
  const cacheKey = `surah_${id}`;
  const cached = cache.get<SurahWithAyahs>(cacheKey);
  if (cached) return cached;

  logger.info(`Fetching surah ${id} from API`);

  const [arabicRes, translationRes] = await Promise.all([
    fetchWithRetry<AlQuranApiResponse<AlQuranSurahDetail>>(
      `${BASE_URL}/surah/${id}/${ARABIC_EDITION}`
    ),
    fetchWithRetry<AlQuranApiResponse<AlQuranSurahDetail>>(
      `${BASE_URL}/surah/${id}/${TRANSLATION_EDITION}`
    ),
  ]);

  const arabicData = arabicRes.data;
  const translationData = translationRes.data;

  const ayahs: AyahWithTranslation[] = arabicData.ayahs.map(
    (ayah: AlQuranAyah, idx: number) => ({
      number: ayah.number,
      text: ayah.text,
      numberInSurah: ayah.numberInSurah,
      juz: ayah.juz,
      manzil: ayah.manzil,
      page: ayah.page,
      ruku: ayah.ruku,
      hizbQuarter: ayah.hizbQuarter,
      sajda: ayah.sajda as boolean,
      translation: translationData.ayahs[idx]?.text ?? '',
    })
  );

  const surah: SurahWithAyahs = {
    number: arabicData.number,
    name: arabicData.name,
    englishName: arabicData.englishName,
    englishNameTranslation: arabicData.englishNameTranslation,
    numberOfAyahs: arabicData.numberOfAyahs,
    revelationType: arabicData.revelationType as 'Meccan' | 'Medinan',
    ayahs,
  };

  cache.set(cacheKey, surah);
  return surah;
}

export async function searchAyahs(
  query: string,
  page = 1,
  limit = 20
): Promise<{ results: SearchResult[]; total: number }> {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return { results: [], total: 0 };
  }

  // Check search cache
  const cacheKey = `search_${normalizedQuery}_${page}_${limit}`;
  const cached = cache.get<{ results: SearchResult[]; total: number }>(cacheKey);
  if (cached) return cached;

  logger.info(`Searching ayahs for: "${normalizedQuery}"`);

  try {
    const response = await fetchWithRetry<
      AlQuranApiResponse<{
        count: number;
        matches: Array<{
          number: number;
          text: string;
          surah: AlQuranSurah;
          numberInSurah: number;
          juz: number;
          manzil: number;
          page: number;
          ruku: number;
          hizbQuarter: number;
          sajda: boolean;
        }>;
      }>
    >(`${BASE_URL}/search/${encodeURIComponent(normalizedQuery)}/all/${TRANSLATION_EDITION}`);

    const matches = response.data.matches || [];
    const total = response.data.count || matches.length;

    const surahNumbers = [...new Set(matches.map((m) => m.surah.number))];
    const surahCache = new Map<number, SurahWithAyahs>();

    await Promise.all(
      surahNumbers.slice(0, 10).map(async (surahNum) => {
        try {
          const surahData = await getSurahById(surahNum);
          surahCache.set(surahNum, surahData);
        } catch (error) {
          logger.error(`Error fetching surah ${surahNum}:`, error);
        }
      })
    );

    const allResults: SearchResult[] = matches.map((match) => {
      const surahData = surahCache.get(match.surah.number);
      const arabicAyah = surahData?.ayahs.find(
        (a) => a.numberInSurah === match.numberInSurah
      );

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
  } catch (error) {
    logger.error('Search API error:', error);
    return { results: [], total: 0 };
  }
}

export function getCacheStats() {
  return cache.getStats();
}

export function clearCache() {
  cache.flushAll();
}