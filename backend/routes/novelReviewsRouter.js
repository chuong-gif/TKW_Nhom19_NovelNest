const express = require('express');
const novelReviewsRouter = express.Router();
const novelReviewsController = require('../controllers/novelReviewsController');
const isLoggedIn = require('../authentication/authentication');
const { checkReviewOwner } = require('../middlewares/ownership');

novelReviewsRouter.get('/:novelId/reviews', novelReviewsController.getNovelReviews);
novelReviewsRouter.get('/:novelId/reviews/:reviewId', isLoggedIn, novelReviewsController.getReviewsById);

novelReviewsRouter.post('/:novelId/reviews', isLoggedIn, novelReviewsController.addReview);
novelReviewsRouter.post('/:novelId/reviews/:reviewId', isLoggedIn, novelReviewsController.addReplyToReview);

novelReviewsRouter.delete('/:reviewId', isLoggedIn, checkReviewOwner, novelReviewsController.deleteReview);
novelReviewsRouter.delete('/:novelId/reviews/:reviewId', isLoggedIn, checkReviewOwner, novelReviewsController.deleteReview);

novelReviewsRouter.post('/:reviewId/toggle-like', isLoggedIn, novelReviewsController.toggleReviewLike);
novelReviewsRouter.post('/:reviewId/replies/:replyId/toggle-like', isLoggedIn, novelReviewsController.toggleReplyLike);

module.exports = novelReviewsRouter;
