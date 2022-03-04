const express = require('express');
const app = express();
const { pool } = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const phoneNumber = require( 'awesome-phonenumber' );

app.use(express.urlencoded({extended: false}));


let getRegisterPage = (req,res) => {
  return res.render('register');
}

let postRegisterPage = async (req,res) => {
  let {name, phone, email, password, password2, ref} = req.body;
  console.log({
    name,
    phone,
    email,
    password,
    password2,
    ref
  });

  let errors = [];

  // Validation check
  if (!name || !phone || !email || !password || !password2){
    errors.push({message: "Vui lòng điền đầy đủ thông tin"});
  }

  if (password.length <6){
    errors.push({message: "Mật khẩu phải ít nhất 6 ký tự"});
  }

  if (password != password2){
    errors.push({message: "Xác nhận mật khẩu không khớp"});
  }

  // Check phone valid
  var pn = new phoneNumber(phone,'VN');
  if(!pn.isValid( ) || !pn.isMobile( ) || !pn.canBeInternationallyDialled( )){
    errors.push({message: "Số điện thoại không hợp lệ"});
  }
  let phoneFormatted = pn.getNumber( 'e164' );
  console.log(phoneFormatted);            // -> '+46707123456' (default)
  console.log(pn.getNumber( 'national' ));        // -> '070-712 34 56'


  if (errors.length >0) {
    // IF error(s) in inputs
    res.render('register', {errors});
  } else {

    // No error in inputs
    let hashedPassword = await bcrypt.hash(password, 3);
    console.log(hashedPassword);

    // Check if user existed
    pool.query(
      `SELECT * FROM users
      WHERE phone = $1`, [phoneFormatted], (err, results) => {
        if(err) {
          throw err
        }
        console.log(results.rows);
        if(results.rows.length > 0){
          errors.push({message: "Số điện thoại này đã được sử dụng"});
          res.render("register",{errors});
        } else {
          // Check ref ID or phone
          var refPhone = new phoneNumber(ref,'VN');
          if(!refPhone.isValid( ) || !refPhone.isMobile( ) || !refPhone.canBeInternationallyDialled( )){
            console.log("Ref by ID",ref);
            pool.query(
              `WITH new_user AS(
                INSERT INTO users (name,phone,email,password)
                VALUES ($1, $2, $3, $4)
                RETURNING id
              ),
              new_ref AS(
                INSERT INTO ref_info (user_id, ref_id)
                VALUES((SELECT id FROM new_user),$5)
              ),
              new_active AS(
                INSERT INTO active_users (user_id, active)
                VALUES((SELECT id FROM new_user),'false')
              )
              INSERT INTO user_role (user_id, role_id)
                VALUES((SELECT id FROM new_user),0)`,
              [name,phoneFormatted,email.trim(),hashedPassword,ref.trim()],
              (err, results) => {
                if(err) {
                  throw err
                }
                //console.log(results.rows);
                req.flash("success_msg", "Đăng ký thành công. Chúng tôi sẽ liên hệ với bạn để xác minh và kích hoạt tài khoản");
                res.redirect('/login');
              }
            )
          } else {
            console.log("Ref by Phone",refPhone.getNumber( 'e164' ));
            pool.query(
              `WITH new_user AS(
                INSERT INTO users (name,phone,email,password)
                VALUES ($1, $2, $3, $4)
                RETURNING id
              ),
              new_ref AS(
                INSERT INTO ref_info (user_id, ref_id)
                VALUES((SELECT id FROM new_user),$5)
              ),
              new_active AS(
                INSERT INTO active_users (user_id, active)
                VALUES((SELECT id FROM new_user),'false')
              )
              INSERT INTO user_role (user_id, role_id)
                VALUES((SELECT id FROM new_user),0)`,
              [name,phoneFormatted,email,hashedPassword,refPhone.getNumber( 'e164' )],
              (err, results) => {
                if(err) {
                  throw err
                }
                //console.log(results.rows);
                req.flash("success_msg", "Đăng ký thành công. Chúng tôi sẽ liên hệ với bạn để xác minh và kích hoạt tài khoản");
                res.redirect('/login');
              }
            )
          }
        }
      }
    )
  }
}

module.exports = {
  getRegisterPage: getRegisterPage,
  postRegisterPage: postRegisterPage,
}
