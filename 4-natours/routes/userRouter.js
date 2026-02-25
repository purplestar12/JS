const express = require('express');
const userRouter = require('./../controllers/userController');
const authRouter = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authRouter.signup);
router.post('/login', authRouter.login);

router.post('/forgotPassword', authRouter.forgotPassword);
router.patch('/resetPassword/:token', authRouter.resetPassword);
router.patch(
  '/updateMyPassword',
  authRouter.protectRoute,
  authRouter.updatePassword,
);

router.patch('/updateMe', authRouter.protectRoute, userRouter.updateMe);
router.delete('/deleteMe', authRouter.protectRoute, userRouter.deleteMe);

router.route('/').get(userRouter.getAllUsers);

router
  .route('/:id')
  .get(userRouter.getUser)
  .patch(userRouter.updateUser)
  .delete(userRouter.deleteUser);

module.exports = router;
