const LocalStrategy = require("passport-local").Strategy;
const {pool} = require('./dbConfig');
const bcrypt = require('bcrypt');
const phoneNumber = require( 'awesome-phonenumber' );

function initialize(passport){
  const authenticateUser = (phone,password,done)=>{
    // Check phone valid
    var pn = new phoneNumber(phone,'VN');
    if(!pn.isValid( ) || !pn.isMobile( ) || !pn.canBeInternationallyDialled( )){
      return done(null, false, {message: "Số điện thoại không hợp lệ"});
    }
    let phoneFormatted = pn.getNumber( 'e164' );
    console.log(phoneFormatted);            // -> '+46707123456' (default)
    console.log(pn.getNumber( 'national' ));        // -> '070-712 34 56'

    pool.query(
      `SELECT * FROM users u
      INNER JOIN active_users au ON u.id=au.user_id
      WHERE phone = $1`, [phoneFormatted],
      (err, results) => {
        if(err){
          throw err;
        }
        console.log(results.rows);
        if(results.rows.length >0){
          const user = results.rows[0];
          bcrypt.compare(password, user.password, (err, isMatch) =>{
            if(err){
              throw err;
            }
            if(isMatch){
              // Password correct
              if(user.active==false){
                // User not activated
                return done(null, false, {message: "Tài khoản chưa được kích hoạt"});
              } else {
                return done(null, user);
              }
            } else {
              return done(null, false, {message: "Password không đúng"});
            }
          });
        } else {
          return done(null, false, {message: "Số điện thoại không đúng"});
        }
      }
    )
  }
  passport.use(new LocalStrategy({
        usernameField:"phone",
        passwordField:"password"
      }, authenticateUser
    )
  );

  passport.serializeUser((user, done)=> done(null, user.id));
  passport.deserializeUser((id,done)=>{
    pool.query(
      `SELECT u.id,u.name,u.phone,u.email,u.password,au.active,e.expire_date,rf.ref_id,ur.role_id,rs.role_name,s.copytrade,s.phongthan,s.ddk,s.sl,n.total_nav
      FROM users u
      INNER JOIN active_users au ON u.id=au.user_id
      INNER JOIN ref_info rf ON u.id=rf.user_id
      INNER JOIN user_role ur ON u.id=ur.user_id
      INNER JOIN roles rs ON rs.role_id=ur.role_id
      INNER JOIN user_services s ON u.id=s.user_id
      INNER JOIN expiry e ON u.id=e.user_id
      INNER JOIN user_nav n ON u.id=n.user_id
      WHERE u.id=$1`,
      [id],
      async (err, results)=>{
        if(err){
          console.log(err);
          return done(null,err);
        }
        let userObj = results.rows[0];
        //let tokenHash = await bcrypt.hash(userObj.id+userObj.phone+userObj.role_id,3);
        //userObj.token = userObj.id + tokenHash;
        return done(null, userObj);
      }
    )
  })
}

module.exports = initialize;
