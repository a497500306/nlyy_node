/**
 * Created by maoli on 16/9/24.
 */
var users = require('../../models/import/users');

TopClient = require( '../../ALYZM/topClient' ).TopClient;
var client = new TopClient({
    'appkey' : '23465484' ,
    'appsecret' : 'a3d49830909f0d11b04118ae8cdd329d' ,
    'REST_URL' : ' http://gw.api.taobao.com/router/rest '
});

var formidable = require('formidable');

//登录
exports.appLogin = function (req, res, next) {
    //得到用户填写的东西
    console.log('登录接口');
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
                        'sms_free_sign_name' : '' ,
                        'sms_param' : {
                            text:idCoed
                        } ,
                        'rec_num' : fields.phone ,
                        'sms_template_code' : "SMS_16250342"
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