'use strict';
const crudconfig = require("../../server/lib/mode-config")
const config = require("../../server/configuration/config")
var Boom = require("loopback-boom")
var request = require("request")
var moment = require("moment")
var crypto = require("crypto")
var TopClient = require('../../server/lib/topClient').TopClient;
module.exports = function(Checkcode) {
  crudconfig.disableCUDMethods(Checkcode)
  Checkcode.findbymobile = function(mobile,cb){
    Checkcode.findById(mobile,function(err,result){
      if(err){
        return cb(err);
      }else{
        return cb(null,result)
      }
    })
  }
  Checkcode.remoteMethod("findbymobile",{
    description:"根据手机号查找验证码",
    accepts:[
      {
        arg : "mobile",
        type : "string",
        required : true,
        http:{source:'body'},
        description : "18712738905"
      }
    ],
    returns:{
      code: "code",
      type: "string",
    },
    http:{
      verb: 'post'
    }
  })
  Checkcode.getVerifyCode = function(mobile,cb){
    let re = /^1\d{10}$/;//可以匹配以1开头的11位的电话号码
    if (!re.test(mobile)) {
      return cb(Boom.badRequest("请输入正确手机号", {mobile: mobile}));
    }
    var getRandomInt = (min,max) =>{//生成验证码
      var code;
      code = Math.floor(Math.random()*(max-min + 1) + min)
      return code.toString();
    }
    Checkcode.findById(mobile,function(err,result){
      console.log("Checkcode.findById.result",result)
      if(err){//查找错误
        Checkcode.app.logger.error({mobile:mobile,err:err},"查找数据出错")
        cb(err)
      }
      if(result && new Date(result.expireAt).valueOf() > new Date().valueOf()){//有结果且失效时间大于当前时间
        var date = new Date().valueOf()
        if(new Date(result.createAt).valueOf() + config.repeatRequestGap > date){
          cb(null,"验证码已发送请稍等")
        }
      }else{//code失效或者没有数据则生成数据并保存
        var sendcode = getRandomInt(100000,999999);
        sendMsg(mobile,sendcode,function(err,result){
          console.log("**Checkcode.sendMsg.result**",result,sendcode)
          if(err){
            //Checkcode.app.logger.error({mobile:mobile,err:err},"发送code出错")
            cb(err)
          }else{
            if(result == 0){//发送成功
              var obj = {
                mobile:mobile,
                code : sendcode,
                createAt: new Date(),
                expireAt: new Date(new Date().valueOf() + config.codeValidityTime)
              }
              //console.log(obj.createAt,"createAt",typeof new Date().valueOf(),(new Date().valueOf()+config.codeValidityTime),"config.codeValidityTime",typeof config.codeValidityTime)
              Checkcode.upsert(obj,function(err,res){//更新插入
                if(err){
                  Checkcode.app.logger.error({mobile:mobile,err:err},"创建数据错误")
                  cb(err)
                }else{
                  cb(null, {code: sendcode, msg: '验证码已发送'})
                }
              })
            }else{//发送失败
              cb('发送失败')
            }
          }
        })
      }
    })
  }
  Checkcode.remoteMethod("getVerifyCode",{
    description:"获取验证码",
    accepts:[
      {
        arg : "mobile",
        type : "string",
        required : true,
        http:{source:'body'},
        description : "18712738905"
      }
    ],
    returns:{
      code: "code",
      type: "string",
      root: true,//返回的只有value
      description: "save into db"
    },
    http:{
      verb: 'post'
    }
  })
  //发送文本
  var sendMsg = function(mobile,code,callback){
    var smsparam = '{\"code\":'+'\"'+code+'\"'+'}';
    console.log("smsparamtypeof",typeof smsparam,smsparam)
    var client = new TopClient({
      'appkey': config.app_key,
      'appsecret': config.App_Secret,
      'REST_URL': 'http://gw.api.taobao.com/router/rest'
    });
    client.execute('alibaba.aliqin.fc.sms.num.send', {
      'sms_type':'normal',
      'sms_free_sign_name':config.sms_free_sign_name,
      'sms_param':smsparam,
      'rec_num':mobile,
      'sms_template_code':config.sms_template_code
    }, function(error, response) {
      if (!error) {
        callback(null,response.result.err_code)
      }
      else{
        callback(error,null)
      }
    })
  }
};
