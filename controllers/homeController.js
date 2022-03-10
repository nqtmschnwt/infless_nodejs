const { pool } = require('../config/dbConfig');
const fs = require('fs');

let getAppHomePage = (req,res) => {
  let user = req.user;
  if(!user) {
    return res.render('webhomepage');
  }
  console.log("User logged in",user.id);
  console.log("User info:", user);
  if(user.role_id==2 || user.role_id==3) {
    // Admin
    return res.redirect('/manager');
  } else {
    // Customer
    let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/userMenu.json'));
    // Get services settings:
    // Get warning
    pool.query(
      `SELECT warning_show, warning_msg FROM trade_warnings ORDER BY id DESC LIMIT 1;`, (err,results) => {
        if(err) {
          console.log('Error: ',err);
        }
        let cb = results.rows[0];
        let cbDisplay = 'none';
        var canhbao={display:cbDisplay,msg:''};
        if(cb!=undefined){
          if(cb.warning_show) cbDisplay = 'block';
          canhbao={display:cbDisplay,msg:cb.warning_msg};
        }
        pool.query(
          `SELECT * FROM trade_orders
          WHERE order_time > (current_date - INTERVAL '1 year') ORDER BY order_time ASC;`, (err,results) => {
            if(err) {
              console.log('Error: ',err);
            }
            let fund_nav = '1';
            if(results.rows.length>0) {
              fund_nav = results.rows[results.rows.length - 1].fund_nav;
            }
            let trades = results.rows;
            //console.log(cb);
            //console.log(canhbao);
            return res.render('appHomePage', {menu:menuData,user,trades:trades,fund_nav,canhbao});
          }
        )
      }
    );

  }

}

let postAppHomePage = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(req.body.client_nav_submit){
      let nav = parseFloat(req.body.clientnav.replace(/,/g, ''))/1000000000;
      let d = new Date().toISOString().substring(0,10);
      pool.query(
        `SELECT COUNT(*) FROM user_nav WHERE user_id=$1 AND nav_date=$2`,[parseInt(user.id),d],(err,results) => {
          if(err) {
            console.log('Error: ',err);
          }
          let count = parseInt(results.rows[0].count);
          if(count==0) {
            // Insert NAV
            pool.query(
              `INSERT INTO user_nav(user_id,nav_date,total_nav) VALUES($1,$2,$3);`,[parseInt(user.id),d,nav],(err,results) => {
                if(err) {
                  console.log('Error: ',err);
                }
              }
            )
          } else {
            // Update NAV
            pool.query(
              `UPDATE user_nav SET total_nav=$3 WHERE user_id=$1 AND nav_date=$2;`,[parseInt(user.id),d,nav],(err,results) => {
                if(err) {
                  console.log('Error: ',err);
                }
              }
            )
          }
          console.log(parseInt(user.id),d,count);
        }
      )
      return res.redirect('/apphome');
    }
  } else {
    return res.redirect('/login');
  }
}

let getWebHomePage = (req,res) => {
  return res.render('webhomepage');
}

let getWebDownloadPage = (req,res) => {
  var urls=[];
  pool.query(
    `SELECT url FROM external_links WHERE url_name=$1`,['download_full'], (err,results) => {
      if(err) {
        console.log('Error: ', err);
      }
      urls.push(results.rows[0].url);
      pool.query(
        `SELECT url FROM external_links WHERE url_name=$1`,['download_update'], (err,results) => {
          if(err) {
            console.log('Error: ', err);
          }
          urls.push(results.rows[0].url);
          return res.render('webDownload',{urls});
        }
      );
    }
  );

}

let getPrivatePolicyPage = (req,res) => {
  return res.render('webPrivatePolicy');
}

let getLienHePage = (req,res) => {
  return res.render('webLienhe');
}

let getTuyendungPage = (req,res) => {
  return res.render('webTuyendung');
}

let getDichVuHoTroPage = (req,res) => {
  return res.render('webDichVuHoTro');
}

let getDichVuHopTacPage = (req,res) => {
  return res.render('webDichVuHopTac');
}

let getGioiThieuPage = (req,res) => {
  return res.render('webGioiThieu');
}

let getTamNhinPage = (req,res) => {
  return res.render('webTamNhinSuMenh');
}

let getMucTieuPage = (req,res) => {
  return res.render('webPhuongChamMucTieu');
}


module.exports = {
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
}
