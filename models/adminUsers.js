/**
 * Created by maoli on 16/8/31.
 */
var mongoose = require('mongoose');

//schema
var adminUsersSchema = new mongoose.Schema({
    "name"  : String,      //用户名
    "password" : String,   //密码
    "read" : Boolean,      //可读权限
    "write" : Boolean,     //可写权限
    "addUser":Boolean      //添加用户权限
});

//索引
adminUsersSchema.index({ "kid": 1});
//model
var adminUsers = mongoose.model("adminUsers",adminUsersSchema);

module.exports = adminUsers;