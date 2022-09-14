const fs = require('fs');
const { pool } = require('../config/dbConfig');
const { google } = require('googleapis');
const api = require('../controllers/apiController');

const auth = new google.auth.GoogleAuth({
  keyFile: './sample_query/fxanalysis.json',
  scopes: 'https://www.googleapis.com/auth/spreadsheets'
});

const fileIds = {
  au:'1RImBcO8calzmQi8AtbX5SApLPRakM1uXGroIImYeIjM',
  us:'1EBQzuO_E7aRQHjZB69V14Gcs_AIjA-uofERyDr_SyZw',
  jp:'1NU7WYgfBzGyKpH1MbH14oQc5tOGrTKo2XZzcel_2gCQ'
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
      try {
        let endoIndicators = JSON.parse(fs.readFileSync('./views/fx/usendo.json')); // edit this
        let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/fxMenu.json'));
        let countryName = 'Hoa Kỳ';  // edit this
        return res.render('fx/fxecon', {menu:menuData,user,endoIndicators,countryName});
      } catch(err) {
        console.log(err);
      }
    } else {
      return res.render('404');
    }
  } else {
    return res.redirect('/login');
  }
}

let getJPEcon = async (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      try {
        let endoIndicators = JSON.parse(fs.readFileSync('./views/fx/jpendo.json'));  // edit this
        let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/fxMenu.json'));
        let countryName = 'Nhật Bản';  // edit this
        return res.render('fx/fxecon', {menu:menuData,user,endoIndicators,countryName});
      } catch(err) {
        console.log(err);
      }
    } else {
      return res.render('404');
    }
  } else {
    return res.redirect('/login');
  }
}

let getAUEcon = async (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      try {
        let endoIndicators = JSON.parse(fs.readFileSync('./views/fx/auendo.json'));  // edit this
        let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/fxMenu.json'));
        let countryName = 'Australia';  // edit this
        return res.render('fx/fxecon', {menu:menuData,user,endoIndicators,countryName});
      } catch(err) {
        console.log(err);
      }
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
            if (source[i].length >= 9) indiInfo.url1 = source[i][8];
            if (source[i].length >= 10) indiInfo.url2 = source[i][9];
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

let apiGetIndicator = async (req,res) => {
  let reqIndi = req.query.code;
  let data = [];
  try {
    let country = reqIndi.split('-')[0];
    let indiCode = reqIndi.split('-')[1];
    // Get data
    let indiData = await getSheetData(fileIds[country],indiCode,'A:B');
    return res.json({reqId:req.query.reqId,err:0,errdesc:'Success',data:indiData});
  } catch(err) {
    console.log(err);
    return res.json({reqId:req.query.reqId,err:1,errdesc:'Failed',data:data});
  }
}

let updateIndicator = async (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      console.log(req.body);
      let reqIndi = req.body.indicatorCode;
      console.log('Writing: ', reqIndi);
      let country = reqIndi.split('-')[0];
      let indiCode = reqIndi.split('-')[1];
      if (req.body.action == 'input') {
        let indiData = await appendSheetData(fileIds[country],indiCode,'A:B',[req.body.date,req.body.val]);
        return res.json({err:0,errdesc:'Success',indiData});
      }
      if (req.body.action == 'edit' && user.role_id == 2) {
        let indiData = await updateSheetData(fileIds[country],indiCode,'A:B',[req.body.oldDate,req.body.oldVal,req.body.newDate,req.body.newVal]);
        return res.json({err:0,errdesc:'Success',indiData});
      }

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

async function appendSheetData(fileId,sheetName,range,val) {
  const sheets = google.sheets({version:"v4",auth:auth});
  const request = {
    spreadsheetId: fileId,
    range: sheetName + '!' + range,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      "majorDimension": "ROWS",
      "values": [[val[0],val[1]] /*, [nextRow col1, nextRow col2] */ ]
  },
    auth: auth,
  };

  try {
    const response = (await sheets.spreadsheets.values.append(request)).data;
    return JSON.stringify(response, null, 2);
  } catch (err) {
    return err;
  }
}

async function updateSheetData(fileId,sheetName,range,val) {
  const sheets = google.sheets({version:"v4",auth:auth});
  // Have to get the range address first
  let getVals = await getSheetData(fileId,sheetName,range);
  let foundRow = 0;
  for(var i=0; i<getVals.length; i++) {
    if (getVals[i][0] == val[0] && getVals[i][1] == val[1]) {
      foundRow = i + 1; // Excel row numbers start with 1
      break;
    }
  }
  //console.log(foundRow);
  // if found then update
  if (foundRow>1) {
    const request = {
      spreadsheetId: fileId,
      auth: auth,
      resource: {
         valueInputOption: "RAW",
         data: [{
            range: sheetName + "!A" + foundRow + ":B" + foundRow,
            values: [[val[2], val[3]]/*, [nextRow col1, nextRow col2]*/],
         }/*,
         {
            range: "Sheet1!H2:I",
            values: [["haha", "hehe"], ["huhu", "hichic"]],
         }*/
         ],

      },
    }
    try {
      const response = (await sheets.spreadsheets.values.batchUpdate(request)).data;
      return JSON.stringify(response, null, 2);
    } catch (err) {
      return err;
    }
  }
}

let fxTradesInquiry = (req,res) => {
  console.log(req.body);
  return res.status(200).send('OK');
}

module.exports = {
  getFxMain:getFxMain,
  getAUEcon:getAUEcon,
  getUSEcon:getUSEcon,
  getJPEcon:getJPEcon,
  getIndicator:getIndicator,
  apiGetIndicator:apiGetIndicator,
  updateIndicator:updateIndicator,
  fxTradesInquiry:fxTradesInquiry,
}
