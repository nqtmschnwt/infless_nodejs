const fs = require('fs');
const { pool } = require('../config/dbConfig');
const { google } = require('googleapis');
const phoneNumber = require( 'awesome-phonenumber' );


let getPfPage = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      let query=[];
      pool.query(
        'SELECT u.id,u.name,u.phone,u.email FROM users u FULL OUTER JOIN portfolios pf ON u.id = pf.user_id WHERE pf.portfolio_id IS NULL;',(err,results) => {
          if(err) {
            console.log('Error: ',err);
          } else {
            let blankpfusers = results.rows;
            let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
            return res.render('pf_dashboard', {menu:menuData,user,data:{type:"blank",data:blankpfusers},query});
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

let postPfPage = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      let query=[];
      if(req.body.createPf) {
        console.log(Object.keys(req.body).length);
        // Check duplicate portfolio
        pool.query(
          `SELECT COUNT(*) FROM portfolios pfs INNER JOIN user_portfolio upf ON pfs.portfolio_id = upf.portfolio_id WHERE pfs.user_id=$1 AND pfs.acc=$2 AND pfs.company=$3;`,
          [req.body.id,req.body.acc,req.body.company],
          (err,results) => {
            if(err) {
              console.log("Error (1)");
              console.log(err);
            } else {
              if(parseInt(results.rows[0].count)==0) {
                // Creating new portfolio
                let d = new Date();
                let dformat = [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-');
                let portfolio = [];
                if(Object.keys(req.body).length > 11) {
                  let tickerAmount = (Object.keys(req.body).length - 11)/4;
                  console.log('Has '+tickerAmount+' ticker');
                  for(var i=0;i<tickerAmount;i++) {
                    if(req.body['pfticker_'+i] != '' && req.body['pfvol_'+i] != '' && req.body['pfbuyprice_'+i] != '' && req.body['pfcurrentprice_'+i] != '') {
                      let tickerInfo = {
                        ticker: req.body['pfticker_'+i].replace(/\s/g,'').replace(/,/g, '').toUpperCase(),
                        vol: parseFloat(req.body['pfvol_'+i].replace(/\s/g,'').replace(/,/g, '')),
                        buyprice: parseFloat(req.body['pfbuyprice_'+i].replace(/\s/g,'').replace(/,/g, ''))/1000,
                        currentprice: parseFloat(req.body['pfcurrentprice_'+i].replace(/\s/g,'').replace(/,/g, ''))/1000
                      };
                      portfolio.push(tickerInfo);
                    }
                  }
                }
                console.log(portfolio);

                pool.query(
                  `WITH new_pf AS(
                    INSERT INTO portfolios(user_id, acc, company) VALUES ($1, $2, $3) RETURNING portfolio_id
                  )
                  INSERT INTO user_portfolio(portfolio_date, latest, portfolio_id, portfolio_value, net_value, cash_value, debt_value, portfolio)
                  VALUES($4,'true',(SELECT portfolio_id FROM new_pf),$5,$6,$7,$8,$9);`,
                  [req.body.id,req.body.acc.toUpperCase(),req.body.company.toUpperCase(),dformat,parseFloat(req.body.tstt)/1000000000,parseFloat(req.body.tsrong)/1000000000,parseFloat(req.body.cash)/1000000000,parseFloat(req.body.debt)/1000000000,JSON.stringify(portfolio)],
                  (err,results) => {
                    if(err) {
                      console.log("Error (2)");
                      console.log(err);
                    } else {
                      console.log('OK');
                    }
                  }
                )
              }

              // Reload page
              pool.query(
                'SELECT u.id,u.name,u.phone,u.email FROM users u FULL OUTER JOIN portfolios pf ON u.id = pf.user_id WHERE pf.portfolio_id IS NULL;',(err,results) => {
                  if(err) {
                    console.log("Error (3)");
                    console.log('Error: ',err);
                  } else {
                    let blankpfusers = results.rows;
                    let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
                    return res.render('pf_dashboard', {menu:menuData,user,data:{type:"blank",data:blankpfusers},query});
                  }
                }
              )
            }
          }
        )
      }

      if(req.body.updatePf) {
        console.log(req.body);
        console.log(Object.keys(req.body).length);
        let query=JSON.parse(req.body.q);
        // Check duplicate portfolio
        let d = new Date();
        let dformat = [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-');
        let portfolio = [];
        if(Object.keys(req.body).length > 13) {
          let tickerAmount = (Object.keys(req.body).length - 13)/4;
          console.log('Has '+tickerAmount+' ticker');
          for(var i=0;i<tickerAmount;i++) {
            if(req.body['pfticker_'+i] != '' && req.body['pfvol_'+i] != '' && req.body['pfbuyprice_'+i] != '' && req.body['pfcurrentprice_'+i] != '') {
              let tickerInfo = {
                ticker: req.body['pfticker_'+i].replace(/\s/g,'').replace(/,/g, '').toUpperCase(),
                vol: parseFloat(req.body['pfvol_'+i].replace(/\s/g,'').replace(/,/g, '')),
                buyprice: parseFloat(req.body['pfbuyprice_'+i].replace(/\s/g,'').replace(/,/g, ''))/1000,
                currentprice: parseFloat(req.body['pfcurrentprice_'+i].replace(/\s/g,'').replace(/,/g, ''))/1000
              };
              portfolio.push(tickerInfo);
            }
          }
        }
        console.log(portfolio);

        pool.query(
          `SELECT COUNT(*) FROM user_portfolio WHERE portfolio_id=$1 AND portfolio_date=$2;`,
          [req.body.pfid,dformat],
          (err,results) => {
            if(err) {
              console.log("Error (4)");
              console.log(err);
            } else {
              if(parseInt(results.rows[0].count)==0) {
                // Creating new portfolio

                pool.query(
                  `WITH update_pf AS(
                    UPDATE user_portfolio SET latest='false' WHERE portfolio_id=$1 AND portfolio_date!=$2
                  )
                  INSERT INTO user_portfolio(portfolio_date, latest, portfolio_id, portfolio_value, net_value, cash_value, debt_value, portfolio)
                  VALUES($2,'true',$1,$3,$4,$5,$6,$7);`,
                  [req.body.pfid,dformat,parseFloat(req.body.tstt)/1000000000,parseFloat(req.body.tsrong)/1000000000,parseFloat(req.body.cash)/1000000000,parseFloat(req.body.debt)/1000000000,JSON.stringify(portfolio)],
                  (err,results) => {
                    if(err) {
                      console.log("Error (5)");
                      console.log(err);
                    } else {
                      console.log('OK');
                    }
                  }
                )
              } else {
                // That day already has data -> do update
                pool.query(
                  `WITH update_pf AS(
                    UPDATE user_portfolio SET latest='false' WHERE portfolio_id=$1 AND portfolio_date!=$2
                  )
                  UPDATE user_portfolio SET
                  latest = 'true',
                  portfolio_value=$3,
                  net_value=$4,
                  cash_value=$5,
                  debt_value=$6,
                  portfolio=$7
                  WHERE portfolio_id=$1 AND portfolio_date = $2;`,
                  [req.body.pfid,dformat,parseFloat(req.body.tstt)/1000000000,parseFloat(req.body.tsrong)/1000000000,parseFloat(req.body.cash)/1000000000,parseFloat(req.body.debt)/1000000000,JSON.stringify(portfolio)],
                  (err,results) => {
                    if(err) {
                      console.log("Error (6)");
                      console.log(err);
                    } else {
                      console.log('OK');
                    }
                  }
                )
              }

              // Reload page
              console.log(query);

              if (query.hasOwnProperty('name')) {
                let refSearch = query.ref;
                if(query.ref!=''){
                  var refNumber = new phoneNumber(query.ref,'VN');
                  if(refNumber.isValid( ) && refNumber.isMobile( ) && refNumber.canBeInternationallyDialled( ))  refSearch = refNumber.getNumber( 'e164' ).replace('+','');
                }

                // Check phone valid
                let phoneFormatted = '';
                if(query.phone!=''){
                  var pn = new phoneNumber(query.phone,'VN');
                  if(pn.isValid( ) && pn.isMobile( ) && pn.canBeInternationallyDialled( ))  phoneFormatted = pn.getNumber( 'e164' );
                }
                pool.query(
                  `SELECT u.id,u.name,u.phone,u.email,r.ref_id,pf.portfolio_id,pf.acc,pf.company FROM users u
                  INNER JOIN ref_info r ON u.id=r.user_id
                  FULL OUTER JOIN portfolios pf ON u.id = pf.user_id WHERE pf.portfolio_id IS NOT NULL AND u.name LIKE $1 AND u.phone LIKE $2 AND u.email LIKE $3 AND r.ref_id LIKE $4 AND pf.acc LIKE $5 AND pf.company LIKE $6

                  ORDER BY u.id ASC`,
                  ['%'+query.name+'%','%'+phoneFormatted+'%','%'+query.email+'%','%'+refSearch+'%','%'+query.acc+'%','%'+query.company+'%'], (err,results)=>{
                    if(err) {
                      console.log("Error (7)");
                      console.log(err);
                    }
                    let data = results.rows;
                    let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
                    return res.render('pf_dashboard', {menu:menuData,user,data:{type:"form1",data:data},query});
                  }
                )
              }

              if (query.hasOwnProperty('minnav')) {
                pool.query(
                  `SELECT u.id,u.name,u.phone,u.email,pf.portfolio_id,pf.acc,pf.company FROM users u
                  FULL OUTER JOIN portfolios pf ON u.id = pf.user_id
                  INNER JOIN user_portfolio upf ON pf.portfolio_id = upf.portfolio_id WHERE pf.portfolio_id IS NOT NULL AND upf.latest='True' AND upf.net_value>=$1 AND upf.net_value<=$2
                  ORDER BY u.id ASC`,
                  [query.minnav,query.maxnav], (err,results)=>{
                    if(err) {
                      console.log("Error (8)");
                      console.log(err);
                    }
                    let data = results.rows;
                    let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
                    return res.render('pf_dashboard', {menu:menuData,user,data:{type:"form2",data:data},query});
                  }
                )
              }

              if (query.hasOwnProperty('ticker')) {
                pool.query(
                  `SELECT u.id,u.name,u.phone,u.email,pf.portfolio_id,pf.acc,pf.company FROM users u
                  FULL OUTER JOIN portfolios pf ON u.id = pf.user_id
                  INNER JOIN user_portfolio upf ON pf.portfolio_id = upf.portfolio_id WHERE pf.portfolio_id IS NOT NULL AND upf.latest='True' AND upf.portfolio LIKE $1
                  ORDER BY u.id ASC`,
                  ['%'+query.ticker.toUpperCase()+'%'], (err,results)=>{
                    if(err) {
                      console.log("Error (9)");
                      console.log(err);
                    }
                    let data = results.rows;
                    let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
                    return res.render('pf_dashboard', {menu:menuData,user,data:{type:"form3",data:data},query});
                  }
                )
              }

            }
          }
        )
      }

      if(req.body.form_1_find) {
        let name = req.body.name;
        let phone = req.body.phone;
        let email = req.body.email;
        let ref = req.body.ref;
        let acc = req.body.acc;
        let company = req.body.company;

        let query = {
          name:"",
          phone:"",
          email:"",
          ref:"",
          acc:"",
          company:""
        }

        query.name = name;
        query.phone = phone;
        query.email = email;
        query.ref = ref;
        query.acc = acc;
        query.company = company;
        let conditions=[];
        //...
        if(!name && !phone && !email && !ref && !acc && !company){
          // All fields are empty
          pool.query(
            `SELECT u.id,u.name,u.phone,u.email,r.ref_id,pf.portfolio_id,pf.acc,pf.company FROM users u
            INNER JOIN ref_info r ON u.id=r.user_id
            FULL OUTER JOIN portfolios pf ON u.id = pf.user_id WHERE pf.portfolio_id IS NOT NULL
            ORDER BY u.id ASC;`,
            (err,results) => {
              if(err) {
                console.log("Error (10)");
                console.log(err);
              }
              let data = results.rows;
              let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
              return res.render('pf_dashboard', {menu:menuData,user,data:{type:"form1",data:data},query});
            }
          )
        } else {
          // Any field having value

          let refSearch = ref;
          if(ref!=''){
            var refNumber = new phoneNumber(ref,'VN');
            if(refNumber.isValid( ) && refNumber.isMobile( ) && refNumber.canBeInternationallyDialled( ))  refSearch = refNumber.getNumber( 'e164' ).replace('+','');
          }

          // Check phone valid
          let phoneFormatted = '';
          if(phone!=''){
            var pn = new phoneNumber(phone,'VN');
            if(pn.isValid( ) && pn.isMobile( ) && pn.canBeInternationallyDialled( ))  phoneFormatted = pn.getNumber( 'e164' );
          }

          pool.query(
            `SELECT u.id,u.name,u.phone,u.email,r.ref_id,pf.portfolio_id,pf.acc,pf.company FROM users u
            INNER JOIN ref_info r ON u.id=r.user_id
            FULL OUTER JOIN portfolios pf ON u.id = pf.user_id WHERE pf.portfolio_id IS NOT NULL AND u.name LIKE $1 AND u.phone LIKE $2 AND u.email LIKE $3 AND r.ref_id LIKE $4 AND pf.acc LIKE $5 AND pf.company LIKE $6
            ORDER BY u.id ASC`,
            ['%'+name+'%','%'+phoneFormatted+'%','%'+email+'%','%'+refSearch+'%','%'+acc+'%','%'+company+'%'], (err,results)=>{
              if(err) {
                console.log("Error (11)");
                console.log(err);
              }
              let data = results.rows;
              let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
              return res.render('pf_dashboard', {menu:menuData,user,data:{type:"form1",data:data},query});
            }
          )

        }
      }

      if(req.body.form_2_find) {
        let minnav = 0;
        let maxnav = 999999;

        if(req.body.minnav != "" && req.body.maxnav != "") {
          minnav = parseFloat(req.body.minnav)/1000000000;
          maxnav = parseFloat(req.body.maxnav)/1000000000;
        }

        let query = {
          minnav:"",
          maxnav:""
        }

        query.minnav = minnav;
        query.maxnav = maxnav;
        let conditions=[];
        //...
        if(!minnav && !maxnav){
          // All fields are empty
          pool.query(
            `SELECT u.id,u.name,u.phone,u.email,pf.portfolio_id,pf.acc,pf.company FROM users u
            FULL OUTER JOIN portfolios pf ON u.id = pf.user_id WHERE pf.portfolio_id IS NOT NULL
            ORDER BY u.id ASC;`,
            (err,results) => {
              if(err) {
                console.log("Error (12)");
                console.log(err);
              }
              let data = results.rows;
              let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
              return res.render('pf_dashboard', {menu:menuData,user,data:{type:"form1",data:data},query});
            }
          )
        } else {
          // Any field having value

          pool.query(
            `SELECT u.id,u.name,u.phone,u.email,pf.portfolio_id,pf.acc,pf.company FROM users u
            FULL OUTER JOIN portfolios pf ON u.id = pf.user_id
            INNER JOIN user_portfolio upf ON pf.portfolio_id = upf.portfolio_id WHERE pf.portfolio_id IS NOT NULL AND upf.latest='True' AND upf.net_value>=$1 AND upf.net_value<=$2
            ORDER BY u.id ASC`,
            [minnav,maxnav], (err,results)=>{
              if(err) {
                console.log("Error (13)");
                console.log(err);
              }
              let data = results.rows;
              let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
              return res.render('pf_dashboard', {menu:menuData,user,data:{type:"form2",data:data},query});
            }
          )

        }
      }

      if(req.body.form_3_find) {
        let ticker = req.body.ticker;
        let query = {
          ticker:""
        }

        query.ticker = ticker;
        let conditions=[];
        //...
        if(!ticker){
          // All fields are empty
          pool.query(
            `SELECT u.id,u.name,u.phone,u.email,pf.portfolio_id,pf.acc,pf.company FROM users u
            FULL OUTER JOIN portfolios pf ON u.id = pf.user_id WHERE pf.portfolio_id IS NOT NULL
            ORDER BY u.id ASC;`,
            (err,results) => {
              if(err) {
                console.log("Error (14)");
                console.log(err);
              }
              let data = results.rows;
              let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
              return res.render('pf_dashboard', {menu:menuData,user,data:{type:"form3",data:data},query});
            }
          )
        } else {
          // Any field having value

          pool.query(
            `SELECT u.id,u.name,u.phone,u.email,pf.portfolio_id,pf.acc,pf.company FROM users u
            FULL OUTER JOIN portfolios pf ON u.id = pf.user_id
            INNER JOIN user_portfolio upf ON pf.portfolio_id = upf.portfolio_id WHERE pf.portfolio_id IS NOT NULL AND upf.latest='True' AND upf.portfolio LIKE $1
            ORDER BY u.id ASC`,
            ['%'+ticker.toUpperCase()+'%'], (err,results)=>{
              if(err) {
                console.log("Error (15)");
                console.log(err);
              }
              let data = results.rows;
              let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
              return res.render('pf_dashboard', {menu:menuData,user,data:{type:"form3",data:data},query});
            }
          )

        }
      }

      if(req.body.findnone) {
        return res.redirect("/securities/pf-control");
      }

    } else {
      return res.redirect('/securities/home');
    }
  } else {
    return res.redirect('/securities/login');
  }
}

let getPfInfo = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      let pfid = req.params.id;
      pool.query(
        `SELECT u.name, pf.acc, pf.company FROM users u
        INNER JOIN portfolios pf ON u.id = pf.user_id WHERE pf.portfolio_id=$1;`,
        [pfid], (err,results) => {
          if(err) {
            console.log(err);
          } else {
            let portfolioInfo = {name:"Error",acc:"Portfolio",company:"Not found"};
            if (results.rows.length > 0)
              portfolioInfo = results.rows[0];
            let currentdate = new Date();
            let last6months = new Date(currentdate.setMonth(currentdate.getMonth()-6));
            let dformat = [last6months.getFullYear(),last6months.getMonth()+1,last6months.getDate()].join('-');
            pool.query(
              `SELECT portfolio_date, net_value, portfolio_value, cash_value, debt_value FROM user_portfolio WHERE portfolio_id=$1 AND portfolio_date>$2
              ORDER BY portfolio_date ASC;`,
              [pfid,dformat],
              (err,results) => {
                if(err) {
                  console.log(err);
                } else {
                  let navdata = results.rows;
                  pool.query(
                    `SELECT cash_value,portfolio FROM user_portfolio WHERE portfolio_id=$1 AND latest='True';`,
                    [pfid],(err,results) => {
                      if(err) {
                        console.log(err);
                      } else {
                        let portfolioCurrent = {cash:0,portfolio:'[]'};
                        if (results.rows.length > 0)
                          portfolioCurrent = results.rows[0];
                        let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
                        return res.render('pf_view', {menu:menuData,user,portfolioInfo,navdata,portfolioCurrent});
                      }
                    }
                  )

                }
              }
            )
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

let getPfUpdate = async (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      /*
      // Server side GG sheet
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
        range: 'GDKH!A:L'
      })

      // Read rows from spreadsheet
      const getPriceRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'Price!A:C'
      })

      let prices = getPriceRows.data.values;

      // get fund's trade orders
      pool.query(
        `SELECT * FROM trade_orders;`, (err,results) => {
          if(err) console.log(err);
          else {
            let trades = [];
            if(results.rows.length > 0) {
              trades = results.rows;
              let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
              return res.render('pf_update', {menu:menuData,user,data:getRows.data,trades:trades,prices});
            }
          }
        }
      )
      */
      // get fund's trade orders
      pool.query(
        `SELECT * FROM trade_orders;`, (err,results) => {
          if(err) console.log(err);
          else {
            let trades = [];
            if(results.rows.length >= 0) {
              trades = results.rows;
              let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
              return res.render('pf_update', {menu:menuData,user,data:[],trades:[]});
            }
          }
        }
      )


      //let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
      //return res.render('pf_update', {menu:menuData,user});

    } else {
      return res.redirect('/securities/home');
    }
  } else {
    return res.redirect('/securities/login');
  }
}

let postPfUpdate = (req,res) => {
  console.log(req.body);

  let phone = req.body.phone;
  let email = req.body.email.toLowerCase();
  let name = req.body.name;
  let acc = req.body.acc;
  let company = req.body.company;

  // Fund's pf
  if(acc=='0') {
    console.log('Fund info received');

    // get fund's portfolio ID
    pool.query(
      `SELECT * FROM portfolios WHERE acc LIKE $1;`,[0],(err,results) => {
        if(err) {
          console.log("Error (1)");
          console.log(err);
        } else {
          if(results.rows.length == 0) {
            // No fund portfolio
            // return "You must create portfolio first"
          } else {
            let d = new Date();
            let dformat = [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-');
            let fundPfId = results.rows[0].portfolio_id;
            // Check if today portfolio recorded
            pool.query(
              `SELECT COUNT(*) FROM user_portfolio WHERE portfolio_id=$1 AND portfolio_date=$2;`,
              [fundPfId,dformat],
              (err,results) => {
                if(err) {
                  console.log("Error (2)");
                  console.log(err);
                } else {
                  if(parseInt(results.rows[0].count)==0) {
                    // Creating new portfolio

                    pool.query(
                      `WITH update_pf AS(
                        UPDATE user_portfolio SET latest='false' WHERE portfolio_id=$1 AND portfolio_date!=$2
                      )
                      INSERT INTO user_portfolio(portfolio_date, latest, portfolio_id, portfolio_value, net_value, cash_value, debt_value, portfolio)
                      VALUES($2,'true',$1,$3,$4,$5,$6,$7);`,
                      [fundPfId,dformat,req.body.portfolio_value,req.body.net_value,req.body.cash_value,req.body.debt,JSON.stringify(req.body.portfolio)],
                      (err,results) => {
                        if(err) {
                          console.log(err);
                        } else {
                          console.log('OK');
                          return res.send({
                                status: 200,
                                message: "Account updated.",
                                errorCode: 0,
                                inputParams: {
                                  name: 'Infless',
                                  phone: '',
                                  email: '',
                                  acc: '0',
                                  company: 'Infless'
                                }
                              });
                        }
                      }
                    )
                  } else {
                    // That day already has data -> do update
                    pool.query(
                      `WITH update_pf AS(
                        UPDATE user_portfolio SET latest='false' WHERE portfolio_id=$1 AND portfolio_date!=$2
                      )
                      UPDATE user_portfolio SET
                      latest = 'true',
                      portfolio_value=$3,
                      net_value=$4,
                      cash_value=$5,
                      debt_value=$6,
                      portfolio=$7
                      WHERE portfolio_id=$1 AND portfolio_date = $2;`,
                      [fundPfId,dformat,req.body.portfolio_value,req.body.net_value,req.body.cash_value,req.body.debt,JSON.stringify(req.body.portfolio)],
                      (err,results) => {
                        if(err) {
                          console.log("Error (3)");
                          console.log(err);
                        } else {
                          console.log('OK');
                          return res.send({
                                status: 200,
                                message: "Account updated.",
                                errorCode: 0,
                                inputParams: {
                                  name: 'Infless',
                                  phone: '',
                                  email: '',
                                  acc: '0',
                                  company: 'Infless'
                                }
                              });
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
    )

  } else {
    // Check phone valid
    let phoneFormatted = '';
    if(phone!=''){
      var pn = new phoneNumber(phone,'VN');
      if(pn.isValid( ) && pn.isMobile( ) && pn.canBeInternationallyDialled( ))  phoneFormatted = pn.getNumber( 'e164' );
    }

    if(phone=='' && email=='') {
      // Both phone and email are blank
      return res.send({
            status: 200,
            message: "Account not found.",
            errorCode: 1,
            inputParams: {
              name: name,
              phone: phone,
              email: email,
              acc: acc,
              company: company
            }
          });
    } else {
      pool.query(
        //`SELECT * FROM users u
        //INNER JOIN portfolios pf ON u.id = pf.user_id WHERE u.phone LIKE $1 AND LOWER(u.email) LIKE $2;`,
        `SELECT * FROM users WHERE phone LIKE $1 AND LOWER(email) LIKE $2;`,
        [phoneFormatted,'%'+email+'%'], (err,results) => {
          if(err) {
            console.log("Error (4)");
            console.log(err);
          } else {
            if(results.rows.length>0) {
              // Client found
              let uid = results.rows[0].id;
              pool.query(
                `SELECT * FROM portfolios WHERE user_id=$1 AND acc LIKE $2 AND company LIKE $3;`,
                [uid,acc,company], (err,results) => {
                  if(err) {
                    console.log(err);
                  } else {
                    if(results.rows.length>0) {
                      // User has portfolio
                      console.log(name+' has portfolio');
                      let d = new Date();
                      let dformat = [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-');
                      let pfid = results.rows[0].portfolio_id;
                      pool.query(
                        `SELECT COUNT(*) FROM user_portfolio WHERE portfolio_id=$1 AND portfolio_date=$2;`,
                        [pfid,dformat],
                        (err,results) => {
                          if(err) {
                            console.log("Error (5)");
                            console.log(err);
                          } else {
                            if(parseInt(results.rows[0].count)==0) {
                              // Creating new portfolio

                              pool.query(
                                `WITH update_pf AS(
                                  UPDATE user_portfolio SET latest='false' WHERE portfolio_id=$1 AND portfolio_date!=$2
                                )
                                INSERT INTO user_portfolio(portfolio_date, latest, portfolio_id, portfolio_value, net_value, cash_value, debt_value, portfolio)
                                VALUES($2,'true',$1,$3,$4,$5,$6,$7);`,
                                [pfid,dformat,req.body.portfolio_value,req.body.net_value,req.body.cash_value,req.body.debt,JSON.stringify(req.body.portfolio)],
                                (err,results) => {
                                  if(err) {
                                    console.log("Error (6)");
                                    console.log(err);
                                  } else {
                                    console.log('OK');
                                    return res.send({
                                          status: 200,
                                          message: "Account updated.",
                                          errorCode: 0,
                                          inputParams: {
                                            name: name,
                                            phone: phone,
                                            email: email,
                                            acc: acc,
                                            company: company
                                          }
                                        });
                                  }
                                }
                              )
                            } else {
                              // That day already has data -> do update
                              pool.query(
                                `WITH update_pf AS(
                                  UPDATE user_portfolio SET latest='false' WHERE portfolio_id=$1 AND portfolio_date!=$2
                                )
                                UPDATE user_portfolio SET
                                latest = 'true',
                                portfolio_value=$3,
                                net_value=$4,
                                cash_value=$5,
                                debt_value=$6,
                                portfolio=$7
                                WHERE portfolio_id=$1 AND portfolio_date = $2;`,
                                [pfid,dformat,req.body.portfolio_value,req.body.net_value,req.body.cash_value,req.body.debt,JSON.stringify(req.body.portfolio)],
                                (err,results) => {
                                  if(err) {
                                    console.log("Error (7)");
                                    console.log(err);
                                  } else {
                                    console.log('OK');
                                    return res.send({
                                          status: 200,
                                          message: "Account updated.",
                                          errorCode: 0,
                                          inputParams: {
                                            name: name,
                                            phone: phone,
                                            email: email,
                                            acc: acc,
                                            company: company
                                          }
                                        });
                                  }
                                }
                              )
                            }

                          }
                        }
                      )
                    } else {
                      // Client doesn't have portfolio
                      console.log(name+' does not have portfolio');
                      let d = new Date();
                      let dformat = [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-');
                      pool.query(
                        `WITH new_pf AS(
                          INSERT INTO portfolios(user_id, acc, company) VALUES ($1, $2, $3) RETURNING portfolio_id
                        )
                        INSERT INTO user_portfolio(portfolio_date, latest, portfolio_id, portfolio_value, net_value, cash_value, debt_value, portfolio)
                        VALUES($4,'true',(SELECT portfolio_id FROM new_pf),$5,$6,$7,$8,$9);`,
                        [uid,req.body.acc.toUpperCase(),req.body.company.toUpperCase(),dformat,req.body.portfolio_value,req.body.net_value,req.body.cash_value,req.body.debt,JSON.stringify(req.body.portfolio)],
                        (err,results) => {
                          if(err) {
                            console.log("Error (8)");
                            console.log(err);
                          } else {
                            console.log('OK');
                            return res.send({
                                  status: 200,
                                  message: "Account created.",
                                  errorCode: 0,
                                  inputParams: {
                                    name: name,
                                    phone: phone,
                                    email: email,
                                    acc: acc,
                                    company: company
                                  }
                                });
                          }
                        }
                      )
                    }
                  }
                }
              )

            } else {
              return res.send({
                    status: 200,
                    message: "Account not found.",
                    errorCode: 1,
                    inputParams: {
                      name: name,
                      phone: phone,
                      email: email,
                      acc: acc,
                      company: company
                    }
                  });
            }
          }
        }
      )
    }
  }





}

module.exports = {
  getPfPage:getPfPage,
  postPfPage:postPfPage,
  getPfInfo:getPfInfo,
  getPfUpdate:getPfUpdate,
  postPfUpdate:postPfUpdate,
}
