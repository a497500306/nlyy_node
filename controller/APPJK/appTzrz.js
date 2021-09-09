/**
 * Created by maoli on 16/10/19.
 */
var formidable = require('formidable');
var site = require('../../models/import/site');
var researchParameter = require('../../models/import/researchParameter');
var addSuccessPatient = require('../../models/import/addSuccessPatient');
var addOutPatient = require('../../models/import/addOutPatient');
var addFailPatient = require('../../models/import/addFailPatient');
var ApplicationAndAudit = require('../../models/import/ApplicationAndAudit');
var users = require('../../models/import/users');
var siteStopIt = require('../../models/import/siteStopIt');
var EMail = require("../../models/EMail");
var study = require('../../models/import/study')
var studyStopIt = require('../../models/import/studyStoplt')
var MLArray = require('../../MLArray')
//时间操作
var moment = require('moment');
moment().format();
TopClient = require( '../../ALYZM/topClient' ).TopClient;
var client = new TopClient({
    'appkey' : '23783814' ,
    'appsecret' : '63636a89dacc578085f6045bc06d96bc' ,
    'REST_URL' : 'http://gw.api.taobao.com/router/rest'
});
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
                        var UserSite = []
                        UserSite = persons[0].UserSite.split(",");
                        if (UserSite.length == 0){
                            UserSite.push(persons[0].UserSite)
                        }
                        //查找
                        if (UserSite.length == 1){
                            site.chazhaomougezhongxin(fields.StudyID,UserSite[0],function (err,persons) {
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
                        }else if (UserSite.length > 1){
                            var zhongxinModel = [];
                            (function iterator(i) {
                                if (i == UserSite.length){
                                    res.send({
                                        'isSucceed': 400,
                                        'data': zhongxinModel
                                    });
                                    return
                                }
                                site.find({StudyID: fields.StudyID, SiteID: UserSite[i]}, function (err, newSitePersons) {
                                    zhongxinModel.push(newSitePersons[0])
                                    iterator(i + 1)
                                })
                            })(0);
                        }else{
                            res.send({
                                'isSucceed': 200,
                                'msg': '该用户没有该模块操作权限'
                            });
                            return
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
                //查询该研究所有全国PI
                users.find({
                    StudyID : fields.StudyID,
                    UserFun:'H1'
                }).exec((err, persons) => {
                    users.find({
                        StudyID : fields.StudyID,UserFun:'M1'
                    }).exec((err, persons1) => {
                        users.find({
                            StudyID : fields.StudyID,UserSite: fields.SiteID,UserFun:'H2'
                        }).exec((err, persons2) => {
                            users.find({
                                StudyID : fields.StudyID,UserFun:'M7'
                            }).exec((err, persons3) => {
                                //取出所有以随机例数
                                addSuccessPatient.find({
                                    StudyID: fields.StudyID,
                                    SiteID: fields.SiteID,
                                    Random: {$ne: null}
                                }, function (err, addPersons) {
                                    var jj = addPersons.length;
                                    addOutPatient.find({
                                        StudyID: fields.StudyID,
                                        SiteID: fields.SiteID
                                    }, function (err, addOutPersons) {
                                        var htmlStr = ''
                                        htmlStr = htmlStr + '<h1>中心停止入组</h1>'
                                        htmlStr = htmlStr + '<h2>研究编号：' + fields.StudyID + '</h2>'
                                        htmlStr = htmlStr + '<h2>研究标题全称：' + persons1[0].StudNameF + '</h2>'
                                        htmlStr = htmlStr + '<h2>研究标题简称：' + persons1[0].StudNameS + '</h2>'
                                        htmlStr = htmlStr + '<h2>研究中心编号：' + fields.SiteID + '</h2>'
                                        htmlStr = htmlStr + '<h2>研究中心名称：' + fields.SiteNam + '</h2>'
                                        htmlStr = htmlStr + '<h2>主要研究者：' + persons2[0].UserNam + '</h2>'
                                        htmlStr = htmlStr + '<h2>已随机例数：' + jj + '</h2>'
                                        htmlStr = htmlStr + '<h2>已完成或者提前退出例数：' + addOutPersons.length + '</h2>'
                                        htmlStr = htmlStr + '<h2>申请人：' + fields.UserNam + '</h2>'
                                        htmlStr = htmlStr + '<h2>申请人手机号：' + fields.UserMP + '</h2>'
                                        htmlStr = htmlStr + '<h2>申请人邮箱：' + fields.UserEmail + '</h2>'
                                        htmlStr = htmlStr + '<h2>原因：' + fields.Reason + '</h2>'
                                        var duanxinStr = '中心停止入组：' + '研究编号：' + fields.StudyID + '，' + '研究标题全称：' + persons1[0].StudNameF
                                            + '，' + '研究标题简称：' + persons1[0].StudNameS + '，' + '研究中心编号：' + fields.SiteID + '，' +
                                            '研究中心名称：' + fields.SiteNam + '，' + '主要研究者：' + persons2[0].UserNam + '，' + '已随机例数：' + jj
                                            + '，' + '已完成或者提前退出例数：' + addOutPersons.length + '，' + '申请人：' + fields.UserNam + '，' + '申请人手机号：' + fields.UserMP + '，'
                                            + '申请人邮箱：' + fields.UserEmail + '，' + '原因：' + fields.Reason;
                                        var phones = [];
                                        var emails = [];
                                        for (var i = 0; i < persons.length; i++) {
                                            var users = persons[i]
                                            if (fields.isMail == '是') {
                                                emails.push(users.UserEmail);
                                            }
                                            if (fields.isMessage == '是') {
                                                phones.push(users.UserMP)
                                            }
                                        }
                                        for (var i = 0; i < persons1.length; i++) {
                                            var users = persons1[i]
                                            if (users.UserSiteYN == 1){
                                                phones.push(users.UserMP)
                                                emails.push(users.UserEmail)
                                            }else if (users.UserSite == fields.SiteID){
                                                phones.push(users.UserMP)
                                                emails.push(users.UserEmail)
                                            }
                                        }
                                        //添加申请人
                                        phones.push(fields.UserMP)
                                        emails.push(fields.UserEmail)
                                        for (var xx = 0 ; xx < persons3.length ; xx++){
                                            if (persons3[xx].UserSiteYN == 1){
                                                phones.push(persons3[xx].UserMP)
                                                emails.push(persons3[xx].UserEmail)
                                            }else if (persons3[xx].UserSite == fields.SiteID){
                                                phones.push(persons3[xx].UserMP)
                                                emails.push(persons3[xx].UserEmail)
                                            }
                                        }
                                        //移除相同的
                                        phones = MLArray.unique(phones);
                                        emails = MLArray.unique(emails);
                                        for (var y = 0; y < phones.length; y++) {
                                            client.execute('alibaba.aliqin.fc.sms.num.send', {
                                                'extend': '',
                                                'sms_type': 'normal',
                                                'sms_free_sign_name': '诺兰医药科技',
                                                'sms_param': {
                                                    studyID: fields.StudyID,
                                                    yytx: duanxinStr,
                                                    date: (moment().format('YYYY-MM-DD h:mm:ss a'))
                                                },
                                                'rec_num': phones[y],
                                                'sms_template_code': "SMS_63885566"
                                            }, function (error, response) {
                                                if (error != null) {
                                                    console.log('阿里错误');
                                                    console.log(error);
                                                } else {
                                                    console.log(response);
                                                }
                                            });
                                        }
                                        for (var m = 0 ; m < emails.length ; m++){
                                            //发送邮件
                                            EMail.fasongxiujian({
                                                from: "诺兰随机专用APP<k13918446402@qq.com>", // 发件地址
                                                to: emails[m], // 收件列表
                                                subject:fields.StudyID +  "中心停止入组", // 标题
                                                html: htmlStr // html 内容
                                            })
                                        }
                                    })
                                })
                            })
                        })
                    })
                })
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
            StudyID : fields.StudyID,
            isStopIt:0
        }).exec((err, persons) => {
            if (err != null){
                res.send({
                    'isSucceed': 200,
                    'msg': '数据库错误'
                });
            }else{
                var dataType = [];
                /*中心平均入组例数,中心以随机例数*/
                //取出所有中心
                //查询该研究有多少中心
                site.chazhaozhongxin(fields.StudyID,function (err,sitePersons) {
                    //取出所有以随机例数
                    addSuccessPatient.find({StudyID:fields.StudyID ,Random:{$ne:null}}, function (err, addPersons) {
                        //取出所有退出
                        (function iterator(i) {
                            if (i == (persons.length)) {
                                res.send({
                                    'isSucceed': 400,
                                    'data': persons,
                                    'dataType': dataType
                                });
                                return;
                            }
                            var newData = {
                                "PJRZLS": String, //平均入组例数
                                "YSJLS": String, //中心以随机数
                            };
                            newData.PJRZLS = (addPersons.length / sitePersons.length).toFixed(1);
                            var jj = 0 ;
                            for (var j = 0 ; j < addPersons.length ; j++){
                                if (addPersons[0].SiteID == persons[i].SiteID){
                                    jj = jj + 1;
                                }
                            }
                            newData.YSJLS = jj;
                            dataType.push(newData);
                            iterator(i + 1)
                        })(0);
                    })
                })
            }
        })
    })
}

//停止入组--审核操作
exports.getZXToExamine = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //取出审批数据
        //取出申请和审核
        ApplicationAndAudit.find({
            "StudyID": fields.StudyID,
            'EventApp': '2',
            'EventRev': '2'
        }, function (err, persons) {
            var applaa = null;
            for (var i = 0; i < persons.length; i++) {
                if (persons[i].EventRev == '2') {
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
                    siteStopIt.find({"id": fields.id}, function (err, UnblindingPersons) {
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
                                                        'ToExamineUserData' : fields.ToExamineUserData,
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
                                                        'ToExamineUserData' : fields.ToExamineUserData,
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
                            }
                        })
                    })
                })
            }else{
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
                                        'ToExamineUserData' : fields.ToExamineUserData,
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
            }
        })
    })
}

//停止入组--确定申请
exports.getDetermineZXStopIt = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //取出申请和审核
        ApplicationAndAudit.find({"StudyID": fields.StudyID ,'EventApp' : '2','EventRev' : '2'}, function (err, persons) {
            var applaa = null;
            for(var i = 0 ; i < persons.length ; i++){
                if (persons[i].EventRev == '2'){
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
                siteStopIt.find({"id": fields.id}, function (err, UnblindingPersons) {
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
                                'msg': '未审核完成,不能进行停止入组操作'
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
                            'msg': '未审核完成,不能进行停止入组操作'
                        });
                        return;
                    }
                    //判断整个研究是后停止入组
                    study.find({
                        "StudyID": fields.StudyID,
                        'StudIsStopIt' : 1,
                    },function (err, newStudyPersons) {
                        siteStopIt.find({
                            'id': fields.id,
                        }).exec((err, persons) => {
                            if (persons[0].isStopIt == 2 || persons[0].isStopIt == 1) {
                                res.send({
                                    'isSucceed': 400,
                                    'msg': '该申请已经操作完成'
                                });
                            } else {
                                if (fields.isStopIt == 1) {
                                    users.find({
                                        StudyID : fields.StudyID,
                                        UserFun:'H1'
                                    }).exec((err, persons4) => {
                                        users.find({
                                            StudyID: fields.StudyID, UserFun: 'M1'
                                        }).exec((err, persons1) => {
                                            users.find({
                                                StudyID: fields.StudyID, UserFun: 'H2',UserSite: fields.SiteID
                                            }).exec((err, persons2) => {
                                                users.find({
                                                    StudyID: fields.StudyID, UserFun: 'M7'
                                                }).exec((err, persons3) => {
                                                    var phones = [];
                                                    var emails = [];
                                                    for (var i = 0; i < persons4.length; i++) {
                                                        var users = persons4[i]
                                                        if (persons[0].isMail == '是') {
                                                            emails.push(users.UserEmail);
                                                        }
                                                        if (persons[0].isMessage == '是') {
                                                            phones.push(users.UserMP)
                                                        }
                                                    }
                                                    for (var i = 0; i < persons1.length; i++) {
                                                        var users = persons1[i]
                                                        phones.push(users.UserMP);
                                                        emails.push(users.UserEmail);
                                                    }
                                                    for (var i = 0; i < persons2.length; i++) {
                                                        var users = persons2[i]
                                                        phones.push(users.UserMP);
                                                        emails.push(users.UserEmail);
                                                    }
                                                    //添加申请人
                                                    phones.push(fields.UserMP)
                                                    emails.push(fields.UserEmail)
                                                    for (var xx = 0; xx < persons3.length; xx++) {
                                                        if (persons3[xx].UserSiteYN == 1) {
                                                            phones.push(persons3[xx].UserMP)
                                                            emails.push(persons3[xx].UserEmail)
                                                        } else if (persons3[xx].UserSite == fields.SiteID) {
                                                            phones.push(persons3[xx].UserMP)
                                                            emails.push(persons3[xx].UserEmail)
                                                        }
                                                    }
                                                    //移除相同的
                                                    phones = MLArray.unique(phones);
                                                    emails = MLArray.unique(emails);
                                                    var htmlStr = ''
                                                    htmlStr = htmlStr + '<h1>研究停止入组</h1>'
                                                    htmlStr = htmlStr + '<h2>' + fields.StudyID + "研究温馨提示：" + persons[0].SiteID + '中心已经于' + (moment().format('YYYY-MM-DD h:mm:ss a')) +'</h2>'
                                                    htmlStr = htmlStr + '<h2>停止入组，请知悉！' + '</h2>'

                                                    var duanxinStr = persons[0].SiteID + '中心已经停止入组'
                                                    for (var j = 0; j < phones.length; j++) {
                                                        client.execute('alibaba.aliqin.fc.sms.num.send', {
                                                            'extend': '',
                                                            'sms_type': 'normal',
                                                            'sms_free_sign_name': '诺兰医药科技',
                                                            'sms_param': {
                                                                studyID: persons[0].StudyID,
                                                                yytx: duanxinStr,
                                                                date: (moment().format('YYYY-MM-DD h:mm:ss a'))
                                                            },
                                                            'rec_num': phones[j],
                                                            'sms_template_code': "SMS_63885566"
                                                        }, function (error, response) {
                                                            if (error != null) {
                                                                console.log('阿里错误');
                                                                console.log(error);
                                                            } else {
                                                                console.log(response);
                                                            }
                                                        });
                                                    }
                                                    for (var m = 0 ; m < emails.length ; m++){
                                                        if (emails[m] != null){
                                                            if (typeof(emails[m])!="undefined"){
                                                                //发送邮件
                                                                EMail.fasongxiujian({
                                                                    from: "诺兰随机专用APP<k13918446402@qq.com>", // 发件地址
                                                                    to: emails[m], // 收件列表
                                                                    subject: persons[0].StudyID + "中心停止入组", // 标题
                                                                    html: htmlStr // html 内容
                                                                })
                                                            }
                                                        }
                                                    }
                                                })
                                            })
                                        })
                                    })
                                    site.update({
                                        'StudyID': persons[0].StudyID,
                                        'SiteID': persons[0].SiteID,
                                    }, {
                                        'isStopIt': 1,
                                        'StopItDate': new Date()
                                    }, function () {

                                    })
                                }
                                siteStopIt.update({
                                    'id': fields.id,
                                }, {
                                    'StopItUsers': fields.StopItUsers,
                                    'StopItPhone': fields.StopItPhone,
                                    'isStopIt': fields.isStopIt,
                                    'StopItDate': new Date()
                                }, function () {
                                    //搜索该研究所有中心是否全部停止,如果全部停止则研究停止入组
                                    study.find({
                                        'StudyID': fields.StudyID,
                                        'isStopIt': 1
                                    }).exec((err, persons) => {
                                        //搜索该研究有多少中心
                                        site.chazhaozhongxin(fields.StudyID, function (err, sitePersons) {
                                            if (sitePersons.length == persons.length) {
                                                //研究全部停止入组
                                                siteStopIt.update({
                                                    'StudyID': fields.StudyID,
                                                }, {
                                                    "StudStopItType": 1, //该研究停止入组模式:1:中心全部停止入组,2:研究同意停止入组
                                                    "StudIsStopIt": 1, //该研究是否停止入组
                                                    "StudStopItDate": new Date()
                                                }, function () {

                                                })
                                            }
                                        })
                                    })
                                    res.send({
                                        'isSucceed': 400,
                                        'msg': '操作成功'
                                    });
                                })
                            }
                        })
                    })
                })
            })
        })
    })
}

//停止入组--查询已停止入组列表
exports.getZXStopItTable = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        siteStopIt.find({
            'StudyID' : fields.StudyID,
            'isStopIt' : 1
        }).exec((err, persons) => {
            var array = [];
            (function iterator(i) {
                if (i == persons.length){
                    res.send({
                        'isSucceed': 400,
                        'data': array,
                    });
                    return
                }
                var dddd = {
                    data:null,
                    qita:null
                }
                var dataJson = {
                    ysjls:'',
                    pjrzls:'',
                    zxzjjz:''
                }
                //查询中心已随机例数
                addSuccessPatient.find({StudyID:fields.StudyID ,SiteID:persons[i].SiteID ,Random:{$ne:null}}, function (err, FailPersons) {
                    dataJson.ysjls = FailPersons.length + "";
                    addSuccessPatient.find({StudyID:fields.StudyID ,Arm:{$ne:null}}, function (err, suoyouPersons) {
                        site.find({
                            'StudyID' : fields.StudyID
                        }).exec((err, newPersons) => {
                            var xx = suoyouPersons.length;

                            var sss = (suoyouPersons.length / newPersons.length).toFixed(1);
                            dataJson.pjrzls = sss;
                            study.find({StudyID: fields.StudyID}, function (err, studyp) {
                                dataJson.zxzjjz = (studyp[0].AccrualCmpYN == 1 ? "是" : "否");
                                dddd.data = persons[i];
                                dddd.qita = dataJson;
                                array.push(dddd);
                                iterator(i + 1)
                            })
                        })
                    })
                })
            })(0);
        })
    })
}


//停止入组--整个研究停止入组申请
exports.getApplyYJStopIt = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        studyStopIt.find({
            StudyID : fields.StudyID
        }).exec((err, persons) => {
            if (persons.length > 0){
                for(var i = 0 ; i < persons.length ; i++){
                    if (persons[0].isStopIt == 1){//如果停止,则输出
                        res.send({
                            'isSucceed': 200,
                            'msg': '该研究已停止入组'
                        });
                        return
                    }
                    if (persons[0].isStopIt == 0){//该中心已经申请
                        res.send({
                            'isSucceed': 200,
                            'msg': '该研究已申请停止入组'
                        });
                        return
                    }
                    if (persons[0].isStopIt == null){//该中心已经申请
                        res.send({
                            'isSucceed': 200,
                            'msg': '该研究已申请停止入组'
                        });
                        return
                    }
                }
            }

            //推送短信
            //推送邮件
            //查询该研究所有全国PI
            users.find({
                StudyID : fields.StudyID,
                UserFun : 'H1'
            }).exec((err, persons) => {
                users.find({
                    StudyID : fields.StudyID,
                    UserFun : 'M1'
                }).exec((err, persons1) => {
                    var phones = [];
                    var emails =[];
                    for (var i = 0; i < persons.length; i++) {
                        var users = persons[i]
                        if (fields.isMail == '是') {
                            emails.push(users.UserEmail);
                        }
                        if (fields.isMessage == '是') {
                            phones.push(users.UserMP)
                        }
                    }
                    for (var i = 0; i < persons1.length; i++) {
                        var users = persons1[i]
                        phones.push(users.UserMP);
                        emails.push(users.UserEmail);
                    }
                    //添加申请人
                    phones.push(fields.UserMP)
                    emails.push(fields.UserEmail)
                    //移除相同的
                    phones = MLArray.unique(phones);
                    emails = MLArray.unique(emails);
                    var htmlStr = ''
                    htmlStr = htmlStr + '<h1>研究停止入组</h1>'
                    htmlStr = htmlStr + '<h2>研究编号:' + fields.StudyID + '</h2>'
                    htmlStr = htmlStr + '<h2>申请人:' + fields.UserNam + '</h2>'
                    htmlStr = htmlStr + '<h2>申请人手机号:' + fields.UserMP + '</h2>'
                    htmlStr = htmlStr + '<h2>原因:' + fields.Reason + '</h2>'
                    var duanxinStr = "研究停止入组" + "：" + "研究编号：" + fields.StudyID + '，' + "申请人：" + fields.UserNam + '，'
                                        +  "申请人手机号：" + fields.UserMP + '，' + "原因" + fields.Reason
                    for (var j = 0; j < phones.length; j++) {

                        client.execute('alibaba.aliqin.fc.sms.num.send', {
                            'extend': '',
                            'sms_type': 'normal',
                            'sms_free_sign_name': '诺兰医药科技',
                            'sms_param': {
                                studyID: fields.StudyID,
                                yytx: duanxinStr,
                                date: (moment().format('YYYY-MM-DD h:mm:ss a'))
                            },
                            'rec_num': phones[j],
                            'sms_template_code': "SMS_63885566"
                        }, function (error, response) {
                            if (error != null) {
                                console.log('阿里错误');
                                console.log(error);
                            } else {
                                console.log(response);
                            }
                        });
                    }
                    for (var m = 0 ; m < emails.length ; m++){
                        //发送邮件
                        EMail.fasongxiujian({
                            from: "诺兰随机专用APP<k13918446402@qq.com>", // 发件地址
                            to: emails[m], // 收件列表
                            subject: fields.StudyID + "研究停止入组", // 标题
                            html: htmlStr // html 内容
                        })
                    }
                })
            })
            //添加数据
            studyStopIt.create({
                StudyID : fields.StudyID,
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


//停止入组--整个研究待审核列表
exports.getYJStopItWaitForAudit = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //取出该研究所有待审核列表.
        studyStopIt.find({
            StudyID : fields.StudyID,
            isStopIt:0
        }).exec((err, persons) => {
            if (err != null){
                res.send({
                    'isSucceed': 200,
                    'msg': '数据库错误'
                });
            }else{
                //获取总样本量
                gitData1(fields.StudyID,function (data) {
                    res.send({
                        'isSucceed': 400,
                        'data': persons,
                        'dataType' : data
                    });
                })
            }
        })
    })
}


//停止入组--整个研究审核操作
exports.getYJToExamine = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //取出审批数据
        //取出申请和审核
        ApplicationAndAudit.find({
            "StudyID": fields.StudyID,
            'EventApp': '3',
            'EventRev': '3'
        }, function (err, persons) {
            var applaa = null;
            for (var i = 0; i < persons.length; i++) {
                if (persons[i].EventRev == '3') {
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
                    studyStopIt.find({"id": fields.id}, function (err, UnblindingPersons) {
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
                                //查看该用户是否已经审核
                                studyStopIt.find({
                                    id : fields.id,
                                    ToExaminePhone : fields.ToExaminePhone
                                }).exec((err, persons) => {
                                    if (err != null){
                                        res.send({
                                            'isSucceed': 200,
                                            'msg': '数据库错误'
                                        });
                                    }else{
                                        studyStopIt.find({
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
                                                studyStopIt.update({
                                                    'id' : fields.id,
                                                },{
                                                    $push : {
                                                        'ToExamineUserData' : fields.ToExamineUserData,
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
                                //查看该用户是否已经审核
                                studyStopIt.find({
                                    id : fields.id,
                                    ToExaminePhone : fields.ToExaminePhone
                                }).exec((err, persons) => {
                                    if (err != null){
                                        res.send({
                                            'isSucceed': 200,
                                            'msg': '数据库错误'
                                        });
                                    }else{
                                        studyStopIt.find({
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
                                                studyStopIt.update({
                                                    'id' : fields.id,
                                                },{
                                                    $push : {
                                                        'ToExamineUserData' : fields.ToExamineUserData,
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
                            }
                        })
                    })
                })
            }else{
                //查看该用户是否已经审核
                studyStopIt.find({
                    id : fields.id,
                    ToExaminePhone : fields.ToExaminePhone
                }).exec((err, persons) => {
                    if (err != null){
                        res.send({
                            'isSucceed': 200,
                            'msg': '数据库错误'
                        });
                    }else{
                        studyStopIt.find({
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
                                studyStopIt.update({
                                    'id' : fields.id,
                                },{
                                    $push : {
                                        'ToExamineUserData' : fields.ToExamineUserData,
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
            }
        })
    })
}

//停止入组--整个研究确定/拒绝停止入组
exports.getDetermineYJStopIt = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        //取出申请和审核
        ApplicationAndAudit.find({"StudyID": fields.StudyID ,'EventApp' : '3','EventRev' : '3'}, function (err, persons) {
            var applaa = null;
            for(var i = 0 ; i < persons.length ; i++){
                if (persons[i].EventRev == '3'){
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
                var siteStopID = parseInt(fields.id);
                studyStopIt.find({id: siteStopID}, function (err, UnblindingPersons) {
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
                                'msg': '未审核完成,不能进行停止入组操作'
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
                            'msg': '未审核完成,不能进行停止入组操作'
                        });
                        return;
                    }
                    console.log('-整个研究确定/拒绝停止入组')
                    studyStopIt.find({
                        'id' : fields.id,
                    }).exec((err, persons) => {
                        if (persons[0].isStopIt == 2 || persons[0].isStopIt == 1){
                            res.send({
                                'isSucceed': 400,
                                'msg': '该申请已经操作完成'
                            });
                        }else{
                            if (fields.isStopIt == 1){
                                //推送短信
                                //推送邮件
                                //查询该研究所有全国PI
                                users.find({
                                    StudyID : fields.StudyID,
                                    UserFun : 'H1'
                                }).exec((err, persons) => {
                                    users.find({
                                        StudyID: fields.StudyID,
                                        UserFun: 'M1'
                                    }).exec((err, persons1) => {
                                        var phones = [];
                                        var emails = [];
                                        for (var i = 0; i < persons.length; i++) {
                                            var users = persons[i]
                                            if (persons[0].isMail == '是') {
                                                emails.push(users.UserEmail);
                                            }
                                            if (persons[0].isMessage == '是') {
                                                phones.push(users.UserMP)
                                            }
                                        }
                                        for (var i = 0; i < persons1.length; i++) {
                                            var users = persons1[i]
                                            phones.push(users.UserMP);
                                            emails.push(users.UserEmail);
                                        }
                                        //添加申请人
                                        phones.push(fields.UserMP)
                                        emails.push(fields.UserEmail)
                                        //移除相同的
                                        phones = MLArray.unique(phones)
                                        emails = MLArray.unique(emails)
                                        var htmlStr = ''
                                        htmlStr = htmlStr + '<h1>研究停止入组</h1>'
                                        htmlStr = htmlStr + '<h2>' + fields.StudyID + "研究温馨提示：" + '所有研究中心已经于' + (moment().format('YYYY-MM-DD h:mm:ss a')) +'</h2>'
                                        htmlStr = htmlStr + '<h2>停止入组，请知悉！' + '</h2>'

                                        var duanxinStr = '所有研究中心已经停止入组'
                                        for (var j = 0; j < phones.length; j++) {
                                            client.execute('alibaba.aliqin.fc.sms.num.send', {
                                                'extend': '',
                                                'sms_type': 'normal',
                                                'sms_free_sign_name': '诺兰医药科技',
                                                'sms_param': {
                                                    studyID: persons[0].StudyID,
                                                    yytx: duanxinStr,
                                                    date: (moment().format('YYYY-MM-DD h:mm:ss a'))
                                                },
                                                'rec_num': phones[j],
                                                'sms_template_code': "SMS_63885566"
                                            }, function (error, response) {
                                                if (error != null) {
                                                    console.log('阿里错误');
                                                    console.log(error);
                                                } else {
                                                    console.log(response);
                                                }
                                            });
                                        }
                                        for (var m = 0 ; m < emails.length ; m++){
                                            //发送邮件
                                            EMail.fasongxiujian({
                                                from: "诺兰随机专用APP<k13918446402@qq.com>", // 发件地址
                                                to: emails[m], // 收件列表
                                                subject: persons[0].StudyID + "研究停止入组", // 标题
                                                html: htmlStr // html 内容
                                            })
                                        }
                                    })
                                })
                                study.update({
                                    'StudyID' : persons[0].StudyID,
                                },{
                                    'StudStopItType' : 2,
                                    'StudIsStopIt' : 1,
                                    "StudStopItUsers" : fields.StopItUsers, //停止入组操作人
                                    "StudStopItPhone" : fields.StopItPhone, //停止入组操作手机号
                                    'StopItDate' : new Date()
                                },function () {
                                    //把该研究的所有中心全部停止入组
                                    console.log(persons[0].StudyID)
                                    site.find({
                                        'StudyID' : persons[0].StudyID,
                                    }).exec((err, persons22) => {
                                        for (var i = 0 ; i < persons22.length ; i++) {
                                            site.update({
                                                'id' : persons22[i].id,
                                            },{
                                                'isStopIt' : 1,
                                            },function (err,ddd) {
                                                console.log('所有中心停止入组')
                                            })
                                        }
                                    })
                                })
                            }
                            studyStopIt.update({
                                'id' : fields.id,
                            },{
                                'StopItUsers' : fields.StopItUsers,
                                'StopItPhone' : fields.StopItPhone,
                                'isStopIt' : fields.isStopIt,
                                'StopItDate' : new Date()
                            },function () {
                                res.send({
                                    'isSucceed': 400,
                                    'msg': '操作成功'
                                });
                            })
                        }
                    })
                })
            })
        })
    })
}

var gitData = function (personsData,block) {
    // var data = {
    //     "PJRZLS": String, //平均入组例数
    //     "YSJLS": String, //中心以随机数
    // };
    (function iterator(j) {
        if (j == (personsData.length)) {
            block(personsData)
            return;
        }
        //查询该研究有多少中心
        site.chazhaozhongxin(personsData[j].StudyID,function (err,persons) {
            var lishu = 0;
            addSuccessPatient.find({StudyID:personsData[j].StudyID ,SiteID:SiteID ,Random:{$ne:null}}, function (err, FailPersons) {
                data.YSJLS = FailPersons.length;
                (function iterator(i) {
                    var siteData = persons[i];
                    if (i == (persons.length)) {
                        data.PJRZLS = lishu / persons.length;
                        block(data)
                        return;
                    }
                    if (siteData == null){
                        var  sss = 0;
                    }
                    addSuccessPatient.find({StudyID:StudyID ,SiteID:siteData.SiteID ,Random:{$ne:null}}, function (err, FailPersons) {
                        lishu = lishu + FailPersons.length
                        iterator(i + 1)
                    })
                })(0);
            })
        })
    })(0);
}

var gitData1 = function (StudyID,block) {
    var data = {
        "PJRZLS": String, //平均入组例数
        "YSJLS": String, //中心以随机数
    };
    //查询该研究有多少中心
    site.chazhaozhongxin(StudyID,function (err,persons) {
        var lishu = 0;
        (function iterator(i) {
            var siteData = persons[i];
            if (i == persons.length) {
                data.PJRZLS = (lishu / persons.length).toFixed(1);
                data.YSJLS = lishu;
                block(data)
                return;
            }
            addSuccessPatient.find({StudyID:StudyID ,SiteID:siteData.SiteID ,Random:{$ne:null}}, function (err, FailPersons) {
                lishu = lishu + FailPersons.length
                iterator(i + 1)
            })
        })(0);
    })
}
