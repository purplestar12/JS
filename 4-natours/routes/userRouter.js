const express = require('express');

const userRouter = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

//Login is not needed for these routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//every route after this middleware, need to be logged in
router.use(authController.protectRoute);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userRouter.updateMe,
); //'photo'-> name of the field which takes file as input
router.delete('/deleteMe', userRouter.deleteMe);

router.use(authController.restrictTo('admin'));

router.route('/').get(userRouter.getAllUsers).post(userRouter.createUser);

router
  .route('/:id')
  .get(userRouter.getUser)
  .patch(userRouter.updateUser)
  .delete(userRouter.deleteUser);

module.exports = router;
