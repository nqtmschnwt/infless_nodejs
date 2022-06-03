const fetch = require('node-fetch');

let getTestPage = (req,res) => {
  //testFunc();
  let authToken = req.body.authToken;
  console.log("get");
  console.log(authToken);
  return res.render('devtest',{authToken:"none"});
}

let postTestPage = (req,res) => {
  //testFunc();
  let authToken = req.body.authToken;
  console.log(authToken);
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
    header: {
      appToken: "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUVFNBUEkiLCJhcHBpZCI6MiwiY2xpZW50aWQiOjEsInBsYW5pZCI6Mn0.e-SzmLVwIcppvWokxnH8iw9wyIHWGt1UpRHvnvb6K-E",
      authUrl: "",
      checksum: "",
      custToken: "",
      requestID: requestID
    },
    body: {
      authToken: authToken,
      channel: "FireBase",
      otp: "",
      password: "",
      transID: "",
      username: ""
    }
  };

  console.log(getAuthCodeBody);

  //POST request with body equal on data in JSON format
  fetch('http://sc.tintinsoft.online:4006/webserver/verifyuser/v1', {
    method: 'POST',
    headers: {
      "appToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUVFNBUEkiLCJhcHBpZCI6MiwiY2xpZW50aWQiOjEsInBsYW5pZCI6Mn0.e-SzmLVwIcppvWokxnH8iw9wyIHWGt1UpRHvnvb6K-E",
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
Inflessweb gọi API:
/api /global/vn/inflessweb/pushadminmsg/v1
Request:
HTTP Header
APPTOKEN: eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUVFNBUEkiLCJhcHBpZCI6MiwiY2xpZW50aWQiOjEsInBsYW5pZCI6Mn0.e-SzmLVwIcppvWokxnH8iw9wyIHWGt1UpRHvnvb6K-E - giá trị cố định cần truyền khi gọi API này
HTTP Body(Payload)
{
  "header": {
"appToken": " eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUVFNBUEkiLCJhcHBpZCI6MiwiY2xpZW50aWQiOjEsInBsYW5pZCI6Mn0.e-SzmLVwIcppvWokxnH8iw9wyIHWGt1UpRHvnvb6K-E "- giống giá trị trong APPTOKEN ở HTTP Header,
    "authUrl": "",
    "checksum": "",
    "custToken": lấy từ api lấy customer token
    "requestID": web tự sinh
  },
"body": {
    "color1": "string",
    "color2": "string",
    "color3": "string",
    "color4": "string",
    "color5": "string",
    "colorNum": "string",
    "fundId": 1,  giá trị cố định cần truyền khi gọi API này,
    "speed": "string",
    "warningId": "string",
    "warningMsg": "string",
    "warningShow": "string",
    "warningTime": "string"
  }}
Response: HTTP 200
HTTP Response Body
{
  "header": {
    "errorcode": khác 0 là  mã lỗi,
    "errordesc": mô tả lỗi ,
    "requestID": requestID trong request
  },
"body": {
    "data": "" không sử dụng
  }}
*/
