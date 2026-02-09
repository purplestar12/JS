const express = require('express');
const userRouter = require('./../controllers/userController');

const router = express.Router();

router
  .route('/')
  .get(userRouter.getAllUsers)
  .post(userRouter.createUser);

router
  .route('/:id')
  .get(userRouter.getUser)
  .patch(userRouter.updateUser)
  .delete(userRouter.deleteUser);

module.exports = router;
