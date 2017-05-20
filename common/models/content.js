'use strict';
var moment = require("moment")
module.exports = function(Content) {
  /*
  2017.4.9
  内容创建时封装该用户的userid
   */
  Content.postMyContent = function(req,param,cb){
    console.log(param)
    var userid = req.accessToken.userId;
    Content.upsert({

      createAt:new Date(),
      mycontent:param.mycontent,
      lbuserId:userid,
      nickname:param.nickname

    },function(err,instance){
      console.log("instance",instance)
      cb(null,instance)
    })
  }
  Content.remoteMethod("postMyContent",{
    description:"发心情",
    accepts : [
      {
        arg : "req",
        http:{source : "req"},
        required : "true"
      },
      {
        arg: "params",
        http:{source:"body"},
        required:true,
        description:'{"mycontent":"hello world"}'
      }
    ],
    returns:{
      arg:"result",
      type:"string"
    },
    http:{verb:"post"}

  })

  //Content.beforeRemote("create",function(context,user,next){
  //  console.log("context.req:",context.req)
  //  console.log("user",user)
  //  var contex_data = context.args.data;
  //  console.log("contex_data:",contex_data,typeof contex_data)
  //  context.args.data.createAt = Date.now();
  //  context.args.data.userId = context.req.accessToken.userId;
  //  next();
  //})
  /*

   //2017.4.9
   //获取好友的发布信息
   */

  Content.getMyContent = function(req,cb){
    var data = [];
    var userid = req.accessToken.userId;
    console.log("userid",userid,typeof (userid))
    Content.app.models.appuser.findOne({where:{ "lbuserId" : userid }},function(err,app_result){
      //获取好友列表,并处理
      var friendsList = app_result.friendsList;
      friendsList.forEach(function(friendobj,index){//获取一个好友三个小时的发布内容;
        console.log("****friendsList.forEach****",friendobj.lbuserId,index)
        Content.find({where:{lbuserId: friendobj.lbuserId}},function(err,contentresult){
          // 找到其的昵称等信息
          if(contentresult.length == 0){//1.1如果结果为空
            console.log(friendsList.length,"friendsList.length",index,"index",data)
            if(index == (friendsList.length - 1)){
              console.log("****cb_data****",data,data.length)
              cb(null,data)
            }
          }else{
            contentresult.forEach(function(obj,contentindex){
              console.log("**contentresult**",contentindex,obj)
              Content.app.models.review.find({where:{ contentId:obj.id },order: "createAt ASC"},function(err,reviewresult){//有很多reviewresult
                //用时间排序,
                //console.log("***reviewresult***",reviewresult)
                if(!reviewresult){
                  reviewresult = [];
                }
                var myres= {
                  mycontentresult:{
                    nickname:obj.nickname,
                    content : obj.mycontent,
                    contentid : obj.id,
                    count: obj.count,
                    createAt  : moment(obj.createAt).format("YYYY-MM-DD hh:mm")//
                  },
                  con_review:reviewresult
                }
                data.push(myres)
                //console.log("***data***",data)
                if(index == (friendsList.length - 1) && contentindex ==  (contentresult.length -1 )){
                  console.log("****come in friendsList.length - 1 cb_data****",data,data.length)
                  cb(null,data)
                }
              })
            })
          }
        })

      })
    })
    //console.log("Content",userid)
    //cb(null,"ok")
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
  /*
   //2017.4.9
   //给发布内容点赞
   */
  Content.upvote = function(body,cb){
    console.log(body.contenId,typeof body.contenId)
    Content.findById(body.contenId,function(err,res){
      var myup;
      if(res.up == 0 || res.up){
        myup=++res.up;
      }else {
        myup = 0;
      }
      Content.update({id: body.contenId},{"up": myup},function(err,result){
        console.log(result)
        cb(null,res)
      })

    })
  }
  Content.remoteMethod("upvote",{
    description:"给发布内容点赞",
    accepts:[{
      required:true,
      arg:"contenId",
      http:{source:"body"},
      description:"传入发布内容的contenId"
    }],
    http: {
      verb: 'post'
    },
    returns:{
      arg:"result"
    }
  })
  /*
   //2017.4.9
   //发布带图片内容
   */
  Content.postContentWithPic = function(content_str,Pic,cb){
    console.log("content_str",content_str,"Pic",Pic)
  }
  Content.remoteMethod("postContentWithPic",{
    description:"发布带图片类信息",
    accepts:[
      {
        arg: 'content_str',
        type: 'string',
        required: true,
        description: '文字内容',
        http: {
          source: 'formData'
        }
      },
      {
        arg: 'Pic',
        type: 'string',
        required: true,
        description: '图片',
        http: {
          source: 'formData'
        }
      }
    ]

  })
};
