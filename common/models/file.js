'use strict';
const config = require("../../server/lib/mode-config")
var fs = require("fs")
var path = require("path")
module.exports = function(File) {
    config.disableCRUDMethods(File)
    var mypath = path.join(__dirname,"../../client/img/and_icon.png")
    console.log("mypath",mypath)
    File.getandroid = function(req,cb){
        fs.createWriteStream(mypath,function(err,result){
            if(err){
                console.log("err",err)
            }
            console.log("getandroid",result)
            cb(null,result)
        })
    }
    File.remoteMethod("getandroid",{
        description:"获取app文件",
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
            type:"object"
        }
    })
};
