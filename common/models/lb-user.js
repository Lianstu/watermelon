'use strict';
var crypto = require("crypto")
module.exports = function(Lbuser) {
  Lbuser.loginbymobile = function(info,cb){
    let credentials={
      username:info.mobile,
      password:info.password
    }
    LbUser.login(credentials, (err, result) => {
      if(result) {
        result.franchisee = franchisee;
        console.log(result)
      }
      callback(err, result);
    });
  }
  var makecrypto = function(form){
    var md5 = crypto.createHash("md5")
    md5.update(form);
    return md5.digest("hex").toUpperCase()
  }
};
