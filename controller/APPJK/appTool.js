/**
 * Created by maoli on 16/9/25.
 */

var users = require('../../models/import/users');
var formidable = require('formidable');
var depot = require('../../models/import/depot');
var site = require('../../models/import/site');
var study = require('../../models/import/study');
var addSuccess = require('../../models/import/addSuccessPatient');

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
        depot.chazhaoChangku(fields.StudyID, fields.UserDepotYN,fields.UserDepot,function (err, persons) {
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

        //取出该研究中的所有分仓库
        depot.find({StudyID : fields.StudyID , DepotBrYN :1 },function (err, persons) {
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

// 查询中心和研究是否揭盲,然后更新数据
exports.addSuccessUpdate = function (StudyID, SiteID,block) {
    study.find({
        StudyID:StudyID
    },function (err, studyp) {
        if (studyp[0].isUnblinding == "1"){
            addSuccess.update({
                "StudyID": StudyID,
                "isUnblinding": {$ne: 1}
            }, {
                isUnblinding: 1,
                UnblindingDate: new Date(),
                UnblindingType: "4"
            }, [false, true], function (err, data) {
                block();
            })
        }else{
            var siteJson = {};
            if (SiteID.indexOf(',') != -1 ) {
                siteJson = {$or:[]};
                var sites = SiteID.split(",");
                for (var i = 0 ; i < sites.length ; i++){
                    siteJson.$or.push({
                        'StudyID' : StudyID,
                        'SiteID' : sites[i]
                    })
                }
            }else{
                siteJson = {StudyID:StudyID,SiteID:SiteID};
            }
            site.find(siteJson,function (err, sitep) {
                if (sitep[0].isUnblinding == "1") {
                    addSuccess.update({
                        "StudyID": StudyID,
                        "SiteID": SiteID,
                        "isUnblinding": {$ne: 1}
                    }, {
                        isUnblinding: 1,
                        UnblindingDate: new Date(),
                        UnblindingType: "3"
                    }, [false, true], function (err, data) {
                        block();
                    })
                }else{
                    block();
                }
            })
        }
    })
}