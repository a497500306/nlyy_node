var formidable = require('formidable');
var site = require('../../models/import/site');
var researchParameter = require('../../models/import/researchParameter');
var addSuccessPatient = require('../../models/import/addSuccessPatient');
var addFailPatient = require('../../models/import/addFailPatient');
var users = require('../../models/import/users');
var siteStopIt = require('../../models/import/siteStopIt');
var EMail = require("../../models/EMail");
var study = require('../../models/import/study');
var studyOffline = require('../../models/import/studyOffline');
var baselineUser = require('../../models/import/baselineUser');
var FollowUpParameter = require('../../models/import/FollowUpParameter');
var addOutPatient = require('../../models/import/addOutPatient');
var Unblinding = require('../../models/import/Unblinding');
TopClient = require( '../../ALYZM/topClient' ).TopClient;
var client = new TopClient({
    'appkey' : '23500106' ,
    'appsecret' : '7938816533f3fc698534761d15d8f66b' ,
    'REST_URL' : 'http://gw.api.tbsandbox.com/router/rest'
});
//时间操作
var moment = require('moment');
moment().format();

//添加受试者基线仿视日期
exports.getAddSszjxfsrq = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //查找是否有改用户
        baselineUser.find({"StudyID" : fields.StudyID,"userId" : fields.userId}, function (err, persons1) {
            if (persons1.length == 0){
                //添加新数据
                baselineUser.create({
                    "StudyID" : fields.StudyID,//研究编号
                    "SiteID" : fields.SiteID,//中心编号
                    "userId" : fields.userId,//用户ID
                    "user":fields.user,//用户对象
                    "isComplete":0,//是否完成随访
                    "isStopDrug":0,//是否停药
                    "baselineDate":fields.baselineDate,//基线日期
                    "stopDrugDate":fields.stopDrugDate,
                    "Date" : new Date(), //导入时间
                },function (error) {
                    if (error != null){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '添加失败'
                        });
                    }else{
                        //更新数据
                        addSuccessPatient.update({
                            'id':fields.userId,
                        },{
                            "baselineDate":fields.baselineDate,//基线日期
                            "stopDrugDate":fields.stopDrugDate,
                        },function () {
                            res.send({
                                'isSucceed' : 400,
                                'msg' : '添加成功'
                            });
                        })
                    }
                })
            }else {
                //更新数据
                baselineUser.update({
                    "StudyID" : fields.StudyID,//研究编号
                    "SiteID" : fields.SiteID,//中心编号
                    "userId" : fields.userId,//用户ID
                },{
                    "StudyID" : fields.StudyID,//研究编号
                    "SiteID" : fields.SiteID,//中心编号
                    "userId" : fields.userId,//用户ID
                    "user":fields.user,//用户对象
                    "isComplete":0,//是否完成随访
                    "isStopDrug":0,//是否停药
                    "baselineDate":fields.baselineDate,//基线日期
                    "stopDrugDate":fields.stopDrugDate,
                    "Date" : new Date(), //导入时间
                },function () {
                    //更新数据
                    addSuccessPatient.update({
                        'id':fields.userId,
                    },{
                        "baselineDate":fields.baselineDate,//基线日期
                        "stopDrugDate":fields.stopDrugDate,
                    },function () {
                        res.send({
                            'isSucceed' : 400,
                            'msg' : '更新成功'
                        });
                    })
                })
            }
        })
    })
}

//查阅下阶段随访受试者
exports.getCyxjdnsfssz = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        var resData = [];
        //查找是否有改用户
        baselineUser.find({"StudyID" : fields.StudyID,"SiteID" : fields.SiteID}, function (err, persons1) {
            //取出数据库中设置基线仿视日期参数
            FollowUpParameter.find({"StudyID" : fields.StudyID}, function (err, persons) {
                var tingyaoFUP = null;
                var fangshiFUP = null;
                for (var i = 0 ; i < persons.length ; i++) {
                    if (persons[i].VisitonTrtYN == 1){
                        fangshiFUP = persons[i]
                    }else {
                        tingyaoFUP = persons[i]
                    }
                }
                console.log(tingyaoFUP)
                console.log(fangshiFUP)
                for (var i = 0 ; i < persons1.length ; i++){
                    //判断是否有完成用药时间
                    var baseline = persons1[i];
                    if (baseline.stopDrugDate == null){//没有
                        //取出基线日期与今天日期隔多少天
                        //取出数据库中仿视日期
                        for (var j = 0 ; j < fangshiFUP.VisitDy.split(",").length ; j++){
                            if (j != 0){
                                var date1=persons1[i].baselineDate;  //开始时间
                                var date2=new Date();    //结束时间
                                var date3=date2.getTime()-date1.getTime();  //时间差的毫秒数
                                //计算出相差天数
                                var days=Math.floor(date3/(24*3600*1000));
                                //计算相隔天数
                                var xxx = fangshiFUP.VisitDy.split(",")[j];
                                var jiangeDay = xxx - days;
                                if ( 0 <= jiangeDay && jiangeDay <= fields.Days){
                                    var dataJse = {
                                        'users':persons1[i],
                                        'VisitNam' : fangshiFUP.VisitNam.split(",")[j],
                                        'Days' : jiangeDay,
                                        'baselineDate' : baseline.baselineDate,
                                        'VisitWk' : fangshiFUP.VisitWk.split(",")[j]
                                    }
                                    resData.push(dataJse);
                                    break;
                                }
                            }
                        }
                    }else{//有
                        //取出基线日期与今天日期隔多少天
                        //取出数据库中仿视日期
                        for (var j = 0 ; j < tingyaoFUP.VisitDy.split(",").length ; j++){
                            if (j != 0){
                                var date1=persons1[i].stopDrugDate;  //开始时间
                                var date2=new Date();    //结束时间
                                var date3=date2.getTime()-date1.getTime();  //时间差的毫秒数
                                //计算出相差天数
                                var days=Math.floor(date3/(24*3600*1000));
                                //计算相隔天数
                                var jiangeDay = tingyaoFUP.VisitDy.split(",")[j] - days;
                                if ( 0 <= jiangeDay && jiangeDay <= fields.Days){
                                    var dataJse = {
                                        'users':persons1[i],
                                        'VisitNam' : tingyaoFUP.VisitNam.split(",")[j],
                                        'Days' : jiangeDay,
                                        'stopDrugDate' : baseline.stopDrugDate,
                                        'VisitWk' : tingyaoFUP.VisitWk.split(",")[j]
                                    }
                                    resData.push(dataJse);
                                    break;
                                }
                            }
                        }
                    }
                }
                res.send({
                    'isSucceed' : 400,
                    'data' : resData
                });
            })
        })
    })
}


//发送预约随访短信
exports.getFsyysfdx = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
            'extend' : '' ,
            'sms_type' : 'normal' ,
            'sms_free_sign_name' : '诺兰医药科技' ,
            'sms_param' : {
                "yytx":fields.content ,
            } ,
            'rec_num' : fields.phone ,
            'sms_template_code' : "SMS_27540231"
        }, function(error, response) {
            if (error != null){
                console.log(error)
                res.send({
                    'isSucceed' : 200,
                    'msg' : '发送失败'
                });
            }else{
                res.send({
                    'isSucceed' : 400,
                    'msg' : '发送成功'
                });
            }
        });
    })
}


//添加完成或退出受试者
exports.getAddOut = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        addOutPatient.find({"userId" : fields.userId}, function (err, persons) {
            if (persons.length == 0){
                /*"StudyID" : String,    //研究编号
                 "SiteID" : String,//中心编号
                 "userId" : String,//受试者id
                 "SubjectID" : String,//受试者流水号
                 "USubjectID" : String,//受试者编号
                 "SubjectDOB" : String,//受试者出生日期
                 "SubjectSex" : String,//受试者性别
                 "SubjectIn" : String,//受试者姓名缩写
                 "DSDE" : String,//完成状态
                 "DSDECOD" : String,//完成代码
                 "DSSTDAT" : Date,//完成或退出日期
                 "DSCONT_OLE" : String,//参加延长期开放研究
                 'Date' : Date, //导入时间*/
                addOutPatient.create({
                    "StudyID" : fields.StudyID,//研究编号
                    "SiteID" : fields.SiteID,//中心编号
                    "userId" : fields.userId,//用户ID
                    "SubjectID":fields.SubjectID,//受试者流水号
                    "USubjectID":fields.USubjectID,//受试者编号
                    "SubjectDOB":fields.SubjectDOB,//受试者出生日期
                    "SubjectSex":fields.SubjectSex,//受试者性别
                    "DSDE":fields.DSDE,//完成状态
                    "DSDECOD":fields.DSDECOD,//完成代码
                    "DSSTDAT":fields.DSSTDAT,//完成或退出日期
                    "DSCONT_OLE":fields.DSCONT_OLE,//参加延长期开放研究
                    "Date" : new Date(), //导入时间
                },function (error) {
                    //更新addSuccessPatient
                    addSuccessPatient.update({
                        'id':fields.userId,
                    },{
                        "isOut":1,//已经完成退出
                    },function () {
                        res.send({
                            'isSucceed' : 400,
                            'msg' : '添加成功'
                        });
                    })
                })
            }else {
                res.send({
                    'isSucceed' : 200,
                    'msg' : '该受试者已经完成或退出'
                });
            }
        })
    })
}


//添加揭盲申请
exports.getUnblindingApplication = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        Unblinding.find({"Users.id" : fields.Users.id,'UnblindingType':fields.UnblindingType,'UserMP' : fields.UserMP ,"SiteID" : fields.SiteID,'StudyID':fields.StudyID,'isStopIt':{$ne:1}}, function (err, persons) {
            if (persons.length == 0){
                Unblinding.find({"Users.id" : fields.Users.id,'UnblindingType':fields.UnblindingType,"SiteID" : fields.SiteID,'StudyID':fields.StudyID,'isStopIt':{$ne:1}}, function (err, persons) {
                    if (persons.length == 0){//添加一条新的申请
                        Unblinding.create({
                            "StudyID" : fields.StudyID,//研究编号
                            "StudySeq" : fields.StudySeq,//研究序列号
                            "SiteID" : fields.SiteID,//中心编号
                            "SiteNam":fields.SiteNam,//中心名称
                            "ScreenYN":fields.ScreenYN,//筛选结果
                            "Users":fields.Users,//受试者信息
                            "UserNam":[fields.UserNam],//申请人名称
                            "UserMP":[fields.UserMP],//申请人手机号
                            'Causal' : [fields.Causal],//因果关系
                            'Reason' : [fields.Reason],//揭盲原因
                            'UnblindingType' : fields.UnblindingType,
                            "UnblApplDTC":new Date(),//揭盲申请日期
                            "UnblindingProcess":[fields.UserNam + '申请揭盲' + '\n' + "揭盲原因:" + fields.Reason + '\n' + "不良事件因果关系" + fields.Causal],//完成或退出日期
                            "UnblindingProcessDates":[new Date()],//参加延长期开放研究
                            "Date" : new Date(), //导入时间
                        },function (error) {
                            res.send({
                                'isSucceed' : 400,
                                'msg' : '申请成功'
                            });
                        })
                    }else {//更新数据
                        Unblinding.update({
                            "Users.id" : fields.Users.id,'UnblindingType':fields.UnblindingType,"SiteID" : fields.SiteID,'StudyID':fields.StudyID,'isStopIt':{$ne:1}
                        },{
                            $push : {
                                "UserNam":fields.UserNam,//申请人名称
                                "UserMP":fields.UserMP,//申请人手机号
                                'Causal' : fields.Causal,//因果关系
                                'Reason' : fields.Reason,//揭盲原因
                                "UnblindingProcess":fields.UserNam + '申请揭盲' + '\n' + "揭盲原因:" + fields.Reason + '\n' + "不良事件因果关系" + fields.Causal,//完成或退出日期
                                "UnblindingProcessDates":new Date()
                            } ,
                        },function () {
                            res.send({
                                'isSucceed': 400,
                                'msg': '操作成功'
                            });
                        })
                    }
                })
            }else{
                res.send({
                    'isSucceed' : 200,
                    'msg' : '请勿重复申请'
                });
            }
        })
    })
}

//添加中心揭盲申请
exports.getSiteUnblindingApplication = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        Unblinding.find({"site.id" : fields.site.id,'UnblindingType':fields.UnblindingType,'UserMP' : fields.UserMP ,"SiteID" : fields.SiteID,'StudyID':fields.StudyID,'isStopIt':{$ne:1}}, function (err, persons) {
            if (persons.length == 0){
                Unblinding.find({"site.id" : fields.site.id,'UnblindingType':fields.UnblindingType,"SiteID" : fields.SiteID,'StudyID':fields.StudyID,'isStopIt':{$ne:1}}, function (err, persons) {
                    if (persons.length == 0){//添加一条新的申请
                        Unblinding.create({
                            "StudyID" : fields.StudyID,//研究编号
                            "StudySeq" : fields.StudySeq,//研究序列号
                            "SiteID" : fields.SiteID,//中心编号
                            "SiteNam":fields.SiteNam,//中心名称
                            "ScreenYN":fields.ScreenYN,//筛选结果
                            "site":fields.site,//中心信息
                            "UserNam":[fields.UserNam],//申请人名称
                            "UserMP":[fields.UserMP],//申请人手机号
                            'Causal' : [fields.Causal],//因果关系
                            'Reason' : [fields.Reason],//揭盲原因
                            'UnblindingType' : fields.UnblindingType,
                            "UnblApplDTC":new Date(),//揭盲申请日期
                            "UnblindingProcess":[fields.UserNam + '申请揭盲' + '\n' + "揭盲原因:" + fields.Reason + '\n' + "不良事件因果关系" + fields.Causal],//完成或退出日期
                            "UnblindingProcessDates":[new Date()],
                            "Date" : new Date(), //导入时间
                        },function (error) {
                            res.send({
                                'isSucceed' : 400,
                                'msg' : '申请成功'
                            });
                        })
                    }else {//更新数据
                        Unblinding.update({
                            "site.id" : fields.site.id,'UnblindingType':fields.UnblindingType,"SiteID" : fields.SiteID,'StudyID':fields.StudyID,'isStopIt':{$ne:1}
                        },{
                            $push : {
                                "UserNam":fields.UserNam,//申请人名称
                                "UserMP":fields.UserMP,//申请人手机号
                                'Causal' : fields.Causal,//因果关系
                                'Reason' : fields.Reason,//揭盲原因
                                "UnblindingProcess":fields.UserNam + '申请揭盲' + '\n' + "揭盲原因:" + fields.Reason + '\n' + "不良事件因果关系" + fields.Causal,//完成或退出日期
                                "UnblindingProcessDates":new Date()
                            } ,
                        },function () {
                            res.send({
                                'isSucceed': 400,
                                'msg': '操作成功'
                            });
                        })
                    }
                })
            }else{
                res.send({
                    'isSucceed' : 200,
                    'msg' : '请勿重复申请'
                });
            }
        })
    })
}


//添加研究揭盲申请
exports.getStudyUnblindingApplication = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        Unblinding.find({"study.id" : fields.study.id,'UnblindingType':fields.UnblindingType,'UserMP' : fields.UserMP ,'StudyID':fields.StudyID,'isStopIt':{$ne:1}}, function (err, persons) {
            if (persons.length == 0){
                Unblinding.find({"study.id" : fields.study.id,'UnblindingType':fields.UnblindingType,'StudyID':fields.StudyID,'isStopIt':{$ne:1}}, function (err, persons) {
                    if (persons.length == 0){//添加一条新的申请
                        Unblinding.create({
                            "StudyID" : fields.StudyID,//研究编号
                            "StudySeq" : fields.StudySeq,//研究序列号
                            "ScreenYN":fields.ScreenYN,//筛选结果
                            "study":fields.study,//中心信息
                            "UserNam":[fields.UserNam],//申请人名称
                            "UserMP":[fields.UserMP],//申请人手机号
                            'Causal' : [fields.Causal],//因果关系
                            'Reason' : [fields.Reason],//揭盲原因
                            'UnblindingType' : fields.UnblindingType,
                            "UnblApplDTC":new Date(),//揭盲申请日期
                            "UnblindingProcess":[fields.UserNam + '申请揭盲' + '\n' + "揭盲原因:" + fields.Reason + '\n' + "不良事件因果关系" + fields.Causal],//完成或退出日期
                            "UnblindingProcessDates":[new Date()],
                            "Date" : new Date(), //导入时间
                        },function (error) {
                            res.send({
                                'isSucceed' : 400,
                                'msg' : '申请成功'
                            });
                        })
                    }else {//更新数据
                        Unblinding.update({
                            "study.id" : fields.study.id,'UnblindingType':fields.UnblindingType,'StudyID':fields.StudyID,'isStopIt':{$ne:1}
                        },{
                            $push : {
                                "UserNam":fields.UserNam,//申请人名称
                                "UserMP":fields.UserMP,//申请人手机号
                                'Causal' : fields.Causal,//因果关系
                                'Reason' : fields.Reason,//揭盲原因
                                "UnblindingProcess":fields.UserNam + '申请揭盲' + '\n' + "揭盲原因:" + fields.Reason + '\n' + "不良事件因果关系" + fields.Causal,//完成或退出日期
                                "UnblindingProcessDates":new Date()
                            } ,
                        },function () {
                            res.send({
                                'isSucceed': 400,
                                'msg': '操作成功'
                            });
                        })
                    }
                })
            }else{
                res.send({
                    'isSucceed' : 200,
                    'msg' : '请勿重复申请'
                });
            }
        })
    })
}


//获取待揭盲列表
exports.getStayUnblindingApplication = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        Unblinding.find({'StudyID':fields.StudyID,"UnblindingType" : fields.UnblindingType,'isStopIt' : null}, function (err, persons) {
            if (err != null) {
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库错误'
                });
            }else{
                console.log(persons.length)
                res.send({
                    'isSucceed' : 400,
                    'data' : persons
                });
            }
        })
    })
}

//设置是否揭盲
exports.getIsUnblindingApplication = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        if (fields.UnblindingType == 1 ||fields.UnblindingType == 2 ){
            //更新数据
            Unblinding.update({
                "id" : fields.id
            },{
                isStopIt : fields.isStopIt,
                UnblindingUsers : fields.UnblindingUsers,
                UnblindingPhone : fields.UnblindingPhone,
                UnblindingDate : new Date(),
                $push : {
                    UnblindingProcess : fields.UnblindingUsers +  (fields.isStopIt == 1 ? "同意揭盲" : "拒绝揭盲"),
                    UnblindingProcessDates : new Date()
                }
            },function (err,data) {
                if (fields.isStopIt == 1){
                    addSuccessPatient.update({
                        "id" : fields.Users.id,
                    },{
                        isUnblinding : 1,
                        UnblindingDate : new Date(),
                        UnblindingType : fields.UnblindingType
                    },function () {
                        res.send({
                            'isSucceed': 400,
                            'msg': '操作成功'
                        });
                    })
                }else {
                    res.send({
                        'isSucceed': 400,
                        'msg': '操作成功'
                    });
                }
            })
        }else if (fields.UnblindingType == 3){
            //更新数据
            Unblinding.update({
                "id" : fields.id
            },{
                isStopIt : fields.isStopIt,
                UnblindingUsers : fields.UnblindingUsers,
                UnblindingPhone : fields.UnblindingPhone,
                UnblindingDate : new Date(),
                $push : {
                    UnblindingProcess : fields.UnblindingUsers +  (fields.isStopIt == 1 ? "同意揭盲" : "拒绝揭盲"),
                    UnblindingProcessDates : new Date()
                }
            },function (err,data) {
                if (fields.isStopIt == 1){
                    //修改中心全部患者
                    addSuccessPatient.update({
                        "SiteID" : fields.SiteID,
                        "isUnblinding" : {$ne:1}

                    },{
                        isUnblinding : 1,
                        UnblindingDate : new Date(),
                        UnblindingType : fields.UnblindingType
                    },function () {
                        res.send({
                            'isSucceed': 400,
                            'msg': '操作成功'
                        });
                    })
                }else {
                    res.send({
                        'isSucceed': 400,
                        'msg': '操作成功'
                    });
                }
            })
        }else if (fields.UnblindingType == 4){
            //更新数据
            Unblinding.update({
                "id" : fields.id
            },{
                isStopIt : fields.isStopIt,
                UnblindingUsers : fields.UnblindingUsers,
                UnblindingPhone : fields.UnblindingPhone,
                UnblindingDate : new Date(),
                $push : {
                    UnblindingProcess : fields.UnblindingUsers +  (fields.isStopIt == 1 ? "同意揭盲" : "拒绝揭盲"),
                    UnblindingProcessDates : new Date()
                }
            },function (err,data) {
                if (fields.isStopIt == 1){
                    //修改研究中全部患者
                    addSuccessPatient.update({
                        "StudyID" : fields.StudyID,
                        "isUnblinding" : {$ne:1}
                    },{
                        isUnblinding : 1,
                        UnblindingDate : new Date(),
                        UnblindingType : fields.UnblindingType,
                    },function () {
                        res.send({
                            'isSucceed': 400,
                            'msg': '操作成功'
                        });
                    })
                }else {
                    res.send({
                        'isSucceed': 400,
                        'msg': '操作成功'
                    });
                }
            })
        }
    })
}


//设置审批
exports.getTrialUnblindingApplication = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //更新数据
        Unblinding.find({"id" : fields.id,"ToExaminePhone" : fields.ToExaminePhone}, function (err, persons) {
            if (persons.length == 0) {
                Unblinding.update({
                    "id" : fields.id
                },{
                    $push : {
                        ToExamineUsers : fields.ToExamineUsers,
                        ToExaminePhone : fields.ToExaminePhone,
                        ToExamineType : fields.ToExamineType,
                        ToExamineDate : new Date(),
                        UnblindingProcess : fields.ToExamineUsers + "审核" + (fields.ToExamineType == 1 ? "通过" : "未通过"),
                        UnblindingProcessDates : new Date()
                    },
                },function (err,data) {
                    res.send({
                        'isSucceed': 400,
                        'msg': '操作成功'
                    });
                })
            }else{
                res.send({
                    'isSucceed': 400,
                    'msg': '请勿重复操作'
                });
            }
        })
    })
}