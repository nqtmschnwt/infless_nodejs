const fs = require('fs');
const { pool } = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const phoneNumber = require( 'awesome-phonenumber' );
const api = require('../controllers/apiController');

let getFindCustomers = (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
      let query = {
        name:"",
        phone:"",
        email:"",
        ref:"",
        status:""
      }
      return res.render('findCustomers', {menu:menuData,user,data:[],query});
    } else {
      return res.redirect('/home');
    }
  } else {
    return res.redirect('/login');
  }
}

let postFindCustomers = async (req,res) => {
  let user=req.user;
  if(user!=undefined){
    if(user.role_id==2 || user.role_id==3)
    {
      let roleSearch=1;
      if(user.role_id==2)
        roleSearch = 3;
      let menuData = JSON.parse(fs.readFileSync('./views/menus/menuData/managerMenu.json'));
      let query = {
        name:"",
        phone:"",
        email:"",
        ref:"",
        status:""
      }
      if(req.body.find){
        //console.log(req.body);
        let name = req.body.name;
        let phone = req.body.phone;
        let email = req.body.email;
        let ref = req.body.ref;
        let status = req.body.status;

        query.name = name;
        query.phone = phone;
        query.email = email;
        query.ref = ref;
        query.status = status;
        let conditions=[];
        //...
        if(!name && !phone && !email && !ref && status=='false'){
          // All fields are empty
          pool.query(
            `SELECT u.id,u.name,u.phone,u.email,r.ref_id,e.expire_date,us.copytrade,us.phongthan,us.ddk,us.sl,us.personal_sltp,nav.total_nav FROM users u
            INNER JOIN ref_info r ON u.id=r.user_id
            INNER JOIN expiry e ON u.id=e.user_id
            INNER JOIN user_services us on u.id=us.user_id
            INNER JOIN user_role ur on u.id=ur.user_id
            INNER JOIN (SELECT DISTINCT ON (n.user_id) n.user_id,n.total_nav FROM user_nav n JOIN users u on u.id=n.user_id ORDER BY n.user_id DESC ) nav ON u.id = nav.user_id
            WHERE ur.role_id<=$1 OR u.id=$2
            ORDER BY u.id ASC`,
            [roleSearch,user.id],
            (err,results) => {
              if(err) {
                throw err;
              }
              let data = results.rows;
              return res.render('findCustomers', {menu:menuData,user,data:data,query});
            }
          )
        } else {
          // Any field having value
          var d,dt;
          if(status=='true') {d=new Date();dt=d.toISOString().split('T')[0]}
          else dt = '3000-12-31';

          let refSearch = ref;
          if(ref!=''){
            var refNumber = new phoneNumber(ref,'VN');
            if(refNumber.isValid( ) && refNumber.isMobile( ) && refNumber.canBeInternationallyDialled( ))  refSearch = refNumber.getNumber( 'e164' ).replace('+','');
          }

          // Check phone valid
          let phoneFormatted = '';
          if(phone!=''){
            var pn = new phoneNumber(phone,'VN');
            if(pn.isValid( ) && pn.isMobile( ) && pn.canBeInternationallyDialled( ))  phoneFormatted = pn.getNumber( 'e164' );
          }

          pool.query(
            `SELECT u.id,u.name,u.phone,u.email,r.ref_id,e.expire_date,us.copytrade,us.phongthan,us.ddk,us.sl,us.personal_sltp,nav.total_nav FROM users u
            INNER JOIN ref_info r ON u.id=r.user_id
            INNER JOIN expiry e ON u.id=e.user_id
            INNER JOIN user_services us on u.id=us.user_id
            INNER JOIN user_role ur on u.id=ur.user_id
            INNER JOIN (SELECT DISTINCT ON (n.user_id) n.user_id,n.total_nav FROM user_nav n JOIN users u on u.id=n.user_id ORDER BY n.user_id DESC ) nav ON u.id = nav.user_id
            WHERE ur.role_id<=$6 AND u.name LIKE $1 AND u.phone LIKE $2 AND u.email LIKE $3 AND r.ref_id LIKE $4 AND e.expire_date<=$5
            ORDER BY u.id ASC`,
            ['%'+name+'%','%'+phoneFormatted+'%','%'+email+'%','%'+refSearch+'%',dt,roleSearch], (err,results)=>{
              if(err) {
                throw err;
              }
              let data = results.rows;
              return res.render('findCustomers', {menu:menuData,user,data:data,query});
            }
          )

        }
      }

      if(req.body.applyChange) {
        console.log(req.body);
        // EXECUTE THE CHANGE COMMAND
        let id = req.body.id;
        let name = req.body.name;
        let phone = req.body.phone;
        let email = req.body.email;
        let ref = req.body.ref;
        let expire = req.body.expire;
        let resetPassword = req.body.resetPassword;
        let ptChange = req.body.ptChange;
        let ddkChange = req.body.ddkChange;
        let slChange = req.body.slChange;
        let personalSLTPChange = req.body.personalSLTPChange;
        let appStatus = req.body.appStatus;

        var roleID;
        if(req.body.role_id){
          roleID=req.body.role_id;
        } else roleID=1;

        if(resetPassword=='true'){
          // Change password
          let newPassword = await bcrypt.hash('123456',3);
          pool.query(
            'UPDATE users SET password=$2 WHERE id=$1',
            [id,newPassword],
            (err,results) => {
              if(err) {
                throw err;
              }
              console.log('Password changed');
            }
          )
        }

        let pn = new phoneNumber(phone,'VN');
        let phoneFormatted = pn.getNumber( 'e164' );

        var refPhone = new phoneNumber(ref,'VN');
        if(refPhone.isValid( ) && refPhone.isMobile( ) && refPhone.canBeInternationallyDialled( )){
          ref = refPhone.getNumber( 'e164' );
        }

        pool.query(
          `WITH change_info AS (
            UPDATE users SET name=$2,phone=$3,email=$4
            WHERE id=$1
          ),
          change_ref AS (
            UPDATE ref_info SET ref_id=$5
            WHERE user_id=$1
          ),
          change_expiry AS (
            UPDATE expiry SET expire_date=$6
            WHERE user_id=$1
          ),
          change_role AS (
            UPDATE user_role SET role_id=$11
            WHERE user_id=$1
          )
          UPDATE user_services SET phongthan=$7,ddk=$8,sl=$9,personal_sltp=$10
          WHERE user_id=$1`,
          [id,name,phoneFormatted,email,ref,expire,ptChange,ddkChange,slChange,personalSLTPChange,roleID],
          (err,results) => {
            if(err) {
              throw err;
            } else {
              console.log("Client info changed");
              // Call api
              pool.query(
                `SELECT * FROM user_token WHERE user_id=$1;`, [req.user.id], (err,results) => {
                  if(err) console.log(err);
                  else {
                    if (results.rows.length>0) {
                      cusToken = results.rows[0].custoken;
                      apiUpdateUser(cusToken,email,expire.split('-').join(''),phoneFormatted,"",appStatus,name)
                      //console.log([cusToken,email,expire.split('-').join(''),phoneFormatted,"",appStatus,name]);
                    }
                  }
                }
              )
              // RELOAD THE LAST QUERY DATA
              query.name = req.body.queryName;
              query.phone = req.body.queryPhone;
              query.email = req.body.queryEmail;
              query.ref = req.body.queryRef;
              query.status = req.body.queryStatus;
              if(!query.name && !query.phone && !query.email && !query.ref){
                pool.query(
                  `SELECT u.id,u.name,u.phone,u.email,r.ref_id,e.expire_date,us.copytrade,us.phongthan,us.ddk,us.sl,us.personal_sltp,nav.total_nav FROM users u
                  INNER JOIN ref_info r ON u.id=r.user_id
                  INNER JOIN expiry e ON u.id=e.user_id
                  INNER JOIN user_services us on u.id=us.user_id
                  INNER JOIN user_role ur on u.id=ur.user_id
                  INNER JOIN (SELECT DISTINCT ON (n.user_id) n.user_id,n.total_nav FROM user_nav n JOIN users u on u.id=n.user_id ORDER BY n.user_id DESC ) nav ON u.id = nav.user_id
                  WHERE ur.role_id<=$1
                  ORDER BY u.id ASC`,
                  [roleSearch],
                  (err,results) => {
                    if(err) {
                      throw err;
                    }
                    let data = results.rows;
                    return res.render('findCustomers', {menu:menuData,user,data:data,query});
                  }
                )
              } else {
                // Any field having value
                var d,dt;
                if(query.status=='true') {d=new Date();dt=d.toISOString().split('T')[0]}
                else dt = '3000-12-31';

                let refSearch = query.ref;
                if(query.ref!=''){
                  var refNumber = new phoneNumber(ref,'VN');
                  if(refNumber.isValid( ) && refNumber.isMobile( ) && refNumber.canBeInternationallyDialled( ))  refSearch = refNumber.getNumber( 'e164' ).replace('+','');
                }

                // Check phone valid
                let phoneFormatted = '';
                if(query.phone!=''){
                  var pn = new phoneNumber(query.phone,'VN');
                  if(pn.isValid( ) && pn.isMobile( ) && pn.canBeInternationallyDialled( ))  phoneFormatted = pn.getNumber( 'e164' );
                }
                pool.query(
                  `SELECT u.id,u.name,u.phone,u.email,r.ref_id,e.expire_date,us.copytrade,us.phongthan,us.ddk,us.sl,us.personal_sltp,nav.total_nav FROM users u
                  INNER JOIN ref_info r ON u.id=r.user_id
                  INNER JOIN expiry e ON u.id=e.user_id
                  INNER JOIN user_services us on u.id=us.user_id
                  INNER JOIN user_role ur on u.id=ur.user_id
                  INNER JOIN (SELECT DISTINCT ON (n.user_id) n.user_id,n.total_nav FROM user_nav n JOIN users u on u.id=n.user_id ORDER BY n.user_id DESC ) nav ON u.id = nav.user_id
                  WHERE ur.role_id<=$6 AND u.name LIKE $1 AND u.phone LIKE $2 AND u.email LIKE $3 AND r.ref_id LIKE $4 AND e.expire_date<=$5
                  ORDER BY u.id ASC`,
                  ['%'+query.name+'%','%'+phoneFormatted+'%','%'+query.email+'%','%'+query.ref+'%',dt,roleSearch], (err,results)=>{
                    if(err) {
                      throw err;
                    }
                    let data = results.rows;
                    return res.render('findCustomers', {menu:menuData,user,data:data,query});
                  }
                )
              }
            }
          }
        )
      }

      //...
    } else {
      return res.redirect('/home');
    }
  } else {
    return res.redirect('/login');
  }
}

async function apiUpdateUser(cusToken,email,expTime,phone,role,status,surName) {
  console.log("New value:",cusToken,email,expTime,phone,"",surName);
  let apiCall = await api.updateUser(cusToken,email,expTime,phone,"",status,surName);
  console.log('Update user result: ', apiCall);
}

module.exports = {
  getFindCustomers:getFindCustomers,
  postFindCustomers:postFindCustomers
}
