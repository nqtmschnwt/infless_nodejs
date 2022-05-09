const fs = require('fs');
const { pool } = require('../config/dbConfig');

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
      return res.redirect('/home');
    }
  } else {
    return res.redirect('/login');
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
                      throw err;
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
                      throw err;
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
                      throw err;
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
                throw err;
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
                throw err;
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
                throw err;
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
                throw err;
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
                throw err;
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
                throw err;
              }
              let data = results.rows;
              let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
              return res.render('pf_dashboard', {menu:menuData,user,data:{type:"form3",data:data},query});
            }
          )

        }
      }

      if(req.body.findnone) {
        return res.redirect("/pf-control");
      }

    } else {
      return res.redirect('/home');
    }
  } else {
    return res.redirect('/login');
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
            throw err;
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
                  throw err;
                } else {
                  let navdata = results.rows;
                  pool.query(
                    `SELECT cash_value,portfolio FROM user_portfolio WHERE portfolio_id=$1 AND latest='True';`,
                    [pfid],(err,results) => {
                      if(err) {
                        throw err;
                      } else {
                        let portfolioCurrent = {cash:0,portfolio:[]};
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
      return res.redirect('/home');
    }
  } else {
    return res.redirect('/login');
  }
}

module.exports = {
  getPfPage:getPfPage,
  postPfPage:postPfPage,
  getPfInfo:getPfInfo,
}
