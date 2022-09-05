const { pool } = require('../config/dbConfig');
const axios = require('axios');
let url = require('url');

const apiurl = 'http://sc.tintinsoft.online:4006';
const apptoken = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUVFNBUEkiLCJhcHBpZCI6MiwiY2xpZW50aWQiOjEsInBsYW5pZCI6Mn0.e-SzmLVwIcppvWokxnH8iw9wyIHWGt1UpRHvnvb6K-E";

let getVol21 = (req,res) => {
  let url_parts = url.parse(req.url, true);
  let query = url_parts.query;
  if("key" in query) {
    if(query["key"]=="tungdeptrai"){
      console.log("Command: ",query);
      res.json({err:0,errdesc:'Success'});
    } else {
      res.json({err:0,errdesc:'Wrong key'});
    }
  }
  else
    res.json({err:0,errdesc:'No key'});
}

let postVol21 = (req,res) => {
  let dt = new Date();
  let complete_date = dt.toLocaleString('vi-VN',{hour12:false,timeZone:'Asia/Ho_Chi_Minh'})
  let dtHour = dt.getHours();
  let dtMinute = dt.getMinutes();

  console.log(complete_date);

  if((dtHour==9 && dtMinute>14) || dtHour>9) {
    let url_parts = url.parse(req.url, true);
    let query = url_parts.query;
    if("key" in query) {
      if(query["key"]=="tungdeptrai"){
        console.log("Command: ",query);
        //res.json({err:0,errdesc:'Success'});
        pool.query(
          `SELECT d._ticker_id,p._ticker,d._dk_price,d._dk_vol,c._sl_price FROM phongthan p
          INNER JOIN dieukien d ON p.id=d._ticker_id
          INNER JOIN catlo c ON p.id=c._ticker_id
          WHERE d._passed='false' AND c._sl='false' AND p._ticker=$1 ORDER BY p._add_date DESC;`,
          [query.ticker], (err,results) => {
            if(err) {
              console.log(err); // throw err;
            } else {
              res.json({err:0,errdesc:'Success'});
              if(results.rows.length > 0) {
                console.log('Found: ',results.rows);
                for(var i = 0; i<results.rows.length; i++){
                  let found = results.rows[i];
                  if(query.ticker == found._ticker) {
                    console.log(found._ticker + " checking conditions...");
                    console.log(found._ticker + " checking price " + (parseFloat(query.price) >= found._dk_price));
                    if(parseFloat(query.price) >= found._dk_price && parseFloat(query.vol) >= found._dk_vol) {
                      // Meet condition
                      let dt = new Date();
                      let complete_date = dt.toLocaleString('vi-VN',{hour12:false,timeZone:'Asia/Ho_Chi_Minh'})
                      pool.query(
                        `UPDATE dieukien SET _passed=$2, _passed_time=$3 WHERE _ticker_id=$1;`,
                        [found._ticker_id,true,complete_date], (err,results) => {
                          if(err) {
                            console.log(err); // throw err;
                          } else
                          console.log(results.rows);


                          sendPhongThan();
                          sendDK();

                          apiPushConditionMatch();
                        }
                      )
                    }

                    if(parseFloat(query.price) < found._sl_price) {
                      // Stoploss

                      pool.query(
                        `UPDATE catlo SET _sl=$2, _sl_time=$3 WHERE _ticker_id=$1;`,
                        [found._ticker_id,true,complete_date], (err,results) => {
                          if(err) {
                            console.log(err); // throw err;
                          } else
                          console.log(results.rows);


                          sendPhongThan();
                          sendSL();

                          apiPushSL();
                        }
                      )
                    }

                  }
                }
              } else {
                res.json({err:0,errdesc:'Success',result:results.rows});
              }
            }
          });

          _io.sockets.emit("vol21",{
            'ticker':query.ticker,
            'dateTime':query.DateTime,
            'price':query.price,
            'percent':query.percent,
            'value':query.value,
            'vol':query.vol,
            'volDB':query.volDotBien
          });

      } else {
        res.json({err:1,errdesc:'Wrong key'});
      }
    } else
      res.json({err:1,errdesc:'No key'});
  } else {
    res.json({err:1,errdesc:'Not trading time'});
  }
}

function addZero(n) {
  if (n<10) return('0'+n);
  else return(''+n);
}

function apiPushConditionMatch() {
  // push api noti
  pool.query(
    `SELECT custoken FROM user_token LIMIT 1;`, (err,results) => {
      if(err) console.log(err);
      else {
        let cusToken = results.rows[0].custoken;
        let d = new Date();
        let requestID = "inflessPushConditionMatch"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

        const options = {
            headers: {
              "APPTOKEN": apptoken,
            },
          };
        let apidata = {
          "header": {
            "appToken": apptoken,
            "authUrl": "",
            "checksum": "",
            "custToken": cusToken,
            "requestID": requestID
          },
          "body": {
            "fundId": "1", // giá trị cố định
            "conditionmatchId": " id trong bang phong than",
            "datetime": "string",
            "price": "string",
            "ticker": "string",
            "vol": "string"
          }
        };

        axios.post(apiurl + '/api/global/vn/inflessweb/pushconditionmatch/v1', apidata, options)
        .then((res) => {
            console.log(res.data);
            _io.sockets.emit("apiResponse",{result:'apiSuccess',resultContent:res.data});
        }).catch((err) => {
            console.error(err);
            _io.sockets.emit("apiResponse",{result:'apiErr',resultContent:err.data});
        });
      }
    }
  )
}

function apiPushSL() {
  // push api noti
  pool.query(
    `SELECT custoken FROM user_token LIMIT 1;`, (err,results) => {
      if(err) console.log(err);
      else {
        let cusToken = results.rows[0].custoken;
        let d = new Date();
        let requestID = "inflessPushSL"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

        let options = {
            headers: {
              "APPTOKEN": apptoken,
            },
          };
        let apidata = {
          "header": {
            "appToken": apptoken,
            "authUrl": "",
            "checksum": "",
            "custToken": apptoken,
            "requestID": requestID
          },
          "body": {
            "fundId": "1", // giá trị cố định
            "datetime": "string",
            "price": "string",
            "slId": " id trong bang phong than ",
            "ticker": "string",
            "vol": "string"
          }
        };

        axios.post(apiurl + '/api/global/vn/inflessweb/pushconditionmatch/v1', apidata, options)
        .then((res) => {
            console.log(res.data);
            _io.sockets.emit("apiResponse",{result:'apiSuccess',resultContent:res.data});
        }).catch((err) => {
            console.error(err);
            _io.sockets.emit("apiResponse",{result:'apiErr',resultContent:err.data});
        });

      }
    }
  )
}

// Socket send info
function sendPhongThan() {
  pool.query(
    `SELECT * FROM phongthan p INNER JOIN dieukien d ON p.id=d._ticker_id INNER JOIN catlo c ON p.id=c._ticker_id WHERE d._passed='false' AND c._sl='false' ORDER BY p._add_date DESC;`,
    (err,results) => {
      if(err) {
        console.log(err); // throw err;
      } else
      //console.log(results.rows);
      _io.sockets.emit('phongThan',results.rows);
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
      _io.sockets.emit('DK',results.rows);
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
      _io.sockets.emit('SL',results.rows);
    }
  )
}


module.exports = {
  getVol21: postVol21,
  postVol21: postVol21,
}
