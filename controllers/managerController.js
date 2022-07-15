const fs = require('fs');
const { pool } = require('../config/dbConfig');
const { google } = require('googleapis');
const api = require('../controllers/apiController');

const auth = new google.auth.GoogleAuth({
  keyFile: './sample_query/sheetkey.json',
  scopes: 'https://www.googleapis.com/auth/spreadsheets'
});

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
  //console.log(user); custoken is added in frontend
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
          let custoken = '';
          pool.query(
            `SELECT custoken FROM user_token WHERE user_id=$1;`,[user.id],(err,results) => {
              if(err) console.log(err);
              else {
                if(results.rows.length!=0) {
                  custoken = results.rows[0].custoken;
                }
                return res.render('phongthanAdmin', {menu:menuData,user,canhbao,lichsucanhbao,custoken});
              }
            }
          )

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
                let custoken = '';
                pool.query(
                  `SELECT custoken FROM user_token WHERE user_id=$1;`,[user.id],(err,results) => {
                    if(err) console.log(err);
                    else {
                      if(results.rows.length!=0) {
                        custoken = results.rows[0].custoken;
                      }
                      return res.render('phongthanAdmin', {menu:menuData,user,canhbao,lichsucanhbao,custoken});
                    }
                  }
                )
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
      let vnindex = await getSheetData('vnindex','A:B');
      let prices = await getSheetData('Price','A:C');
      let dividend = await getSheetData('dividend','A:E');
      let data = {
        prices: prices,
        vnindex: vnindex,
        dividend: dividend
      }
      pool.query(
        `SELECT * FROM trade_orders ORDER BY id ASC;`, (err,results) => {
          if(err) console.log(err);
          else {
            data.trades = results.rows;
            let currentdate = new Date();
            let last6months = new Date(currentdate.setMonth(currentdate.getMonth()-6));
            let dformat6 = [last6months.getFullYear(),last6months.getMonth()+1,last6months.getDate()].join('-');
            pool.query(
              `SELECT upf.portfolio_date, upf.latest, upf.net_value FROM user_portfolio upf
              INNER JOIN portfolios pf
              ON upf.portfolio_id = pf.portfolio_id
              WHERE pf.user_id=0 AND upf.portfolio_date>$1
              ORDER BY upf.portfolio_date ASC;`,
              [dformat6],
              (err,results) => {
                if(err) console.log(err);
                else {
                  data.pfRecords = results.rows;
                  let custoken = '';
                  pool.query(
                    `SELECT custoken FROM user_token WHERE user_id=$1;`,[user.id],(err,results) => {
                      if(err) console.log(err);
                      else {
                        if(results.rows.length!=0) {
                          data.custoken = results.rows[0].custoken;
                        }

                        let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
                        //console.log(data.prices);
                        //return res.render('devtest', {menu:menuData,user,data.prices,data.vnindex,data.dividend,data.pfRecords,data.trades,custoken});
                        data.menu = menuData;
                        data.user = user;
                        return res.render('tradeAdmin', data);
                      }
                    }
                  )

                }
              });
          }
        })
      /*const auth = new google.auth.GoogleAuth({
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
                    let custoken = '';
                    pool.query(
                      `SELECT custoken FROM user_token WHERE user_id=$1;`,[user.id],(err,results) => {
                        if(err) console.log(err);
                        else {
                          if(results.rows.length!=0) {
                            custoken = results.rows[0].custoken;
                          }
                          let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
                          return res.render('tradeAdmin', {menu:menuData,user,trades:trades,fund_nav,navdata,prices,vnindex,custoken});
                        }
                      }
                    )

                  }
                }
              )

            }
          )
        }
      )*/
    } else {
      return res.redirect('/home');
    }
  } else {
    return res.redirect('/login');
  }
}

let postTradePage = async (req,res) => {
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
                          let custoken = '';
                          pool.query(
                            `SELECT custoken FROM user_token WHERE user_id=$1;`,[user.id],(err,results) => {
                              if(err) console.log(err);
                              else {
                                if(results.rows.length!=0) {
                                  custoken = results.rows[0].custoken;
                                }

                                let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
                                return res.render('tradeAdmin', {menu:menuData,user,trades:trades,fund_nav,navdata,prices,vnindex,custoken});
                              }
                            }
                          )

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

// API functions
let addCusToken = async (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      let idToken = req.body.idToken;
      let verifyResults = await api.verifyUser(idToken);
      let authCode = verifyResults.body.authCode;
      let authCodeResults = await api.getCusToken(authCode);
      let cusToken = authCodeResults.body.custoken;
      user.custoken = cusToken;
      //console.log(user);
      pool.query(
        `SELECT * FROM user_token WHERE user_id=$1;`, [user.id], (err,results) => {
          if(err) console.log(err);
          else {
            if(results.rows.length==0) {
              pool.query(
                `INSERT INTO user_token(user_id,custoken) VALUES ($1,$2);`,[user.id,cusToken],(err,results) => {
                  if(err) console.log(err);
                  else {
                    console.log('token recorded');
                    return res.json({id:user.id,token:cusToken});
                  }
                }
              )
            } else {
              pool.query(
                `UPDATE user_token SET custoken=$2 WHERE user_id=$1;`,[user.id,cusToken],(err,results) => {
                  if(err) console.log(err);
                  else {
                    console.log('token recorded');
                    return res.json({id:user.id,custoken:cusToken});
                  }
                }
              )
            }
          }
        }
      )
    }
  }
}

let pushTrans = async (req,res) => {
  let user=req.user;
  //console.log(user);
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      //console.log(req.body);
      let custoken = req.body.custoken;
      let fundNav = req.body.fundNav;
      let orderDirection = req.body.orderDirection;
      let orderType = req.body.orderType;
      let pct = req.body.pct;
      let price = req.body.price;
      let ticker = req.body.ticker;
      let vol = req.body.vol;
      let push = await api.pushTrans(custoken,fundNav,orderDirection,orderType,pct,price,ticker,vol);
      console.log('push trans result: ', push);
      return push;
    }
  }
}

let pushAdmMsg = async (req,res) => {
  let user=req.user;
  //console.log(user);
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      //console.log(req.body);
      let custoken = req.body.custoken;
      let cn=req.body.cn;
      let c1=req.body.c1;
      let c2=req.body.c2;
      let c3=req.body.c3;
      let c4=req.body.c4;
      let c5=req.body.c5;
      let speed=req.body.speed;
      let show=req.body.show;
      let msg=req.body.msg;
      let push = await api.pushAdmMsg(custoken,cn,c1,c2,c3,c4,c5,speed,show,msg);
      console.log('push msg result: ', push);
      return push;
    }
  }
}

async function getSheetData(sheetName,range) {
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
    range: sheetName + "!" + range
  });
  return getRows.data.values;
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
  addCusToken: addCusToken,
  pushTrans:pushTrans,
  pushAdmMsg:pushAdmMsg,
}
