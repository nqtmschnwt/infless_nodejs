const fetch = require('node-fetch');

let getTestPage = (req,res) => {
  //testFunc();
  let authToken = req.body.authToken;
  console.log("get");
  //console.log(authToken);
  return res.render('devtest',{authToken:"none"});
}

let postTestPage = (req,res) => {
  //testFunc();
  let authToken = req.body.authToken;
  //console.log(authToken);
  testFunc(authToken);
  //return res.render('devtest',{authToken:authToken});
  return res.send({
        status: 200,
        message: "Done",
      });
}

function addZero(n) {
  if (n<10) return('0'+n);
  else return(''+n);
}

function testFunc(authToken) {
  let d = new Date();
  let requestID = "inflessVerifyUser"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

  let getAuthCodeBody = {
    "header": {
      "appToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUVFNBUEkiLCJhcHBpZCI6MiwiY2xpZW50aWQiOjEsInBsYW5pZCI6Mn0.e-SzmLVwIcppvWokxnH8iw9wyIHWGt1UpRHvnvb6K-E",
      "authUrl": "",
      "checksum": "",
      "custToken": "",
      "requestID": requestID
    },
    "body": {
      "authToken": authToken,
      "channel": "FireBase",
      "otp": "",
      "password": "",
      "transID": "",
      "username": ""
    }
  };

  console.log(getAuthCodeBody);

  //POST request with body equal on data in JSON format
  fetch('http://sc.tintinsoft.online:4006/webserver/verifyuser/v1', {
    method: 'POST',
    headers: {
      "APPTOKEN": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUVFNBUEkiLCJhcHBpZCI6MiwiY2xpZW50aWQiOjEsInBsYW5pZCI6Mn0.e-SzmLVwIcppvWokxnH8iw9wyIHWGt1UpRHvnvb6K-E",
    },
    body: JSON.stringify(getAuthCodeBody),
  })
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.log(err));
}

module.exports = {
  getTestPage:getTestPage,
  postTestPage:postTestPage,
}

/*
Inflessweb gọi api
/webserver/verifyuser/v1
Request:
HTTP Header
APPTOKEN: eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUVFNBUEkiLCJhcHBpZCI6MiwiY2xpZW50aWQiOjEsInBsYW5pZCI6Mn0.e-SzmLVwIcppvWokxnH8iw9wyIHWGt1UpRHvnvb6K-E - giá trị cố định cần truyền khi gọi API này
HTTP Body(Payload)
{
  "header": {
    "appToken": " eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUVFNBUEkiLCJhcHBpZCI6MiwiY2xpZW50aWQiOjEsInBsYW5pZCI6Mn0.e-SzmLVwIcppvWokxnH8iw9wyIHWGt1UpRHvnvb6K-E "- giống giá trị trong APPTOKEN ở HTTP Header,
    "authUrl": "",
    "checksum": "",
    "custToken": "",
    "requestID": web tự sinh
  },
  "body": {
    "authToken": firebase token do firebase sdk trả cho web,
    "channel": "FireBase"-giá trị cố định cần truyền khi gọi API này,
    "otp": "",
    "password": "",
    "transID": "",
    "username": ""
  }
}

*/
