/**
 * Created by maoli on 16/9/24.
 */
var users = require('../../models/import/users');
var study = require('../../models/import/study');
var researchParameter = require('../../models/import/researchParameter');
var ExcludeStandard = require('../../models/import/ExcludeStandard');
var ApplicationAndAudit = require('../../models/import/ApplicationAndAudit');

TopClient = require( '../../ALYZM/topClient' ).TopClient;
var client = new TopClient({
    'appkey' : '23500106' ,
    'appsecret' : '7938816533f3fc698534761d15d8f66b' ,
    'REST_URL' : 'http://gw.api.tbsandbox.com/router/rest'
});

var formidable = require('formidable');

//登录
exports.appLogin = function (req, res, next) {
    //得到用户填写的东西
    console.log('登录接口');
    console.log(req);
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log("post");
        console.log(fields)
        console.log(fields.phone);
        //搜索是否存在该用户
        users.chazhaoPhone(fields.phone,function (err, persons) {
            if (err != null){
                console.log(error);
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
            }else{
                console.log('登陆');
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
        users.chazhaoPhone(fields.phone,function (err, persons) {
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
                            "text":"idCoed"
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
                            res.send({
                                'isSucceed' : 200,
                                'msg' : '验证码发送失败'
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
        res += chars[id];
    }
    return res;
}