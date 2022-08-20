const fetch = require('node-fetch');

const url = 'http://sc.tintinsoft.online:4006';
const apptoken = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUVFNBUEkiLCJhcHBpZCI6MiwiY2xpZW50aWQiOjEsInBsYW5pZCI6Mn0.e-SzmLVwIcppvWokxnH8iw9wyIHWGt1UpRHvnvb6K-E";

/*let getTestPage = (req,res) => {
  //testFunc();
  let idToken = req.body.idToken;
  console.log("get");
  //console.log(authToken);
  return res.render('devtest',{idToken:"none"});
}

let postTestPage = async (req,res) => {
  let idToken = req.body.idToken;
  let verifyResults = await verifyUser(idToken);
  let authCode = verifyResults.body.authCode;
  let authCodeResults = await getCusToken(authCode);
  let cusToken = authCodeResults.body.custoken;

  // test send msg
  let admPushMsgResults = await pushAdmMsg(cusToken);
  let admPushMsgErr = admPushMsgResults.header.errorcode;
  var pushMsgErrDesc;
  if(admPushMsgErr==0) {
    pushMsgErrDesc = 'Success';
  } else {
    pushMsgErrDesc = 'Error #' + admPushMsgErr + ': ' + admPushMsgResults.header.errordesc;
  }

  return res.send({
        status: 200,
        message: "Done",
        cusToken: cusToken,
        pushMsg: pushMsgErrDesc
      });
}*/

function addZero(n) {
  if (n<10) return('0'+n);
  else return(''+n);
}

//========== API functions ===========
function verifyUser(idToken) {
  let d = new Date();
  let requestID = "inflessVerifyUser"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

  let apiBody = {
    "header": {
      "appToken": apptoken,
      "authUrl": "",
      "checksum": "",
      "custToken": "",
      "requestID": requestID
    },
    "body": {
      "authToken": idToken,
      "channel": "FireBase",
      "otp": "",
      "password": "",
      "transID": "",
      "username": ""
    }
  };

  return fetch(url + '/webserver/verifyuser/v1', {
    method: 'POST',
    headers: {
      "APPTOKEN": apptoken,
    },
    body: JSON.stringify(apiBody),
  })
  .then(res => res.json());
}

function getCusToken(authCode) {
  let d = new Date();
  let requestID = "inflessCusToken"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

  let apiBody = {
    "header": {
      "appToken": apptoken,
      "authUrl": "",
      "checksum": "",
      "custToken": "",
      "requestID": requestID
    },
    "body": {
      "authCode": authCode,
      "requestAuthCodeID": ""
    }
  };

  return fetch(url + '/api/global/vn/fundmntsystem/getcustoken/v1', {
    method: 'POST',
    headers: {
      "APPTOKEN": apptoken,
    },
    body: JSON.stringify(apiBody),
  })
  .then(res => res.json());
}

// push lệnh mới trong ngày
function pushTrans(cusToken,fundNav,orderDirection,orderType,pct,price,ticker,vol) {
  let d = new Date();
  let requestID = "inflessPushTrans"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

  let apiBody = {
    "header": {
      "appToken": apptoken,
      "authUrl": "",
      "checksum": "",
      "custToken": cusToken,
      "requestID": requestID
    },
    "body": {
      "fundId": "1",  // giá trị cố định
      "fundNav": fundNav,
      "orderDirection": orderDirection,
      "orderTime": ""  + d.getFullYear() + "-" + addZero(d.getMonth()+1) + "-" + addZero(d.getDate()) + addZero(d.getHours()) + ":" + addZero(d.getMinutes()) + ":" + addZero(d.getSeconds()),
      "orderType": orderType,
      "pct": pct,
      "price": price,
      "ticker": ticker,
      "transId": ""  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds()),
      "vol": vol
    }
  };

  return fetch(url + '/api/global/vn/inflessweb/pushtrans/v1', {
    method: 'POST',
    headers: {
      "APPTOKEN": apptoken,
    },
    body: JSON.stringify(apiBody),
  })
  .then(res => res.json());
}

// lấy nav client
function inquiryNav(cusToken) {
  let d = new Date();
  let requestID = "inflessInquiryNav"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

  let apiBody = {
    "header": {
      "appToken": apptoken,
      "authUrl": "",
      "checksum": "",
      "custToken": cusToken,
      "requestID": requestID
    },
    "body": {
      "data":"" // để chuỗi rỗng
    }
  };

  return fetch(url + '/api/global/vn/inflessweb/inquiryclient/v1', {
    method: 'POST',
    headers: {
      "APPTOKEN": apptoken,
    },
    body: JSON.stringify(apiBody),
  })
  .then(res => res.json());
}

// lấy danh sách các lệnh mua bán
function inquiryTrades(cusToken) {
  let d = new Date();
  let requestID = "inflessInquiryTrades"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

  let apiBody = {
    "header": {
      "appToken": apptoken,
      "authUrl": "",
      "checksum": "",
      "custToken": cusToken,
      "requestID": requestID
    },
    "body": {
      "from": "",// chuỗi dạng date DD/MM/YYYY
      "fund_nav": "",
      "id": "",
      "index": "giá trị id của giao dịch cuối cùng trong lần vấn tin trước",
      "order": " 1 sắp xếp theo thứ tự thời gian cũ nhất lên đầu, khác 1 theo thứ tự thời gian mới nhất lên đầu ",
      "order_direction": "",
      "order_time": "",
      "order_type": "",
      "pct": "",
      "price": "",
      "rownum": "số lượng bản ghi tối đa cho 1 lần query",
      "ticker": "",
      "to": "chuỗi dạng date DD/MM/YYYY",
      "vol": ""
    }
  };

  return fetch(url + '/api/global/vn/inflessweb/inquirytrans/v1', {
    method: 'POST',
    headers: {
      "APPTOKEN": apptoken,
    },
    body: JSON.stringify(apiBody),
  })
  .then(res => res.json());
}

// bảng phong thần
function inquiryConditions(cusToken) {
  let d = new Date();
  let requestID = "inflessInquiryConditions"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

  let apiBody = {
    "header": {
      "appToken": apptoken,
      "authUrl": "",
      "checksum": "",
      "custToken": cusToken,
      "requestID": requestID
    },
    "body": {
      "addTime": "",
      "from": "",
      "index": "giá trị id của giao dịch cuối cùng trong lần vấn tin trước ",
      "order": "1", // 1 sắp xếp theo thứ tự thời gian cũ nhất lên đầu, khác 1 theo thứ tự thời gian mới nhất lên đầu,
      "rownum": "số lượng bản ghi tối đa cho 1 lần query",
      "ticker": "",
      "to": ""
    }
  };

  return fetch(url + '/api/global/vn/inflessweb/inquirycondition/v1', {
    method: 'POST',
    headers: {
      "APPTOKEN": apptoken,
    },
    body: JSON.stringify(apiBody),
  })
  .then(res => res.json());
}

// noti đủ đk
function pushConditionMatch(cusToken) {
  let d = new Date();
  let requestID = "inflessPushConditionMatch"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

  let apiBody = {
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

  return fetch(url + '/api/global/vn/inflessweb/pushconditionmatch/v1', {
    method: 'POST',
    headers: {
      "APPTOKEN": apptoken,
    },
    body: JSON.stringify(apiBody),
  })
  .then(res => res.json());
}

// bảng dủ đk
function inquiryConditionMatch(cusToken) {
  let d = new Date();
  let requestID = "inflessInquiryConditionMatch"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

  let apiBody = {
    "header": {
      "appToken": apptoken,
      "authUrl": "",
      "checksum": "",
      "custToken": cusToken,
      "requestID": requestID
    },
    "body": {
      "addTime": "",
      "from": "",
      "index": " giá trị id của giao dịch cuối cùng trong lần vấn tin trước ",
      "order": "1 sắp xếp theo thứ tự thời gian cũ nhất lên đầu, khác 1 theo thứ tự thời gian mới nhất lên đầu ",
      "rownum": " số lượng bản ghi tối đa cho 1 lần query ",
      "passTime": "",
      "ticker": "",
      "to": ""
    }
  };

  return fetch(url + '/api/global/vn/inflessweb/inquiryconditionmatch/v1', {
    method: 'POST',
    headers: {
      "APPTOKEN": apptoken,
    },
    body: JSON.stringify(apiBody),
  })
  .then(res => res.json());
}

// push cắt lỗ
function pushSL(cusToken) {
  let d = new Date();
  let requestID = "inflessPushSL"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

  let apiBody = {
    "header": {
      "appToken": apptoken,
      "authUrl": "",
      "checksum": "",
      "custToken": cusToken,
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

  return fetch(url + '/api/global/vn/inflessweb/pushconditionsl/v1', {
    method: 'POST',
    headers: {
      "APPTOKEN": apptoken,
    },
    body: JSON.stringify(apiBody),
  })
  .then(res => res.json());
}

// bảng cắt lỗ
function inquirySL(cusToken) {
  let d = new Date();
  let requestID = "inflessInquirySL"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

  let apiBody = {
    "header": {
      "appToken": apptoken,
      "authUrl": "",
      "checksum": "",
      "custToken": cusToken,
      "requestID": requestID
    },
    "body": {
      "slTime": "",
      "addTime": "",
      "from": "",
      "index": " giá trị id của giao dịch cuối cùng trong lần vấn tin trước ",
      "order": "1 sắp xếp theo thứ tự thời gian cũ nhất lên đầu, khác 1 theo thứ tự thời gian mới nhất lên đầu ",
      "rownum": " số lượng bản ghi tối đa cho 1 lần query ",
      "passTime": "",
      "ticker": "",
      "to": ""
    }
  };

  return fetch(url + '/api/global/vn/inflessweb/inquiryconditionsl/v1', {
    method: 'POST',
    headers: {
      "APPTOKEN": apptoken,
    },
    body: JSON.stringify(apiBody),
  })
  .then(res => res.json());
}

// push admin msg
function pushAdmMsg(cusToken,cn,c1,c2,c3,c4,c5,speed,show,msg) {
  let d = new Date();
  let admMsgRequestID = "inflessPushAdmMsg"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

  let apiBody = {
    "header": {
      "appToken": apptoken,
      "authUrl": "",
      "checksum": "",
      "custToken": cusToken,
      "requestID": admMsgRequestID
    },
    "body": {
      "color1": c1,
      "color2": c2,
      "color3": c3,
      "color4": c4,
      "color5": c5,
      "colorNum": cn,
      "fundId": 1,
      "speed": speed,
      "warningId": ""  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds()), //"1",
      "warningMsg": msg,
      "warningShow": show,
      "warningTime": d.getFullYear() + "-" + addZero(d.getMonth()+1) + "-" + addZero(d.getDate())  + " " + addZero(d.getHours())  + ":"  + addZero(d.getMinutes())  + ":"  + addZero(d.getSeconds())
    }
  };
  //console.log(apiBody);

  return fetch(url + '/api/global/vn/inflessweb/pushadminmsg/v1', {
    method: 'POST',
    headers: {
      "APPTOKEN": apptoken,
    },
    body: JSON.stringify(apiBody),
  })
  .then(res => res.json());
}

// inquiry admin msg
function inquiryAdmMsg(cusToken) {
  let d = new Date();
  let admMsgRequestID = "inflessInquiryAdmMsg"  + d.getFullYear() + addZero(d.getMonth()+1) + addZero(d.getDate()) + addZero(d.getHours()) + addZero(d.getMinutes()) + addZero(d.getSeconds());

  let apiBody = {
    "header": {
      "appToken": apptoken,
      "authUrl": "",
      "checksum": "",
      "custToken": cusToken,
      "requestID": admMsgRequestID
    },
    "body": {
      "warningId": "string"
    }
  };

  return fetch(url + '/api/global/vn/inflessweb/pushadminmsg/v1', {
    method: 'POST',
    headers: {
      "APPTOKEN": apptoken,
    },
    body: JSON.stringify(apiBody),
  })
  .then(res => res.json());
}

let externalRegister = (req,res) => {
  console.log(req.body);
}

let externalLogin = (req,res) => {
  console.log(req.body);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({
    error: '0',
    errdesc: 'Login success'
  }));
  // Errors including:
  /*
  {
    wrong username
    wrong password
  }
  */
}

module.exports = {
  externalRegister:externalRegister,
  externalLogin:externalLogin,
  verifyUser:verifyUser,
  getCusToken:getCusToken,
  pushTrans:pushTrans,
  pushAdmMsg:pushAdmMsg,
}

/*


*/
