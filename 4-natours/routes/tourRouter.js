const express = require('express');
const tourRouter = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

//    A. CREATE ROUTER
const router = express.Router();

// PARAM MIDDLEWARE
// router.param('id', tourRouter.checkId);

// C. DEFINE ALIASING ROUTER
router
  .route('/top-5-best-tours')
  .get(tourRouter.getTopTours, tourRouter.getAllTours);

router.route('/tour-stats').get(tourRouter.getTourStats);
router.route('/monthly-plan/:year').get(tourRouter.getMonthlyPlan);

//    B. DEFINE ROUTER
router
  .route('/')
  .get(authController.protectRoute, tourRouter.getAllTours)
  .post(tourRouter.createTour);

router
  .route('/:id')
  .get(tourRouter.getTour)
  .patch(tourRouter.updateTour)
  .delete(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    tourRouter.deleteTour,
  );

module.exports = router;
