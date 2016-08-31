var formidable = require('formidable');
var adminUser = require("../models/adminUsers");
var settings = require("../settings");

//显示登录界面
exports.showAdmin = function (req, res, next) {
    res.render("./login");
}

//登录交互
exports.doLogin = function (req, res, next) {
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields);
        adminUser.find(fields,function (err, result) {
            console.log(result);
            if (result.length == 1){
                //登录成功
                //成功后返回
                //记录session
                req.session.login = "1";
                req.session.name = result[0].name;
                req.session.read = result[0].read;
                req.session.write = result[0].write;
                req.session.addUser = result[0].addUser;
                res.send({
                    'isSucceed' : "1",
                    'msg' : '成功',
                    'url' : settings.fwqUrl + '/home'
                });
                return;
            }else{
                res.send({
                    'isSucceed' : "3",
                    'msg' : '账号或密码错误'
                });
                return;
            }
        })
    })
}

//进入管理界面
exports.showHome = function (req, res, next) {
    if(req.session.login!= '1'){
        res.render("login");
        return;
    }
    res.render("mshome",{
        "userName": req.session.name,
    });
}