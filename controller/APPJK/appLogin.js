/**
 * Created by maoli on 16/9/24.
 */
var users = require('../../models/import/users');
var study = require('../../models/import/study');
var researchParameter = require('../../models/import/researchParameter');
var ExcludeStandard = require('../../models/import/ExcludeStandard');
var ApplicationAndAudit = require('../../models/import/ApplicationAndAudit');
var questionPatient = require('../../models/import/questionPatient');
var uuid = require('uuid/v1');

TopClient = require( '../../ALYZM/topClient' ).TopClient;
var client = new TopClient({
    'appkey' : '23500106' ,
    'appsecret' : '7938816533f3fc698534761d15d8f66b' ,
    'REST_URL' : 'http://gw.api.taobao.com/router/rest'
});
var formidable = require('formidable');

//登录
exports.appLogin = function (req, res, next) {
    //得到用户填写的东西
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
                var personsData = [];
                (function iterator(i) {
                    if (i == persons.length){
                        if (personsData.length > 0){//登录
                            console.log(fields)
                            res.send({
                                'isSucceed' : 400,
                                'data' : personsData
                            });
                            //保存registrationId到对应的用户
                            users.update({
                                UserMP : fields.phone,
                            },{
                                platform:fields.platform,
                                registrationId:fields.registrationId,
                            },{multi:true},function (err,data) {
                                console.log("修改成功");
                            })
                            return;
                        }else{
                            res.send({
                                'isSucceed' : 200,
                                'msg' : '未找到该用户的任何研究'
                            });
                            return;
                        }
                    }
                    //判断用户是否同步了数据
                    synchronizeMessage(persons[i])
                    study.find({
                        StudyID:persons[i].StudyID
                    },function (err, studyData) {
                        if (studyData[0].activationStudyYN == null){
                            console.log('未激活');

                        }else if (studyData[0].activationStudyYN == 1){
                            personsData.push(persons[i])
                        }else{
                            console.log('123123')
                        }
                        iterator(i + 1)
                    })
                })(0);

            }
        })
    })
}

/*同步数据*/
function synchronizeMessage(userData) {
    if (userData.isSynchronizeMessage === true) {
        return;
    }
    //判断这个研究是否有相同用户
    users.find({
        StudyID : userData.StudyID,
        UserSite : userData.UserSite,
        UserFun : userData.UserFun,
        UserAcc : {$ne : userData.UserAcc},
        UserMP : {$ne : userData.UserMP},
        isSynchronizeMessage : {$ne : true}
    },function (err, usersPersons) {
        if (usersPersons.length > 0) {
            var json = {
                StudyID : userData.StudyID,
                UserSite : userData.UserSite,
                UserFun : userData.UserFun,
                UserAcc : userData.UserAcc,
                UserMP : userData.UserMP
            }
            users.update(json,{
                $set:{isSynchronizeMessage : true}
            },{multi:true},function (err, data) {
                console.log("123")
            })
            // var uuid2 = uuid();
            // var addUsersJson = {
            //     "addUsers.StudyID" : usersPersons[0].StudyID,
            //     "addUsers.UserSite" : usersPersons[0].UserSite,
            //     "addUsers.UserFun" : usersPersons[0].UserFun,
            //     "addUsers.UserAcc" : usersPersons[0].UserAcc,
            //     "addUsers.UserMP" : usersPersons[0].UserMP,
            //     "isSynchronizeMessage" : {$ne : true}
            // }
            // questionPatient.find(addUsersJson,function (err, questionDatas) {
            //     if (questionDatas.length > 0){
            //         for (var i = 0; i < questionDatas.length; i++) {
            //             questionPatient.create({
            //                 StudyID : questionDatas[i].StudyID,
            //                 CRFModeule : questionDatas[i].CRFModeule,
            //                 voiceUrls : questionDatas[i].voiceUrls,
            //                 text : questionDatas[i].text,
            //                 addUsers : userData,
            //                 Users : questionDatas[i].Users,
            //                 Date : questionDatas[i].Date,
            //                 voiceType : questionDatas[i].voiceType,
            //                 messageIDNum : uuid2,
            //                 markType : questionDatas[i].markType,
            //                 GroupUsers : questionDatas[i].GroupUsers,
            //                 isSynchronizeMessage : true,
            //                 Synchronize : usersPersons[0]
            //             })
            //         }
            //     }
            // })
            var uuid1 = uuid();
            var UsersJson = {
                "Users.StudyID" : usersPersons[0].StudyID,
                "Users.UserSite" : usersPersons[0].UserSite,
                "Users.UserFun" : usersPersons[0].UserFun,
                "Users.UserAcc" : usersPersons[0].UserAcc,
                "Users.UserMP" : usersPersons[0].UserMP,
                "isSynchronizeMessage" : {$ne : true}
            }
            questionPatient.find(UsersJson,function (err, questionDatas) {
                if (questionDatas.length > 0){
                    for (var i = 0; i < questionDatas.length; i++) {
                        questionPatient.create({
                            StudyID : questionDatas[i].StudyID,
                            CRFModeule : questionDatas[i].CRFModeule,
                            voiceUrls : questionDatas[i].voiceUrls,
                            text : questionDatas[i].text,
                            Users : questionDatas[i].Users,
                            addUsers : questionDatas[i].addUsers,
                            Date : questionDatas[i].Date,
                            voiceType : questionDatas[i].voiceType,
                            messageIDNum : uuid1,
                            markType : questionDatas[i].markType,
                            GroupUsers : questionDatas[i].GroupUsers,
                            isSynchronizeMessage : true,
                            SynchronizeUser : userData,
                            serialNumber : questionDatas[i].serialNumber
                        })
                    }
                }
            })
        }
    })
}

//登录
exports.appStudyAndResearchParameter = function (req, res, next) {
    //得到用户填写的东西
    console.log('登录接口');
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //搜索研究
        study.find({StudyID: fields.StudyID}, function (err, persons) {
            if (err != null) {
                res.send({
                    'isSucceed': 200,
                    'msg': '数据库正在维护,请稍后再试'
                });
            }else{
                if (persons.length == 0){
                    res.send({
                        'isSucceed': 200,
                        'msg': '未找到该研究'
                    });
                }else{
                    //查找研究随机化参数
                    researchParameter.find({StudyID: fields.StudyID}, function (err, persons1) {
                        if (err != null) {
                            res.send({
                                'isSucceed': 200,
                                'msg': '数据库正在维护,请稍后再试'
                            });
                        }else{
                            if (persons1.length == 0){
                                res.send({
                                    'isSucceed': 200,
                                    'msg': '未找到该研究随机化参数'
                                });
                            }else{
                                //查找入排标准
                                ExcludeStandard.find({StudyID: fields.StudyID}, function (err, persons2) {
                                    if (err != null) {
                                        res.send({
                                            'isSucceed': 200,
                                            'msg': '数据库正在维护,请稍后再试'
                                        });
                                    }else{
                                        if (persons2.length == 0){
                                            res.send({
                                                'isSucceed': 200,
                                                'msg': '未找到该研究入选排除标准'
                                            });
                                        }else{
                                            //查询申请和审核
                                            ApplicationAndAudit.find({StudyID: fields.StudyID}, function (err, persons3) {
                                                if (err != null) {
                                                    res.send({
                                                        'isSucceed': 200,
                                                        'msg': '数据库正在维护,请稍后再试'
                                                    });
                                                }else{
                                                    if (persons2.length == 0){
                                                        res.send({
                                                            'isSucceed': 200,
                                                            'msg': '未找到该研究任务申请和审核'
                                                        });
                                                    }else {
                                                        res.send({
                                                            'isSucceed': 400,
                                                            'study': persons[0],
                                                            'ApplicationAndAudit': persons3,
                                                            'ExcludeStandard': persons2,
                                                            'researchParameter': persons1[0]
                                                        });
                                                    }
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        }
                    })
                }
            }
        })
    })
},

//获取验证码
exports.appIDCode = function (req, res, next) {
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields,files);
        //搜索数据库中是否有该用户
        users.find({'UserAcc':fields.phone},function (err, persons) {
            var idCoed = generateMixed(4);
            if (err != null){
                console.log(error);
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
            }else{
                if (persons.length > 0){//发送验证码
                    client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                        'extend' : '' ,
                        'sms_type' : 'normal' ,
                        'sms_free_sign_name' : '诺兰医药科技' ,
                        'sms_param' : {
                            "text":idCoed
                        } ,
                        'rec_num' : fields.phone ,
                        'sms_template_code' : "SMS_27335120"
                    }, function(error, response) {
                        if (!error) {
                            res.send({
                                'isSucceed' : 400,
                                'IDCode' : idCoed
                            });
                        }else{
                            console.log(error)
                            res.send({
                                'isSucceed' : 200,
                                'msg' : '验证码发送失败' + error.toString()
                            });
                        }
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
//生成随机数
var chars = ['0','1','2','3','4','5','6','7','8','9'];
function generateMixed(n) {
    var res = "";
    for(var i = 0; i < n ; i ++) {
        var id = Math.ceil(Math.random()*chars.length);
        console.log(id)
        if (id == 10){
            id = 0;
        }
        res += chars[id];
    }
    return res;
}