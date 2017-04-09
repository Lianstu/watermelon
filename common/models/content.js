'use strict';

module.exports = function(Content) {
  /*
  2017.4.9
  内容创建时封装该用户的userid
   */
  Content.beforeRemote("create",function(context,user,next){
    console.log("context.req:",context.req)
    console.log("user",user)
    var contex_data = context.args.data;
    console.log("contex_data:",contex_data,typeof contex_data)
    context.args.data.createAt = Date.now();
    context.args.data.userId = context.req.accessToken.userId;
    next();
  })
  /*
   //2017.4.9
   //获取好友的发布信息
   */
  Content.getMyContent = function(req,cb){
    var userid = req.accessToken.userId;
    Content.app.models.lbuser.findById(userid,function(err,result){
      if(!err){
        Content.app.models.appuser.findById(result.username,function(err,app_result){
          //获取好友列表,并处理
          var friendsList = app_result.friendsList;

        })
      }
    })
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
