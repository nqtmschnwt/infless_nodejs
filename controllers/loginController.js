const express = require('express');
const app = express();
const { pool } = require('../config/dbConfig');
const passport = require('passport');

let getLoginPage = (req,res) => {
  console.log(req.clientIp);
  return res.render('login');
}

let postLoginPage = passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
})

module.exports = {
  getLoginPage: getLoginPage,
  postLoginPage: postLoginPage,
}
