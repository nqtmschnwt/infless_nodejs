require('dotenv').config();
const { pool } = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const phoneNumber = require( 'awesome-phonenumber' );

let getSetup = async (req,res) => {
  let name = process.env.admin_name;
  let pn = new phoneNumber(process.env.admin_phone,'VN');
  let phoneFormatted = pn.getNumber( 'e164' );
  let email = process.env.admin_email;
  let password = await bcrypt.hash(process.env.admin_password, 10);
  let ref = '0';

  console.log([name,phoneFormatted,email,password,ref]);

  pool.query(
    `WITH new_user AS(
      INSERT INTO users (name,phone,email,password)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    ),
    new_ref AS(
    INSERT INTO ref_info (user_id, ref_id)
      VALUES((SELECT id FROM new_user),0)
    ),
    new_active AS(
    INSERT INTO active_users (user_id, active)
      VALUES((SELECT id FROM new_user),'true')
    ),
    new_services AS(
      INSERT INTO user_services (user_id, copytrade, phongthan, ddk, sl)
      VALUES((SELECT id FROM new_user),'true','true','true','true')
    )
    INSERT INTO user_role (user_id, role_id)
      VALUES((SELECT id FROM new_user),2)`,
    [name,phoneFormatted,email,password,ref],
    (err, results) => {
      if(err) {
        throw err
      }
      //console.log(results.rows);
      req.flash("success_msg", "Cài đặt thành công!");
      res.redirect('/login');
    }
  )
}

module.exports = {
  getSetup: getSetup,
}
