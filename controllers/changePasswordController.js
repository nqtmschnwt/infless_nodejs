const fs = require('fs');
const { pool } = require('../config/dbConfig');
const bcrypt = require('bcrypt');

let getChangePasswordPage = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    console.log(user);
    if(user.role_id==2 || user.role_id==3)
    {
      let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
      return res.render('changePsw', {menu:menuData,user});
    } else {
      let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/userMenu.json'));
      return res.render('changePsw', {menu:menuData,user});
    }
  } else {
    return res.redirect('/login');
  }
}

let postChangePasswordPage = async (req,res) => {
  let {oldPassword, newPassword, newPassword2} = req.body;
  let user=req.user;
  let menuData;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      // Admin menu
      menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
    }
  }
  console.log([oldPassword, newPassword, newPassword2]);
  let errors = [];

  // Validation check
  if (!oldPassword || !newPassword || !newPassword2){
    errors.push({message: "Vui lòng điền đầy đủ thông tin"});
  }

  if (newPassword.length <6){
    errors.push({message: "Mật khẩu phải ít nhất 6 ký tự"});
  }

  if (oldPassword == newPassword){
    errors.push({message: "Mật khẩu mới phải khác mật khẩu cũ"});
  }

  if (newPassword != newPassword2){
    errors.push({message: "Xác nhận mật khẩu không khớp"});
  }

  if (errors.length == 0){
    let checkPsw = await bcrypt.compare(oldPassword, user.password);
    if (!checkPsw){
      errors.push({message: "Mật khẩu cũ không đúng"});
    }
  }

  if (errors.length >0) {
    // IF error(s) in inputs
    res.render('changePsw', {menu:menuData,user,errors});
  } else {
    let hashedPassword = await bcrypt.hash(newPassword, 10);
    pool.query(
      `UPDATE users SET password=$1 WHERE id=$2`,
      [hashedPassword,user.id],
      (err, results) => {
        if(err){
          throw err;
        } else {
          req.flash("success_msg", "Thay đổi mật khẩu thành công");
          res.redirect('/change-password');
        }
      }
    )
  }
}

module.exports = {
  getChangePasswordPage:getChangePasswordPage,
  postChangePasswordPage:postChangePasswordPage
}
