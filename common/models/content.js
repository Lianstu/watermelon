'use strict';

module.exports = function(Content) {
  Content.beforeRemote("create",function(context,user,next){
    console.log("context.req:",context.req)
    console.log("user",user)
    var contex_data = context.args.data;
    console.log("contex_data:",contex_data,typeof contex_data)
    context.args.data.createAt = Date.now();
    context.args.data.userId = context.req.accessToken.userId;
    next();
  })
  Content.getMyContent = function(req,cb){
    var userid = req.accessToken.userId;

    console.log("Content",userid)
    cb(null,"ok")
  }
  Content.remoteMethod("getMyContent",{
    description:"获取我的好友内容",
    accepts:[
      {
        arg:"info",
        http:{source:"req"},
        type:"object",
        description:'填写id',
      }
    ],
    returns:{
      arg:"result",
      type:"string"
    }
  })
};
