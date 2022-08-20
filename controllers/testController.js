const fs = require('fs');
const { pool } = require('../config/dbConfig');
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './sample_query/sheetkey.json',
  scopes: 'https://www.googleapis.com/auth/spreadsheets'
});

let getTestPage = (req,res) => {
  return res.render('devtest');
}

let postTestPage = (req,res) => {
  return res.render('devtest');
}

async function getSheetData(sheetName,range) {
  // Create client instance for auth
  const client = await auth.getClient();
  // Instance of GG sheets api
  const googleSheets = google.sheets({version:"v4",auth:client});

  const spreadsheetId = '1BSXJVLWeoEZe0c1UnP58tAHXUbbWrobLLq0oTWv3xKg';

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
  getTestPage:getTestPage,
  postTestPage:postTestPage,
}

/*


*/
