const fs = require('fs');
const { pool } = require('../config/dbConfig');
const { google } = require('googleapis');

let getManagerPage = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
      return res.render('manager', {menu:menuData,user});
    } else {
      return res.render('404');
    }
  } else {
    return res.redirect('/login');
  }

}

let postManagerPage = (req,res) => {
  let cmd = req.body.cmd;
  if(cmd=='create-fundpf') {
    pool.query(
      `SELECT COUNT(*) FROM portfolios WHERE user_id=0;`, (err,results) => {
        if(err)
          console.log('Error: ', err);
        else {
          let count = results.rows[0].count;
          if(count==0){
            // CREATE fund portfolio
            pool.query(
              `INSERT INTO portfolios(user_id,acc,company) VALUES ($1,$2,$3);`,
              [0,0,''], (err,results) => {
                if(err) {
                  return res.send({
                        status: 200,
                        message: 'Error creating portfolio.',
                      });
                } else {
                  return res.send({
                        status: 200,
                        message: 'Portfolio created successfully.',
                      });
                }
              }
            )
          } else {
            return res.send({
                  status: 200,
                  message: 'Fund portfolio already created.',
                });
          }

        }
      }
    )
  }

}

let getDownloadSetupPage = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      r = {result:'',msg:''};
      let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
      return res.render('downloadSetup', {menu:menuData,user,data:{},result:r});
    } else {
      return res.render('404');
    }
  } else {
    return res.redirect('/login');
  }
}

let postDownloadSetupPage = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      var errors = 0;
      for(var i in req.body){
        if(i != 'update') {
          pool.query(
            `INSERT INTO external_links (url, url_name)
            VALUES($1,$2)
            ON CONFLICT (url_name)
            DO
               UPDATE SET url=$1;`,
            [req.body[i],i],
            (err, results) => {
              if(err) {
                console.log('Error: ', err);
                errors += 1;
              }
            }
          )
        }
      }
      var r = {result:'',msg:''};
      if(errors==0){
        r = {result:'success',msg:'Cập nhật thành công'};
      } else {
        console.log(errors);
        r = {result:'fail',msg:'Có lỗi xảy ra'};
      }
      let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
      return res.render('downloadSetup', {menu:menuData,user,data:{},result:r});
    } else {
      return res.redirect('/home');
    }
  } else {
    return res.redirect('/login');
  }
}

let getPTPage = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
      pool.query(
        `SELECT warning_time,warning_show,warning_msg FROM trade_warnings ORDER BY id DESC;`, (err,results) => {
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

          let lichsucanhbao = results.rows;
          return res.render('phongthanAdmin', {menu:menuData,user,canhbao,lichsucanhbao});
        }
      );
    } else {
      return res.redirect('/home');
    }
  } else {
    return res.redirect('/login');
  }
}

let postPTPage = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      let body = req.body;
      //console.log(body);
      if(body.canhbaoSubmitOn!=undefined) {
        //console.log('canhbaoON');
        let d = new Date();
        let dformat = [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-')+' '+[d.getHours(),d.getMinutes(),d.getSeconds()].join(':');
        pool.query(
          `INSERT INTO trade_warnings(warning_time,warning_msg,warning_show,col_num,col_1,col_2,col_3,col_4,col_5,speed)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [dformat,body.canhbaoMsg,'true',parseInt(body.canhbaoColorNumber),body.canhbaoCol1,body.canhbaoCol2,body.canhbaoCol3,body.canhbaoCol4,body.canhbaoCol5,parseInt(body.canhbaoSpeed)],
          (err,results) => {
            if(err) {
              console.log('Error: ',err);
            }
            let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
            pool.query(
              `SELECT warning_time,warning_show,warning_msg FROM trade_warnings ORDER BY id DESC;`, (err,results) => {
                if(err) {
                  console.log('Error: ',err);
                }
                let cb = results.rows[0];
                let cbDisplay = 'none';
                if(cb.warning_show) cbDisplay = 'block';
                let canhbao={display:cbDisplay,msg:cb.warning_msg};
                let lichsucanhbao = results.rows;
                return res.render('phongthanAdmin', {menu:menuData,user,canhbao,lichsucanhbao});
              }
            );
          }
        );
      }

      if(body.canhbaoSubmitOff!=undefined) {
        pool.query(
          `UPDATE trade_warnings SET warning_show=$1`,['false'], (err,results) => {
            if(err) {
              console.log('Error: ',err);
            }
            let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
            pool.query(
              `SELECT warning_time,warning_show,warning_msg FROM trade_warnings ORDER BY id DESC;`, (err,results) => {
                if(err) {
                  console.log('Error: ',err);
                }
                let cb = results.rows[0];
                let cbDisplay = 'none';
                if(cb.warning_show) cbDisplay = 'block';
                let canhbao={display:cbDisplay,msg:cb.warning_msg};
                let lichsucanhbao = results.rows;
                return res.render('phongthanAdmin', {menu:menuData,user,canhbao,lichsucanhbao});
              }
            );
          }
        );
      }


    } else {
      return res.redirect('/home');
    }
  } else {
    return res.redirect('/login');
  }
}

let getTradePage = async (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      const auth = new google.auth.GoogleAuth({
        keyFile: './sample_query/sheetkey.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
      });
      // Create client instance for auth
      const client = await auth.getClient();
      // Instance of GG sheets api
      const googleSheets = google.sheets({version:"v4",auth:client});

      const spreadsheetId = '1BSXJVLWeoEZe0c1UnP58tAHXUbbWrobLLq0oTWv3xKg';

      // Get metadata about spreadsheets
      const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId
      })

      // Read rows from spreadsheet
      const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'Price!A:C'
      })

      // Read rows from spreadsheet
      const getVnindex = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'vnindex!A:B'
      })

      let prices = getRows.data.values;
      let vnindex = getVnindex.data.values;

      pool.query(
        `SELECT fund_nav FROM trade_orders ORDER BY id ASC LIMIT 1;`, (err,results) => {
          if(err) {
            console.log('Error: ',err);
          }
          var initCap = 10;
          var fund_nav = ''+initCap;
          if(results.rows.length>0) {
            fund_nav = results.rows[0].fund_nav;
          }
          pool.query(
            `SELECT * FROM trade_orders ORDER BY id ASC;`, (err,results)=> {
              if(err) {
                console.log('Error: ',err);
              }
              let trades = results.rows;
              // get portfolio records
              let currentdate = new Date();
              let last6months = new Date(currentdate.setMonth(currentdate.getMonth()-6));
              let dformat6 = [last6months.getFullYear(),last6months.getMonth()+1,last6months.getDate()].join('-');
              pool.query(
                `SELECT upf.portfolio_date, upf.latest, upf.portfolio_value, upf.net_value, upf.cash_value, upf.debt_value FROM user_portfolio upf
                INNER JOIN portfolios pf
                ON upf.portfolio_id = pf.portfolio_id
                WHERE pf.user_id=0 AND upf.portfolio_date>$1
                ORDER BY upf.portfolio_date ASC;`,
                [dformat6],
                (err,results) => {
                  if(err) {
                    console.log(err);
                  } else {
                    let navdata = results.rows;
                    let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
                    return res.render('tradeAdmin', {menu:menuData,user,trades:trades,fund_nav,navdata,prices,vnindex});
                  }
                }
              )

            }
          )
        }
      )
    } else {
      return res.redirect('/home');
    }
  } else {
    return res.redirect('/login');
  }
}

let postTradePage = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      body = req.body;
      if(body.orderSend){
        console.log(body);
        let d = new Date();
        let dformat = [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-')+' '+[d.getHours(),d.getMinutes(),d.getSeconds()].join(':');

        let ticker = body.ticker.replace(/\s/g,'');
        pool.query(
          `INSERT INTO trade_orders(order_time, order_direction, order_type, ticker, vol, price, pct, fund_nav)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
          [dformat,body.order_direction,body.order_type,body.ticker.toUpperCase(),parseFloat(body.vol.replace(/,/g, ''))/1000000,parseFloat(body.price.replace(/,/g, '')),parseFloat(body.pct),parseFloat(body.fund_nav.replace(/,/g, ''))/1000000000],
          (err,results) => {
            if(err) {
              console.log('Error: ',err);
            }
            pool.query(
              `SELECT fund_nav FROM trade_orders ORDER BY id ASC LIMIT 1;`, (err,results) => {
                if(err) {
                  console.log('Error: ',err);
                }
                var fund_nav = '1';
                if(results.rows.length>0) {
                  fund_nav = results.rows[0].fund_nav;
                }
                pool.query(
                  `SELECT * FROM trade_orders ORDER BY order_time ASC;`, (err,results)=> {
                    if(err) {
                      console.log('Error: ',err);
                    }
                    let trades = results.rows;

                    // get portfolio records
                    let currentdate = new Date();
                    let last6months = new Date(currentdate.setMonth(currentdate.getMonth()-6));
                    let dformat6 = [last6months.getFullYear(),last6months.getMonth()+1,last6months.getDate()].join('-');
                    pool.query(
                      `SELECT upf.portfolio_date, upf.latest, upf.portfolio_value, upf.net_value, upf.cash_value, upf.debt_value FROM user_portfolio upf
                      INNER JOIN portfolios pf
                      ON upf.portfolio_id = pf.portfolio_id
                      WHERE pf.user_id=0 AND upf.portfolio_date>$1
                      ORDER BY upf.portfolio_date ASC;`,
                      [dformat6],
                      (err,results) => {
                        if(err) {
                          console.log(err);
                        } else {
                          let navdata = results.rows;
                          let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
                          return res.render('tradeAdmin', {menu:menuData,user,trades:trades,fund_nav,navdata});
                        }
                      }
                    )

                  }
                )
              }
            )
          }
        )
      }
      else {
        let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
        return res.render('tradeAdmin', {menu:menuData,user});
      }

    } else {
      return res.redirect('/home');
    }
  } else {
    return res.redirect('/login');
  }
}

let getScanListPage = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      pool.query(
        `SELECT sltp FROM user_personal_sltp;`, (err,results) => {
          if(err) {
            console.log('Error: ',err);
          } else {
            let scanlist = results.rows;
            let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
            return res.render('scanlist',{menu:menuData,user,scanlist});
          }
        }
      )
    } else {
      return res.redirect('/home');
    }
  } else {
    return res.redirect('/login');
  }
}

module.exports = {
  getManagerPage:getManagerPage,
  postManagerPage:postManagerPage,
  getDownloadSetupPage:getDownloadSetupPage,
  postDownloadSetupPage:postDownloadSetupPage,
  getPTPage: getPTPage,
  postPTPage: postPTPage,
  getTradePage: getTradePage,
  postTradePage: postTradePage,
  getScanListPage: getScanListPage,
}
