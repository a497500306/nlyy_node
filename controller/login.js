var formidable = require('formidable');
var adminUser = require("../models/adminUsers");
var settings = require("../settings");

var study = require("../models/study");
var dbHelper = require('../models/dbHelper');

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
    console.log("进来了");
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields);
    });

        res.render("mshome",{
            "userName": req.session.name
    });
}

//管理页面获取网络请求
exports.doHome = function (req, res, next) {
    if(req.session.login!= '1'){
        res.render("./login");
        return;
    }
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        if (fields.id == "xzyj"){//新增研究
            dbHelper.pageQuery(Number(fields.page),10,study,"",{},{
                Date: 'desc'
            },function (error, $page) {
                if(error){
                    next(error);
                }else{
                    $page['read'] = req.session.read;
                    $page['write'] = req.session.write;
                    $page['addUser'] = req.session.addUser;
                    $page['keys'] = ['研究序列号','研究编号','申办方全称','申办方简称','研究标题全称','研究标题简称','全国PI手机号',
                                      '全国PI','全国PI邮箱','治疗领域','研究分期','研究总样本量'
                                      ,'受试者入组是否中心之间竞争','中心平均入组例数','研究总招募月数','研究招募信心度','添加时间','操作'];
                    $page['keysEn'] = ['StudySeq','StudyID','SponsorF','SponsorS','StudNameF','StudNameS','CoorPIPhone','CoorPI',
                        'CoorPIEMail','TherArea','StudyPh','StudySize','AccrualCmpYN'
                        ,'AccrualPerS','AccrualT','AccrualConf','Date','操作'];
                    $page['importUrl'] = "/nlyy/addYzyj";
                    res.send($page)
                }
            })
        }else if(fields.id == "xzyjzx"){//新增研究中心

        }else if(fields.id == "szyjsjhcs"){//设置研究随机化参数

        }else if(fields.id == "xzyjzx"){//新增研究中心

        }else if(fields.id == "xzck"){//新增仓库

        }else if(fields.id == "dryjrxpcbz"){//导入研究入选排除标准

        }else if(fields.id == "gdsjfdrsjh"){//固定随机法导入随机号

        }else if(fields.id == "drywh"){//导入药物号

        }else if(fields.id == "nztjssjsywaqkc"){//内置统计算式计算药物安全库存

        }else if(fields.id == "szsszsfcs"){//设置受试者随访参数

        }else if(fields.id == "szrwsqhsh"){//设置任务申请和审核

        }else if(fields.id == "szhlyh"){//设置管理用户

        }
        return;
    });
}

/*************导入数据*****************/
