const fs = require('fs');
const { pool } = require('../config/dbConfig');
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './sample_query/sheetkey.json',
  scopes: 'https://www.googleapis.com/auth/spreadsheets'
});

let getTestPage = async (req,res) => {
  let vnindex = await getSheetData('vnindex','A:B');
  let prices = await getSheetData('Price','A:C');
  let dividend = await getSheetData('dividend','A:E');
  let data = {
    prices: prices,
    vnindex: vnindex,
    dividend: dividend
  }
  pool.query(
    `SELECT * FROM trade_orders ORDER BY id ASC;`, (err,results) => {
      if(err) console.log(err);
      else {
        data.trades = results.rows;
        let currentdate = new Date();
        let last6months = new Date(currentdate.setMonth(currentdate.getMonth()-6));
        let dformat6 = [last6months.getFullYear(),last6months.getMonth()+1,last6months.getDate()].join('-');
        pool.query(
          `SELECT upf.portfolio_date, upf.latest, upf.net_value FROM user_portfolio upf
          INNER JOIN portfolios pf
          ON upf.portfolio_id = pf.portfolio_id
          WHERE pf.user_id=0 AND upf.portfolio_date>$1
          ORDER BY upf.portfolio_date ASC;`,
          [dformat6],
          (err,results) => {
            if(err) console.log(err);
            else {
              data.pfRecords = results.rows;
              let custoken = '';
              pool.query(
                `SELECT custoken FROM user_token WHERE user_id=$1;`,[user.id],(err,results) => {
                  if(err) console.log(err);
                  else {
                    if(results.rows.length!=0) {
                      custoken = results.rows[0].custoken;
                    }

                    let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
                    return res.render('devtest', data);
                  }
                }
              )

            }
          });
      }
    })
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
