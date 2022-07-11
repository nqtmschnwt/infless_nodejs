// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA55RLyd-DL6oF50Ijb6f8TY5ev9LcnV-A",
  authDomain: "fundmntsystem.firebaseapp.com",
  projectId: "fundmntsystem",
  storageBucket: "fundmntsystem.appspot.com",
  messagingSenderId: "907222202776",
  appId: "1:907222202776:web:5c7cf5d2e49f6c7e1393ed"
};


firebase.initializeApp(firebaseConfig);

// Google provider
var provider = new firebase.auth.GoogleAuthProvider();

document.onload = function() {
  firebase.auth().signInWithRedirect(provider);
};

// Sign in from redirect
firebase.auth()
  .getRedirectResult()
  .then((result) => {
    if (result.credential) {
      //** @type {firebase.auth.OAuthCredential}
      var credential = result.credential;

      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = credential.accessToken;
      // ...
      console.log('Success!!! ');
      console.log('===================');
    }

    let currentUser = firebase.auth().currentUser;
    if(currentUser == undefined) console.log('undefined user');
    else {
      console.log(currentUser.email);

      currentUser.getIdToken().then(function(idToken) {
        console.log(idToken);
        //document.getElementById('idToken').innerHTML = idToken;
        let data = {idToken: idToken};

        fetch("/addcustoken", {
          method: "POST",
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data)
        }).then(res => res.json())
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        });
      });
    }


  }).catch((error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
    console.log('ERROR: ', errorCode, errorMessage);
  });
