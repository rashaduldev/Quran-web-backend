import path from "path";
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quran API",
      version: "1.0.0",
      description: `A comprehensive REST API providing access to the Holy Quran with Arabic text and English translations.

## Features
- All 114 Surahs with metadata
- Complete Ayah text in Arabic (Uthmani script)
- English translation (Muhammad Asad)
- Full-text search in translations
- Response caching for performance

## Data Source
Data is sourced from [AlQuran Cloud](https://alquran.cloud/api) and cached server-side for 24 hours.
      `,
      contact: {
        name: "Quran API Support",
        url: "https://github.com/rashaduldev/Quran-web-backend",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "https://quran-web-backend-rashaduldev.vercel.app",
        description: "Production Server",
      },
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
    ],
    tags: [
      {
        name: "Surahs",
        description: "Surah (chapter) operations",
      },
      {
        name: "Search",
        description: "Search operations",
      },
      {
        name: "Health",
        description: "API health and status",
      },
    ],
    components: {
      schemas: {
        Surah: {
          type: "object",
          properties: {
            number: { type: "integer", example: 1 },
            name: { type: "string", example: "سُورَةُ ٱلْفَاتِحَةِ" },
            englishName: { type: "string", example: "Al-Faatiha" },
            englishNameTranslation: {
              type: "string",
              example: "The Opening",
            },
            numberOfAyahs: { type: "integer", example: 7 },
            revelationType: {
              type: "string",
              enum: ["Meccan", "Medinan"],
              example: "Meccan",
            },
          },
        },
        Ayah: {
          type: "object",
          properties: {
            number: { type: "integer", example: 1 },
            text: {
              type: "string",
              example: "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
            },
            numberInSurah: { type: "integer", example: 1 },
            juz: { type: "integer", example: 1 },
            page: { type: "integer", example: 1 },
            translation: {
              type: "string",
              example:
                "In the name of God, the Most Gracious, the Dispenser of Grace",
            },
          },
        },
        SurahDetail: {
          allOf: [
            { $ref: "#/components/schemas/Surah" },
            {
              type: "object",
              properties: {
                ayahs: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Ayah" },
                },
              },
            },
          ],
        },
        SearchResult: {
          type: "object",
          properties: {
            surahNumber: { type: "integer", example: 2 },
            surahName: { type: "string", example: "سُورَةُ البَقَرَةِ" },
            surahEnglishName: { type: "string", example: "Al-Baqara" },
            ayahNumber: { type: "integer", example: 255 },
            ayahNumberInSurah: { type: "integer", example: 255 },
            arabicText: {
              type: "string",
              example: "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ...",
            },
            translation: {
              type: "string",
              example: "God - there is no deity save Him...",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "Error message" },
          },
        },
      },
    },
  },
  apis: [
    path.resolve(process.cwd(), 'src/routes/*.ts'),
    path.resolve(process.cwd(), 'src/controllers/*.ts'),
    
    path.resolve(process.cwd(), 'dist/routes/*.js'),
    path.resolve(process.cwd(), 'dist/controllers/*.js'),
    
    './routes/*.js',
    './controllers/*.js',
    './*.js'
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
