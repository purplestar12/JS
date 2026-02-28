const express = require('express');
const userRouter = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protectRoute,
  authController.updatePassword,
);

router.get(
  '/me',
  authController.protectRoute,
  userController.getMe,
  userController.getUser,
);

router.patch('/updateMe', authController.protectRoute, userRouter.updateMe);
router.delete('/deleteMe', authController.protectRoute, userRouter.deleteMe);

router.route('/').get(userRouter.getAllUsers);

router
  .route('/:id')
  .get(userRouter.getUser)
  .patch(userRouter.updateUser)
  .delete(userRouter.deleteUser);

module.exports = router;
