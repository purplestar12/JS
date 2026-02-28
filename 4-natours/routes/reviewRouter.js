const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

//mini app
const router = express.Router({ mergeParams: true }); //mergeParams -- access params in nested route, ie.,Inherit params from parent router

//POST - /tour/37890/reviews
//POST - /reviews

router
  .route('/')
  .get(authController.protectRoute, reviewController.getAllReviews)
  .post(
    authController.protectRoute,
    authController.restrictTo('user'),
    reviewController.setTourUserIDs,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
