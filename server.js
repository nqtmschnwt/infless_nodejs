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
const cors = require('cors');

const { pool } = require('./config/dbConfig');

app.use(cors({
    origin: '*'
}));
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

// New socket
const amiController = require('./controllers/amiController');
var server = app.listen(port, function() {
    console.log('Server listening at', server.address())
})
var io2 = require('socket.io')(server)
var url = require('url');
io2.on('connection', (socket) => {
  console.log('Socket connection', socket.id);
  socket.emit('ID',socket.id);
  Object.keys(io2.sockets.sockets).forEach(function(id) {
    console.log("ID:",id)  // socketId
  });

  sendPhongThan();
  sendDK();
  sendSL();

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('kick', function(data){
      console.log(data);
      socket.broadcast.emit('kick', data);
  });

  socket.on('chat', function(data){
      console.log(data);
      io2.sockets.emit('chat', data);
  });

  socket.on('trade', function(data){
      console.log(data);
      io2.sockets.emit('trade', data);
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
      );
  });

  // Admin commands
  socket.on('vol21Admin', function(data){
    io2.sockets.emit('vol21Admin',data);
    //console.log(data);
    if(data.key=='tungdeptrai'){
      if(data.cmd.cmdHeader == 'connect'){
        console.log('Admin connected');
        console.log(data.cmd.cmdContent);
        try {
          let cmdContent = JSON.parse(data.cmd.cmdContent);
          let uid = cmdContent.id;
          let custoken = cmdContent.custoken;
          pool.query(
            `SELECT * FROM user_token WHERE user_id=$1;`, [uid], (err,results) => {
              if(err) console.log(err);
              else {
                if(results.rows.length > 0) {
                  pool.query(
                    `UPDATE user_token SET custoken=$2 WHERE user_id=$1;`, [uid, custoken], (err,results) => {
                      if(err) console.log(err);
                      else console.log('user token updated');
                    }
                  )
                }
              }
            }
          )
        } catch(err) {
          console.log(err);
        }
        socket.emit('vol21Admin', {
          'msgHeader':'connectionConfirm',
          'msgContent':'Admin kết nối thành công',
        });
      } else {
        socket.emit('vol21Admin', {
          'msgHeader':'cmdConfirm',
          'msgContent':data.cmd,
        });

        // Command received then process it
        adminCmd(socket,data.cmd);
      }

    } else {
      socket.emit('vol21Admin',{
        'msgHeader':'warning',
        'msgContent':'Key gửi lên server không hợp lệ',
      });
    }
  })

  // SysAdmin commands
  socket.on('vol21SysAdmin', async function(data){
    io2.sockets.emit('vol21SysAdmin',data);
    //console.log(data);
    if(data.key=='tungtungtung'){
      if(data.cmd.cmdHeader == 'query'){
        console.log('Admin connected');
        socket.emit('vol21Admin', {
          'msgHeader':'queryConfirm',
          'msgContent':data.cmd.cmdContent,
        });

        // Command received, then process it
        let result = await devController.sysAdminQuery(data.cmd.cmdContent);
        console.log(result);
        //console.log({'Command':data.cmd.cmdContent,'Results':result});
        sendPhongThan();
        sendDK();
        sendSL();
      } else {
        socket.emit('vol21Admin', {
          'msgHeader':'warning',
          'msgContent':'Lệnh của SysAdmin không hợp lệ (sai header)',
        });
      }

    } else {
      socket.emit('vol21Admin',{
        'msgHeader':'warning',
        'msgContent':'Key gửi lên server không hợp lệ',
      });
    }

  })

  // Canh bao
  socket.on('adminCanhbao', function(data){
    console.log('Admin canh bao: ', JSON.stringify(data));
    io2.sockets.emit('canhbao',data);
  });

});
global._io  =  io2;


// Old socket
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
                    `UPDATE dieukien SET _passed=true,_passed_time=$2 WHERE _ticker_id=$1;`,  // fixed on 2022-07-09: update _passed_time
                    [id, passed_time],(err,results)=>{
                      if(err) {
                        console.log('Error: ', err);
                      } else console.log(ticker,' updated in dieukien.');
                    }
                  );
                  // Push noti to api here

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
              );
              // Push noti to api here
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
                    `UPDATE catlo SET _sl=true,_sl_time=$2 WHERE _ticker_id=$1;`,  // fixed on 2022-07-09: update _sl_time
                    [id,sl_time],(err,results)=>{
                      if(err) {
                        console.log('Error: ', err);
                      } else console.log(ticker,' updated in catlo.');
                    }
                  );
                  // push noti

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
              );
              // push noti
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

// Socket send info
function sendPhongThan() {
  pool.query(
    `SELECT * FROM phongthan p
    INNER JOIN dieukien d ON p.id=d._ticker_id
    INNER JOIN catlo c ON p.id=c._ticker_id WHERE d._passed='false' AND c._sl='false' ORDER BY p._add_date DESC;`,
    (err,results) => {
      if(err) {
        console.log(err); // throw err;
      } else
      //console.log(results.rows);
      io2.sockets.emit('phongThan',results.rows);
    }
  )
}

function sendDK() {
  pool.query(
    `SELECT * FROM phongthan p INNER JOIN dieukien d ON p.id=d._ticker_id WHERE d._passed='true' ORDER BY d._passed_time DESC;`,
    (err,results) => {
      if(err) {
        console.log(err); // throw err;
      } else
      //console.log(results.rows);
      io2.sockets.emit('DK',results.rows);
    }
  )
}

function sendSL() {
  pool.query(
    `SELECT * FROM phongthan p INNER JOIN catlo c ON p.id=c._ticker_id WHERE c._sl='true' ORDER BY c._sl_time DESC;`,
    (err,results) => {
      if(err) {
        console.log(err); // throw err;
      } else
      //console.log(results.rows);
      io2.sockets.emit('SL',results.rows);
    }
  )
}

function adminCmd(socket,cmd) {
  console.log(cmd);
  // ADD TICKER
  if(cmd.cmdHeader == "addTicker") {
    let {ticker,price,vol,sl,form} = cmd.cmdContent;
    let p = 0,
        v = 0,
        s = 0,
        f = 0;
    let errors=[];
    if(!ticker) {
      errors.push({message: "Mã không được bỏ trống"});
    }
    if(price.length != 0) {
      if(isNaN(price)) {
        errors.push({message: "Giá điều kiện phải là số"});
      } else {
        if(parseFloat(price)<0) {
          errors.push({message: "Giá điều kiện phải lớn hơn hoặc bằng 0"});
        } else p = parseFloat(price);
      }
    }
    if(vol.length != 0) {
      if(isNaN(vol)) {
        errors.push({message: "Khối lượng điều kiện phải là số"});
      } else {
        if(parseFloat(vol)<0) {
          errors.push({message: "Khối lượng điều kiện phải lớn hơn hoặc bằng 0"});
        } else v = parseFloat(vol);
      }
    }
    if(sl.length != 0) {
      if(isNaN(sl)) {
        errors.push({message: "Giá cắt lỗ phải là số"});
      } else {
        if(parseFloat(sl)<0) {
          errors.push({message: "Giá cắt lỗ phải lớn hơn hoặc bằng 0"});
        } else s = parseFloat(sl);
      }
    }
    if(form.length != 0) {
      if(isNaN(form)) {
        errors.push({message: "Form phải là số"});
      } else {
        if(parseInt(form)<0) {
          errors.push({message: "Form phải lớn hơn hoặc bằng 0"});
        } else f = parseFloat(form);
      }
    }

    if (errors.length >0) {
      // IF error(s) in inputs
      socket.emit('vol21Admin', {
        'msgHeader':'cmdError',
        'msgContent':errors,
      });
    } else {
      // Insert new ticker to database
      //console.log(ticker,p,v,s,f);
      let dt = new Date();
      let add_date = dt.getFullYear() + '-' + addZero(dt.getMonth()+1) + '-' + addZero(dt.getDate());
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
        [ticker,add_date,f,p,v,s],
        (err,results) => {
          if(err) {
            console.log(err); // throw err;
          } else
          console.log(results.rows);

          // Insert completed, then broadcast new updated table
          sendPhongThan();
        }
      )
    }

  }

  // EDIT TICKER
  if(cmd.cmdHeader == "editTicker") {
    let {id,ticker,price,vol,sl,form} = cmd.cmdContent;
    let p = 0,
        v = 0,
        s = 0,
        f = 0;
    let i = parseInt(id);
    let errors=[];
    if(!ticker) {
      errors.push({message: "Mã không được bỏ trống"});
    }
    if(price.length != 0) {
      if(isNaN(price)) {
        errors.push({message: "Giá điều kiện phải là số"});
      } else {
        if(parseFloat(price)<0) {
          errors.push({message: "Giá điều kiện phải lớn hơn hoặc bằng 0"});
        } else p = parseFloat(price);
      }
    }
    if(vol.length != 0) {
      if(isNaN(vol)) {
        errors.push({message: "Khối lượng điều kiện phải là số"});
      } else {
        if(parseFloat(vol)<0) {
          errors.push({message: "Khối lượng điều kiện phải lớn hơn hoặc bằng 0"});
        } else v = parseFloat(vol);
      }
    }
    if(sl.length != 0) {
      if(isNaN(sl)) {
        errors.push({message: "Giá cắt lỗ phải là số"});
      } else {
        if(parseFloat(sl)<0) {
          errors.push({message: "Giá cắt lỗ phải lớn hơn hoặc bằng 0"});
        } else s = parseFloat(sl);
      }
    }
    if(form.length != 0) {
      if(isNaN(form)) {
        errors.push({message: "Form phải là số"});
      } else {
        if(parseInt(form)<0) {
          errors.push({message: "Form phải lớn hơn hoặc bằng 0"});
        } else f = parseFloat(form);
      }
    }

    if (errors.length >0) {
      // IF error(s) in inputs
      socket.emit('vol21Admin', {
        'msgHeader':'cmdError',
        'msgContent':errors,
      });
    } else {
      // update ticker to database
      //console.log(ticker,p,v,s,f);
      pool.query(
        `WITH edit_ticker AS(
          UPDATE phongthan SET _form=$3 WHERE id=$1 AND _ticker=$2
          RETURNING id
        ),
        edit_dieukien AS(
          UPDATE dieukien SET _dk_price=$4,_dk_vol=$5 WHERE _ticker_id=$1
        )
        UPDATE catlo SET _sl_price=$6 WHERE _ticker_id=$1;`,
        [i,ticker,f,p,v,s],
        (err,results) => {
          if(err) {
            console.log(err); // throw err;
          } else
          console.log(results.rows);

          // Insert completed, then broadcast new updated table
          sendPhongThan();
        }
      )
    }
  }

  // DELETE TICKER
  if(cmd.cmdHeader == "delTicker") {
    let {id,ticker} = cmd.cmdContent;
    let i = parseInt(id);
    let errors=[];
    if(!ticker) {
      errors.push({message: "Mã không được bỏ trống"});
    }

    if (errors.length >0) {
      // IF error(s) in inputs
      socket.emit('vol21Admin', {
        'msgHeader':'cmdError',
        'msgContent':errors,
      });
    } else {
      // Delete ticker from database
      //console.log(ticker);
      pool.query(
        `DELETE FROM phongthan WHERE id=$1 AND _ticker=$2;`,
        [i,ticker],
        (err,results) => {
          if(err) {
            console.log(err); // throw err;
          } else
          console.log(results.rows);

          // Insert completed, then broadcast new updated table
          sendPhongThan();
        }
      )
    }
  }
}
