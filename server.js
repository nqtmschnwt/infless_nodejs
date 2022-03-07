const express = require('express');
const app = express();
const viewEngine = require('./config/viewEngine');
const initWebRoutes = require('./route/web');
require('dotenv').config();
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const helmet = require('helmet');
const requestIp = require('request-ip');
const bodyParser = require("body-parser");


const { pool } = require('./config/dbConfig');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(requestIp.mw());

const initializePassport = require("./config/passportConfig");
initializePassport(passport);

app.use(express.urlencoded({extended: false}));
app.use(express.json({ limit: '300kb' })); // body-parser defaults to a body size limit of 300kb. Payload limit is used to prevent large request sending to server that may crash
app.use(helmet({
    contentSecurityPolicy: false,
  })
);  // helmet is a middleware to filter toxic HTTP headers
app.use(session({
    // Key we want to keep secret which will encrypt all of our information
    secret: process.env.SESSION_SECRET,
    // Should we resave our session variables if nothing has changes which we dont
    resave: false,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

viewEngine(app);
initWebRoutes(app);

// SOME LOCAL FUNCTIONS
app.locals.dateFormat = (d) => {
  let dDate = new Date(d);
  return (addZero(parseInt(dDate.getDate())) + "/" + addZero(parseInt(dDate.getMonth() + 1)) + "/" + dDate.getFullYear());
}

function addZero(numb) {
  if(numb<10){
    return "0"+numb;
  } else {
    return ""+numb;
  }
}

let port = process.env.PORT || 6969;
app.listen(port, () => {
  console.log("Server running on port", port);
});

var io = require('socket.io-client');
var socket = io.connect('https://infless-copy-trade-clone-001.herokuapp.com/', {reconnect: true});
socket.emit('nodeConnect','Hello');
// Add a connect listener
socket.on('connect', function (socket) {
    console.log('Connected!');
});
socket.on('ID', function(data) {
  console.log('Socket ID: '+data);
});
socket.on('phongThan', function(data){
  if(data.length > 0) {
    for(var i=0; i<data.length; i++) {
      let info = data[i];
      let ticker = data[i]._ticker;
      pool.query(
        `SELECT d._ticker_id,p._ticker FROM phongthan p INNER JOIN dieukien d ON p.id=d._ticker_id INNER JOIN catlo c ON p.id=c._ticker_id WHERE p._ticker=$1 AND p._add_date=$2 ORDER BY p._add_date DESC;`,
        [ticker,info._add_date], (err,results) => {
          if(err) {
            console.log('Error: ', err);
          } else {
            if(results.rows.length==0) {
              //console.log(ticker,' not found in phongthan.');
              // Add ticker to phongthan
              pool.query(
                `WITH new_ticker AS(
                  INSERT INTO phongthan (_ticker,_add_date,_form)
                  VALUES ($1, $2, $3)
                  RETURNING id
                ),
                new_dieukien AS(
                  INSERT INTO dieukien (_ticker_id, _dk_price, _dk_vol, _passed)
                  VALUES((SELECT id FROM new_ticker),$4,$5,'false')
                )
                INSERT INTO catlo (_ticker_id, _sl_price, _sl)
                  VALUES((SELECT id FROM new_ticker),$6,'false');`,
                [ticker,info._add_date,info._form,info._dk_price,info._dk_vol,info._sl_price], (err,results)=>{
                  if(err) {
                    console.log('Error: ', err);
                  }// else console.log(ticker,' added to phongthan.');
                }
              )
            }
          }
        }
      )
    }
    console.log('PT updated');
  }
});

socket.on('DK',function(data){
  //console.log(data);
  if(data.length>0){
    for(var i=0; i<data.length; i++){
      let ticker = data[i]._ticker,
          add_date = data[i]._add_date
          form = data[i]._form,
          dk_price = data[i]._dk_price
          dk_vol = data[i]._dk_vol
          passed_time = data[i]._passed_time;
      pool.query(
        `SELECT p.id,d._ticker_id,p._ticker,d._passed FROM phongthan p
        INNER JOIN dieukien d ON p.id=d._ticker_id
        WHERE p._ticker=$1 AND p._add_date=$2 ORDER BY p._add_date DESC;`,
        [ticker,add_date], (err,results) => {
          if(err) {
            console.log('Error: ', err);
          } else {
            if(results.rows.length>0) {
              //console.log(ticker, ' found in phongthan.');
              // Check if passed
              for(var j=0; j<results.rows.length; j++) {
                if(results.rows[j]._passed==false){
                  let id = results.rows[j].id;
                  pool.query(
                    `UPDATE dieukien SET _passed=true WHERE _ticker_id=$1;`,
                    [id],(err,results)=>{
                      if(err) {
                        console.log('Error: ', err);
                      } else console.log(ticker,' updated in dieukien.');
                    }
                  )
                }// else console.log(ticker,' passed.');
              }
            } else {
              //console.log(ticker,' not found in phongthan.');
              // Add ticker to phongthan
              pool.query(
                `WITH new_ticker AS(
                  INSERT INTO phongthan (_ticker,_add_date,_form)
                  VALUES ($1, $2, $3)
                  RETURNING id
                )
                INSERT INTO dieukien (_ticker_id, _dk_price, _dk_vol, _passed, _passed_time)
                VALUES((SELECT id FROM new_ticker),$4,$5,'true',$6);`,
                [ticker,add_date,form,dk_price,dk_vol,passed_time], (err,results)=>{
                  if(err) {
                    console.log('Error: ', err);
                  }// else console.log(ticker,' added to phongthan.');
                }
              )
            }
          }
        }
      )
    }
    console.log('DK updated');
  }
});

socket.on('SL',function(data){
  //console.log(data);
  if(data.length>0){
    for(var i=0; i<data.length; i++){
      let ticker = data[i]._ticker,
          add_date = data[i]._add_date
          form = data[i]._form,
          sl_price = data[i]._sl_price
          sl_time = data[i]._sl_time;
      pool.query(
        `SELECT p.id,c._ticker_id,p._ticker,c._sl FROM phongthan p
        INNER JOIN catlo c ON p.id=c._ticker_id
        WHERE p._ticker=$1 AND p._add_date=$2 ORDER BY p._add_date DESC;`,
        [ticker,add_date], (err,results) => {
          if(err) {
            console.log('Error: ', err);
          } else {
            if(results.rows.length>0) {
              //console.log(ticker, ' found in phongthan.');
              // Check if passed
              for(var j=0; j<results.rows.length; j++) {
                if(results.rows[j]._sl==false){
                  let id = results.rows[j].id;
                  pool.query(
                    `UPDATE catlo SET _sl=true WHERE _ticker_id=$1;`,
                    [id],(err,results)=>{
                      if(err) {
                        console.log('Error: ', err);
                      } else console.log(ticker,' updated in catlo.');
                    }
                  )
                }// else console.log(ticker,' already SL.');
              }
            } else {
              console.log(ticker,' not found in phongthan.');
              // Add ticker to phongthan
              pool.query(
                `WITH new_ticker AS(
                  INSERT INTO phongthan (_ticker,_add_date,_form)
                  VALUES ($1, $2, $3)
                  RETURNING id
                )
                INSERT INTO catlo (_ticker_id, _sl_price, _sl, _sl_time)
                VALUES((SELECT id FROM new_ticker),$4,'true',$5);`,
                [ticker,add_date,form,sl_price,sl_time], (err,results)=>{
                  if(err) {
                    console.log('Error: ', err);
                  }// else console.log(ticker,' added to phongthan.');
                }
              )
            }
          }
        }
      )
    }
    console.log('SL updated')
  }
});

socket.on('trade', function(data){
    //console.log(data);
    let fundnav = parseFloat(data.fundnav/1000000000);
    let order= data.order;
    let ordertype= data.ordertype;
    let symbol= data.symbol;
    let vol= parseFloat(data.vol/1000000);
    let pct= parseFloat(data.pct);
    let price= parseFloat(data.price);
    //console.log([fundnav,order,ordertype,symbol,vol,pct,price]);
    let d = new Date();
    let dformat = [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-')+' '+[d.getHours(),d.getMinutes(),d.getSeconds()].join(':');
    pool.query(
      `INSERT INTO trade_orders(order_time, order_direction, order_type, ticker, vol, price, pct, fund_nav)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
      [dformat,order,ordertype,symbol,vol,price,pct,fundnav],(err,results)=>{
        if(err) {
          console.log('Error: ', err);
        }
      }
    )
    //io.sockets.emit('chat', data);
});
