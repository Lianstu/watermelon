'use strict';
//var app = require('http')
//test1
var loopback = require('loopback');
//var app = loopback();
//var http = require('http').Server(app);
//var io = require('socket.io')(http);
//test2
//app.io = require('socket.io')(app.start());
//io.on("connection",function(socket){
//    console.log("*******connection*******")
//})
//console.log("connection_socket")
module.exports = function(Chat) {
    console.log("connection_socket")
    Chat.observe('after save', function (ctx, next) {

        console.log("socket",socket)
        if(ctx.isNewInstance){
        }
    })

    //console.log("Chat_socket",socket)
    //io.on("connection",function(socket){
    //    console.log("connection_socket",socket.id)
    //})
};
