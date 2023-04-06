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
    if(user.role_id>1)
    {
      let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
      return res.render('manager', {menu:menuData,user});
    } else {
      return res.render('404');
    }
  } else {
    return res.redirect('/securities/login');
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
    if(user.role_id>1)
    {
      r = {result:'',msg:''};
      let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
      return res.render('downloadSetup', {menu:menuData,user,data:{},result:r});
    } else {
      return res.render('404');
    }
  } else {
    return res.redirect('/securities/login');
  }
}

let postDownloadSetupPage = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id>1)
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
      return res.redirect('/securities/home');
    }
  } else {
    return res.redirect('/securities/login');
  }
}

let getPTPage = (req,res) => {
  let user=req.user;
  //console.log(user); custoken is added in frontend
  if(user!=undefined){
    if(user.role_id>1)
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
      return res.redirect('/securities/home');
    }
  } else {
    return res.redirect('/securities/login');
  }
}

let postPTPage = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id>1)
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
                        console.log(custoken);
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
                let custoken = '';
                pool.query(
                  `SELECT custoken FROM user_token WHERE user_id=$1;`,[user.id],(err,results) => {
                    if(err) console.log(err);
                    else {
                      if(results.rows.length!=0) {
                        custoken = results.rows[0].custoken;
                        console.log(custoken);
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


    } else {
      return res.redirect('/securities/home');
    }
  } else {
    return res.redirect('/securities/login');
  }
}

let getTradePage = async (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id>1)
    {
      let vnindex = await getSheetData('vnindex','A:B');
      let prices = await getSheetData('Price','A:C');
      let dividend = await getSheetData('dividend','A:E');
      let data = {
        prices: prices,
        vnindex: vnindex,
        dividend: dividend
      }
      //console.log(data);
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
    } else {
      return res.redirect('/securities/home');
    }
  } else {
    return res.redirect('/securities/login');
  }
}

let postTradePage = async (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id>1)
    {
      let vnindex = await getSheetData('vnindex','A:B');
      let prices = await getSheetData('Price','A:C');
      let dividend = await getSheetData('dividend','A:E');

      let data = {
        prices: prices,
        vnindex: vnindex,
        dividend: dividend
      }

      body = req.body;
      if(body.orderSend){
        console.log(body);
        let d = new Date();
        let dformat = [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-')+' '+[d.getHours(),d.getMinutes(),d.getSeconds()].join(':');

        let ticker = body.ticker.replace(/\s/g,'');
        pool.query(
          `INSERT INTO trade_orders(order_time, order_direction, order_type, ticker, vol, price, pct, fund_nav)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
          [dformat,body.order_direction,body.order_type,body.ticker.toUpperCase().replace(/\s/g,''),parseFloat(body.vol.replace(/,/g, ''))/1000000,parseFloat(body.price.replace(/,/g, '')),parseFloat(body.pct),parseFloat(body.fund_nav.replace(/,/g, ''))/1000000000],
          (err,results) => {
            if(err) {
              console.log('Error: ',err);
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
          }
        )
      }
      else {
        let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
        return res.render('tradeAdmin', {menu:menuData,user});
      }

    } else {
      return res.redirect('/securities/home');
    }
  } else {
    return res.redirect('/securities/login');
  }
}

let getScanListPage = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id>1)
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
      return res.redirect('/securities/home');
    }
  } else {
    return res.redirect('/securities/login');
  }
}

let updateFundNav = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id>1)
    {
      // get portfolio id
      pool.query(
        `SELECT portfolio_id FROM portfolios WHERE user_id=0`, (err, results) => {
          if(err) console.log(err);
          else {
            if(results.rows.length > 0) {
              let pfid = results.rows[0].portfolio_id;
              // check portfolio record today
              pool.query(
                `SELECT * FROM user_portfolio WHERE portfolio_id=$1 AND portfolio_date=$2;`, [pfid,req.body.date], (err, results) => {
                  if(results.rows.length == 0) {
                    // Insert nav value today
                    pool.query(
                      `INSERT INTO user_portfolio(portfolio_date,net_value,portfolio_id) VALUES ($1,$2,$3);`,[req.body.date,req.body.netValue,pfid], (err, results) => {
                        if(err) console.log(err);
                        else return res.json({err:0,errdesc:'fund nav value updated'});
                      }
                    )
                  } else {
                    // update nav value today
                    pool.query(
                      `UPDATE user_portfolio SET net_value=$2 WHERE portfolio_date=$1 AND portfolio_id=$3;`,[req.body.date,req.body.netValue,pfid], (err, results) => {
                        if(err) console.log(err);
                        else return res.json({err:0,errdesc:'fund nav value updated'});
                      }
                    )
                  }
                }
              )
            } else return res.json({err:2,errdesc:'portfolio does not exist'});
          }
        }
      )

    } else {
      return res.json({err:1,errdesc:'access denied'});
    }
  } else {
    return res.json({err:1,errdesc:'access denied'});
  }
}

// API functions
let addCusToken = async (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id>1)
    {
      try {
        let idToken = req.body.idToken;
        console.log('idToken: ' + idToken);
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
      } catch(err) {
        console.log(err);
      }
    }
  }
}

let getShopManagementPage = (req,res) => {
  let user=req.user;
  if(user!=undefined) {
    if(user.role_id>1) {
      pool.query(
        `SELECT * FROM orders ORDER BY id ASC;`,
        (err,results) => {
          if(err) {
            console.log('Error: ',err);
          } else {
            let orderlist = results.rows;
            let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
            return res.render('orderlist',{menu:menuData,user,orderlist});
          }
        }
      )
    }
  }
}

let getOrdersData = (req,res) => {
  let user=req.user;
  if(user!=undefined) {
    if(user.role_id>1) {
      pool.query(
        `SELECT * FROM orders ORDER BY id DESC;`,
        (err,results) => {
          if(err) {
            console.log('Error: ',err);
          } else {
            return res.json({cmd:'getordersdata',error:0,message:'success',data:results.rows});
          }
        }
      )
    } else return res.json({error:1,message:'User has no permisson.'});
  } else return res.json({error:1,message:'User has no permisson.'});
}

let postShopManagementPage = (req,res) => {
  let user=req.user;
  if(user!=undefined) {
    if(user.role_id>1) {
      let data = req.body;
      console.log(data);
      if (data.orderAccept) {
        pool.query(
          `UPDATE orders SET bill_status='paid' WHERE bill_id=$1;`,
          [data.orderBill],
          (err,results) => {
            if(err) {
              return res.json({error:1,message:err});
            } else {
              // Get order info
              pool.query(
                `SELECT order_details FROM orders WHERE bill_id=$1;`,
                [data.orderBill],
                (err,results) => {
                  if (err) return res.json({error:1,message:err});
                  else {
                    const orderDetails = JSON.parse(results.rows[0].order_details);

                    let errors = [];
                    let reduceList = [];
                    for (var i=0; i<orderDetails.length; i++) {
                      const odetails = orderDetails[i].orderDetails;
                      //console.log(odetails);
                      // Reduce product quantity in storage
                      pool.query(
                        `UPDATE product_storage
                          SET quantity = quantity-$2 WHERE product_code=$1;`,
                          [odetails.code,odetails.quantity],
                          (err,results) => {

                            if (err) errors.push(err);
                            else reduceList.push([odetails.code,odetails.quantity]);
                          }
                      );
                    }
                    if (errors.length > 0) return res.json({error:1,message:errors});
                    else return res.json({error:0,message:'accepted,'+data.orderBill,reduce:reduceList});
                  }
                }
              )


            }
          }
        )
      } else {
        pool.query(
          `UPDATE orders SET bill_status='cancelled' WHERE bill_id=$1;`,
          [data.orderBill],
          (err,results) => {
            if(err) {
              return res.json({error:1,message:err});
            } else {
              return res.json({error:0,message:'cancelled,' + data.orderBill});
            }
          }
        )
      }
      //return res.json({id:user.id,phone:'123456789'});
    } else {
      return res.json({error:1,message:'User has no permisson.'});
    }
  } else {
    return res.json({error:1,message:'User has no permisson.'});
  }
}

let getShopWarehousePage = (req,res) => {
  let user=req.user;
  if(user!=undefined) {
    if(user.role_id>1) {
      pool.query(
        `SELECT o.id,o._date,o.user_id,o.bill_id,o.bill_value,o.order_details,o.bill_status,u.name,u.phone,u.email FROM orders o
        INNER JOIN users u ON o.user_id=u.id ORDER BY o.id DESC;`,
        (err,results) => {
          if(err) {
            console.log('Error: ',err);
          } else {
            let orderlist = results.rows;
            let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
            return res.render('orderlist',{menu:menuData,user,orderlist});
          }
        }
      )
    }
  }
}

let postShopWarehousePage = (req,res) => {
  let user=req.user;
  if(user!=undefined) {
    if(user.role_id>1) {
      return res.json({error:0,message:'server response'})
    } else {
      return res.json({error:1,message:'User has no permisson.'});
    }
  } else {
    return res.json({error:1,message:'User has no permisson.'});
  }
}

let getLdpFormData = (req,res) => {
  let user=req.user;
  if(user!=undefined) {
    if(user.role_id>1) {
      let data = req.body;
      switch (data.cmd) {
        case 'getlandingdata':
          pool.query(
            `SELECT * FROM ldp_data ORDER BY id DESC;`,
            (err, results) => {
              if(err) {
                return res.json({error:1,message:err});
              } else {
                return res.json({cmd:'getlandingdata',error:0,message:'success',data:results.rows});
              }
            }
          )
          //return res.json({error:0,message:'server response'});
          break;
        default:
          return res.json({error:1,message:'Unknown command'});
      }
    } else {
      return res.json({error:1,message:'User has no permisson.'});
    }
  } else {
    return res.json({error:1,message:'User has no permisson.'});
  }
}

let getProductQuant = (req,res) => {
  let user=req.user;
  if(user!=undefined) {
    if(user.role_id>1) {
      let data = req.body;

          pool.query(
            `SELECT * FROM product_storage WHERE product_code=$1;`,
            [data.product_code],
            (err, results) => {
              if(err) {
                return res.json({error:1,message:err});
              } else {
                return res.json({cmd:'getproductquant',error:0,message:'success',data:results.rows});
              }
            }
          )

    } else {
      return res.json({error:1,message:'User has no permisson.'});
    }
  } else {
    return res.json({error:1,message:'User has no permisson.'});
  }
}

let postLdpAdmin = (req,res) => {
  let user=req.user;
  if(user!=undefined) {
    if(user.role_id>1) {
      let data = req.body;
      if (data.endTime) {
        pool.query(
          `UPDATE ldp_settings
            SET content = $1 WHERE name='endTime';`,
            [data.endTime],
            (err,results) => {
              if (err) return res.json({error:1,message:err});
              else return res.json({error:0,cmd:'endTime',message:'endTime success'});
            }
        )
      } else if (data.product_code && data.quantity) {
        pool.query(
          `UPDATE product_storage
            SET quantity = $2 WHERE product_code=$1;`,
            [data.product_code,data.quantity],
            (err,results) => {
              if (err) return res.json({error:1,message:err});
              else return res.json({error:0,cmd:'product_quantity',message:'product_quantity success'});
            }
        )
      } else if (data.approve_id) {
          pool.query(
            `UPDATE ldp_data SET status=$2 WHERE id=$1;`,
            [data.approve_id,data.approve],
            (err,results) => {
              if (err) return res.json({error:1,message:err});
              else {
                if (data.approve == "accepted") {
                  pool.query(
                    `UPDATE product_storage
                      SET quantity = quantity-1 WHERE product_code=$1;`,
                      ['INF0001'],
                      (err,results) => {
                        if (err) return res.json({error:1,message:err});
                        else return res.json({error:0,cmd:data.approve,message:'success'});
                      }
                  )
                } else return res.json({error:0,cmd:data.approve,message:'success'});

              }
            }
          )
      } else if (data.embedCode) {
        pool.query(
          `UPDATE ldp_settings
            SET content = $1 WHERE name='embedCode';`,
            [data.embedCode],
            (err,results) => {
              if (err) return res.json({error:1,message:err});
              else return res.json({error:0,cmd:'embedCode',message:'embedCode success'});
            }
        )
      }

    } else {
      return res.json({error:1,message:'User has no permisson.'});
    }
  } else {
    return res.json({error:1,message:'User has no permisson.'});
  }
}

let postSqlCmd = (req,res) => {
  let user=req.user;
  if(user!=undefined) {
    if(user.role_id==2) {
      let data = req.body;

      pool.query(
        data.cmd,
        (err,results) => {
          if (err) return res.json({error:1,message:err});
          else return res.json({error:0,message:results});
        }
      )


    } else {
      return res.json({error:1,message:'User has no permisson.'});
    }
  } else {
    return res.json({error:1,message:'User has no permisson.'});
  }
}

/*API*/

let pushTrans = async (req,res) => {
  let user=req.user;
  //console.log(user);
  if(user!=undefined){
    if(user.role_id>1)
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
    if(user.role_id>1)
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

let createUser = async (req,res) => {
      //console.log(req.body);
      let custoken = req.body.custoken;
      let email=req.body.email;
      let expTime=req.body.expTime;
      let phone=req.body.phone;
      let role=req.body.role;
      let surName=req.body.surName;
      let push = await api.createUser(custoken,email,expTime,phone,role,surName);
      console.log('Result: ', push);
      return res.json(push);
}

let updateUser = async (req,res) => {
      //console.log(req.body);
      let custoken = req.body.custoken;
      let email=req.body.email;
      let expTime=req.body.expTime;
      let phone=req.body.phone;
      let role=req.body.role;
      let surName=req.body.surName;
      let push = await api.updateUser(custoken,email,expTime,phone,role,surName);
      console.log('Result: ', push);
      return res.json(push);
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
  getShopManagementPage: getShopManagementPage,
  postShopManagementPage: postShopManagementPage,
  postShopWarehousePage: postShopWarehousePage,
  getShopWarehousePage: getShopWarehousePage,
  pushTrans:pushTrans,
  pushAdmMsg:pushAdmMsg,
  updateFundNav:updateFundNav,
  createUser:createUser,
  updateUser:updateUser,
  getLdpFormData: getLdpFormData,
  getProductQuant:getProductQuant,
  postLdpAdmin: postLdpAdmin,
  //postEmbedCode: postEmbedCode,
  postSqlCmd: postSqlCmd,
  getOrdersData: getOrdersData,
}
