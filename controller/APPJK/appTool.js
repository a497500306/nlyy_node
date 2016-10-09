/**
 * Created by maoli on 16/9/25.
 */

var users = require('../../models/import/users');
var formidable = require('formidable');
var depot = require('../../models/import/depot');
var site = require('../../models/import/site');

//查询用户所有研究
exports.appGetStud = function (req, res, next) {
    //得到用户填写的东西
    console.log('查询用户所有研究');
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //搜索是否存在该用户
        users.chazhaoPhone(fields.phone,function (err, persons) {
            if (err != null){
                console.log(error);
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
            }else{
                if (persons.length > 0){//登录
                    console.log(persons);
                    res.send({
                        'isSucceed' : 400,
                        'data' : persons
                    });
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '未找到该用户'
                    });
                }
            }
        })
    })
}

//查询用户所有仓库
exports.appGetWarehouse = function (req, res, next) {
    console.log('查询用户所有仓库');
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //搜索是否存在该用户
        console.log(fields);
        depot.chazhaoChangku(fields.StudyID, fields.id,fields.UserDepotYN,fields.UserDepot,function (err, persons) {
            if (err != null){
                if (err.isSucceed == "200"){
                    res.send(err);
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据库正在维护,请稍后再试'
                    });
                }
            }else{
                res.send({
                    'isSucceed' : 400,
                    'data' : persons
                })
            }
        })
    })
}

//查询某研究所有分仓库
exports.appGetFengWarehouse = function (req, res, next) {
    console.log('查询某研究所有分仓库');
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        depot.chazhaofenChangku(fields.StudyID,function (err, persons) {
            if (err != null){
                if (err.isSucceed == "200"){
                    res.send(err);
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据库正在维护,请稍后再试'
                    });
                }
            }else{
                res.send({
                    'isSucceed' : 400,
                    'data' : persons
                })
            }
        })
    })
}

//查询某研究所有中心
exports.appGetSite = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        site.chazhaozhongxin(fields.StudyID,function (err, persons) {
            if (err != null){
                if (err.isSucceed == "200"){
                    res.send(err);
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据库正在维护,请稍后再试'
                    });
                }
            }else{
                res.send({
                    'isSucceed' : 400,
                    'data' : persons
                })
            }
        })
    })
}