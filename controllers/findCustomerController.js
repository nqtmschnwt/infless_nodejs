const fs = require('fs');
const { pool } = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const phoneNumber = require( 'awesome-phonenumber' );

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
            `SELECT u.id,u.name,u.phone,u.email,r.ref_id,e.expire_date,us.phongthan,us.ddk FROM users u
            INNER JOIN ref_info r ON u.id=r.user_id
            INNER JOIN expiry e ON u.id=e.user_id
            INNER JOIN user_services us on u.id=us.user_id
            INNER JOIN user_role ur on u.id=ur.user_id
            WHERE ur.role_id=1
            ORDER BY u.id ASC`,
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
            `SELECT u.id,u.name,u.phone,u.email,r.ref_id,e.expire_date,us.phongthan,us.ddk FROM users u
            INNER JOIN ref_info r ON u.id=r.user_id
            INNER JOIN expiry e ON u.id=e.user_id
            INNER JOIN user_services us on u.id=us.user_id
            INNER JOIN user_role ur on u.id=ur.user_id
            WHERE ur.role_id=1 AND u.name LIKE $1 AND u.phone LIKE $2 AND u.email LIKE $3 AND r.ref_id LIKE $4 AND e.expire_date<=$5
            ORDER BY u.id ASC`,
            ['%'+name+'%','%'+phoneFormatted+'%','%'+email+'%','%'+refSearch+'%',dt], (err,results)=>{
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
          )
          UPDATE user_services SET phongthan=$7,ddk=$8
          WHERE user_id=$1`,
          [id,name,phoneFormatted,email,ref,expire,ptChange,ddkChange],
          (err,results) => {
            if(err) {
              throw err;
            } else {
              console.log("Client info changed");
              // RELOAD THE LAST QUERY DATA
              query.name = req.body.queryName;
              query.phone = req.body.queryPhone;
              query.email = req.body.queryEmail;
              query.ref = req.body.queryRef;
              query.status = req.body.queryStatus;
              if(!query.name && !query.phone && !query.email && !query.ref){
                pool.query(
                  `SELECT u.id,u.name,u.phone,u.email,r.ref_id,e.expire_date,us.phongthan,us.ddk FROM users u
                  INNER JOIN ref_info r ON u.id=r.user_id
                  INNER JOIN expiry e ON u.id=e.user_id
                  INNER JOIN user_services us on u.id=us.user_id
                  ORDER BY u.id ASC`,
                  (err,results) => {
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

module.exports = {
  getFindCustomers:getFindCustomers,
  postFindCustomers:postFindCustomers
}
