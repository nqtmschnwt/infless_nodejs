const fetch = require('node-fetch');

let getTestPage = (req,res) => {
  //testFunc();
  return res.render('devtest');
}

function testFunc() {
  const getCustomerTokenBody = {
    authToken: 'Firebase token here',
    channel: "FireBase",
    otp: "",
    password: "",
    transID: "",
    username: ""
  };

  //POST request with body equal on data in JSON format
  fetch('http://sc.tintinsoft.online:4006/webserver/verifyuser/v1', {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "appToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUVFNBUEkiLCJhcHBpZCI6MiwiY2xpZW50aWQiOjEsInBsYW5pZCI6Mn0.e-SzmLVwIcppvWokxnH8iw9wyIHWGt1UpRHvnvb6K-E",
      "authUrl": "",
      "checksum": "",
      "custToken": "",
      "requestID": "",
    },
    body: JSON.stringify(getCustomerTokenBody),
  })
  .then((response) => response.json())
  //Then with the data from the response in JSON...
  .then((data) => {
    console.log('Success:', data);
  })
  //Then with the error genereted...
  .catch((error) => {
    console.error('Error:', error);
  });
}

module.exports = {
  getTestPage:getTestPage,
}
