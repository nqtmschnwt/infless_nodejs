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

// push l???nh m???i trong ng??y
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
      "fundId": "1",  // gi?? tr??? c??? ?????nh
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

// l???y nav client
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
      "data":"" // ????? chu???i r???ng
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

// l???y danh s??ch c??c l???nh mua b??n
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
      "from": "",// chu???i d???ng date DD/MM/YYYY
      "fund_nav": "",
      "id": "",
      "index": "gi?? tr??? id c???a giao d???ch cu???i c??ng trong l???n v???n tin tr?????c",
      "order": " 1 s???p x???p theo th??? t??? th???i gian c?? nh???t l??n ?????u, kh??c 1 theo th??? t??? th???i gian m???i nh???t l??n ?????u ",
      "order_direction": "",
      "order_time": "",
      "order_type": "",
      "pct": "",
      "price": "",
      "rownum": "s??? l?????ng b???n ghi t???i ??a cho 1 l???n query",
      "ticker": "",
      "to": "chu???i d???ng date DD/MM/YYYY",
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

// b???ng phong th???n
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
      "index": "gi?? tr??? id c???a giao d???ch cu???i c??ng trong l???n v???n tin tr?????c ",
      "order": "1", // 1 s???p x???p theo th??? t??? th???i gian c?? nh???t l??n ?????u, kh??c 1 theo th??? t??? th???i gian m???i nh???t l??n ?????u,
      "rownum": "s??? l?????ng b???n ghi t???i ??a cho 1 l???n query",
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

// noti ????? ??k
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
      "fundId": "1", // gi?? tr??? c??? ?????nh
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

// b???ng d??? ??k
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
      "index": " gi?? tr??? id c???a giao d???ch cu???i c??ng trong l???n v???n tin tr?????c ",
      "order": "1 s???p x???p theo th??? t??? th???i gian c?? nh???t l??n ?????u, kh??c 1 theo th??? t??? th???i gian m???i nh???t l??n ?????u ",
      "rownum": " s??? l?????ng b???n ghi t???i ??a cho 1 l???n query ",
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

// push c???t l???
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
      "fundId": "1", // gi?? tr??? c??? ?????nh
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

// b???ng c???t l???
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
      "index": " gi?? tr??? id c???a giao d???ch cu???i c??ng trong l???n v???n tin tr?????c ",
      "order": "1 s???p x???p theo th??? t??? th???i gian c?? nh???t l??n ?????u, kh??c 1 theo th??? t??? th???i gian m???i nh???t l??n ?????u ",
      "rownum": " s??? l?????ng b???n ghi t???i ??a cho 1 l???n query ",
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

module.exports = {
  verifyUser:verifyUser,
  getCusToken:getCusToken,
  pushTrans:pushTrans,
  pushAdmMsg:pushAdmMsg,
}

/*


*/
