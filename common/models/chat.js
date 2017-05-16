'use strict';
var pubsub = require('../../server/pubsub.js');
var loopback = require('loopback');
module.exports = function(Chat) {
    /* 和好友单聊*/
    Chat.ChatwithFriend = function(id,cb){
        var socket = Chat.app.io;
        pubsub.publish(socket, {
            collectionName : 'Chat/'+id,
            data: "hello world",
            method: 'POST'
        });
        cb(null,"yes")
    }
    Chat.remoteMethod("ChatwithFriend", {
        description: "和好友单聊",
        accepts: [
            {
                arg: "pubsub",
                type: 'number',
                required: true,
                description: "传入一个唯一参数"
            }
        ],
        returns: {
            arg: "result",
            type: "string"
        },
        http: {path: '/:pubsub', verb: 'post'},
    })
    console.log("connection_socket")

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
                            if(arr[i].toString() == userid.toString()){//处理改好友已存在
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
    Chat.isaccepted = function(hermobile,options,cb){
        console.log("isaccepted",hermobile,options)
        var socket = Chat.app.io;
            pubsub.publish(socket, {
                collectionName : "Chat/"+hermobile,
                data: {options:options,mobile:hermobile},
                method: 'POST'
            });
            cb(null,options)
    }
    Chat.remoteMethod("isaccepted",{
        description:"是否同意添加好友",
        accepts:[
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
        }
    })
};
