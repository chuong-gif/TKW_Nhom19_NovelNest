const express = require('express');
const chapterRouter = express.Router();
const chapterController = require('../controllers/chapterController');
const isLoggedIn = require('../authentication/authentication');
const { checkChapterUploadPermission } = require('../middlewares/ownership');

chapterRouter.get('/:novelId/chapters', isLoggedIn, chapterController.getChaptersByNovelId);
chapterRouter.get('/:novelId/chapters/:chapterId', chapterController.getChapterById);

chapterRouter.post('/:novelId/new-chapter', isLoggedIn, checkChapterUploadPermission, chapterController.uploadChapter);

module.exports = chapterRouter;
