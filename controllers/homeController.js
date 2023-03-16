const { pool } = require('../config/dbConfig');
const fs = require('fs');
const phoneNumber = require( 'awesome-phonenumber' );

let getAppHomePage = (req, res) => {
    let user = req.user;
    if (!user) {
        return res.render('webhomepage');
    }
    console.log("User logged in", user.id);
    console.log("User info:", user);
    /*if(user.role_id==2 || user.role_id==3) {
      // Admin
      return res.redirect('/manager');
    } else {
      */
    // Customer
    let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/userMenu.json'));
    // Get services settings:
    // Get warning
    pool.query(
        `SELECT warning_show, warning_msg FROM trade_warnings ORDER BY id DESC LIMIT 1;`, (err, results) => {
            if (err) {
                console.log('Error: ', err);
            }
            let cb = results.rows[0];
            let cbDisplay = 'none';
            var canhbao = { display: cbDisplay, msg: '' };
            if (cb != undefined) {
                if (cb.warning_show) cbDisplay = 'block';
                canhbao = { display: cbDisplay, msg: cb.warning_msg };
            }
            pool.query(
                `SELECT * FROM trade_orders
          WHERE order_time > (current_date - INTERVAL '1 year') ORDER BY order_time ASC;`, (err, results) => {
                    if (err) {
                        console.log('Error: ', err);
                    }
                    let fund_nav = '1';
                    if (results.rows.length > 0) {
                        fund_nav = results.rows[results.rows.length - 1].fund_nav;
                    }
                    let trades = results.rows;
                    pool.query(
                        `SELECT last_change,sltp,history FROM user_personal_sltp WHERE user_id=$1;`, [user.id], (err, results) => {
                            if (err) {
                                console.log('Error: ', err);
                            } else {
                                let personalsltp = {
                                    last_change: "",
                                    sltp: "[]",
                                    history: "[]"
                                }
                                if (results.rows.length > 0) personalsltp = results.rows[0];
                                console.log('personal: ', personalsltp);
                                return res.render('appHomePage', { menu: menuData, user, trades: trades, fund_nav, canhbao, personalsltp });
                            }

                        }
                    )

                }
            )
        }
    );

    /*}*/

}

let postAppHomePage = (req, res) => {
    let user = req.user;
    //console.log(req.headers);
    console.log(req.body);
    if (user != undefined) {
        if (req.body.client_nav_submit) {
            let nav = parseFloat(req.body.clientnav.replace(/,/g, '')) / 1000000000;
            console.log("new nav: ", nav);
            let d = new Date().toISOString().substring(0, 10);
            pool.query(
                `SELECT COUNT(*) FROM user_nav WHERE user_id=$1 AND nav_date=$2`, [parseInt(user.id), d], (err, results) => {
                    if (err) {
                        console.log('Error: ', err);
                    }
                    let count = parseInt(results.rows[0].count);
                    if (count == 0) {
                        // Insert NAV
                        pool.query(
                            `INSERT INTO user_nav(user_id,nav_date,total_nav) VALUES($1,$2,$3);`, [parseInt(user.id), d, nav], (err, results) => {
                                if (err) {
                                    console.log('Error: ', err);
                                }
                            }
                        )
                    } else {
                        // Update NAV
                        pool.query(
                            `UPDATE user_nav SET total_nav=$3 WHERE user_id=$1 AND nav_date=$2;`, [parseInt(user.id), d, nav], (err, results) => {
                                if (err) {
                                    console.log('Error: ', err);
                                }
                            }
                        )
                    }
                    console.log(parseInt(user.id), d, count);
                }
            )
            return res.redirect('/securities/apphome');
        }
        if (req.body.personalAdd) {
            try {
                //console.log(req.body);
                let uid = parseInt(req.body.uid);
                let input = {
                    ticker: req.body.personalTicker.toUpperCase(),
                    sl: parseFloat(req.body.personalSL),
                    tp: parseFloat(req.body.personalTP)
                };
                pool.query(
                    `SELECT last_change,sltp FROM user_personal_sltp WHERE user_id=$1 ORDER BY user_id DESC LIMIT 1;`, [uid], (err, results) => {
                        if (err) {
                            console.log('Error: ', err);
                        } else {
                            var d = new Date();
                            if (results.rows.length == 0) {
                                console.log('No data, start adding');
                                // Finish fetching, start adding
                                let portfolio = [];
                                portfolio.push(input);
                                pool.query(
                                    `INSERT INTO user_personal_sltp(user_id,last_change,sltp) VALUES ($1,$2,$3);`, [uid, d, JSON.stringify(portfolio)], (err, results) => {
                                        if (err) {
                                            console.log('Error: ', err);
                                        } else {
                                            return res.redirect('/securities/apphome');
                                        }
                                    }
                                )

                            } else {
                                let currentSLTP = JSON.parse(results.rows[0].sltp);
                                console.log('Has data: ', currentSLTP);

                                // Finish fetching, start adding
                                let updatedTickers = 0;
                                for (var i = 0; i < currentSLTP.length; i++) {
                                    if (currentSLTP[i].ticker == input.ticker) {
                                        currentSLTP[i].sl = input.sl;
                                        currentSLTP[i].tp = input.tp;
                                        updatedTickers++;
                                    }
                                }
                                if (updatedTickers == 0)
                                    currentSLTP.push(input);

                                pool.query(
                                    `UPDATE user_personal_sltp SET last_change=$2,sltp=$3 WHERE user_id=$1;`, [uid, d, JSON.stringify(currentSLTP)], (err, results) => {
                                        if (err) {
                                            console.log('Error: ', err);
                                        } else {
                                            return res.redirect('/securities/apphome');
                                        }
                                    }
                                )

                            }
                        }
                    }
                )
            } catch (err) {
                console.log(err);
            }

        }
        if (req.body.personalChange) {
            try {
                let uid = parseInt(req.body.uid);
                let input = {
                    ticker: req.body.personalTicker.toUpperCase(),
                    sl: parseFloat(req.body.personalSL),
                    tp: parseFloat(req.body.personalTP)
                };
                pool.query(
                    `SELECT last_change,sltp FROM user_personal_sltp WHERE user_id=$1 ORDER BY user_id DESC LIMIT 1;`, [uid], (err, results) => {
                        if (err) {
                            console.log('Error: ', err);
                        } else {
                            var d = new Date();
                            if (results.rows.length > 0) {
                                let currentSLTP = JSON.parse(results.rows[0].sltp);
                                console.log('Has data: ', currentSLTP);

                                // Finish fetching, start adding
                                let updatedTickers = 0;
                                for (var i = 0; i < currentSLTP.length; i++) {
                                    if (currentSLTP[i].ticker == input.ticker) {
                                        currentSLTP[i].sl = input.sl;
                                        currentSLTP[i].tp = input.tp;
                                        updatedTickers++;
                                    }
                                }
                                if (updatedTickers > 0) {
                                    pool.query(
                                        `UPDATE user_personal_sltp SET last_change=$2,sltp=$3 WHERE user_id=$1;`, [uid, d, JSON.stringify(currentSLTP)], (err, results) => {
                                            if (err) {
                                                console.log('Error: ', err);
                                            } else {
                                                return res.redirect('/securities/apphome');
                                            }
                                        }
                                    )
                                } else {
                                    return res.redirect('/securities/apphome');
                                }
                            }
                        }
                    }
                )

            } catch (err) {
                console.log(err);
            }
        }
        if (req.body.personalDel) {
            try {
                let uid = parseInt(req.body.uid);
                let ticker = req.body.personalTicker.toUpperCase();
                pool.query(
                    `SELECT last_change,sltp FROM user_personal_sltp WHERE user_id=$1 ORDER BY user_id DESC LIMIT 1;`, [uid], (err, results) => {
                        if (err) {
                            console.log('Error: ', err);
                        } else {
                            var d = new Date();
                            if (results.rows.length > 0) {
                                let currentSLTP = JSON.parse(results.rows[0].sltp);
                                console.log('Has data: ', currentSLTP);

                                // Finish fetching, start deleting
                                for (var i = 0; i < currentSLTP.length; i++) {
                                    if (currentSLTP[i].ticker == ticker) {
                                        currentSLTP.splice(i, 1);
                                        break;
                                    }
                                }

                                pool.query(
                                    `UPDATE user_personal_sltp SET last_change=$2,sltp=$3 WHERE user_id=$1;`, [uid, d, JSON.stringify(currentSLTP)], (err, results) => {
                                        if (err) {
                                            console.log('Error: ', err);
                                        } else {
                                            return res.redirect('/securities/apphome');
                                        }
                                    }
                                )

                            }
                        }
                    }
                )

            } catch (err) {
                console.log(err);
            }
        }

        if (req.headers.reqcontent == "pSLTP") {
            console.log('Update personal SLTP');
            let uid = req.body.i;
            let ticker = req.body.ticker.toUpperCase();
            let type = req.body.type;
            let price = req.body.price;
            let date = req.body.date;
            pool.query(
                `SELECT last_change,sltp,history FROM user_personal_sltp WHERE user_id=$1 ORDER BY user_id DESC LIMIT 1;`, [uid], (err, results) => {
                    if (err) {
                        console.log('Error: ', err);
                    } else {
                        if (results.rows.length > 0) {
                            let currentSLTP = JSON.parse(results.rows[0].sltp);
                            let currentH = JSON.parse(results.rows[0].history);

                            if (currentSLTP == null) currentSLTP = [];
                            if (currentH == null) currentH = [];

                            if (currentSLTP.length > 0) {
                                for (var i = 0; i < currentSLTP.length; i++) {
                                    if (currentSLTP[i].ticker == ticker) {
                                        currentSLTP.splice(i, 1);
                                        break;
                                    }
                                }
                                if (currentH.length > 0) {
                                    let hCount = 0;
                                    for (var i = 0; i < currentH.length; i++) {
                                        if (currentH[i].ticker == ticker && currentH[i].date == date) {
                                            hCount++;
                                            break;
                                        }
                                    }
                                    if (hCount == 0) {
                                        currentH.push({
                                            ticker: ticker,
                                            type: type,
                                            price: price,
                                            date: date
                                        });
                                    }
                                } else {
                                    currentH.push({
                                        ticker: ticker,
                                        type: type,
                                        price: price,
                                        date: date
                                    });
                                }
                            }
                            console.log(uid, currentSLTP, currentH);
                            pool.query(
                                `UPDATE user_personal_sltp SET sltp=$2,history=$3 WHERE user_id=$1`, [uid, JSON.stringify(currentSLTP), JSON.stringify(currentH)],
                                (err, results) => {
                                    if (err) {
                                        console.log('Error: ', err);
                                    } else {
                                        console.log("Update personal SLTP done");
                                    }
                                }
                            )
                        } else {
                            console.log('No data for this user');
                        }
                    }
                }
            )
        }

    } else {
        return res.redirect('/login');
    }
}

let getWebHomePage = (req, res) => {
    return res.render('webhomepage');
}

let getWebDownloadPage = (req, res) => {
    var urls = [];
    pool.query(
        `SELECT url FROM external_links WHERE url_name=$1`, ['download_full'], (err, results) => {
            if (err) {
                console.log('Error: ', err);
            }
            urls.push(results.rows[0].url);
            pool.query(
                `SELECT url FROM external_links WHERE url_name=$1`, ['download_update'], (err, results) => {
                    if (err) {
                        console.log('Error: ', err);
                    }
                    urls.push(results.rows[0].url);
                    return res.render('webDownload', { urls });
                }
            );
        }
    );
}

let getLanding2023 = (req, res) => {
    return res.render('systemldp');
}

let getThankYouPage = (req, res) => {
    return res.render('thankyou');
}


let getPrivatePolicyPage = (req, res) => {
    return res.render('webPrivatePolicy');
}

let getLienHePage = (req, res) => {
    return res.render('webLienhe');
}

let getTuyendungPage = (req, res) => {
    return res.render('webTuyendung');
}

let getDichVuHoTroPage = (req, res) => {
    return res.render('webDichVuHoTro');
}

let getDichVuHopTacPage = (req, res) => {
    return res.render('webDichVuHopTac');
}

let getGioiThieuPage = (req, res) => {
    return res.render('webGioiThieu');
}

let getTamNhinPage = (req, res) => {
    return res.render('webTamNhinSuMenh');
}

let getMucTieuPage = (req, res) => {
    return res.render('webPhuongChamMucTieu');
}

let getMainUIPage = (req, res) => {
    return res.render('mainUI');
}

let getShopPage = (req, res) => {
    return res.render('shop/shopSingle');
}

let postShopPage = (req, res) => {
    const data = req.body;
    const user = req.user;
    //console.log(user);
    //console.log(JSON.stringify(data, null, 2));

    let orderData = {
            userID: "",
            userName: "",
            userPhone: "",
            userEmail: "",
            billID: "",
            billValue: "",
            orderDetails: ""
        }
        // Save the order to the database
        // ...
    if (user != undefined) {
        orderData.userID = user.id;
        orderData.userName = user.name;
        orderData.userPhone = user.phone;
        orderData.userEmail = user.email;
        orderData.billID = data.orderBill.billCode;
        orderData.billValue = data.orderBill.billValue / (10 ** 9);
        orderData.orderDetails = JSON.stringify(data.orderArr);

        let date = new Date();
        let dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
            .toISOString()
            .split("T")[0];

        pool.query(
            `INSERT INTO orders(user_id, bill_id, bill_value, order_details,_date) VALUES ($1,$2,$3,$4,$5)`, [orderData.userID, orderData.billID, orderData.billValue, orderData.orderDetails, dateString],
            (err, results) => {
                if (err) {
                    res.send({ error: 1, message: 'Unknown error' });
                } else {
                    console.log(orderData);
                    // Send a response back to the client
                    res.send({ error: 0, message: 'success' });
                }
            }
        )

    } else {
        // Send a response back to the client
        res.send({ error: 1, message: 'User not logged in' });
    }
}

let getShopCategoryPage = (req, res) => {
    return res.render('shop/shopCategory');
}

let getLandingPage = (req, res) => {
  pool.query(
    `SELECT * FROM ldp_settings WHERE name='endTime';`,
    (err,results) => {
      if(err) console.log(err);
      else {
        if(results.rows.length > 0) {
          return res.render('ldp/ldp',{endTime: results.rows[0].content});
        } else return res.render('ldp/ldp',{endTime: '1678671390868'});
      }
    }
  )

}

let postLdpForm = (req,res) => {
  let data=req.body;
  console.log(data);
  let d = new Date().toISOString().substring(0, 10);
  // Check phone valid
  var pn = new phoneNumber(data.phone,'VN');
  if(!pn.isValid( ) || !pn.isMobile( ) || !pn.canBeInternationallyDialled( )){
    return res.json({error:1,message:"Số điện thoại không hợp lệ"});
  }
  let phoneFormatted = pn.getNumber( 'e164' );
  pool.query(
    `INSERT INTO ldp_data(_date, name, email, phone, address, status) VALUES ($1,$2,$3,$4,$5,$6);`,
    [d,data.name,data.email,phoneFormatted,data.address,'pending'],
    (err,results) => {
      if(err) {
        console.log(err);
        return res.json({error:1,message:err});
      } else {
        return res.json({error:0,message:'success'});
      }
    }
  )
}

module.exports = {
    // Securities pages
    getAppHomePage: getAppHomePage,
    getWebHomePage: getWebHomePage,
    getWebDownloadPage: getWebDownloadPage,
    getPrivatePolicyPage: getPrivatePolicyPage,
    postAppHomePage: postAppHomePage,
    getLienHePage: getLienHePage,
    getTuyendungPage: getTuyendungPage,
    getDichVuHoTroPage: getDichVuHoTroPage,
    getDichVuHopTacPage: getDichVuHopTacPage,
    getGioiThieuPage: getGioiThieuPage,
    getTamNhinPage: getTamNhinPage,
    getMucTieuPage: getMucTieuPage,
    getDemoLandingPage: getLanding2023,
    getThankYouPage: getThankYouPage,
    getShopPage: getShopPage,
    getShopCategoryPage: getShopCategoryPage,
    getLandingPage: getLandingPage,
    postLdpForm: postLdpForm,

    postShopPage: postShopPage,
    // Main UI pages
    getMainUIPage: getMainUIPage,
}
