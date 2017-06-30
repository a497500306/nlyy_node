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
var ApplicationAndAudit = require('../../models/import/ApplicationAndAudit');
var MLArray = require('../../MLArray');

TopClient = require( '../../ALYZM/topClient' ).TopClient;
var client = new TopClient({
    'appkey' : '23783814' ,
    'appsecret' : '63636a89dacc578085f6045bc06d96bc' ,
    'REST_URL' : 'http://gw.api.taobao.com/router/rest'
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
                if (fangshiFUP == null){
                    res.send({
                        'isSucceed' : 200,
                        'msg' : "受试者随访参数停药数据缺失"
                    });
                    return;
                }
                if (tingyaoFUP == null){
                    res.send({
                        'isSucceed' : 200,
                        'msg' : "受试者随访参数访视数据缺失"
                    });
                    return;
                }
                for (var i = 0 ; i < persons1.length ; i++){
                    //判断是否有完成用药时间
                    var baseline = persons1[i];
                    for (var y = 0 ; y < persons.length ; y++) {
                        if (persons[y].VisitonTrtYN == 1){
                            var ads = persons[y].Arm.split(",")[0];
                            var sda = baseline.user.Arm;
                            if (ads == sda){
                                fangshiFUP = persons[y]
                            }
                        }else {
                            if (persons[y].Arm.split(",")[0] == baseline.user.Arm) {
                                tingyaoFUP = persons[y]
                            }
                        }
                    }
                    if (baseline.stopDrugDate == null){//没有
                        //取出基线日期与今天日期隔多少天
                        //取出数据库中仿视日期
                        for (var j = 0 ; j <= fangshiFUP.VisitDy.split(",").length ; j++){
                            if (j != 0){
                                var date1=baseline.baselineDate;  //开始时间
                                var date2=new Date();    //结束时间
                                var date3=date2.getTime()-date1.getTime();  //时间差的毫秒数
                                //计算出相差天数
                                var days=Math.floor(date3/(24*3600*1000));
                                //计算相隔天数
                                var xxx = fangshiFUP.VisitDyL.split(",")[j];
                                var jiangeDay = xxx - days;
                                //计算相隔天数
                                var xxx1 = fangshiFUP.VisitDy.split(",")[j];
                                var jiangeDay1 = xxx1 - days;
                                var jiangeDi = - parseInt(((tingyaoFUP.VisitDyU.split(",")[j] - tingyaoFUP.VisitDyL.split(",")[j])/2))
                                if ( jiangeDi <= jiangeDay1 && jiangeDay < fields.Days){
                                    var dataJse = {
                                        'users':baseline,
                                        'VisitNam' : fangshiFUP.VisitNam.split(",")[j],
                                        'Days' : fangshiFUP.VisitDy.split(",")[j] - days,
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
                        for (var j = 0 ; j <= tingyaoFUP.VisitDy.split(",").length ; j++){
                            if (j != 0){
                                var date1=baseline.stopDrugDate;  //开始时间
                                var date2=new Date();    //结束时间
                                var date3=date2.getTime()-date1.getTime();  //时间差的毫秒数
                                //计算出相差天数
                                var days=Math.floor(date3/(24*3600*1000));
                                //计算相隔天数
                                var jiangeDay = tingyaoFUP.VisitDyL.split(",")[j] - days;
                                //计算相隔天数
                                var xxx1 = fangshiFUP.VisitDy.split(",")[j];
                                var jiangeDay1 = xxx1 - days;
                                var jiangeDi = - parseInt(((tingyaoFUP.VisitDyU.split(",")[j] - tingyaoFUP.VisitDyL.split(",")[j])/2))
                                if ( jiangeDi <= jiangeDay1 && jiangeDay < fields.Days){
                                    var dataJse = {
                                        'users':baseline,
                                        'VisitNam' : tingyaoFUP.VisitNam.split(",")[j],
                                        'Days' : fangshiFUP.VisitDy.split(",")[j] - days,
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
                studyID:fields.StudyID ,
                yytx:fields.content.replace('研究温馨提示：',''),
                date:(moment().format('YYYY-MM-DD h:mm:ss a'))
            } ,
            'rec_num' : fields.phone ,
            'sms_template_code' : "SMS_63885566"
        }, function(error, response) {
            if (error != null){
                console.log(error)
                res.send({
                    'isSucceed' : 200,
                    'msg' : '发送失败,查看是否手机号码错误!'
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
                    if (fields.isShibai == false){
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
                    }else{
                        //更新addSuccessPatient
                        addFailPatient.update({
                            'id':fields.userId,
                        },{
                            "isOut":1,//已经完成退出
                        },function () {
                            res.send({
                                'isSucceed' : 400,
                                'msg' : '添加成功'
                            });
                        })
                    }
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
        Unblinding.find({"Users.id" : fields.Users.id,'UnblindingType':fields.UnblindingType,'UserMP' : fields.UserMP ,"SiteID" : fields.SiteID,'StudyID':fields.StudyID,'isStopIt':{$eq:1}}, function (err, persons) {
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
                            "User" : [fields.User],//申请用户信息
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
                            "isStopIt" : null,
                            "StudyID" : fields.StudyID,//研究编号
                            "StudySeq" : fields.StudySeq,//研究序列号
                            "SiteID" : fields.SiteID,//中心编号
                            "SiteNam":fields.SiteNam,//中心名称
                            "ScreenYN":fields.ScreenYN,//筛选结果
                            "Users":fields.Users,//受试者信息
                            "UserNam":[fields.UserNam],//申请人名称
                            "UserMP":[fields.UserMP],//申请人手机号
                            "User" : [fields.User],//申请用户信息
                            'Causal' : [fields.Causal],//因果关系
                            'Reason' : [fields.Reason],//揭盲原因
                            'UnblindingType' : fields.UnblindingType,
                            "UnblApplDTC":new Date(),//揭盲申请日期
                            "ToExamineUsers" : [],//审核人
                            "ToExaminePhone" : [],//审核人手机号
                            "ToExamineUserData" : [],//审核人数据
                            "ToExamineType" : [],//是通过还是拒绝
                            "ToExamineDate" : [], //审核时间
                            "UnblindingProcess":[fields.UserNam + '申请揭盲' + '\n' + "揭盲原因:" + fields.Reason + '\n' + "不良事件因果关系" + fields.Causal],//完成或退出日期
                            "UnblindingProcessDates":[new Date()],//参加延长期开放研究
                            "Date" : new Date(), //导入时间,
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
        Unblinding.find({"site.id" : fields.site.id,'UnblindingType':fields.UnblindingType,'UserMP' : fields.UserMP ,"SiteID" : fields.SiteID,'StudyID':fields.StudyID,'isStopIt':{$eq:1}}, function (err, persons) {
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
                            "User" : [fields.User],
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
                            "isStopIt":null,
                            "StudyID" : fields.StudyID,//研究编号
                            "StudySeq" : fields.StudySeq,//研究序列号
                            "SiteID" : fields.SiteID,//中心编号
                            "SiteNam":fields.SiteNam,//中心名称
                            "ScreenYN":fields.ScreenYN,//筛选结果
                            "site":fields.site,//中心信息
                            "UserNam":[fields.UserNam],//申请人名称
                            "UserMP":[fields.UserMP],//申请人手机号
                            "User" : [fields.User],
                            'Causal' : [fields.Causal],//因果关系
                            'Reason' : [fields.Reason],//揭盲原因
                            'UnblindingType' : fields.UnblindingType,
                            "UnblApplDTC":new Date(),//揭盲申请日期
                            "ToExamineUsers" : [],//审核人
                            "ToExaminePhone" : [],//审核人手机号
                            "ToExamineUserData" : [],//审核人数据
                            "ToExamineType" : [],//是通过还是拒绝
                            "ToExamineDate" : [], //审核时间
                            "UnblindingProcess":[fields.UserNam + '申请揭盲' + '\n' + "揭盲原因:" + fields.Reason + '\n' + "不良事件因果关系" + fields.Causal],//完成或退出日期
                            "UnblindingProcessDates":[new Date()],
                            "Date" : new Date(), //导入时间
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
        Unblinding.find({"study.id" : fields.study.id,'UnblindingType':fields.UnblindingType,'UserMP' : fields.UserMP ,'StudyID':fields.StudyID,'isStopIt':{$eq:1}}, function (err, persons) {
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
                            "User" : [fields.User],
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
                            "isStopIt" : null,
                            "StudyID" : fields.StudyID,//研究编号
                            "StudySeq" : fields.StudySeq,//研究序列号
                            "ScreenYN":fields.ScreenYN,//筛选结果
                            "study":fields.study,//中心信息
                            "UserNam":[fields.UserNam],//申请人名称
                            "UserMP":[fields.UserMP],//申请人手机号
                            "User" : [fields.User],
                            'Causal' : [fields.Causal],//因果关系
                            'Reason' : [fields.Reason],//揭盲原因
                            "ToExamineUsers" : [],//审核人
                            "ToExaminePhone" : [],//审核人手机号
                            "ToExamineUserData" : [],//审核人数据
                            "ToExamineType" : [],//是通过还是拒绝
                            "ToExamineDate" : [], //审核时间
                            'UnblindingType' : fields.UnblindingType,
                            "UnblApplDTC":new Date(),//揭盲申请日期
                            "UnblindingProcess":[fields.UserNam + '申请揭盲' + '\n' + "揭盲原因:" + fields.Reason + '\n' + "不良事件因果关系" + fields.Causal],//完成或退出日期
                            "UnblindingProcessDates":[new Date()],
                            "Date" : new Date(), //导入时间
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
        Unblinding.find({$or:[
            {'StudyID':fields.StudyID,"UnblindingType" : fields.UnblindingType,'isStopIt':'0'},
            {'StudyID':fields.StudyID,"UnblindingType" : fields.UnblindingType,'isStopIt':null}
            ]}, function (err, persons) {
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

//获取待揭盲全部列表
exports.getAllStayUnblindingApplication = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        Unblinding.find(
            {$or:[
                {'StudyID':fields.StudyID,"UserMP" : fields.UserMP,'isStopIt':'0'},
                {'StudyID':fields.StudyID,"UserMP" : fields.UserMP,'isStopIt':null}
            ]}, function (err, persons) {
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
        //取出申请和审核
        ApplicationAndAudit.find({"StudyID": fields.StudyID ,'EventApp' : '1','EventRev' : '1'}, function (err, persons) {
            var applaa = null;
            for(var i = 0 ; i < persons.length ; i++){
                if (persons[i].EventUnbRev == fields.UnblindingType){
                    applaa = persons[i];
                    break;
                }
            }
            if (applaa == null){
                res.send({
                    'isSucceed': 200,
                    'msg': '未找到相关数据,请联系服务商'
                });
                return;
            }
            users.find({"StudyID": fields.StudyID}, function (err, persons) {
                Unblinding.find({"id": fields.id}, function (err, UnblindingPersons) {
                    if (UnblindingPersons[0].isStopIt == 1 || UnblindingPersons[0].isStopIt == 2 ){
                        res.send({
                            'isSucceed': 400,
                            'msg': '请勿重复操作!'
                        });
                        return;
                    }
                    //取出符合符合条件的用户
                    var shUsers = [];
                    var splits = applaa.EventRevUsers.split(",");
                    for (var i = 0 ; i < persons.length ; i++){
                        for (var j = 0 ; j < splits.length ; j++){
                            if (persons[i].UserFun == splits[j]){
                                shUsers.push(persons[i]);
                                break;
                            }
                        }
                    }
                    //判断审核次序
                    /*1=单个审核人；2=全部审核人；3=逐步审核*/
                    var isWC = false;
                    if (applaa.EventRevOrd == '1'){
                        for (var i = 0 ; i < splits.length ; i++){
                            //查看所有用户有多少具有该权限
                            var dataU = [];
                            var unDataU = [];
                            for (var j = 0 ; j < shUsers.length ; j++){
                                if (shUsers[j].UserFun == splits[i]){
                                    dataU.push(shUsers[j].UserMP)
                                }
                            }
                            for (var x = 0 ; x < dataU.length ; x++){
                                for (var y = 0 ; y < UnblindingPersons[0].ToExamineUserData.length ; y++){
                                    if (UnblindingPersons[0].ToExamineUserData[y].UserMP == dataU[x]){
                                        unDataU.push(UnblindingPersons[0].ToExamineUserData[y].UserMP)
                                    }
                                }
                            }
                            if (unDataU.length != 0){
                                isWC = true;
                            }
                        }
                        if (isWC == false){
                            res.send({
                                'isSucceed': 200,
                                'msg': '未审核完成,不能进行揭盲操作'
                            });
                            return;
                        }
                    }else{
                        //取出符合符合条件的用户
                        var xySHUsers = [];
                        var splits = applaa.EventRevUsers.split(",");
                        for (var i = 0 ; i < persons.length ; i++){
                            for (var j = 0 ; j < splits.length ; j++){
                                if (persons[i].UserFun == splits[j]){
                                    xySHUsers.push(persons[i]);
                                    break;
                                }
                            }
                        }
                        var shUsers = [];
                        for (var i = 0 ; i < xySHUsers.length ; i++){
                            if (i == 0 ){
                                shUsers.push(xySHUsers[i])
                            }else{
                                var isAdd = true;
                                for (var j = 0 ; j < shUsers.length ; j++){
                                    if (xySHUsers[i].UserMP == shUsers[j].UserMP){
                                        isAdd = false;
                                        break;
                                    }
                                }
                                if (isAdd == true){
                                    shUsers.push(xySHUsers[i])
                                    console.log(xySHUsers[i].UserMP)
                                }
                            }
                        }
                        if (shUsers.length == UnblindingPersons[0].ToExamineUsers.length){
                            isWC = true;
                        }
                    }
                    if (isWC == false){
                        res.send({
                            'isSucceed': 200,
                            'msg': '未审核完成,不能进行揭盲操作'
                        });
                        return;
                    }
                    if (fields.UnblindingType == 1 || fields.UnblindingType == 2) {
                        //判断该受试者是否揭盲
                        addSuccessPatient.find({"id": fields.Users.id}, function (err, isUsersPersons) {
                            if (isUsersPersons[0].isUnblinding == '1'){
                                res.send({
                                    'isSucceed': 200,
                                    'msg': '该受试者已经揭盲'
                                });
                                return;
                            }
                            //更新数据
                            Unblinding.update({
                                "id": fields.id
                            }, {
                                isStopIt: fields.isStopIt,
                                UnblindingUsers: fields.UnblindingUsers,
                                UnblindingPhone: fields.UnblindingPhone,
                                UnblindingDate: new Date(),
                                $push: {
                                    UnblindingProcess: fields.UnblindingUsers + (fields.isStopIt == 1 ? "同意揭盲" : "拒绝揭盲"),
                                    UnblindingProcessDates: new Date()
                                }
                            }, function (err, data) {
                                if (fields.isStopIt == 1) {
                                    addSuccessPatient.update({
                                        "id": fields.Users.id,
                                    }, {
                                        isUnblinding: '1',
                                        UnblindingDate: new Date(),
                                        UnblindingType: fields.UnblindingType
                                    }, function (err, data11) {
                                        addSuccessPatient.find({"id": fields.Users.id}, function (err, UsersPersons) {
                                            //发送邮件
                                            jiemangyoujian({text: '单个用户揭盲', id: fields.Users.id}, fields.id)
                                            res.send({
                                                'isSucceed': 400,
                                                'msg': '揭盲结果:' + UsersPersons[0].Arm
                                            });
                                        })
                                    })
                                } else {
                                    res.send({
                                        'isSucceed': 400,
                                        'msg': '操作成功'
                                    });
                                }
                            })
                        })
                    }else if (fields.UnblindingType == 3) {
                        //更新数据
                        Unblinding.update({
                            "id": fields.id
                        }, {
                            isStopIt: fields.isStopIt,
                            UnblindingUsers: fields.UnblindingUsers,
                            UnblindingPhone: fields.UnblindingPhone,
                            UnblindingDate: new Date(),
                            $push: {
                                UnblindingProcess: fields.UnblindingUsers + (fields.isStopIt == 1 ? "同意揭盲" : "拒绝揭盲"),
                                UnblindingProcessDates: new Date()
                            }
                        }, function (err, data) {
                            if (fields.isStopIt == 1) {
                                //修改中心数据
                                site.update({
                                    "StudyID": fields.StudyID,
                                    "SiteID": fields.SiteID
                                }, {
                                    isUnblinding: '1',
                                    UnblindingDate: new Date()
                                }, function (err, data11) {
                                    //修改中心全部患者
                                    addSuccessPatient.update({
                                        "StudyID": fields.StudyID,
                                        "SiteID": fields.SiteID,
                                        "isUnblinding": {$ne: '1'}
                                    }, {$set:{
                                        isUnblinding: '1',
                                        UnblindingDate: new Date(),
                                        UnblindingType: fields.UnblindingType
                                    }},{multi:true}, function (err, data) {
                                        jiemangyoujian({text:'单个中心揭盲',StudyID: fields.StudyID, SiteID: fields.SiteID},fields.id)
                                        res.send({
                                            'isSucceed': 400,
                                            'msg': '操作成功'
                                        });
                                    })
                                })
                            } else {
                                res.send({
                                    'isSucceed': 400,
                                    'msg': '操作成功'
                                });
                            }
                        })
                    } else if (fields.UnblindingType == 4) {
                        //更新数据
                        Unblinding.update({
                            "id": fields.id
                        }, {$set: {
                            isStopIt: fields.isStopIt,
                            UnblindingUsers: fields.UnblindingUsers,
                            UnblindingPhone: fields.UnblindingPhone,
                            UnblindingDate: new Date(),
                            $push: {
                                UnblindingProcess: fields.UnblindingUsers + (fields.isStopIt == 1 ? "同意揭盲" : "拒绝揭盲"),
                                UnblindingProcessDates: new Date()
                            }
                        }
                        }, {multi:true},function (err, data) {
                            if (fields.isStopIt == 1) {
                                study.update({
                                    "StudyID": fields.StudyID
                                },{$set: {
                                    isUnblinding: '1',
                                    UnblindingDate: new Date()
                                }
                                },{multi:true}, function (err, data) {
                                    //修改研究中全部患者
                                    addSuccessPatient.update({
                                        "StudyID": fields.StudyID,
                                        "isUnblinding": {$ne: '1'}
                                    }, {$set: {
                                        isUnblinding: '1',
                                        UnblindingDate: new Date(),
                                        UnblindingType: fields.UnblindingType,
                                    }
                                    }, {multi:true},function (err, data11) {
                                        jiemangyoujian({text:'整个研究揭盲',StudyID: fields.StudyID,},fields.id)
                                        res.send({
                                            'isSucceed': 400,
                                            'msg': '操作成功'
                                        });
                                    })
                                })
                            } else {
                                res.send({
                                    'isSucceed': 400,
                                    'msg': '操作成功'
                                });
                            }
                        })
                    }
                })
            })
        })
    })
}

//揭盲邮件
jiemangyoujian = function (UsersPersons,data,fields) {
    //发送邮件
    var emas = [];
    var phones = [];
    var htmlStr = ''
    var duanxinStr = ''
    if (UsersPersons.text == "单个用户揭盲"){
        Unblinding.find({
            "id": data
        }, function (err, Unblinding) {
            emas.push(Unblinding[0].User[0].UserEmail)
            phones.push(Unblinding[0].User[0].UserMP)
            researchParameter.find({
                "StudyID": Unblinding[0].Users.StudyID
            }, function (err, persons) {
                if (Unblinding[0].Users.SubjFa == '' || Unblinding[0].Users.SubjFa == null){//没有分层
                    htmlStr = htmlStr + "<h2>" + Unblinding[0].Users.StudyID + "研究温馨提示："+ "受试者" + Unblinding[0].Users.USubjID + "," + Unblinding[0].Users.SubjIni + "已经于" + (moment().format('YYYY-MM-DD h:mm:ss a'))  + "完成揭盲，随机号为" + Unblinding[0].Users.Random + "，治疗分组为" + Unblinding[0].Users.Arm + '，' +"</h2>"
                    duanxinStr = duanxinStr + "受试者" + Unblinding[0].Users.USubjID + "，" + Unblinding[0].Users.SubjIni + "已经于" + (moment().format('YYYY-MM-DD h:mm:ss a'))  + "完成揭盲，随机号为" + Unblinding[0].Users.Random + "，治疗分组为" + Unblinding[0].Users.Arm + '，'
                }else{//有分层
                    htmlStr = htmlStr + "<h2>" + Unblinding[0].Users.StudyID + "研究温馨提示："+ "受试者" + Unblinding[0].Users.USubjID + "，" + Unblinding[0].Users.SubjIni + "已经于" + (moment().format('YYYY-MM-DD h:mm:ss a'))  + "完成揭盲，随机号为" + Unblinding[0].Users.Random + "，治疗分组为" + Unblinding[0].Users.Arm + '，' + "</h2>"
                    htmlStr = htmlStr + '<h2>分层因素如下：' + '</h2>'
                    duanxinStr = duanxinStr +  "受试者" + Unblinding[0].Users.USubjID + "，" + Unblinding[0].Users.SubjIni + "已经于" + (moment().format('YYYY-MM-DD h:mm:ss a'))  + "完成揭盲，随机号为" + Unblinding[0].Users.Random + "，治疗分组为" + Unblinding[0].Users.Arm + '，'
                    duanxinStr = duanxinStr + '分层因素如下：' + ''
                    if (Unblinding[0].Users.SubjFa != ''){
                        htmlStr = htmlStr + '<h2>' + persons[0].LabelStraA + '：' + Unblinding[0].Users.SubjFa + '</h2>'
                        duanxinStr = duanxinStr + '' + persons[0].LabelStraA + '：' + Unblinding[0].Users.SubjFa + '；'
                    }
                    if (Unblinding[0].Users.SubjFb != ''){
                        htmlStr = htmlStr + '<h2>' + persons[0].LabelStraB + '：' + Unblinding[0].Users.SubjFb + '</h2>'
                        duanxinStr = duanxinStr + '' + persons[0].LabelStraB + '：' + Unblinding[0].Users.SubjFb + '；'
                    }
                    if (Unblinding[0].Users.SubjFc != ''){
                        htmlStr = htmlStr + '<h2>' + persons[0].LabelStraC + '：' + Unblinding[0].Users.SubjFc + '</h2>'
                        duanxinStr = duanxinStr + '' + persons[0].LabelStraC + '：' + Unblinding[0].Users.SubjFc + '；'
                    }
                    if (Unblinding[0].Users.SubjFd != ''){
                        htmlStr = htmlStr + '<h2>' + persons[0].LabelStraD + '：' + Unblinding[0].Users.SubjFd + '</h2>'
                        duanxinStr = duanxinStr + '' + persons[0].LabelStraD + '：' + Unblinding[0].Users.SubjFd + '；'
                    }
                    if (Unblinding[0].Users.SubjFe != ''){
                        htmlStr = htmlStr + '<h2>' + persons[0].LabelStraE + '：' + Unblinding[0].Users.SubjFe + '</h2>'
                        duanxinStr = duanxinStr + '' + persons[0].LabelStraE + '：' + Unblinding[0].Users.SubjFe + '；'
                    }
                    if (Unblinding[0].Users.SubjFf != ''){
                        htmlStr = htmlStr + '<h2>' + persons[0].LabelStraF + '：' + Unblinding[0].Users.SubjFf + '</h2>'
                        duanxinStr = duanxinStr + '' + persons[0].LabelStraF + '：' + Unblinding[0].Users.SubjFf + '；'
                    }
                    if (Unblinding[0].Users.SubjFg != ''){
                        htmlStr = htmlStr + '<h2>' + persons[0].LabelStraG + '：' + Unblinding[0].Users.SubjFg + '</h2>'
                        duanxinStr = duanxinStr + '' + persons[0].LabelStraG + '：' + Unblinding[0].Users.SubjFg + '；'
                    }
                    if (Unblinding[0].Users.SubjFh != ''){
                        htmlStr = htmlStr + '<h2>' + persons[0].LabelStraH + '：' + Unblinding[0].Users.SubjFh + '</h2>'
                        duanxinStr = duanxinStr + '' + persons[0].LabelStraH + '：' + Unblinding[0].Users.SubjFh + '；'
                    }
                    if (Unblinding[0].Users.SubjFi != ''){
                        htmlStr = htmlStr + '<h2>' + persons[0].LabelStraI + '：' + Unblinding[0].Users.SubjFi + '</h2>'
                        duanxinStr = duanxinStr + '' + persons[0].LabelStraI + '：' + Unblinding[0].Users.SubjFi + '；'
                    }
                }
                for (var  i = 0 ; i < Unblinding[0].ToExamineUserData.length ; i++){
                    emas.push(Unblinding[0].ToExamineUserData[i].UserEmail)
                    phones.push(Unblinding[0].ToExamineUserData[i].UserMP)
                }
                //发送邮件
                users.find({
                    $or:[
                        {
                            UserFun: 'H1',
                            StudyID: Unblinding[0].Users.StudyID,
                        },
                        {
                            UserFun: 'H2',
                            StudyID: Unblinding[0].Users.StudyID,
                            UserSite: Unblinding[0].Users.SiteID
                        },{
                            UserFun: 'C1',
                            StudyID: Unblinding[0].Users.StudyID
                        }
                    ]}, function (err, usersPersons) {
                    for (var j = 0 ; j < usersPersons.length ;j++){
                        var isXiangtong = false;
                        for (var x = 0 ; x < emas.length ; x++){
                            if (emas[x] == usersPersons[j].UserEmail){
                                isXiangtong = true;
                            }
                        }
                        if (isXiangtong == false){
                            emas.push(usersPersons[j].UserEmail)
                            phones.push(usersPersons[j].UserMP)
                        }
                    }
                    emas = MLArray.unique(emas);
                    phones = MLArray.unique(phones);
                    //发送邮件
                    for (var y = 0 ;  y < emas.length ; y++){
                        EMail.fasongxiujian({
                            from: "诺兰随机专用APP<k13918446402@qq.com>", // 发件地址
                            to: emas[y], // 收件列表
                            subject: Unblinding[0].Users.StudyID + "揭盲成功", // 标题
                            html: htmlStr // html 内容
                        })
                        client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                                'extend' : '' ,
                                'sms_type' : 'normal' ,
                                'sms_free_sign_name' : '诺兰医药科技' ,
                                'sms_param' : {
                                    studyID:Unblinding[0].Users.StudyID ,
                                    yytx:duanxinStr,
                                    date:(moment().format('YYYY-MM-DD h:mm:ss a'))
                                } ,
                                'rec_num' : phones[y] ,
                                'sms_template_code' : "SMS_63885566"
                            }, function(error, response) {
                                if (error != null){
                                    console.log('阿里错误');
                                    console.log(error);
                                }else {
                                    console.log(response);
                                }
                        });
                    }
                })
            })
        })
    }else if (UsersPersons.text == "单个中心揭盲"){
        Unblinding.find({
            "id": data
        }, function (err, Unblinding) {
            researchParameter.find({
                "StudyID": Unblinding[0].StudyID
            }, function (err, persons) {
                htmlStr = htmlStr + "<h2>" + Unblinding[0].StudyID + "研究温馨提示：" + Unblinding[0].SiteID + "中心" + "已经于" + (moment().format('YYYY-MM-DD h:mm:ss a'))  + "完成揭盲" +"</h2>"
                duanxinStr = duanxinStr +  + Unblinding[0].SiteID + "中心" + "，"  + "完成揭盲"
                for (var  i = 0 ; i < Unblinding[0].ToExamineUserData.length ; i++){
                    emas.push(Unblinding[0].ToExamineUserData[i].UserEmail)
                    phones.push(Unblinding[0].ToExamineUserData[i].UserMP)
                }
                //发送邮件
                users.find({
                    $or:[
                        {
                            UserFun: 'H1',
                            StudyID: Unblinding[0].StudyID,
                        },
                        {
                            UserFun: 'H2',
                            StudyID: Unblinding[0].StudyID,
                            UserSite: Unblinding[0].SiteID
                        },{
                            UserFun: 'C1',
                            StudyID: Unblinding[0].StudyID
                        }
                    ]}, function (err, usersPersons) {
                    for (var j = 0 ; j < usersPersons.length ;j++){
                        var isXiangtong = false;
                        for (var x = 0 ; x < emas.length ; x++){
                            if (emas[x] == usersPersons[j].UserEmail){
                                isXiangtong = true;
                            }
                        }
                        if (isXiangtong == false){
                            emas.push(usersPersons[j].UserEmail)
                            phones.push(usersPersons[j].UserMP)
                        }
                    }
                    emas = MLArray.unique(emas);
                    phones = MLArray.unique(phones);
                    //发送邮件
                    for (var y = 0 ;  y < emas.length ; y++){
                        EMail.fasongxiujian({
                            from: "诺兰随机专用APP<k13918446402@qq.com>", // 发件地址
                            to: emas[y], // 收件列表
                            subject: Unblinding[0].StudyID + "揭盲成功", // 标题
                            html: htmlStr // html 内容
                        })
                        client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                            'extend' : '' ,
                            'sms_type' : 'normal' ,
                            'sms_free_sign_name' : '诺兰医药科技' ,
                            'sms_param' : {
                                studyID:Unblinding[0].StudyID ,
                                yytx:duanxinStr,
                                date:(moment().format('YYYY-MM-DD h:mm:ss a'))
                            } ,
                            'rec_num' : phones[y] ,
                            'sms_template_code' : "SMS_63885566"
                        }, function(error, response) {
                            if (error != null){
                                console.log('阿里错误');
                                console.log(error);
                            }else {
                                console.log(response);
                            }
                        });
                    }
                })
            })
        })
    }else if (UsersPersons.text == "整个研究揭盲"){
        Unblinding.find({
            "id": data
        }, function (err, Unblinding) {
            researchParameter.find({
                "StudyID": Unblinding[0].StudyID
            }, function (err, persons) {
                htmlStr = htmlStr + "<h2>" + Unblinding[0].StudyID + "研究温馨提示：" + Unblinding[0].StudyID + "研究" + "已经于" + (moment().format('YYYY-MM-DD h:mm:ss a'))  + "完成揭盲" +"</h2>"
                duanxinStr = duanxinStr +  + Unblinding[0].StudyID + "研究" + "，"  + "完成揭盲"
                for (var  i = 0 ; i < Unblinding[0].ToExamineUserData.length ; i++){
                    emas.push(Unblinding[0].ToExamineUserData[i].UserEmail)
                    phones.push(Unblinding[0].ToExamineUserData[i].UserMP)
                }
                //发送邮件
                users.find({
                    $or:[
                        {
                            UserFun: 'H1',
                            StudyID: Unblinding[0].StudyID,
                        },
                        {
                            UserFun: 'H2',
                            StudyID: Unblinding[0].StudyID
                        },{
                            UserFun: 'C1',
                            StudyID: Unblinding[0].StudyID
                        }
                    ]}, function (err, usersPersons) {
                    for (var j = 0 ; j < usersPersons.length ;j++){
                        var isXiangtong = false;
                        for (var x = 0 ; x < emas.length ; x++){
                            if (emas[x] == usersPersons[j].UserEmail){
                                isXiangtong = true;
                            }
                        }
                        if (isXiangtong == false){
                            emas.push(usersPersons[j].UserEmail)
                            phones.push(usersPersons[j].UserMP)
                        }
                    }

                    emas = MLArray.unique(emas);
                    phones = MLArray.unique(phones);
                    //发送邮件
                    for (var y = 0 ;  y < emas.length ; y++){
                        EMail.fasongxiujian({
                            from: "诺兰随机专用APP<k13918446402@qq.com>", // 发件地址
                            to: emas[y], // 收件列表
                            subject: Unblinding[0].StudyID + "揭盲成功", // 标题
                            html: htmlStr // html 内容
                        })
                        client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                            'extend' : '' ,
                            'sms_type' : 'normal' ,
                            'sms_free_sign_name' : '诺兰医药科技' ,
                            'sms_param' : {
                                studyID:Unblinding[0].StudyID ,
                                yytx:duanxinStr,
                                date:(moment().format('YYYY-MM-DD h:mm:ss a'))
                            } ,
                            'rec_num' : phones[y] ,
                            'sms_template_code' : "SMS_63885566"
                        }, function(error, response) {
                            if (error != null){
                                console.log('阿里错误');
                                console.log(error);
                            }else {
                                console.log(response);
                            }
                        });
                    }
                })
            })
        })
    }
}


//设置审批
exports.getTrialUnblindingApplication = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //取出审批数据
        //取出申请和审核
        ApplicationAndAudit.find({
            "StudyID": fields.StudyID,
            'EventApp': '1',
            'EventRev': '1'
        }, function (err, persons) {
            var applaa = null;
            for (var i = 0; i < persons.length; i++) {
                if (persons[i].EventUnbRev == fields.UnblindingType) {
                    applaa = persons[i];
                    break;
                }
            }
            if (applaa == null) {
                res.send({
                    'isSucceed': 400,
                    'msg': '未找到相关数据,请联系服务商'
                });
                return;
            }
            //判断是否需要按顺序
            if (applaa.EventRevOrd == '3'){//需要按顺序
                //取出该研究中的审核身份的所有人
                users.find({"StudyID": fields.StudyID}, function (err, persons) {
                    Unblinding.find({"id": fields.id}, function (err, UnblindingPersons) {
                        var shUsers = persons;
                        var splits = applaa.EventRevUsers.split(",");
                        //判断该用户是否审核
                        for (var i = 0 ; i < UnblindingPersons[0].ToExamineUsers.length ; i++){
                            if (UnblindingPersons[0].ToExamineUsers[i] == fields.ToExaminePhone){
                                res.send({
                                    'isSucceed': 400,
                                    'msg': '请勿重复操作'
                                });
                                return
                            }
                        }
                        //查找该用户的所有身份
                        users.find({"StudyID": fields.StudyID, 'UserMP' : fields.ToExaminePhone}, function (err, persons) {
                            //判断该用户的最低身份
                            var shenfen = null;
                            for (var i = 0 ; i < splits.length ; i++){
                                for (var j = 0 ; j < persons.length ; j++){
                                    if (persons[j].UserFun == splits[i]){
                                        shenfen = i;
                                        break;
                                    }
                                }
                                if (shenfen != null){
                                    break;
                                }
                            }
                            //判断是不是最低身份
                            if (shenfen == 0){//是最低身份直接保存
                                //更新数据
                                Unblinding.find({"id": fields.id, "ToExaminePhone": fields.ToExaminePhone}, function (err, persons) {
                                    if (persons.length == 0) {
                                        Unblinding.update({
                                            "id": fields.id
                                        }, {
                                            $push: {
                                                ToExamineUserData: fields.ToExamineUserData,
                                                ToExamineUsers: fields.ToExamineUsers,
                                                ToExaminePhone: fields.ToExaminePhone,
                                                ToExamineType: fields.ToExamineType,
                                                ToExamineDate: new Date(),
                                                UnblindingProcess: fields.ToExamineUsers + "审核" + (fields.ToExamineType == 1 ? "通过" : "未通过"),
                                                UnblindingProcessDates: new Date()
                                            },
                                        }, function (err, data) {
                                            res.send({
                                                'isSucceed': 400,
                                                'msg': '操作成功'
                                            });
                                        })
                                    } else {
                                        res.send({
                                            'isSucceed': 400,
                                            'msg': '请勿重复操作'
                                        });
                                    }
                                })
                            }else{//判断之前身份是否完成
                                for (var i = 0 ; i < shenfen ; i++){
                                    //查看所有用户有多少具有该权限
                                    var dataU = [];
                                    var unDataU = [];
                                    for (var j = 0 ; j < shUsers.length ; j++){
                                        if (shUsers[j].UserFun == splits[i]){
                                            dataU.push(shUsers[j].UserMP)
                                        }
                                    }
                                    for (var x = 0 ; x < dataU.length ; x++){
                                        for (var y = 0 ; y < UnblindingPersons[0].ToExamineUserData.length ; y++){
                                            if (UnblindingPersons[0].ToExamineUserData[y].UserMP == dataU[x]){
                                                unDataU.push(UnblindingPersons[0].ToExamineUserData[y].UserMP)
                                            }
                                        }
                                    }
                                    if (dataU.length != unDataU.length){
                                        res.send({
                                            'isSucceed': 400,
                                            'msg': '前面还有用户未审核完成'
                                        });
                                        return;
                                    }
                                }
                                //更新数据
                                Unblinding.find({"id": fields.id, "ToExaminePhone": fields.ToExaminePhone}, function (err, persons) {
                                    if (persons.length == 0) {
                                        Unblinding.update({
                                            "id": fields.id
                                        }, {
                                            $push: {
                                                ToExamineUserData: fields.ToExamineUserData,
                                                ToExamineUsers: fields.ToExamineUsers,
                                                ToExaminePhone: fields.ToExaminePhone,
                                                ToExamineType: fields.ToExamineType,
                                                ToExamineDate: new Date(),
                                                UnblindingProcess: fields.ToExamineUsers + "审核" + (fields.ToExamineType == 1 ? "通过" : "未通过"),
                                                UnblindingProcessDates: new Date()
                                            },
                                        }, function (err, data) {
                                            res.send({
                                                'isSucceed': 400,
                                                'msg': '操作成功'
                                            });
                                        })
                                    } else {
                                        res.send({
                                            'isSucceed': 400,
                                            'msg': '请勿重复操作'
                                        });
                                    }
                                })
                            }
                        })
                    })
                })
            }else{
                //更新数据
                Unblinding.find({"id": fields.id, "ToExaminePhone": fields.ToExaminePhone}, function (err, persons) {
                    if (persons.length == 0) {
                        Unblinding.update({
                            "id": fields.id
                        }, {
                            $push: {
                                ToExamineUserData: fields.ToExamineUserData,
                                ToExamineUsers: fields.ToExamineUsers,
                                ToExaminePhone: fields.ToExaminePhone,
                                ToExamineType: fields.ToExamineType,
                                ToExamineDate: new Date(),
                                UnblindingProcess: fields.ToExamineUsers + "审核" + (fields.ToExamineType == 1 ? "通过" : "未通过"),
                                UnblindingProcessDates: new Date()
                            },
                        }, function (err, data) {
                            res.send({
                                'isSucceed': 400,
                                'msg': '操作成功'
                            });
                        })
                    } else {
                        res.send({
                            'isSucceed': 400,
                            'msg': '请勿重复操作'
                        });
                    }
                })
            }
        })
    })
}