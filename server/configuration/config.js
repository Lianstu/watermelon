/**
 * Created by lianshaoshuai on 17/3/31.
 */
module.exports ={
  repeatRequestGap: 60000,//验证码重发时间
  codeValidityTime: 600000,//二维码有效时间10min
  app_key: "23728992",
  App_Secret: "3ee8e54ffcd8173e88466fc32b490c39",
  sendurl: 	"http://gw.api.tbsandbox.com/router/rest", //"http://gw.api.taobao.com/router/rest",
  method: "alibaba.aliqin.fc.sms.num.send",
  sign_method: "md5",
  v: "2.0",
  sms_type:"normal",
  sms_free_sign_name:"毕设社交app1",
  sms_template_code:"SMS_60035082"
}
