'use strict';
var pubsub = require('../../server/pubsub.js');
var loopback = require('loopback');
module.exports = function(Chat) {
    console.log("connection_socket")
    Chat.observe('after save', function (ctx, next) {
        var socketid = Chat.app.io.sockets.sockets.id;
        var socket = Chat.app.io;
        console.log("come in Chat after save socket",socketid)
        if(ctx.isNewInstance){
            //Now publishing the data..
            pubsub.publish(socket, {
                collectionName : 'Chat',
                data: ctx.instance,
                method: 'POST'
            });
        }else{
            //Now publishing the data..
            pubsub.publish(socket, {
                collectionName : 'Chat',
                data: ctx.instance,
                modelId: ctx.instance.id,
                method: 'PUT'
            });
        }
        //Calling the next middleware..
        next();
    }); //after save..
    //OrderDetail before delete..
    Chat.observe("before delete", function(ctx, next){
        var socket = Chat.app.io;
        console.log("come in Chat after save socket",socket)
        //Now publishing the data..
        pubsub.publish(socket, {
            collectionName : 'Chat',
            data: ctx.instance.id,
            modelId: ctx.instance.id,
            method: 'DELETE'
        });
        //move to next middleware..
        next();
    }); //before delete..
};
