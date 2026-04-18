"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const surah_controller_1 = require("../controllers/surah.controller");
const router = (0, express_1.Router)();
router.get('/', surah_controller_1.getAllSurahs);
router.get('/:id', surah_controller_1.getSurahById);
router.get('/:id/ayahs', surah_controller_1.getSurahAyahs);
exports.default = router;
//# sourceMappingURL=surah.route.js.map