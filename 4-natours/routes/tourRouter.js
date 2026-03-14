const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRouter');

//    A. CREATE ROUTER
const router = express.Router();

//MOUNTING A NESTED ROUTE
router.use('/:tourId/reviews', reviewRouter);

// PARAM MIDDLEWARE
// router.param('id', tourController.checkId);

// C. DEFINE ALIASING ROUTER
router
  .route('/top-5-best-tours')
  .get(tourController.getTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

//tours-distance?distance=233&center=-40,45&unit=mi --> same as "distance-within/233/center/-40,45/unit/mi" (a lot more cleaner)
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getAllToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

//    B. DEFINE ROUTER
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
