const express = require('express');
const tourRouter = require('./../controllers/tourController');

//    A. CREATE ROUTER
const router = express.Router();

// PARAM MIDDLEWARE
// router.param('id', tourRouter.checkId);

//    B. DEFINE ROUTER
router
  .route('/')
  .get(tourRouter.getAllTours)
  .post(tourRouter.createTour);

router
  .route('/:id')
  .get(tourRouter.getTour)
  .patch(tourRouter.updateTour)
  .delete(tourRouter.deleteTour);

module.exports = router;
