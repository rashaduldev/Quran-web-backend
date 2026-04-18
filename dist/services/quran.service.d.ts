import NodeCache from 'node-cache';
import type { Surah, SurahWithAyahs, SearchResult } from '../types/quran.types';
export declare function getAllSurahs(): Promise<Surah[]>;
export declare function getSurahById(id: number): Promise<SurahWithAyahs>;
export declare function searchAyahs(query: string, page?: number, limit?: number): Promise<{
    results: SearchResult[];
    total: number;
}>;
export declare function getCacheStats(): NodeCache.Stats;
export declare function clearCache(): void;
//# sourceMappingURL=quran.service.d.ts.map