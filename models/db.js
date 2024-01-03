var mongoose = require('mongoose');
var adminUser = require('./adminUsers');

//本地数据
// mongoose.connect('mongodb://localhost/nlyy');

//测试数据库
mongoose.connect('mongodb://182.254.242.142:40000/nlyy');

//正式数据库
// var opts = {
//     auth: {
//         authSource: 'admin'
//     }
// };
// mongoose.connect('mongodb://mongouser:knowlands2017@10.66.117.57:27017/nlyy',opts);
var db = mongoose.connection;
db.once('open', function (callback) {
    console.log("数据库成功打开");
    //查找超级用户表中是否有超级用户admin
    adminUser.find({"name":"admin"},function (err, result) {
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

// var dbUri = "mongodb://mongouser:knowlands2017@10.66.117.57:27017";
// var opts = {
//     auth: {
//         authSource: 'admin'
//     }
// };
// var db = mongoose.createConnection(dbUri, opts);
// db.once('open', function (callback) {
//     console.log("数据库成功打开");
//     //查找超级用户表中是否有超级用户admin
//     adminUser.find({"name":"admin"},function (err, result) {
//         console.log(result);
//         console.log(err);
//         if (result.length == 0 ){
//             console.log('第一次打开数据库');
//             adminUser.create({"name":"admin","password":"admin","read" : true,"write" : true,"addUser":true},function (error) {
//                 if (error){
//                     console.log('保存失败');
//                 }
//                 console.log("第一次打开数据库保持admin");
//             });
//         }
//     })
// });
module.exports = db;