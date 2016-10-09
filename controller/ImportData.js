var formidable = require('formidable');
var fs = require("fs");
var sd = require("silly-datetime");
var path = require("path");
var xlsx = require("node-xlsx");
var study = require('../models/import/study');//新增研究
var site = require("../models/import/site");//新增研究中心
var depot = require("../models/import/depot");//新增仓库
var researchParameter = require("../models/import/researchParameter");//设置研究的随机化参数
var drug = require("../models/import/drug");//导入药物号
var random = require("../models/import/random");//导入固定随机法随机号
var adminUser = require("../models/adminUsers");//管理用户
var users = require("../models/import/users");//用户表

//导入新增研究
exports.addYzyj = function (req, res, next) {
    addData(req, res, next, study);
}

//导入新增研究中心
exports.addXzyjzx = function (req, res, next) {
    addData(req, res, next, site);
}

//导入新增仓库
exports.addXzck = function (req, res, next) {
    addData(req, res, next, depot);
}

exports.addSzhlyh = function (req, res, next) {
    addData(req, res, next, adminUser);
}

//导入用户数据
exports.addDryhsj = function (req, res, next) {
    console.log("ssss");
    addData(req, res, next, users);
}
//导入药物号
exports.addDrywh = function (req, res, next) {
    console.log("导入药物号");
    addData(req, res, next, drug);
}
//固定随机法导入随机号
exports.addGdsjfdrsjh = function (req, res, next) {
    console.log("固定随机法导入随机号");
    addData(req, res, next, random);
}
//设置研究的随机化参数
exports.addSzyjsjhcs = function (req, res, next) {
    console.log("设置研究的随机化参数");
    addData(req, res, next, researchParameter);
}


//公共方法
addData = function (req, res, next, name) {
    if(req.session.login!= '1'){
        res.render("login");
        return;
    }
    console.log("导入数据");
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    //配置上传路径
    form.uploadDir = __dirname + '/../middle/';
    form.parse(req,function (err, fields, files) {
        //上传完成移动到文件目录中
        if (err){
            next();     //这个中间件不受理这个请求了，往下走
            return;
        }
        if (files.excel.size == 0){
            res.send('未选择文件,请返回重新选择');
            return;
        }
        var ttt = sd.format(new Date(), 'YYYYMMDDHHmmss');
        var ran = parseInt(Math.random() * 89999 + 10000);
        var extname = path.extname(files.excel.name);
        var oldpath = files.excel.path;
        var newpath = path.normalize(__dirname + "/../file/" + ran + ttt + extname);
        fs.rename(oldpath,newpath,function(err){
            if(err){
                next();     //这个中间件不受理这个请求了，往下走
                return;
            }

            //操作excel
            var list = xlsx.parse(newpath);
            for (var i = 1 ; i < list[0].data.length ; i++){
                var model = {};
                console.log(list[0].data[i]);
                for (var j = 0 ; j < list[0].data[i].length ; j++){
                    model[list[0].data[0][j]] = list[0].data[i][j]
                }
                model['Date'] = new Date();
                if (list[0].data[i].length != 0){
                    name.create(model ,function (error) {
                        if (error){
                            console.log(error);
                            next();     //这个中间件不受理这个请求了，往下走
                            return;
                        }
                    });
                }
            }
            res.redirect('/home');
        });
    });
}