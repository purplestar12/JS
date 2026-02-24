const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//validators like min, max, minlength, maxlength, custom validators
// only work for CREATE & SAVE, not for update for default
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name !'],
    trim: true,
  },
  email: {
    type: String,
    tolower: true,
    required: [true, 'Please provide the email'],
    unique: [true, 'The email id must be unique'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email',
    },
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please enter the password'],
    minlength: [8, 'A password should have more than or equal to 8 characters'],
    maxlength: [
      15,
      'A password should have less than or equal to 15 characters',
    ],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password and confirm password should be the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.methods.checkPassword = async function (
  givenUserPassword,
  dbHashPassword,
) {
  return await bcrypt.compare(givenUserPassword, dbHashPassword);
};

userSchema.methods.isPasswordChangedAfterJWT = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000, //change date to seconds, then change to milliseconds
    );
    console.log(passwordChangedTimeStamp, JWTTimeStamp);
    return passwordChangedTimeStamp > JWTTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log(resetToken, 'passwordResetToken: ', passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //expiry time: 10 minutes. convert it to milliseconds before adding
  return resetToken;
};

// console.log(
//     'resetToken: ',
//     resetToken,
//     this.createPasswordResetToken,
//     typeof this.createPasswordResetToken,
//   );

userSchema.pre('save', async function () {
  //if the password is not updated, don't hash it
  //runs only when the 'password' field is updated
  console.log('password isModified:: ', this.isModified('password'));
  if (!this.isModified('password')) return; //first time data comes, returns true only
  this.password = await bcrypt.hash(this.password, 10); //hash the 'password' with the cost of 10, which means 2 power 10 times, it is hashed
  this.confirmPassword = undefined;
});

const Users = mongoose.model('Users', userSchema);

module.exports = Users;
