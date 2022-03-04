let getLogoutPage = (req,res) => {
  //console.log(req.user);
  if(req.user != undefined){
    console.log("User logged out:",req.user.id);
    req.logOut();
    req.flash('success_msg', 'Bạn đã đăng xuất thành công');
    res.redirect('/login');
  } else {
    res.redirect('/login');
  }
}

module.exports = {
  getLogoutPage: getLogoutPage,
}
