'use strict';
var pubsub = require('../../server/pubsub.js');
var loopback = require('loopback');
module.exports = function(Chat) {
    /*
     获取好友聊天内容
     //todo 根据传入的用户信息,获取聊天内容,并返回对应{nickname:nackname,uniqueChatID : uniqueChatID,chat_content :[data]}
     */
    Chat.findChatContent = function(req,cb){
        var cbdata = [];
        var userid = req.accessToken.userId;
        console.log("userid",userid)
        //todo 先根据userid 找到uniqueChatID ; 查找chat是否存在该字段,存在找出来,不存在就不存在
        Chat.app.models.appuser.findOne({where:{lbuserId:userid}},function(err,userinfo){
            var friendlist = userinfo.friendsList;
            friendlist.forEach(function(obj,index){
                if(obj.uniqueChatID){
                    Chat.app.models.appuser.findOne({where:{lbuserId:obj.lbuserId}},function(err,nicknameinfo){//拿到nickname
                        Chat.findOne({where:{uniqueChatID:obj.uniqueChatID}},function(err,chatinfo){
                            if(chatinfo){//如果之前聊过
                                cbdata.push( {nickname:nicknameinfo.nickname,chat_content : chatinfo.chat_content,uniqueChatID:chatinfo.uniqueChatID,lbuserId:obj.lbuserId})
                                if(index == (friendlist.length - 1)){
                                    cb(null,cbdata)
                                }
                            }else {//如果之前没有聊过
                                cb(null,cbdata)
                            }

                        })
                    })
                }else  if (friendlist.length == 1){
                    cb(null,cbdata)
                }
            })
        })
    }
    Chat.remoteMethod("findChatContent", {
        description: "获取聊天内容",
        accepts: [
            {
                arg: "req",
                type: 'object',
                required: true,
                http:{source:"req"}
            }
        ],
        returns: {
            arg: "result",
            type: "string"
        },
        http: { verb: 'post'}
    })

    /* 和好友单聊
     //todo 1.先搜索uniqueChatID 对应的集合是否存在, 2.1不存在说明没有进行过聊天创建,2.2存在则更改数据;
     // uniqueChatID : uniqueChatID;
     // chat_content :[{
     //  lbuserid : userid,
     //  content : "你好!",
     //  time : "2015-11-22 08:50:22"
     // }]
   */
    Chat.ChatwithFriend = function(req,uniqueChatID,chatcontent,cb){
        var socket = Chat.app.io;
        var userid = req.accessToken.userId //拿到发起方用户id
        var uniqueChatID = uniqueChatID;//拿到订阅的唯一id号
        console.log("userid",userid,"uniqueChatID",uniqueChatID)
        Chat.findOne({where:{"uniqueChatID":uniqueChatID}},function(err,result){
            if(result){
                  console.log("result is exited")
                  result.chat_content[result.chat_content.length] = {
                    lbuserid : userid,
                    content : chatcontent,
                    time : new Date()
                }
                console.log("result.chat_content",result.chat_content)
                result.updateAttributes({chat_content:result.chat_content},function(err,updresult){
                    console.log("updresult.chat_content",updresult.chat_content)
                    pubsub.publish(socket, {
                        collectionName : 'Chat/'+uniqueChatID,
                        data:updresult.chat_content ,
                        method: 'POST'
                    });
                })
            }else {//result 不存在
                console.log("result is null")
                Chat.create({
                    uniqueChatID:uniqueChatID,
                    chat_content :[{
                          lbuserid : userid,
                          content : chatcontent,
                          time : new Date()
                     }]
                },function(err,result){
                    if(err){
                        console.log("create err ",err)
                    }else {
                        pubsub.publish(socket, {
                            collectionName : 'Chat/'+uniqueChatID,
                            data:result.chat_content ,
                            method: 'POST'
                        });
                    }

                })
            }
        })
        cb(null,"yes")

    }
    Chat.remoteMethod("ChatwithFriend", {
        description: "和好友单聊",
        accepts: [
            {
                arg: "req",
                type: 'object',
                required: true,
                http:{source:"req"}
            },
            {
                arg: "pubsub",
                type: 'string',
                required: true,
                description: "传入一个唯一参数"
            },
            {
                arg: "chatcontent",
                type: 'string',
                required: true,
                description: "聊天内容"
            }
        ],
        returns: {
            arg: "result",
            type: "string"
        },
        http: {path: '/:pubsub', verb: 'post'},
    })

    /*搜索用户是否存在existfriend方法
    * todo 搜索用户是否存在,1>存在则提示存在,并提示用户填写添加理由,2>不存在则提示好有不存在 3> 如果已添加提示已经是好友
    * 1.已存在该好友 2.用户不存在 3.请输入添加帐号
     */
    Chat.existFriend = function(req,mobile,cb){
        var  acces_userid = req.accessToken.userId
        console.log("userid",acces_userid)
        if(mobile){
            Chat.app.models.appuser.findOne({where:{mobile:mobile}},function(err,result){//查找好友的信息
                if(err){
                    cb(err)
                }else if(result){
                    var userid = result.lbuserId//拿到好友的lbuserId
                    Chat.app.models.appuser.findOne({where:{lbuserId:acces_userid}},function(err,myresult){//查找自己的好友列表
                        var arr = myresult.friendsList;
                        for(var i = 0;i<arr.length;i++){
                            if(arr[i].lbuserId.toString() == userid.toString()){//处理改好友已存在
                                cb(null,"已存在该好友")
                            }else{//正常逻辑添加好友
                                cb(null,{nickname:result.nickname,mobile:mobile})
                            }
                        }
                    })
                }else{//处理用户不存在情况
                    cb(null,"用户不存在")
                }
            })
        }else{
            cb(null,"请输入添加帐号")
        }

    }
    Chat.remoteMethod("existFriend",{
        description:"是否存在该好友",
        accepts:[
        {
            arg:"req",
            type:"object",
            http:{source:"req"}
        },{
            arg:"mobile",
            required:true,
            type :"string",
        }],
        returns: {
            arg:"isexist",
            type:"string"
        },
        http:{verb:"post"}
    })

    /*添加好友addfriend方法
    * todo 推送给该用户信息,是否接受请求;
    * req:req
    * mobile : 需要添加人的好友的手机号
    * message: 附加消息
    * cb(null,"已发送") 提示用户已发送给对方等待添加
    */
    Chat.addfriend = function (req,mobile,message,cb){
        var socket = Chat.app.io;
        var  userid = req.accessToken.userId
        console.log(mobile,message,userid)
        Chat.app.models.appuser.findOne({where:{lbuserId:userid}},function(err,result){
            console.log("addfriend",result.mobile)
            pubsub.publish(socket, {
                collectionName : "Chat/"+mobile,
                data: {mobile:result.mobile,message:message},
                method: 'POST'
            });
            cb(null,"已发送")
        })
        //"手机号为"++"希望添加您为好友,附加消息:"+message
    }
    Chat.remoteMethod("addfriend",{
        description:"添加好友",
        accepts:[
            {
                arg:"req",
                type:"object",
                http:{source:"req"},
                description:"" +
                ""
            },
            {
                arg:"mobile",
                type:"string",
                description:"18262277905"
            },
            {
                arg:"message",
                type:"string",
                description:"我是廉小帅"
            }
        ],
        returns:{
            arg:"sendaddfriendsmes",
            type:"string"
        },
        http:{verb:"post"}
    })

    /*是否接受成为好友isaccepted方法
    *todo 同意则增加好列表,拒绝则不添加好友列表,并把结果给添加方
    * hermobile:添加方的手机号
    * options: number是否同意,1 同意,2 不同意
    * cb : 回调函数
    */
    Chat.isaccepted = function(req,hermobile,options,cb){
        var  userid = req.accessToken.userId
        var uniqueChatID =( new Date() ).valueOf() +"";
        var socket = Chat.app.io;
        console.log("isaccepted",hermobile,options,"userid",userid)
        Chat.app.models.appuser.findOne({where:{lbuserId:userid}},function(err,idresult){
            Chat.app.models.appuser.findOne({where:{mobile:hermobile}},function(err,mobileresult){
                var idfriendsList = idresult.friendsList//1.处理同意方好友列表
                idfriendsList[idfriendsList.length] = {lbuserId:mobileresult.lbuserId,uniqueChatID:uniqueChatID}
                var mobilefriendsList = mobileresult.friendsList//2.处理请求方好友列表
                mobilefriendsList[mobilefriendsList.length] = {lbuserId:idresult.lbuserId,uniqueChatID:uniqueChatID}
                idresult.updateAttributes({"friendsList" : idfriendsList},function(err,idinstance){
                    console.log("instance",idinstance)
                    mobileresult.updateAttributes({"friendsList" : mobilefriendsList},function(err,mobileinstance){
                        console.log("instance",mobileinstance)
                        pubsub.publish(socket, {
                            collectionName : "Chat/"+hermobile,
                            data: {options:options,mobile:hermobile},
                            method: 'POST'
                        });
                        cb(null,options)
                    })
                })
            })
        })

    }
    Chat.remoteMethod("isaccepted",{
        description:"是否同意添加好友",
        accepts:[
            {
                arg:"req",
                required:true,
                type:"object",
                http:{source:"req"}
            },
            {
                arg:"hermobile",
                required:true,
                type:"string"
            },
            {
                arg:"options",
                required:true,
                type:"string"
            }
        ],
        returns:{
            arg:"result",
            type:"string"
        },
        http:{verb:"post"}
    })
    Chat.findmyfriend = function(req,cb){
        var userid = req.accessToken.userId
        console.log(userid)
        var data = [];
        Chat.app.models.appuser.findOne({where:{lbuserId:userid}},function(err,result){
            var userfriendlist = result.friendsList;
            userfriendlist.forEach(function(obj,index){
                if(obj.uniqueChatID != ""){
                    Chat.app.models.appuser.findOne({where:{lbuserId:obj.lbuserId}},function(err,friendlist){
                        console.log("friendlist:@@@@",friendlist)
                        data.push({nickname:friendlist.nickname,uniqueChatID:obj.uniqueChatID,lbuserId:obj.lbuserId})
                        console.log(data,index,(userfriendlist.length -1))
                        if (index == (userfriendlist.length -1)){
                            cb(null,data)
                        }
                    })
                }else if(obj.uniqueChatID == "" &&userfriendlist.length ==1){
                    cb(null,data)
                }

            })
        })

    }
    Chat.remoteMethod("findmyfriend",{
        description:"拉取好友列表",
        accepts:[
            {
                arg:"req",
                required:true,
                type:"object",
                http:{source:"req"}
            }
        ],
        returns :{
            arg:"friendlist",
            type:"string"
        },
        http:{verb:"post"}
    })
};
