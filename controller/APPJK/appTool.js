/**
 * Created by maoli on 16/9/25.
 */

var users = require('../../models/import/users');

//查询用户所有研究
exports.appGetStud = function (req, res, next) {
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