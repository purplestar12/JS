const multer = require('multer'); //to handle multipart/form-data
const sharp = require('sharp');

const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const handlerFactory = require('./handlerFactory');

const filterBody = (bodyObj, ...allowedFields) => {
  let filteredBodyObj = {};
  Object.keys(bodyObj).forEach((key) => {
    if (allowedFields.includes(key)) filteredBodyObj[key] = bodyObj[key];
  });

  return filteredBodyObj;
};

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage(); //store the file in RAM (not in disk), while processing it

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  //resizing & processing image before saving it
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`); //write file to the disk
  return next();
};

exports.createUser = (req, res) => {
  return res.status(500).json({
    status: 'error',
    message:
      'This route is not yet defined! Please use /signin to create a user',
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  return next();
};

exports.updateMe = async (req, res, next) => {
  console.log('req.file:: ', req.file);
  console.log('req.body:: ', req.body);

  //password shouldnot be updated in this route
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'Password cannot be changed here. Only the user data can be updated',
        400,
      ),
    );
  }

  //filter out the fields which shouldnot get updated using user input
  const filteredBody = filterBody(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename; //store updated filename in db

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: { updatedUser },
    },
  });
};

exports.deleteMe = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

//do not UPADATE password in this
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);
exports.getUser = handlerFactory.getOne(User);
exports.getAllUsers = handlerFactory.getAll(User);
