const fs = require('fs');
const { pool } = require('../config/dbConfig');
const { google } = require('googleapis');
const api = require('../controllers/apiController');

const auth = new google.auth.GoogleAuth({
  keyFile: './sample_query/fxanalysis.json',
  scopes: 'https://www.googleapis.com/auth/spreadsheets'
});

const fileIds = {
  us:'1EBQzuO_E7aRQHjZB69V14Gcs_AIjA-uofERyDr_SyZw'
};

let getFxMain = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/fxMenu.json'));
      return res.render('fx/fxmain', {menu:menuData,user});
    } else {
      return res.render('404');
    }
  } else {
    return res.redirect('/login');
  }
}

let getUSEcon = async (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      //let source = await getSheetData(fileId_US,'source','A:J');
      //console.log(source);
      let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/fxMenu.json'));
      return res.render('fx/fxecon', {menu:menuData,user,/*source*/});
    } else {
      return res.render('404');
    }
  } else {
    return res.redirect('/login');
  }
}

let getIndicator = async (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      let reqIndi = req.body.indicatorCode;
      console.log('Requesting: ', reqIndi);
      let country = reqIndi.split('-')[0];
      let indiCode = reqIndi.split('-')[1];
      console.log(fileIds[country]);
      let source = await getSheetData(fileIds[country],'source','A:J');
      //console.log(source);

      // Get general information
      let indiInfo = {
        code: indiCode.toUpperCase(),
        name: '',
        freq: '',
        releaseTime: '',
        url0: '',
        url1: '',
        url2: ''
      };
      try {
        for (var i=0; i<source.length; i++) {
          if (source[i][4] == indiInfo.code) {
            indiInfo.name = source[i][2];
            indiInfo.freq = source[i][5];
            indiInfo.releaseTime = source[i][6];
            indiInfo.url0 = source[i][7];
            if (source.lenth >= 9) indiInfo.url1 = source[i][8];
            if (source.lenth >= 10) indiInfo.url1 = source[i][9];
          }
        }
      } catch(err) {
        console.log(err);
      }

      // Get data
      let indiData = await getSheetData(fileIds[country],indiCode,'A:B');

      return res.json({err:0,errdesc:'Get indicator success',indiInfo,indiData});
    } else {
      return res.json({err:1,errdesc:'Access denied'});
    }
  } else {
    return res.json({err:1,errdesc:'Access denied'});
  }
}

async function getSheetData(fileId,sheetName,range) {
  // Create client instance for auth
  const client = await auth.getClient();
  // Instance of GG sheets api
  const googleSheets = google.sheets({version:"v4",auth:client});

  let spreadsheetId = fileId;

  // Get metadata about spreadsheets
  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId
  })
  // Read rows from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: sheetName + "!" + range
  });
  return getRows.data.values;
}

module.exports = {
  getFxMain:getFxMain,
  getUSEcon:getUSEcon,
  getIndicator:getIndicator,
}
