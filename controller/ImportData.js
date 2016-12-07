var formidable = require('formidable');
var fs = require("fs");
var sd = require("silly-datetime");
var path = require("path");
var xlsx = require("node-xlsx");
var study = require('../models/import/study');//新增研究
var site = require("../models/import/site");//新增研究中心
var depot = require("../models/import/depot");//新增仓库
var researchParameter = require("../models/import/researchParameter");//设置研究的随机化参数
var ExcludeStandard = require("../models/import/ExcludeStandard");//导入入选排除标准
var FollowUpParameter = require("../models/import/FollowUpParameter");//导入入选排除标准
var drug = require("../models/import/drug");//导入药物号
var random = require("../models/import/random");//导入固定随机法随机号
var adminUser = require("../models/adminUsers");//管理用户
var users = require("../models/import/users");//用户表
var ApplicationAndAudit = require("../models/import/ApplicationAndAudit");//设置申请人和审核人

//测试
//导入新增研究
exports.wenjiancheshi = function (req, res, next) {
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
            res.send({
                'isSucceed' : 400,
                'msg' : '数据库正在维护,请稍后再试'
            });
            console.log(fields)
            console.log(files)
            console.log(files.img.size)
        })
}

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
//导入入选排除标准
exports.addRxpcbz = function (req, res, next) {
    console.log("导入入选排除标准");
    addData(req, res, next, ExcludeStandard);
}

//设置受试者随访参数
exports.addSzsszsfcs = function (req, res, next) {
    console.log("设置受试者随访参数");
    addData(req, res, next, FollowUpParameter);
}

//设置申请人和审核人
exports.addSzrwsqhsh = function (req, res, next) {
    console.log("设置申请人和审核人");
    addData(req, res, next, ApplicationAndAudit);
}

//删除数据
exports.deleteData = function (req, res, next) {
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log('点击删除')
        console.log(fields);
        if (fields.dianType == 'xzyj'){//删除选择研究
            shanchuData(study,fields.id,res);
        }else if (fields.dianType == 'szyjsjhcs') {//删除设置研究随机化参数
            shanchuData(researchParameter,fields.id,res);
        }else if (fields.dianType == 'xzyjzx') {//删除新增研究中心
            shanchuData(site,fields.id,res);
        }else if (fields.dianType == 'xzck') {//删除新增仓库
            shanchuData(depot,fields.id,res);
        }else if (fields.dianType == 'dryjrxpcbz') {//删除导入研究入选排除标准
            shanchuData(ExcludeStandard,fields.id,res);
        }else if (fields.dianType == 'gdsjfdrsjh') {//删除固定随机法导入随机号
            shanchuData(random,fields.id,res);
        }else if (fields.dianType == 'drywh') {//删除导入药物号
            shanchuData(drug,fields.id,res);
        }else if (fields.dianType == 'szsszsfcs') {//删除设置受试者随访参数
            shanchuData(FollowUpParameter,fields.id,res);
        }else if (fields.dianType == 'szrwsqhsh') {//删除设置任务申请和审核
            shanchuData(ApplicationAndAudit,fields.id,res);
        }else if (fields.dianType == 'dryh') {//删除导入用户数据
            shanchuData(users,fields.id,res);
        }else if (fields.dianType == 'nztjssjsywaqkc') {//删除内置统计算式计算药物安全库存

        }
    })
}
function shanchuData(model,id,res) {
    // 删除数据
    model.remove({id : id},
        (err)=>{
            res.redirect('/home');
        }
    )
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
        console.log("files------");
        console.log(files);
        console.log("files------");
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