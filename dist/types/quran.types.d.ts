export type Surah = {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: 'Meccan' | 'Medinan';
};
export type Ayah = {
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    manzil: number;
    page: number;
    ruku: number;
    hizbQuarter: number;
    sajda: boolean | {
        id: number;
        recommended: boolean;
        obligatory: boolean;
    };
};
export interface AyahWithTranslation extends Ayah {
    translation: string;
}
export interface SurahWithAyahs extends Surah {
    ayahs: AyahWithTranslation[];
}
export type AlQuranApiResponse<T> = {
    code: number;
    status: string;
    data: T;
};
export type AlQuranSurah = {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
};
export type AlQuranAyah = {
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    manzil: number;
    page: number;
    ruku: number;
    hizbQuarter: number;
    sajda: boolean | object;
};
export type AlQuranSurahDetail = {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
    ayahs: AlQuranAyah[];
};
export type SearchResult = {
    surahNumber: number;
    surahName: string;
    surahEnglishName: string;
    ayahNumber: number;
    ayahNumberInSurah: number;
    arabicText: string;
    translation: string;
};
export type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};
//# sourceMappingURL=quran.types.d.ts.map