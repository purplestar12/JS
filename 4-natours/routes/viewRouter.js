const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

//authController.isLoggedInUser - to show the header 'logout' button or not

router.get('/', authController.isLoggedInUser, viewController.getOverview);
router.get(
  '/login',
  authController.isLoggedInUser,
  viewController.getLoginPage,
);
router.get(
  '/tour/:slug',
  authController.isLoggedInUser,
  viewController.getTourDetails,
);
router.get('/me', authController.protectRoute, viewController.getMyAccount);

router.post(
  '/submit-user-details',
  authController.protectRoute,
  viewController.updateUserDetails,
);

module.exports = router;
