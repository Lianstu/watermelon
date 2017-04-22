'use strict';
const config = require("../../server/lib/mode-config")
var crypto = require("crypto")
module.exports = function(Appuser) {
  config.disableCRUDMethods(Appuser)
  //注册
  Appuser.register = function(userInfo,cb){
    console.log(userInfo)
    var watermeuser={};
    watermeuser.mobile = userInfo.mobile;
    watermeuser.code = userInfo.code;
    watermeuser.nickname = userInfo.nickname;
    watermeuser.password =makecrypto(userInfo.password);
    watermeuser.sex = userInfo.sex;
    watermeuser.createAt = new Date();
    watermeuser.watermelonNo = makewatermelonNo();//以时间戳形式生成
    watermeuser.avater = "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1491125392261&di=6cad18adb957545015d2b34666b1eb7c&imgtype=0&src=http%3A%2F%2Fimgqn.koudaitong.com%2Fupload_files%2F2015%2F05%2F15%2FFuqVchtUU1Tw_PVD6bK321G9ez6Q.jpg"
    console.log(watermeuser)
    //先查看mobile是否被注册,如果注册提示已注册;如果未注册查看code是否过期以及准确,正确情况下创建数据
    var checkcode =Appuser.app.models.checkcode;
    Appuser.findById(watermeuser.mobile,function(err,res){
      if(!err){
        if(!res){//手机号不存在
          checkcode.findById(watermeuser.mobile,function(err,result){
            if(!err){
              if(result){//查询未出错且存在code
                if(result.expireAt.valueOf() < new Date().valueOf()){//过期时间小于当前时间,即code已过期
                  cb("code已过期")
                }else{//未过期
                  if(result.code == userInfo.code){//两个code相等正确逻辑处理
                    Appuser.app.models.lbuser.create({username:userInfo.mobile,password:userInfo.password,email:userInfo.mobile+"@qq.com"},function(err,result){
                      if(!err){
                        if(result){
                          //console.log("***lbuser*****",result)
                          watermeuser.lbuserId = result.id;
                          watermeuser.friendsList = [result.id];
                          //console.log("***lbuser*****",result, result.id)
                          Appuser.create(watermeuser,function(err,result){
                            if(err){
                              userInfo.app.logger.error(watermeuser,"创建数据失败")
                              cb(err)
                            }else {
                              cb(null,watermeuser)
                            }
                          })
                        }
                      }
                    })
                  }else{//code不等提示code错误
                    cb("code验证错误")
                  }
                }
              }
            }
          })
        }else{//手机号存在
          cb("手机号已注册")
        }
      }
    })

  }
  Appuser.remoteMethod("register",{
    description : "注册",
    accepts:[
      {
        arg : "userInfo",
        type : "Object",
        required : true,
        http : {
          source : "body"
        },
        description: '{"nickname": "廉小帅", "code":"123123", "mobile":"18712738905","password": "123456", "sex":true}'
      }
    ],
    returns :{
      arg:"result",
      type:"string"
    },
    http:{verb:"post"}
  })
  //用手机号登录
  Appuser.loginbymobile = function(info,cb){
    console.log(info);
    let credentials={
      username:info.mobile,
      password:info.password
    }
    console.log("credentials",credentials)
    Appuser.findById(info.mobile,function(err,result){
      if(!err){
        if(result){//查找无错误,且结果存在

          Appuser.app.models.lbuser.login(credentials, (err, result) => {
            if(result) {
              result.Appuser = Appuser;
              console.log("result",result)
            }
            cb(err, result);
          });
          //var pwd = makecrypto(info.password);
          //if(pwd == result.password){//比对加密后的密码相同提示登录成功
          //  cb(null,"success")
          }else{
            cb("登录密码错误")
          }
        }else{
          cb("账号不存在")
        }
    })
  }
  Appuser.login = function(info,cb){

  }
  Appuser.remoteMethod("loginbymobile",{
    description:'登录',
    accepts:[
      {
        arg:"info",
        required:true,
        type:"object",
        description:'{"mobile":"18712738905","password":"123456"}',
        http:{source:"body"}
      }
    ],
    returns:{
      arg:"ok",
      type:"string"
    }
  })
  var makecrypto = function(form){
    var md5 = crypto.createHash("md5")
    md5.update(form);
    return md5.digest("hex").toUpperCase()
  }
  var makewatermelonNo = function(){
    var date = new Date()
    var No = date.valueOf()
    return No;
  }
};

