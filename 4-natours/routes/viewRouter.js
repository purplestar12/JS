const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedInUser); //to show the header 'logout' button or not

router.get('/', viewController.getOverview);

router.get('/login', viewController.getLoginPage);

router.get('/tour/:slug', viewController.getTourDetails);

module.exports = router;
