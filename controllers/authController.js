const User = require("../models/user");
const jwt = require('jsonwebtoken');

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
      errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
      errors.password = 'That password is incorrect';

  }

  // duplicate email error
  if (err.code === 11000) {
      errors.email = 'that email is already registered';
    // return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'net secret', {
    expiresIn: maxAge
  });
};

// controller actions
module.exports.signup_get = (req, res) => {
    try {
        res.render('signup', { title: 'sign up' });
    } catch (err) {
        res.render('404', { title: 'sign up' });
    }
}

module.exports.login_get = (req, res) => {
    try {res.render('login', { title: 'log in' });
} catch (err) {
    res.render('404', { title: 'log in' });
}
}

module.exports.signup_post = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({ name, email, password });
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(201).json({ user: user._id });
      // res.redirect('/profile');
  }
  catch(err) {
    const errors = handleErrors(err);
      res.status(400).json({ errors });
    res.render('signup', { title: 'sign up' });
  }
 
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).json({ user: user._id });
      // res.redirect('/user/profile');
  } 
  catch (err) {
    const errors = handleErrors(err);
      res.status(400).json({ errors });
      res.render('login', { title: 'log in' });

  }

}

module.exports.profile_get = (req, res) => {
    try {
        res.render('profile', { title: 'profile' });
    } catch (err) {
        res.render('404', { title: 'profile' });
    }
}

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
}