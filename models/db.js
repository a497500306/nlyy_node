var mongoose = require('mongoose');
var adminUser = require('./adminUsers');

mongoose.connect('mongodb://localhost/nlyy');

var db = mongoose.connection;
db.once('open', function (callback) {
    console.log("数据库成功打开");
    //查找超级用户表中是否有超级用户admin
    var user = adminUser.find({"name":"admin"},function (err, result) {
        console.log(result);
        if (result.length == 0 ){
            console.log('第一次打开数据库');
            adminUser.create({"name":"admin","password":"admin","read" : true,"write" : true,"addUser":true},function (error) {
                if (error){
                    console.log('保存失败');
                }
                console.log("第一次打开数据库保持admin");
            });
        }
    })
});

module.exports = db;