const express = require('express');
const setupController = require('../controllers/setupController');
const homeController = require('../controllers/homeController');
const loginController = require('../controllers/loginController');
const logoutController = require('../controllers/logoutController');
const registerController = require('../controllers/registerController');
const managerController = require('../controllers/managerController');
const changePasswordController = require('../controllers/changePasswordController');
const newCustomerController = require('../controllers/newCustomerController');
const findCustomerController = require('../controllers/findCustomerController');
const app = express();
const rateLimit = require('express-rate-limit');
const contextPath = '/inflessweb';

let router = express.Router();

let initWebRoutes = (app) => {
  // Setup
      router.get("/setup", setupController.getSetup);

  /* WEB PAGES */
      router.get("/", homeController.getWebHomePage);
      router.get("/gioi-thieu", homeController.getGioiThieuPage);
      router.get("/gioi-thieu/tam-nhin-su-menh/", homeController.getTamNhinPage);
      router.get("/gioi-thieu/phuong-cham-muc-tieu/", homeController.getMucTieuPage);
      router.get("/he-thong-ho-tro-giao-dich-infless/", homeController.getWebDownloadPage);
      router.get("/dich-vu-ho-tro-dau-tu-chung-khoan/", homeController.getDichVuHoTroPage);
      router.get("/dich-vu-hop-tac-dau-tu/", homeController.getDichVuHopTacPage);
      router.get("/privacy-policy/", homeController.getPrivatePolicyPage);
      router.get("/lien-he/", homeController.getLienHePage);
      router.get("/tuyen-dung/", homeController.getTuyendungPage);


  /* PLATFORM PAGES */
      // CLient home page
      router.get("/home", homeController.getAppHomePage);
      router.get("/apphome", checkNotAuthenticated, homeController.getAppHomePage);
      router.post("/apphome", homeController.postAppHomePage);
      // Login page
      router.get("/login", checkAuthenticated, loginController.getLoginPage);
      router.post("/login", limiter(1,5,'Đăng nhập không thành công quá nhiều lần. Bạn sẽ không thể đăng nhập trong vòng 1 giờ nữa.'), loginController.postLoginPage);
      // Logout
      router.get("/logout", logoutController.getLogoutPage);
      // Register page
      router.get("/register", checkAuthenticated, registerController.getRegisterPage);
      router.post("/register", registerController.postRegisterPage);
      // Admin page
      router.get("/manager", managerController.getManagerPage);
      // Trading page
      router.get("/trade-admin", managerController.getTradePage);
      router.post("/trade-admin", managerController.postTradePage);
      // Phong than page
      router.get("/pt-admin", managerController.getPTPage);
      router.post("/pt-admin", managerController.postPTPage);
      // Download settup page
      router.get("/download-setup", managerController.getDownloadSetupPage);
      router.post("/download-setup", managerController.postDownloadSetupPage);
      // Change password page
      router.get("/change-password", changePasswordController.getChangePasswordPage);
      router.post("/change-password", changePasswordController.postChangePasswordPage);
      // New customer page
      router.get("/new-customers", newCustomerController.getNewCustomers);
      router.post("/new-customers", newCustomerController.postNewCustomers);
      // Find customer page
      router.get("/find-customers", findCustomerController.getFindCustomers);
      router.post("/find-customers", findCustomerController.postFindCustomers);


  // Request with json body
  router.post('/json', (req, res) => {
   // Check if request payload content-type matches json, because body-parser does not check for content types
   if (!req.is('json')) {
       return res.sendStatus(415); // -> Unsupported media type if request doesn't have JSON body
   }
   res.send('Hooray, it worked!');
  });

  // 404 error (always the last route)
  router.all('*', (req, res) => {
    res.status(404).render('404');
  });

  return app.use("/", router);
  //return app.use(contextPath, router);
}

// Check user logged in or not, then redirect
function checkAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return res.redirect('/apphome');
  }
  next();
}

function checkNotAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

// Limit number of request every hour
function limiter(hour,max,msg) {
  let createLimiter = rateLimit({
    windowMs: hour * 60 * 60 * 1000, // 1 hour window
    max: max, // start blocking after 5 requests
    message: msg,
  });
  return createLimiter;
}


module.exports = initWebRoutes;
