const fs = require('fs');
const { pool } = require('../config/dbConfig');
const api = require('../controllers/apiController');

let getNewCustomers = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
      pool.query(
        `SELECT u.id,u.name,u.phone,u.email,r.ref_id FROM users u
        INNER JOIN active_users au ON u.id=au.user_id
        INNER JOIN ref_info r ON u.id=r.user_id
        WHERE au.active=$1`,
        [false],
        (err, results)=>{
          if(err){
            throw err;
          }
          //console.log(results.rows);
          return res.render('newCustomers', {menu:menuData,user,data:results.rows});
        }
      )

    } else {
      return res.redirect('/home');
    }
  } else {
    return res.redirect('/login');
  }
}

let postNewCustomers = async (req,res) => {
  console.log(req.body);
  let expTime = "";
  let surName = "";
  let cusToken = "";
  let email = "";
  let phone = "";

  if(req.body.action == 'acceptCustomer') {
    pool.query(
      `WITH new_active AS (
        UPDATE active_users SET active='true'
        WHERE user_id=$1
        RETURNING user_id
      ),
      new_expiry AS (
        INSERT INTO expiry(user_id,expire_date)
        VALUES ((SELECT user_id FROM new_active),$2)
      ),
      new_role AS (
        UPDATE user_role SET role_id=1
        WHERE user_id=(SELECT user_id FROM new_active)
      ),
      new_nav AS (
        INSERT INTO user_nav(user_id,nav_date,total_nav)
        VALUES((SELECT user_id FROM new_active),$3,0)
      )
      INSERT INTO user_services(user_id,copytrade)
      VALUES ((SELECT user_id FROM new_active),'true');`,
      [parseInt(req.body.id), addDays(parseInt(req.body.expiry)),addDays(0)],
      (err, results) => {
        if(err){
          console.log(err);
        }
        console.log(`User activated ${req.body.id}`);
        // Get that user
        pool.query(
          `SELECT u.id,u.name,u.phone,u.email,ex.expire_date FROM users u
          INNER JOIN expiry ex ON u.id = ex.user_id
          WHERE u.id=$1;`, [parseInt(req.body.id)],
          (err,results) => {
            if(err) {
              console.log(err);
            } else {
              // call api
              let user = results.rows[0];
              let ed = new Date(user.expire_date);
              expTime = ed.getFullYear() + addZero(ed.getMonth()+1) + addZero(ed.getDate());
              surName = user.name.split(' ')[0];
              email = user.email;
              phone = user.phone;
              pool.query(
                `SELECT * FROM user_token WHERE user_id=$1;`, [req.user.id], (err,results) => {
                  if(err) console.log(err);
                  else {
                    cusToken = results.rows[0].custoken;
                    apiCreateUser(cusToken,email,expTime,phone,"",surName)
                  }
                }
              )
            }
          }
        )
      }
    )

  } else if (req.body.action == 'declineCustomer') {
    console.log()
    pool.query(
      `WITH del_user AS (
        DELETE FROM users WHERE id=$1
      ),
      del_ref AS (
        DELETE FROM ref_info WHERE user_id=$1
      ),
      del_active AS (
        DELETE FROM active_users WHERE user_id=$1
      )
      DELETE FROM user_role WHERE user_id=$1;`,
      [parseInt(req.body.id)],
      (err,results)=>{
        if(err){
          throw err;
        }
        console.log(`User deleted  ${req.body.id}`);
        //return res.redirect('/new-customers');
      }
    )
  }


  return res.redirect('/new-customers');
}

async function apiCreateUser(cusToken,email,expTime,phone,role,surName) {
  console.log("New value:",cusToken,email,expTime,phone,"",surName);
  let apiCall = await api.createUser(cusToken,email,expTime,phone,"",surName);
  console.log('Create user result: ', apiCall);
}

function addDays(days) {
  var result = new Date();
  result.setDate(result.getDate() + days);
  return result;
}

function addZero(n) {
  if (n<10) return('0'+n);
  else return(''+n);
}

module.exports = {
  getNewCustomers:getNewCustomers,
  postNewCustomers:postNewCustomers
}
