const express = require('express');
const amiController = require('../controllers/amiController');
const apiController = require('../controllers/apiController');
const setupController = require('../controllers/setupController');
const homeController = require('../controllers/homeController');
const loginController = require('../controllers/loginController');
const logoutController = require('../controllers/logoutController');
const registerController = require('../controllers/registerController');
const managerController = require('../controllers/managerController');
const changePasswordController = require('../controllers/changePasswordController');
const newCustomerController = require('../controllers/newCustomerController');
const findCustomerController = require('../controllers/findCustomerController');
const testController = require('../controllers/testController');
const pfController = require('../controllers/pfController');

const fxController = require('../controllers/fxController');

const app = express();
const rateLimit = require('express-rate-limit');
const contextPath = '/inflessweb';

let router = express.Router();

let initWebRoutes = (app) => {
    // Setup
    router.get("/setup", setupController.getSetup);

    /* MAIN UI PAGES*/
    router.get("/", homeController.getMainUIPage);

    /* SECURITIES WEB PAGES */
    router.get("/securities/", homeController.getWebHomePage);
    router.get("/securities/gioi-thieu", homeController.getGioiThieuPage);
    router.get("/securities/gioi-thieu/tam-nhin-su-menh/", homeController.getTamNhinPage);
    router.get("/securities/gioi-thieu/phuong-cham-muc-tieu/", homeController.getMucTieuPage);
    router.get("/securities/he-thong-ho-tro-giao-dich-infless/", homeController.getWebDownloadPage);
    router.get("/securities/dich-vu-ho-tro-dau-tu-chung-khoan/", homeController.getDichVuHoTroPage);
    router.get("/securities/dich-vu-hop-tac-dau-tu/", homeController.getDichVuHopTacPage);
    router.get("/securities/privacy-policy/", homeController.getPrivatePolicyPage);
    router.get("/securities/lien-he/", homeController.getLienHePage);
    router.get("/securities/tuyen-dung/", homeController.getTuyendungPage);
    router.get("/securities/demolanding2023/", homeController.getDemoLandingPage);
    router.get("/securities/thankyoupage/", homeController.getThankYouPage);

    router.get("/securities/shop/", homeController.getShopPage);
    router.post("/api/order/", homeController.postShopPage);

    /* PLATFORM PAGES */
    // CLient home page
    router.get("/securities/home", homeController.getAppHomePage);
    router.get("/securities/apphome", checkNotAuthenticated, homeController.getAppHomePage);
    router.post("/securities/apphome", homeController.postAppHomePage);
    // Login page
    router.get("/securities/login", checkAuthenticated, loginController.getLoginPage);
    router.get("/login", checkAuthenticated, loginController.getLoginPage);
    //router.post("/login", limiter(1,5,'Đăng nhập không thành công quá nhiều lần. Bạn sẽ không thể đăng nhập trong vòng 1 giờ nữa.'), loginController.postLoginPage);
    router.post("/securities/login", loginController.postLoginPage);
    router.post("/login", loginController.postLoginPage);
    // Login from external systems
    router.post("/securities/app/login", apiController.externalLogin);
    // Logout
    router.get("/securities/logout", logoutController.getLogoutPage);
    // Register page
    router.get("/securities/register", checkAuthenticated, registerController.getRegisterPage);
    router.post("/securities/register", registerController.postRegisterPage);
    // Admin page
    router.get("/securities/manager", managerController.getManagerPage);
    router.post("/securities/manager", managerController.postManagerPage);
    router.post("/securities/updatefundnav", managerController.updateFundNav);

    // Trading page
    router.get("/securities/trade-admin", managerController.getTradePage);
    router.post("/securities/trade-admin", managerController.postTradePage);
    // Scanlist page
    router.get("/securities/scan-list", managerController.getScanListPage);
    // Phong than page
    router.get("/securities/pt-admin", managerController.getPTPage);
    router.post("/securities/pt-admin", managerController.postPTPage);
    // Download settup page
    router.get("/securities/download-setup", managerController.getDownloadSetupPage);
    router.post("/securities/download-setup", managerController.postDownloadSetupPage);
    // Shop management page
    router.get("/securities/shop-management", managerController.getShopManagementPage);
    router.post("/securities/shop-management", managerController.postShopManagementPage);
    //router.post("/securities/shop-management", managerController.postShopManagementPage);
    // Change password page
    router.get("/securities/change-password", changePasswordController.getChangePasswordPage);
    router.post("/securities/change-password", changePasswordController.postChangePasswordPage);
    // New customer page
    router.get("/securities/new-customers", newCustomerController.getNewCustomers);
    router.post("/securities/new-customers", newCustomerController.postNewCustomers);
    // Find customer page
    router.get("/securities/find-customers", findCustomerController.getFindCustomers);
    router.post("/securities/find-customers", findCustomerController.postFindCustomers);
    // Dev test page
    router.get("/securities/devtest", testController.getTestPage);
    router.post("/securities/devtest", testController.postTestPage);
    // Portfolio control
    router.get("/securities/pf-control", pfController.getPfPage);
    router.post("/securities/pf-control", pfController.postPfPage);
    router.get("/securities/portfolio-:id", pfController.getPfInfo);
    router.get("/securities/pf-update", pfController.getPfUpdate);
    router.post("/securities/pf-update", pfController.postPfUpdate);

    // Ami
    router.get("/ami", amiController.getVol21);
    router.post("/ami", amiController.postVol21);


    /* FX PAGES */
    router.get("/fx", fxController.getFxMain);
    router.get("/econ-au", fxController.getAUEcon);
    router.get("/econ-us", fxController.getUSEcon);
    router.get("/econ-jp", fxController.getJPEcon);
    router.get("/econ-eu", fxController.getEUEcon);
    router.post("/fx/indicator", fxController.getIndicator);
    router.post("/fx/indiupdate", fxController.updateIndicator);
    router.post("/fxtrades", fxController.fxTradesInquiry);

    /* MT4 */
    router.post("/mt4/", fxController.postFxMt4);

    // API urls
    router.post("/securities/addcustoken", managerController.addCusToken);
    router.post("/securities/pushadmmsg", managerController.pushAdmMsg);
    router.post("/securities/pushtrans", managerController.pushTrans);
    router.post("/securities/createuser", managerController.createUser);
    router.post("/securities/updateuser", managerController.updateUser);

    /* FX API */
    router.get("/fx/api/v1", fxController.apiGetIndicator);
    router.post("/fx/api/v1", fxController.apiGetIndicator);


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
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/securities/apphome');
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/securities/login');
}

// Limit number of request every hour
function limiter(hour, max, msg) {
    let createLimiter = rateLimit({
        windowMs: hour * 60 * 60 * 1000, // 1 hour window
        max: max, // start blocking after 5 requests
        message: msg,
    });
    return createLimiter;
}


module.exports = initWebRoutes;
