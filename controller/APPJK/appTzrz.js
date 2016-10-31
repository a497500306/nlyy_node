/**
 * Created by maoli on 16/10/19.
 */
var formidable = require('formidable');
var site = require('../../models/import/site');
var researchParameter = require('../../models/import/researchParameter');
var addSuccessPatient = require('../../models/import/addSuccessPatient');
var addFailPatient = require('../../models/import/addFailPatient');
var site = require('../../models/import/site');
var users = require('../../models/import/users');
var siteStopIt = require('../../models/import/siteStopIt');
var EMail = require("../../models/EMail");
var study = require('../../models/import/study')

//获取中心数据
exports.getTzrzSite = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        users.find({
            UserMP : fields.UserMP,
            UserSiteYN : 1,
            StudyID : fields.StudyID
        }).exec((err, persons) => {
            if (err) {
                console.log(err);
            } else {
                if (persons.length != 0) {//负责全部中心
                    //查询所有中心
                    site.chazhaozhongxin(fields.StudyID,function (err,persons) {
                        if (err != null){
                            res.send({
                                'isSucceed': 200,
                                'msg': '数据库错误'
                            });
                        }else{
                            res.send({
                                'isSucceed': 400,
                                'data': persons
                            });
                        }
                    })
                }else{//负责某个中心
                    //查询该用户负责的中心
                    users.find({
                        UserMP : fields.UserMP,
                        StudyID : fields.StudyID
                    }).exec((err, persons) => {
                        var UserSite = ''
                        for (var i = 0 ; i < persons.length ; i++){
                            var user = persons[i]
                            if (persons[i].UserSite != null ){
                                if (persons[i].UserSite.length > 0){
                                    UserSite = persons[i].UserSite
                                }
                            }
                        }
                        //查找
                        if (UserSite.length > 0){
                            site.chazhaomougezhongxin(fields.StudyID,UserSite,function (err,persons) {
                                if (err != null){
                                    res.send({
                                        'isSucceed': 200,
                                        'msg': '数据库错误'
                                    });
                                }else{
                                    res.send({
                                        'isSucceed': 400,
                                        'data': persons
                                    });
                                }
                            })
                        }else{
                            res.send({
                                'isSucceed': 200,
                                'msg': '该用户有该模块操作权限'
                            });
                        }
                    })
                }
            }
        })
    })
}

//停止入组--确定申请
exports.getApplyZXStopIt = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //添加数据
        siteStopIt.find({
            SiteID : fields.SiteID,
            StudyID : fields.StudyID
        }).exec((err, persons) => {
            if (persons.length > 0){
                for(var i = 0 ; i < persons.length ; i++){
                    if (persons[0].isStopIt == 1){//如果停止,则输出
                        res.send({
                            'isSucceed': 200,
                            'msg': '该中心已停止入组'
                        });
                        return
                    }
                    if (persons[0].isStopIt == 0){//该中心已经申请
                        res.send({
                            'isSucceed': 200,
                            'msg': '该中心已申请停止入组'
                        });
                        return
                    }
                    if (persons[0].isStopIt == null){//该中心已经申请
                        res.send({
                            'isSucceed': 200,
                            'msg': '该中心已申请停止入组'
                        });
                        return
                    }
                }
            }

            //推送短信
            //推送邮件
            if (fields.isMail == '是'){
                //查询该研究所有全国PI
                users.find({
                    StudyID : fields.StudyID,
                    UserFun : 'H1'
                }).exec((err, persons) => {
                    /*
                     /*tableData.push('研究编号')
                     tableData.push('中心编号')
                     tableData.push('中心名称')
                     tableData.push('申请人')
                     tableData.push('申请人手机号')
                     tableData.push('申请日期')
                     tableData.push('是否推送短信给全国PI')
                     tableData.push('是否推送邮件给全国PI')
                     tableData.push('中心已停止受试者入组')
                     tableData.push('选择原因')*/
                    var htmlStr = ''
                    htmlStr = htmlStr + '<h2>研究编号:'+ fields.StudyID + '</h2>'
                    htmlStr = htmlStr + '<h2>中心编号:'+ fields.SiteID + '</h2>'
                    htmlStr = htmlStr + '<h2>中心名称:'+ fields.SiteNam + '</h2>'
                    htmlStr = htmlStr + '<h2>申请人:'+ fields.UserNam + '</h2>'
                    htmlStr = htmlStr + '<h2>申请人手机号:'+ fields.UserMP + '</h2>'
                    htmlStr = htmlStr + '<h2>原因:'+ Reason+ '</h2>'
                    for (var i = 0 ; i < persons.length ; i++){
                        var users = persons[i]
                        //发送邮件
                        EMail.fasongxiujian({
                            from: "中心停止入组<497500306@qq.com>", // 发件地址
                            to: users.UserEmail, // 收件列表
                            subject: "中心停止入组", // 标题
                            html: htmlStr // html 内容
                        })
                    }
                })
            }
            //添加数据
            siteStopIt.create({
                StudyID : fields.StudyID,
                SiteID : fields.SiteID,
                SiteNam : fields.SiteNam,
                UserNam : fields.UserNam,
                UserMP : fields.UserMP,
                isMessage : fields.isMessage,
                isMail : fields.isMail,
                Reason : fields.Reason,
                UserEmail : fields.UserEmail,
                ToExamineUsers : [],
                ToExaminePhone : [],
                ToExamineDate : [],
                ToExamineType : [],
                StopItUsers : null,
                StopItPhone : null,
                isStopIt : null,
                StopItDate : null,
                isStopIt:0,
                Date : new Date(), //导入时间
            },function (error) {
                if (error != null){
                    res.send({
                        'isSucceed': 200,
                        'msg': '数据添加失败'
                    });
                }else{
                    res.send({
                        'isSucceed': 400,
                        'msg': '申请成功'
                    });
                }
            })
        })
    })
}

//停止入组--待审核列表
exports.getZXStopItWaitForAudit = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //取出该研究所有待审核列表.
        siteStopIt.find({
            StudyID : fields.StudyID
        }).exec((err, persons) => {
            if (err != null){
                res.send({
                    'isSucceed': 200,
                    'msg': '数据库错误'
                });
            }else{
                res.send({
                    'isSucceed': 400,
                    'data': persons
                });
            }
        })
    })
}

//停止入组--审核操作
exports.getZXToExamine = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //查看该用户是否已经审核
        siteStopIt.find({
            id : fields.id,
            ToExaminePhone : fields.ToExaminePhone
        }).exec((err, persons) => {
            if (err != null){
                res.send({
                    'isSucceed': 200,
                    'msg': '数据库错误'
                });
            }else{
                siteStopIt.find({
                    id : fields.id
                }).exec((err, persons1) => {
                    if (persons1[0].isStopIt == 1){
                        res.send({
                            'isSucceed': 400,
                            'msg': '该中心已经停止入组'
                        });
                        return
                    }
                    if (persons.length == 0){
                        siteStopIt.update({
                            'id' : fields.id,
                        },{
                            $push : {
                                'ToExamineUsers' : fields.ToExamineUsers,
                                'ToExaminePhone' : fields.ToExaminePhone,
                                'ToExamineType' : fields.ToExamineType,
                                'ToExamineDate' : new Date()
                            } ,
                        },function () {
                            res.send({
                                'isSucceed': 400,
                                'msg': '操作成功'
                            });
                        })
                    }else{
                        res.send({
                            'isSucceed': 400,
                            'msg': '您已经审核过该申请'
                        });
                    }
                })
            }
        })
    })
}

//停止入组--确定申请
exports.getDetermineZXStopIt = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        siteStopIt.find({
            'id' : fields.id,
        }).exec((err, persons) => {
            if (persons[0].isStopIt == 2 || persons[0].isStopIt == 1){
                res.send({
                    'isSucceed': 400,
                    'msg': '该申请已经操作完成'
                });
            }else{
                if (fields.isStopIt == 1){
                    site.update({
                        'StudyID' : persons[0].StudyID,
                        'SiteID' :  persons[0].SiteID,
                    },{
                        'isStopIt' : 1,
                        'StopItDate' : new Date()
                    },function () {

                    })
                }
                siteStopIt.update({
                    'id' : fields.id,
                },{
                    'StopItUsers' : fields.StopItUsers,
                    'StopItPhone' : fields.StopItPhone,
                    'isStopIt' : fields.isStopIt,
                    'StopItDate' : new Date()
                },function () {
                    //搜索该研究所有中心是否全部停止,如果全部停止则研究停止入组
                    study.find({
                        'StudyID' : persons[0].StudyID,
                        'isStopIt' : 1
                    }).exec((err, persons) => {
                        //搜索该研究有多少中心
                        site.chazhaozhongxin(persons[0].StudyID,function (err,sitePersons) {
                            if (sitePersons.length == persons.length){
                                //研究全部停止入组
                                siteStopIt.update({
                                    'StudyID' : persons[0].StudyID,
                                },{
                                    "StudStopItType" : 1, //该研究停止入组模式:1:中心全部停止入组,2:研究同意停止入组
                                    "StudIsStopIt" : 1, //该研究是否停止入组
                                    "StudStopItDate" : new Date()
                                },function () {

                                })
                            }
                        })
                    })
                    console.log(persons)
                    console.log(err)
                    res.send({
                        'isSucceed': 400,
                        'msg': '操作成功'
                    });
                })
            }
        })
    })
}

//停止入组--查询已停止入组列表
exports.getZXStopItTable = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        site.find({
            'StudyID' : fields.StudyID,
            'isStopIt' : 1
        }).exec((err, persons) => {
            res.send({
                'isSucceed': 400,
                'data': persons
            });
        })
    })
}