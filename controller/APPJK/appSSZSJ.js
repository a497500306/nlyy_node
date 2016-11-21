/**
 * Created by maoli on 16/10/19.
 */
var formidable = require('formidable');
var site = require('../../models/import/site');
var researchParameter = require('../../models/import/researchParameter');
var addSuccessPatient = require('../../models/import/addSuccessPatient');
var addFailPatient = require('../../models/import/addFailPatient');
var random = require('../../models/import/random');
var drugCK = require('../../models/import/drugCK')
var EMail = require("../../models/EMail");
var users = require('../../models/import/users')
var drugWL = require('../../models/import/drugWL')
var yytx = require('../../models/import/yytx')
var randomTool = require('../../randomTool/MLRandomTool')
//获取中心数据
exports.getSite = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //获取某个中心数据
        site.chazhaomougezhongxin(fields.StudyID,fields.UserSite,function (err, persons) {
            console.log(persons)
            if (err != null){
                if (err.isSucceed == "200"){
                    res.send(err);
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据库正在维护,请稍后再试'
                    });
                }
            }else if (persons.length == 0){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '没有找到该中心'
                });
            }else{
                res.send({
                    'isSucceed' : 400,
                    'site' : persons[0]
                });
            }
        })
    })
}

//判断中心是否停止入组
exports.getIsStopItSite = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        site.find({StudyID:fields.StudyID,SiteID: fields.SiteID,isStopIt:1}, function (err, persons1) {
            console.log(persons1)
            if (err != null) {
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库错误'
                });
            }else{
                if (persons1.length == 0){
                    res.send({
                        'isSucceed' : 400,
                        'msg' : '中心未停止入组'
                    });
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '中心停止入组'
                    });
                }
            }
        })
    })
}

//添加成功受试者基础数据
exports.getAddSuccessBasicsData = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //搜索新增失败中是否有该用户
        addFailPatient.find({StudyID : fields.StudyID,SubjMP : fields.SubjMP},function (err, persons) {
            if (persons.length != 0){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '该手机已经使用'
                });
            }else{
                addSuccessPatient.find({StudyID : fields.StudyID,SubjMP : fields.SubjMP},function (err, persons) {
                    if (persons.length != 0){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '该手机已经使用'
                        });
                    }else{
                        addSuccessPatient.create({
                            StudySeq:fields.StudySeq,
                            StudyID:fields.StudyID,
                            SiteID:fields.SiteID,
                            SiteNam:fields.SiteNam,
                            ScreenYN:fields.ScreenYN,
                            SubjDOB:fields.SubjDOB,
                            SubjSex:fields.SubjSex,
                            SubjIni:fields.SubjIni,
                            SubjMP:fields.SubjMP,
                            RandoM:fields.RandoM,
                            SubjFa:fields.SubjFa,
                            SubjFb:fields.SubjFb,
                            SubjFc:fields.SubjFc,
                            SubjFd:fields.SubjFd,
                            SubjFe:fields.SubjFe,
                            SubjFf:fields.SubjFf,
                            SubjFg:fields.SubjFg,
                            SubjFh:fields.SubjFh,
                            SubjFi:fields.SubjFi,
                            SubjStudYN:fields.SubjStudYN,
                            Date:new Date()
                        },function (err,data) {
                            //创建用户号
                            addSuccessPatient.update({
                                'id' : data.id,
                            },{
                                'USubjID' : data.SiteID + data.SubjID,
                            },function () {
                                res.send({
                                    'isSucceed' : 400,
                                    'USubjID' : data.SiteID + data.SubjID,
                                    'id' : data.id
                                });
                            })
                        })
                    }
                })
            }
        })
    })
}

//用药提醒
exports.getYytx = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //先查找该研究是否有该手机号码用药提醒,有的话修改,没有的话添加
        yytx.find({StudyID:fields.StudyID,phone:fields.phone}, function (err, persons) {
            if (persons.length == 0){//没有,添加
                yytx.create({
                    StudyID:fields.StudyID,
                    Date:new Date(),
                    phone : fields.phone,
                    //开始时间
                    kaishiStr : fields.kaishiStr,
                    //结束时间
                    jiesuStr : fields.jiesuStr,
                    //推送时间
                    tuisong1 : fields.tuisong1,
                    //推送内容
                    tuisongnr1 : fields.tuisongnr1,
                    //推送时间
                    tuisong2 :  fields.tuisong2,
                    //推送内容
                    tuisongnr2 : fields.tuisongnr2,
                    //推送时间
                    tuisong3 :  fields.tuisong3,
                    //推送内容
                    tuisongnr3 :  fields.tuisongnr3,
                },function (err,data) {
                    if (err != null){
                        res.send({
                            'isSucceed': 200,
                            'msg': '数据库错误'
                        });
                    }else {
                        res.send({
                            'isSucceed': 400,
                            'msg': '添加成功'
                        });
                    }
                })
            }else{//有!修改
                //更新
                yytx.update({
                    'StudyID':fields.StudyID,
                    'phone':fields.phone
                },{
                    Date:new Date(),
                    phone : fields.phone,
                    //开始时间
                    kaishiStr : fields.kaishiStr,
                    //结束时间
                    jiesuStr : fields.jiesuStr,
                    //推送时间
                    tuisong1 : fields.tuisong1,
                    //推送内容
                    tuisongnr1 : fields.tuisongnr1,
                    //推送时间
                    tuisong2 :  fields.tuisong2,
                    //推送内容
                    tuisongnr2 : fields.tuisongnr2,
                    //推送时间
                    tuisong3 :  fields.tuisong3,
                    //推送内容
                    tuisongnr3 :  fields.tuisongnr3,
                },function () {
                    res.send({
                        'isSucceed': 400,
                        'msg': '添加成功'
                    });
                })
            }
        })
    })
}

//补充药物号
exports.getBcywh = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //药物号
        drugCK.find({StudyID:fields.StudyID ,UsedCoreId:fields.SiteID,DDrugNumAYN: 1,DDrugUseAYN:{$ne:1}}).sort('DrugNum').exec(function(err, drugPersons) {
            if (err != null) {
                console.log(err)
                console.log('错误')
            }
            console.log('中心已激活药物号个数')
            console.log(drugPersons.length)
            if (drugPersons.length < 20) {
                users.find({
                    StudyID: fields.StudyID,
                    UserFun: 'H4',
                    UserSite: fields.SiteID
                }, function (err, usersPersons) {
                    //异步转同步
                    (function iterator(i) {
                        console.log('查找仓管员')
                        if (i == usersPersons.length) {
                            return
                        }
                        site.find({StudyID: fields.StudyID, SiteID: fields.SiteID}, function (err, sitePersons) {
                            //发送短信提醒
                            //发送药物号不足提醒
                            var htmlStr = '<h2>中心:' + sitePersons[0].SiteNam + '</h2>'
                            htmlStr = htmlStr + '<h2>药物号不足</h2>'
                            EMail.fasongxiujian({
                                from: "配送清单<k13918446402@qq.com>", // 发件地址
                                to: usersPersons[i].UserEmail, // 收件列表
                                subject: "药物号不足提醒", // 标题
                                html: htmlStr // html 内容
                            })
                            iterator(i + 1)
                        })
                    })(0);
                })
                users.find({StudyID: fields.StudyID, UserFun: 'M6'}, function (err, usersPersons) {
                    //异步转同步
                    (function iterator(i) {
                        console.log('查找总仓管员')
                        if (i == usersPersons.length) {
                            return
                        }
                        site.find({StudyID: fields.StudyID, SiteID: fields.SiteID}, function (err, sitePersons) {
                            //发送短信提醒
                            //发送药物号不足提醒
                            var htmlStr = '<h2>中心:' + sitePersons[0].SiteNam + '</h2>'
                            htmlStr = htmlStr + '<h2>药物号不足</h2>'
                            EMail.fasongxiujian({
                                from: "配送清单<k13918446402@qq.com>", // 发件地址
                                to: usersPersons[i].UserEmail, // 收件列表
                                subject: "药物号不足提醒", // 标题
                                html: htmlStr // html 内容
                            })
                            iterator(i + 1)
                        })
                    })(0);
                })
            }
            if (drugPersons.length == 0) {
                res.send({
                    'isSucceed': 200,
                    'msg': '该中心已激活药物号不足'
                });
            } else {
                //设置为已使用
                drugCK.update({
                    'id':drugPersons[0].id
                },{
                    DDrugUseAYN:1 ,
                    DDrugUseID:fields.userId
                },function () {
                    console.log("药物号修改成功");
                })
                addSuccessPatient.update({
                    'id':fields.userId
                },{
                    $push : {
                        'Drug' : drugPersons[0].DrugNum,
                        'DrugDate' : new Date()
                    } ,
                },function () {
                    res.send({
                        'isSucceed': 200,
                        'msg': '药物号:' + drugPersons[0].DrugNum
                    });
                })
            }
        })
    })
}

//替换药物号
exports.getThywh = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        //药物号
        drugCK.find({StudyID:fields.StudyID ,UsedCoreId:fields.SiteID,DDrugNumAYN: 1,DDrugUseAYN:{$ne:1}}).sort('DrugNum').exec(function(err, drugPersons) {
            if (err != null) {
                console.log(err)
                console.log('错误')
            }
            console.log('中心已激活药物号个数')
            console.log(drugPersons.length)
            if (drugPersons.length < 20) {
                users.find({
                    StudyID: fields.StudyID,
                    UserFun: 'H4',
                    UserSite: fields.SiteID
                }, function (err, usersPersons) {
                    //异步转同步
                    (function iterator(i) {
                        console.log('查找仓管员')
                        if (i == usersPersons.length) {
                            return
                        }
                        site.find({StudyID: fields.StudyID, SiteID: fields.SiteID}, function (err, sitePersons) {
                            //发送短信提醒
                            //发送药物号不足提醒
                            var htmlStr = '<h2>中心:' + sitePersons[0].SiteNam + '</h2>'
                            htmlStr = htmlStr + '<h2>药物号不足</h2>'
                            EMail.fasongxiujian({
                                from: "配送清单<k13918446402@qq.com>", // 发件地址
                                to: usersPersons[i].UserEmail, // 收件列表
                                subject: "药物号不足提醒", // 标题
                                html: htmlStr // html 内容
                            })
                            iterator(i + 1)
                        })
                    })(0);
                })
                users.find({StudyID: fields.StudyID, UserFun: 'M6'}, function (err, usersPersons) {
                    //异步转同步
                    (function iterator(i) {
                        console.log('查找总仓管员')
                        if (i == usersPersons.length) {
                            return
                        }
                        site.find({StudyID: fields.StudyID, SiteID: fields.SiteID}, function (err, sitePersons) {
                            //发送短信提醒
                            //发送药物号不足提醒
                            var htmlStr = '<h2>中心:' + sitePersons[0].SiteNam + '</h2>'
                            htmlStr = htmlStr + '<h2>药物号不足</h2>'
                            EMail.fasongxiujian({
                                from: "配送清单<k13918446402@qq.com>", // 发件地址
                                to: usersPersons[i].UserEmail, // 收件列表
                                subject: "药物号不足提醒", // 标题
                                html: htmlStr // html 内容
                            })
                            iterator(i + 1)
                        })
                    })(0);
                })
            }
            if (drugPersons.length == 0) {
                res.send({
                    'isSucceed': 200,
                    'msg': '该中心已激活药物号不足'
                });
            } else {
                //设置为已使用
                drugCK.update({
                    'id':drugPersons[0].id
                },{
                    DDrugUseAYN:1 ,
                    DDrugUseID:fields.userId
                },function () {
                    console.log("药物号修改成功");
                })
                drugCK.update({
                    'StudyID':fields.StudyID,
                    'DrugNum':fields.DrugNum
                },{
                    'DDrugNumAYN' : 0 ,
                    'DDrugDMNumYN' : 1
                },function () {
                    console.log("药物号修改成功");
                    //修改物流信息
                    drugWL.update({
                        'StudyID' : fields.StudyID,
                        'DrugNum' : fields.DrugNum
                    },{
                        $push : {
                            'drugStrs' : '替换药物号,废弃',
                            'drugDate' : new Date()
                        } ,
                    },function () {
                        console.log("修改成功");
                    })
                })
                addSuccessPatient.update({
                    'id':fields.userId
                },{
                    $push : {
                        'Drug' : "替换药物号为" + drugPersons[0].DrugNum,
                        'DrugDate' : new Date()
                    } ,
                },function () {
                    res.send({
                        'isSucceed': 200,
                        'msg': '药物号:' + drugPersons[0].DrugNum
                    });
                })
            }
        })
    })
}
//取随机号
exports.getRandomNumber = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //异步转同步
        (function iterator(i) {
            //取出研究随机化参数信息
            researchParameter.find({StudyID:fields.StudyID}, function (err, persons) {
                if (err != null){
                    res.send({
                        'isSucceed': 200,
                        'msg': '数据库错误'
                    });
                }else{
                    if (persons[0].length == 0){
                        res.send({
                            'isSucceed': 200,
                            'msg': '未找到该研究随机化信息'
                        });
                    }else{
                        if (persons[0].RandoM == 1){//无分层因素固定随机:先到先得
                            //取随机号
                            random.find({StudyID:fields.StudyID,isUse:{$ne:1}}).sort('RandoNum').exec(function(err, randomPersons) {
                                if (randomPersons.length == 0){
                                    res.send({
                                        'isSucceed': 200,
                                        'msg': '随机号已用完'
                                    });
                                    return
                                }else{
                                    //判断是否取药物号
                                    if (persons[0].BlindSta == 2){//单盲实验
                                        //是否提供药物号
                                        if (persons[0].DrugNSBlind == 1){//是
                                            //取出随机号和药物号
                                            youyaowuhaoquyaowuhao(persons,fields,randomPersons,persons[0].RandoM,res)
                                        }else{//否
                                            meiyouyaowuhao(persons,randomPersons,persons[0].RandoM,res)
                                        }
                                    }else if (persons[0].BlindSta == 3){//开放
                                        //判断是否提供药物号
                                        if (persons[0].DrugNOpen == 1){//是
                                            //取出随机号和药物号
                                            youyaowuhaoquyaowuhao(persons,fields,randomPersons,persons[0].RandoM,res)
                                        }else{//否
                                            //取出随机号不取药物号
                                            meiyouyaowuhao(persons,randomPersons,persons[0].RandoM,res)
                                        }
                                    }else{//双盲实验
                                        //取出随机号和药物号
                                        youyaowuhaoquyaowuhao(persons,fields,randomPersons,persons[0].RandoM,res)
                                    }
                                }
                            })
                        }else if(persons[0].RandoM == 2){//有分层因素固定随机:判断分层因素,后先到先得
                            //取随机号
                            random.find({
                                StudyID:fields.StudyID,
                                SubjFa:fields.SubjFa == '' ? null:fields.SubjFa,
                                SubjFb:fields.SubjFb == '' ? null:fields.SubjFb,
                                SubjFc:fields.SubjFc == '' ? null:fields.SubjFc,
                                SubjFd:fields.SubjFd == '' ? null:fields.SubjFd,
                                SubjFe:fields.SubjFe == '' ? null:fields.SubjFe,
                                SubjFf:fields.SubjFf == '' ? null:fields.SubjFf,
                                SubjFg:fields.SubjFg == '' ? null:fields.SubjFg,
                                SubjFh:fields.SubjFh == '' ? null:fields.SubjFh,
                                SubjFi:fields.SubjFi == '' ? null:fields.SubjFi,
                                isUse:{$ne:1}
                            }).sort('RandoNum').exec(function(err, randomPersons) {
                                if (randomPersons.length == 0){
                                    res.send({
                                        'isSucceed': 200,
                                        'msg': '随机号已用完'
                                    });
                                    return
                                }else{
                                    //判断是否取药物号
                                    if (persons[0].BlindSta == 2){//单盲实验
                                        //是否提供药物号
                                        if (persons[0].DrugNSBlind == 1){//是
                                            //取出随机号
                                            youyaowuhaoquyaowuhao(persons,fields,randomPersons,persons[0].RandoM,res)
                                        }else{//否
                                            //取出随机号不取药物号
                                            meiyouyaowuhao(persons,randomPersons,persons[0].RandoM,res)
                                        }
                                    }else if (persons[0].BlindSta == 3){//开放
                                        //判断是否提供药物号
                                        if (persons[0].DrugNOpen == 1){//是
                                            //取出随机号
                                            youyaowuhaoquyaowuhao(persons,fields,randomPersons,persons[0].RandoM,res)
                                        }else{//否
                                            //取出随机号不取药物号
                                            meiyouyaowuhao(persons,randomPersons,persons[0].RandoM,res)
                                        }
                                    }else{//双盲实验
                                        //取出随机号
                                        youyaowuhaoquyaowuhao(persons,fields,randomPersons,persons[0].RandoM,res)
                                    }
                                }
                            })
                        }else if(persons[0].RandoM == 3){//动态随机
                            //判断是否取药物号
                            if (persons[0].BlindSta == 2){//单盲实验
                                //是否提供药物号
                                if (persons[0].DrugNSBlind == 1){//是
                                    dongtaisuijiYouyaowuhao(persons,fields,persons[0].RandoM,res)
                                }else{//否
                                    dongtaisuijiWuyaowuhao(persons,fields,persons[0].RandoM,res)
                                }
                            }else if (persons[0].BlindSta == 3){//开放
                                //判断是否提供药物号
                                if (persons[0].DrugNOpen == 1){//是
                                    dongtaisuijiYouyaowuhao(persons,fields,persons[0].RandoM,res)
                                }else{//否
                                    dongtaisuijiWuyaowuhao(persons,fields,persons[0].RandoM,res)
                                }
                            }else{//双盲实验
                                dongtaisuijiYouyaowuhao(persons,fields,persons[0].RandoM,res)
                            }
                        }else{
                            res.send({
                                'isSucceed': 200,
                                'msg': '研究随机化信息中随机方法错误'
                            });
                        }
                    }
                }
            })
        })(0);
    })
}
//动态随机
//有药物号动态随机
function dongtaisuijiYouyaowuhao(persons,fields,RandoM,res) {
    //获取0~1中的一个小数
    var rand = Math.random();
    //药物号
    drugCK.find({StudyID:fields.StudyID ,UsedCoreId:fields.SiteID,DDrugNumAYN: 1,DDrugUseAYN:{$ne:1}}).sort('DrugNum').exec(function(err, drugPersons) {
        if (err != null){
            console.log(err)
            console.log('错误')
        }
        console.log('中心已激活药物号个数')
        console.log(drugPersons.length)
        if (drugPersons.length < 20){
            users.find({StudyID:fields.StudyID ,UserFun:'H4',UserSite:fields.SiteID}, function (err, usersPersons) {
                //异步转同步
                (function iterator(i){
                    console.log('查找仓管员')
                    if(i == usersPersons.length){
                        return
                    }
                    site.find({StudyID:fields.StudyID , SiteID:fields.SiteID}, function (err, sitePersons) {
                        //发送短信提醒
                        //发送药物号不足提醒
                        var htmlStr = '<h2>中心:' + sitePersons[0].SiteNam + '</h2>'
                        htmlStr = htmlStr + '<h2>药物号不足</h2>'
                        EMail.fasongxiujian({
                            from: "配送清单<k13918446402@qq.com>", // 发件地址
                            to: usersPersons[i].UserEmail, // 收件列表
                            subject: "药物号不足提醒", // 标题
                            html: htmlStr // html 内容
                        })
                        iterator(i+1)
                    })
                })(0);
            })
            users.find({StudyID:fields.StudyID ,UserFun:'M6'}, function (err, usersPersons) {
                //异步转同步
                (function iterator(i){
                    console.log('查找总仓管员')
                    if(i == usersPersons.length){
                        return
                    }
                    site.find({StudyID:fields.StudyID , SiteID:fields.SiteID}, function (err, sitePersons) {
                        //发送短信提醒
                        //发送药物号不足提醒
                        var htmlStr = '<h2>中心:' + sitePersons[0].SiteNam + '</h2>'
                        htmlStr = htmlStr + '<h2>药物号不足</h2>'
                        EMail.fasongxiujian({
                            from: "配送清单<k13918446402@qq.com>", // 发件地址
                            to: usersPersons[i].UserEmail, // 收件列表
                            subject: "药物号不足提醒", // 标题
                            html: htmlStr // html 内容
                        })
                        iterator(i+1)
                    })
                })(0);
            })
        }
        if (drugPersons.length == 0){
            res.send({
                'isSucceed': 200,
                'msg': '该中心已激活药物号不足'
            });
        }else {
            dongtaisuijiWuyaowuhao(persons,fields,RandoM,res,drugPersons)
        }
    })
    //drugPersons
}

//无药物号动态随机
function dongtaisuijiWuyaowuhao(persons,fields,RandoM,res,drugPersons) {
//获取0~1中的一个小数
    var rand = Math.random();
    //判断是不是第一个取随机号的用户
    addSuccessPatient.find({StudyID:fields.StudyID , Random:{$ne:null}}, function (err, addSuccessPersons) {
        if (addSuccessPersons.length == 0) {//第一个用户
            console.log("第一个用户,使用完全随机")
            //随机
            var rand = Math.random();
            //取出治疗组和比例
            var ntrtGrp = persons[0].NTrtGrp.split(",");
            var alloRatio = persons[0].AlloRatio.split(",");
            if (ntrtGrp.length != alloRatio.length){
                //输出
                res.send({
                    'isSucceed': 200,
                    'msg': "数据错误,治疗组数与比例数不相等"
                });
                return
            }else{
                var glArray = [];
                for (var i = 0 ; i < alloRatio.length ; i++){
                    for (var j = 0 ; j < alloRatio[i] ; j++){
                        glArray.push(i)
                    }
                }
                //随机取数组中的元素
                var id = 0;
                var jj = 1;
                while(jj){
                    id = Math.ceil(Math.random()*10);
                    if (id <= glArray.length){
                        jj = 0
                    }
                }
                id = id - 1
                //需要放入的治疗组
                var ntrtInt = alloRatio[id];
                var ntrtGrp = ntrtGrp[id];
                //在随机号数据库中添加一条随机号数据
                //搜索该研究中有多少随机号
                chuchunyonghu(RandoM,drugPersons,persons,ntrtGrp,res,fields)
            }
        }else {//不是第一个用户
            //计算每组内各层的受试者人数
            //1.0取出该研究所有受试者
            addSuccessPatient.find({StudyID:fields.StudyID , Random:{$ne:null}, Arm:{$ne:null}}, function (err, addSuccessPersons) {
                //创建各组的字典数组
                var SubjFs = [];
                var nTrtGrpArray = persons[0].NTrtGrp.split(",");
                for (var i = 0 ; i < nTrtGrpArray.length ; i++){
                    SubjFs[nTrtGrpArray[i]] = [];
                }
                var sss = 0
                //1.先把所有用户的<随机分层因素>放到对应的数组中:[[[A组分层因素A],[A组分层因素B]],[[B组分层因素A],[B组分层因素B]]]
                for (var i = 0 ; i < addSuccessPersons.length ; i++) {
                    if (addSuccessPersons[i].SubjFa != ""){
                        if (SubjFs[addSuccessPersons[i].Arm][0]  != null){
                            SubjFs[addSuccessPersons[i].Arm][0].push(addSuccessPersons[i].SubjFa)
                        }else {
                            var array = new Array()
                            array.push(addSuccessPersons[i].SubjFa)
                            SubjFs[addSuccessPersons[i].Arm].push(array)
                        }
                    }
                    if (addSuccessPersons[i].SubjFb != ""){
                        if (SubjFs[addSuccessPersons[i].Arm][1] != null){
                            SubjFs[addSuccessPersons[i].Arm][1].push(addSuccessPersons[i].SubjFb)
                        }else {
                            var array = new Array()
                            array.push(addSuccessPersons[i].SubjFb)
                            SubjFs[addSuccessPersons[i].Arm].push(array)
                        }
                    }
                    if (addSuccessPersons[i].SubjFc != ""){
                        if (SubjFs[addSuccessPersons[i].Arm][2] != null){
                            SubjFs[addSuccessPersons[i].Arm][2].push(addSuccessPersons[i].SubjFc)
                        }else {
                            var array = new Array()
                            array.push(addSuccessPersons[i].SubjFc)
                            SubjFs[addSuccessPersons[i].Arm].push(array)
                        }
                    }
                    if (addSuccessPersons[i].SubjFd != ""){
                        if (SubjFs[addSuccessPersons[i].Arm][3] != null){
                            SubjFs[addSuccessPersons[i].Arm][3].push(addSuccessPersons[i].SubjFd)
                        }else {
                            var array = new Array()
                            array.push(addSuccessPersons[i].SubjFd)
                            SubjFs[addSuccessPersons[i].Arm].push(array)
                        }
                    }
                    if (addSuccessPersons[i].SubjFe != ""){
                        if (SubjFs[addSuccessPersons[i].Arm][4] != null){
                            SubjFs[addSuccessPersons[i].Arm][4].push(addSuccessPersons[i].SubjFe)
                        }else {
                            var array = new Array()
                            array.push(addSuccessPersons[i].SubjFe)
                            SubjFs[addSuccessPersons[i].Arm].push(array)
                        }
                    }
                    if (addSuccessPersons[i].SubjFf != ""){
                        if (SubjFs[addSuccessPersons[i].Arm][5] != null){
                            SubjFs[addSuccessPersons[i].Arm][5].push(addSuccessPersons[i].SubjFf)
                        }else {
                            var array = new Array()
                            array.push(addSuccessPersons[i].SubjFf)
                            SubjFs[addSuccessPersons[i].Arm].push(array)
                        }
                    }
                    if (addSuccessPersons[i].SubjFg != ""){
                        if (SubjFs[addSuccessPersons[i].Arm][6] != null){
                            SubjFs[addSuccessPersons[i].Arm][6].push(addSuccessPersons[i].SubjFg)
                        }else {
                            var array = new Array()
                            array.push(addSuccessPersons[i].SubjFg)
                            SubjFs[addSuccessPersons[i].Arm].push(array)
                        }
                    }
                    if (addSuccessPersons[i].SubjFh != ""){
                        if (SubjFs[addSuccessPersons[i].Arm][7] != null){
                            SubjFs[addSuccessPersons[i].Arm][7].push(addSuccessPersons[i].SubjFh)
                        }else {
                            var array = new Array()
                            array.push(addSuccessPersons[i].SubjFh)
                            SubjFs[addSuccessPersons[i].Arm].push(array)
                        }
                    }
                    if (addSuccessPersons[i].SubjFi != ""){
                        var iii = 0
                        if (addSuccessPersons[i].SubjFa != ""){
                            iii = 1
                        }
                        if (addSuccessPersons[i].SubjFb != ""){
                            iii = 2
                        }
                        if (addSuccessPersons[i].SubjFc != ""){
                            iii = 3
                        }
                        if (addSuccessPersons[i].SubjFd != ""){
                            iii = 4
                        }
                        if (addSuccessPersons[i].SubjFe != ""){
                            iii = 5
                        }
                        if (addSuccessPersons[i].SubjFf != ""){
                            iii = 6
                        }
                        if (addSuccessPersons[i].SubjFg != ""){
                            iii = 7
                        }
                        if (addSuccessPersons[i].SubjFh != ""){
                            iii = 8
                        }
                        if (SubjFs[addSuccessPersons[i].Arm][iii] != null){
                            SubjFs[addSuccessPersons[i].Arm][iii].push(addSuccessPersons[i].SubjFi)
                        }else {
                            var array = new Array()
                            array.push(addSuccessPersons[i].SubjFi)
                            SubjFs[addSuccessPersons[i].Arm].push(array)
                        }
                    }
                }
                //2.根据随机化参数表中的所有随机分层因素,查询数组中对应的因素的个数
                //2.1根据新用户的选择分层因素,取出该因素的分组情况
                console.log("所有人的所有分层因素合集")
                console.log(SubjFs)
                var rensus = [];
                for (var i = 0 ; i < nTrtGrpArray.length ; i++){
                    var array = [];
                    if (addSuccessPersons[0].SubjFa != ""){
                        var gesu = 0;
                        if (SubjFs[nTrtGrpArray[i]].length == 0){
                            array.push(0)
                        }else{
                            for (var j = 0 ; j < SubjFs[nTrtGrpArray[i]][0].length ; j++){
                                if (SubjFs[nTrtGrpArray[i]][0][j] == fields.SubjFa){
                                    gesu = gesu + 1;
                                }
                            }
                            array.push(gesu)
                        }
                    }
                    if (addSuccessPersons[0].SubjFb != ""){
                        var gesu = 0;
                        if (SubjFs[nTrtGrpArray[i]].length == 0){
                            array.push(0)
                        }else {
                            var gesu = 0;
                            for (var j = 0; j < SubjFs[nTrtGrpArray[i]][1].length; j++) {
                                if (SubjFs[nTrtGrpArray[i]][1][j] == fields.SubjFb) {
                                    gesu = gesu + 1;
                                }
                            }
                            array.push(gesu)
                        }
                    }
                    if (addSuccessPersons[0].SubjFc != ""){
                        var gesu = 0;
                        if (SubjFs[nTrtGrpArray[i]].length == 0){
                            array.push(0)
                        }else {
                            var gesu = 0;
                            for (var j = 0; j < SubjFs[nTrtGrpArray[i]][2].length; j++) {
                                if (SubjFs[nTrtGrpArray[i]][2][j] == fields.SubjFc) {
                                    gesu = gesu + 1;
                                }
                            }
                            array.push(gesu)
                        }
                    }
                    if (addSuccessPersons[0].SubjFd != ""){
                        var gesu = 0;
                        if (SubjFs[nTrtGrpArray[i]].length == 0){
                            array.push(0)
                        }else {
                            var gesu = 0;
                            for (var j = 0; j < SubjFs[nTrtGrpArray[i]][3].length; j++) {
                                if (SubjFs[nTrtGrpArray[i]][3][j] == fields.SubjFd) {
                                    gesu = gesu + 1;
                                }
                            }
                            array.push(gesu)
                        }
                    }
                    if (addSuccessPersons[0].SubjFe != ""){
                        var gesu = 0;
                        if (SubjFs[nTrtGrpArray[i]].length == 0){
                            array.push(0)
                        }else {
                            var gesu = 0;
                            for (var j = 0; j < SubjFs[nTrtGrpArray[i]][4].length; j++) {
                                if (SubjFs[nTrtGrpArray[i]][4][j] == fields.SubjFe) {
                                    gesu = gesu + 1;
                                }
                            }
                            rensus.push(gesu)
                        }
                    }
                    if (addSuccessPersons[0].SubjFf != ""){
                        var gesu = 0;
                        if (SubjFs[nTrtGrpArray[i]].length == 0){
                            array.push(0)
                        }else {
                            var gesu = 0;
                            for (var j = 0; j < SubjFs[nTrtGrpArray[i]][5].length; j++) {
                                if (SubjFs[nTrtGrpArray[i]][5][j] == fields.SubjFf) {
                                    gesu = gesu + 1;
                                }
                            }
                            array.push(gesu)
                        }
                    }
                    if (addSuccessPersons[0].SubjFg != ""){
                        var gesu = 0;
                        if (SubjFs[nTrtGrpArray[i]].length == 0){
                            array.push(0)
                        }else {
                            var gesu = 0;
                            for (var j = 0; j < SubjFs[nTrtGrpArray[i]][6].length; j++) {
                                if (SubjFs[nTrtGrpArray[i]][6][j] == fields.SubjFg) {
                                    gesu = gesu + 1;
                                }
                            }
                            array.push(gesu)
                        }
                    }
                    if (addSuccessPersons[0].SubjFh != ""){
                        var gesu = 0;
                        if (SubjFs[nTrtGrpArray[i]].length == 0){
                            array.push(0)
                        }else {
                            var gesu = 0;
                            for (var j = 0; j < SubjFs[nTrtGrpArray[i]][7].length; j++) {
                                if (SubjFs[nTrtGrpArray[i]][7][j] == fields.SubjFh) {
                                    gesu = gesu + 1;
                                }
                            }
                            array.push(gesu)
                        }
                    }
                    if (addSuccessPersons[0].SubjFi != "") {
                        var gesu = 0;
                        if (SubjFs[nTrtGrpArray[i]].length == 0) {
                            array.push(0)
                        } else {
                            var gesu = 0;
                            for (var j = 0; j < SubjFs[nTrtGrpArray[i]][SubjFs[nTrtGrpArray[i]].length - 1].length; j++) {
                                if (SubjFs[nTrtGrpArray[i]][SubjFs[nTrtGrpArray[i]].length - 1][j] == fields.SubjFi) {
                                    gesu = gesu + 1;
                                }
                            }
                            array.push(gesu)
                        }
                    }
                    rensus.push(array)

                }
                console.log('相同分层因素人数')
                console.log(rensus)
                //3.根据不同的组,做不同的组合
                var qiwangrenshu = [];
                for (var i = 0 ; i < nTrtGrpArray.length ; i++){
                    var array = [];
                    if (addSuccessPersons[0].SubjFa != ""){
                        array.push(rensus[i][0] + 1)
                    }
                    if (addSuccessPersons[0].SubjFb != ""){
                        array.push(rensus[i][1] + 1)
                    }
                    if (addSuccessPersons[0].SubjFc != ""){
                        array.push(rensus[i][2] + 1)
                    }
                    if (addSuccessPersons[0].SubjFd != ""){
                        array.push(rensus[i][3] + 1)
                    }
                    if (addSuccessPersons[0].SubjFe != ""){
                        array.push(rensus[i][4] + 1)
                    }
                    if (addSuccessPersons[0].SubjFf != ""){
                        array.push(rensus[i][5] + 1)
                    }
                    if (addSuccessPersons[0].SubjFg != ""){
                        array.push(rensus[i][6] + 1)
                    }
                    if (addSuccessPersons[0].SubjFh != ""){
                        array.push(rensus[i][7] + 1)
                    }
                    if (addSuccessPersons[0].SubjFi != "") {
                        array.push(rensus[i][rensus[i].length - 1] + 1)
                    }
                    qiwangrenshu.push(array)
                }
                //使用不同方法计算各分层因素内与假设治疗组的距离
                console.log('期望人数')
                console.log(qiwangrenshu)
                var qiwangcha = [];
                //计算出总人数
                for (var i = 0 ; i < nTrtGrpArray.length ; i++){
                    //算出添加受试者后的受试者期望人数
                    var zongR = [0,0,0,0,0,0,0,0,0];
                    for (var j = 0 ; j < nTrtGrpArray.length ; j++){
                        if (addSuccessPersons[0].SubjFa != ""){
                            if (j == nTrtGrpArray.length - 1){
                                console.log(zongR[0] + rensus[j][0] + 1)
                                var iii = (zongR[0] + rensus[j][0] + 1)/nTrtGrpArray.length
                                console.log(iii)
                                console.log("zongR: " + zongR[0] + " rensus[j][0]: " + rensus[j][0])
                                zongR.splice(0,1,iii)
                            }else{
                                var iii = zongR[0] + rensus[j][0]
                                zongR.splice(0,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFb != ""){
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[1] + rensus[j][1] + 1)/nTrtGrpArray.length
                                zongR.splice(1,1,iii)
                            }else{
                                var iii = zongR[1] + rensus[j][1]
                                zongR.splice(1,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFc != ""){
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[2] + rensus[j][2] + 1)/nTrtGrpArray.length
                                zongR.splice(2,1,iii)
                            }else{
                                var iii = zongR[2] + rensus[j][2]
                                zongR.splice(2,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFd != ""){
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[3] + rensus[j][3] + 1)/nTrtGrpArray.length
                                zongR.splice(3,1,iii)
                            }else{
                                var iii = zongR[3] + rensus[j][3]
                                zongR.splice(3,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFe != ""){
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[4] + rensus[j][4] + 1)/nTrtGrpArray.length
                                zongR.splice(4,1,iii)
                            }else{
                                var iii = zongR[4] + rensus[j][4]
                                zongR.splice(4,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFf != ""){
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[5] + rensus[j][5] + 1)/nTrtGrpArray.length
                                zongR.splice(5,1,iii)
                            }else{
                                var iii = zongR[5] + rensus[j][5]
                                zongR.splice(5,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFg != ""){
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[6] + rensus[j][6] + 1)/nTrtGrpArray.length
                                zongR.splice(6,1,iii)
                            }else{
                                var iii = zongR[6] + rensus[j][6]
                                zongR.splice(6,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFh != ""){
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[7] + rensus[j][7] + 1)/nTrtGrpArray.length
                                zongR.splice(7,1,iii)
                            }else{
                                var iii = zongR[7] + rensus[j][7]
                                zongR.splice(7,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFi != "") {
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[zongR.length - 1] + rensus[j][rensus[j].length - 1] + 1)/nTrtGrpArray.length
                                zongR.splice(8,1,iii)
                            }else{
                                var iii = zongR[zongR.length - 1] + rensus[j][rensus[j].length - 1]
                                zongR.splice(8,1,iii)
                            }
                        }
                    }
                    console.log(zongR)
                    var array = [];//[[[0,2,2],[3,3,2],[3,1,2]],[假设B],]
                    if (addSuccessPersons[0].SubjFa != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][0] - zongR[0]
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][0] - zongR[0]
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFb != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][1] - zongR[1]
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][1] - zongR[1]
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFc != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][2] - zongR[2]
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][2] - zongR[2]
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFd != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][3] - zongR[3]
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][3] - zongR[3]
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFe != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][4] - zongR[4]
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][4] - zongR[4]
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFf != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][5] - zongR[5]
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][5] - zongR[5]
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFg != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][6] - zongR[6]
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][6] - zongR[6]
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFh != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][7] - zongR[7]
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][7] - zongR[7]
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFi != "") {
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][qiwangrenshu[i].length - 1] - zongR[zongR.length - 1]
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][rensus[y].length - 1] - zongR[zongR.length - 1]
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    qiwangcha.push(array)
                }
                console.log("算到的期望差距分数:")
                console.log("最里层数组元素为各层分组的期望差距,中间层是各个分层因素的期望差距,最外层为各个假设组")
                console.log(qiwangcha)
                //判断用那种方法计算各分层因素内与假设治疗组的距离
                /*var bupinghen = [];
                 for (var i = 0 ; i < nTrtGrpArray.length ; i++){
                 var mou = 0;
                 if (addSuccessPersons[0].SubjFa != ""){
                 var he = 0;
                 for (var xx = 0 ; xx < qiwangcha[i][0].length ; xx++){
                 he = he - qiwangcha[i][0][xx]
                 }
                 mou = mou + Math.abs(he);
                 }
                 if (addSuccessPersons[0].SubjFb != ""){
                 var he = 0;
                 for (var xx = 0 ; xx < qiwangcha[i][1].length ; xx++){
                 he = he - qiwangcha[i][1][xx]
                 }
                 mou = mou + Math.abs(he);
                 }
                 if (addSuccessPersons[0].SubjFc != ""){
                 var he = 0;
                 for (var xx = 0 ; xx < qiwangcha[i][2].length ; xx++){
                 he = he - qiwangcha[i][2][xx]
                 }
                 mou = mou + Math.abs(he);
                 }
                 if (addSuccessPersons[0].SubjFd != ""){
                 var he = 0;
                 for (var xx = 0 ; xx < qiwangcha[i][3].length ; xx++){
                 he = he - qiwangcha[i][3][xx]
                 }
                 mou = mou + Math.abs(he);
                 }
                 if (addSuccessPersons[0].SubjFe != ""){
                 var he = 0;
                 for (var xx = 0 ; xx < qiwangcha[i][4].length ; xx++){
                 he = he - qiwangcha[i][4][xx]
                 }
                 mou = mou + Math.abs(he);
                 }
                 if (addSuccessPersons[0].SubjFf != ""){
                 var he = 0;
                 for (var xx = 0 ; xx < qiwangcha[i][5].length ; xx++){
                 he = he - qiwangcha[i][5][xx]
                 }
                 mou = mou + Math.abs(he);
                 }
                 if (addSuccessPersons[0].SubjFg != ""){
                 var he = 0;
                 for (var xx = 0 ; xx < qiwangcha[i][6].length ; xx++){
                 he = he - qiwangcha[i][6][xx]
                 }
                 mou = mou + Math.abs(he);
                 }
                 if (addSuccessPersons[0].SubjFh != ""){
                 var he = 0;
                 for (var xx = 0 ; xx < qiwangcha[i][7].length ; xx++){
                 he = he - qiwangcha[i][7][xx]
                 }
                 mou = mou + Math.abs(he);
                 }
                 if (addSuccessPersons[0].SubjFi != "") {
                 var he = 0;
                 for (var xx = 0 ; xx < qiwangcha[i][8].length ; xx++){
                 he = he - qiwangcha[i][8][xx]
                 }
                 mou = mou + Math.abs(he);
                 }
                 bupinghen.push(mou)
                 }
                 //根据4种治疗选择方法进行随机
                 if (persons[0].TrtSelMth == 1) {//直接法
                 var fenpeiStr = "";
                 var arrayNuber = 0;
                 for (var i = 0 ; i < nTrtGrpArray.length ; i++){
                 if (i == 0 ){
                 arrayNuber = bupinghen[i];
                 fenpeiStr = nTrtGrpArray[i]
                 }else {
                 if (arrayNuber < bupinghen[i]){
                 arrayNuber = bupinghen[i]
                 fenpeiStr = nTrtGrpArray[i]
                 }
                 }
                 }
                 }else if (persons[0].TrtSelMth == 2) {//指定概率法
                 randomTool.zhidinggailv(persons)
                 }else if (persons[0].TrtSelMth == 3) {//倒数法
                 //取出总数
                 var daoshuZ = 0;
                 for (var  i = 0 ; i < bupinghen.length ; i++) {
                 daoshuZ = bupinghen[i] + daoshuZ;
                 }
                 //计算各个分组的比例
                 var props = [];
                 for (var i = 0 ; i < nTrtGrpArray.length ; i++){
                 var prop = 1 - (bupinghen[i]/daoshuZ)
                 // id = Math.ceil(Math.random()*10);
                 var id = Math.ceil(prop*10);
                 for (var j = 0 ; j < id ; j++){
                 props.push(nTrtGrpArray[i])
                 }
                 }
                 var ss = Math.ceil(Math.random()*10)
                 var fenpeiStr = ''
                 if (props[ss].length >= ss){
                 fenpeiStr = props[ss]
                 }else{
                 fenpeiStr = props[ss-1]
                 }
                 }else {//完全随机法
                 randomTool.wangquansuiji(persons)
                 }*/
                if (persons[0].FormulaImSc == 1) {//极差法
                    var ntrgrp = randomTool.jichafa(nTrtGrpArray,addSuccessPersons,qiwangcha,persons)
                    //存储随机号
                    chuchunyonghu(RandoM,drugPersons,persons,ntrgrp,res,fields)
                }else if (persons[0].FormulaImSc == 2) {//方差法
                    var ntrgrp = randomTool.fangchafa(nTrtGrpArray,addSuccessPersons,qiwangcha,persons)
                    //储存随机号
                    chuchunyonghu(RandoM,drugPersons,persons,ntrgrp,res,fields)
                }else {//最大值法
                    var ntrgrp = randomTool.zuidazhifa(nTrtGrpArray,addSuccessPersons,qiwangcha,persons)
                    //储存随机号
                    chuchunyonghu(RandoM,drugPersons,persons,ntrgrp,res,fields)
                }
                /**************************************************************/
            })
        }
    })
}

//储存用户
function chuchunyonghu(RandoM,drugPersons,persons,ntrtGrp,res,fields) {
    random.find({StudyID:fields.StudyID}, function (err, newRandomPersons) {
        random.create({
            StudyID : fields.StudyID,    //研究编号
            // "StratumN" : Number,    //分层结果代码:1=01中心既往未接受化疗者，2=01中心既往已接受化疗者，3=02中心既往未接受化疗者，4=02中心既
            // // 往已接受化疗者，5=03中心既往未接受化疗者，6=03中心既往已接受化疗者，7=04中心既往未接受化疗者，8=04中心既往已接受化疗者，9=05中心既往未接受化疗者，
            // // 10=06中心既往已接受化疗者。
            // "Stratum" : String,  //分层结果:01中心既往未接受化疗者，01中心既往已接受化疗者，02中心既往未接受化疗者，02中心既往已接受化疗者，03中心既往未接受化疗者，03中心既往已接受化疗者，04中心既往未接受化疗者，04中心既往已接受化疗者，05中心既往未接受化疗者，05中心既往已接受化疗者。
            // "BlockSeq" : Number, //层内区组号
            // "SeqInBlock" : Number, // 区组内序号
            // "ArmCD" : String, //治疗分组代码
            "StudyDs" : persons[0].StudyDs,    //研究设计:1=平行设计；2=交叉设计
            "StudyPeNum" : persons[0].StudyPeNum,   //研究阶段个数:适用于StudyDs=2；StudyDs=1不适用
            "RandoNum" : newRandomPersons.length + 1, //随机号
            "Arm" : ntrtGrp, //治疗分组标签
            "SubjFa" : fields.SubjFa == '' ? null:fields.SubjFa,
            "SubjFb" :fields.SubjFb == '' ? null:fields.SubjFb,
            "SubjFc" :fields.SubjFc == '' ? null:fields.SubjFc,
            "SubjFd" :fields.SubjFd == '' ? null:fields.SubjFd,
            "SubjFe" :fields.SubjFe == '' ? null:fields.SubjFe,
            "SubjFf" :fields.SubjFf == '' ? null:fields.SubjFf,
            "SubjFg" :fields.SubjFg == '' ? null:fields.SubjFg,
            "SubjFh" :fields.SubjFh == '' ? null:fields.SubjFh,
            "SubjFi" :fields.SubjFi == '' ? null:fields.SubjFi,
            "isUse" : 1, //是否使用;1为使用
            "UseUserId" : fields.userId, //使用者ID
            Date : new Date(), //导入时间
        },function (error,data) {
            var msg = ""
            if (drugPersons == null) {
                addSuccessPatient.update({
                    'id':fields.userId
                },{
                    'Random':data.RandoNum,
                    'RandoM':RandoM,
                    'Arm' : data.Arm,
                },function () {
                    console.log("新增联系人修改成功");
                })
                if (persons[0].RandoNumYN == 1){
                    msg = msg + "随机号: " + data.RandoNum + "\n"
                }
                if (persons[0].ArmYN == 1) {
                    msg = msg + "分组信息: " + data.Arm + "\n"
                }
                if (persons[0].SubStudYN == 1) {
                    msg = msg + "随机参加子研究: " + data.Arm + "\n"
                }
                if (persons[0].CStudyPeYN == 1) {
                    msg = msg + "研究阶段: " + data.Arm + "\n"
                }
                console.log('提示')
                console.log(msg)
                //输出
                res.send({
                    'isSucceed': 400,
                    'msg': msg
                });
                return
            }else{
                //设置为已使用
                drugCK.update({
                    'id':drugPersons[0].id
                },{
                    DDrugUseAYN:1 ,
                    DDrugUseID:fields.userId
                },function () {
                    console.log("药物号修改成功");
                })
                addSuccessPatient.update({
                    'id':fields.userId
                },{
                    'Random':data.RandoNum,
                    'RandoM':RandoM,
                    'Arm' : data.Arm,
                    $push : {
                        'Drug' : drugPersons[0].DrugNum,
                        'DrugDate' : new Date()
                    } ,
                },function () {
                    console.log("新增联系人修改成功");
                })
                if (persons[0].RandoNumYN == 1){
                    msg = msg + "随机号: " + data.RandoNum + "\n"
                }
                if (persons[0].DrugNumYN == 1) {
                    msg = msg + "药物号: " + drugPersons[0].DrugNum + "\n"
                }
                if (persons[0].ArmYN == 1) {
                    msg = msg + "分组信息: " + data.Arm + "\n"
                }
                if (persons[0].SubStudYN == 1) {
                    msg = msg + "随机参加子研究: " + data.Arm + "\n"
                }
                if (persons[0].CStudyPeYN == 1) {
                    msg = msg + "研究阶段: " + data.Arm + "\n"
                }
                console.log('提示')
                console.log(msg)
                //输出
                res.send({
                    'isSucceed': 400,
                    'msg': msg
                });
                return
            }
        })
    })
}

//有药物号公共方法
function youyaowuhaoquyaowuhao(persons,fields,randomPersons,RandoM,res) {
    var msg = '操作成功\n';
    console.log(persons)
    //取出随机号和药物号
    //药物号
    drugCK.find({StudyID:fields.StudyID ,UsedCoreId:fields.SiteID,DDrugNumAYN: 1,DDrugUseAYN:{$ne:1}}).sort('DrugNum').exec(function(err, drugPersons) {
        if (err != null){
            console.log(err)
            console.log('错误')
        }
        console.log('中心已激活药物号个数')
        console.log(drugPersons.length)
        if (drugPersons.length < 20){
            users.find({StudyID:fields.StudyID ,UserFun:'H4',UserSite:fields.SiteID}, function (err, usersPersons) {
                //异步转同步
                (function iterator(i){
                    console.log('查找仓管员')
                    if(i == usersPersons.length){
                        return
                    }
                    site.find({StudyID:fields.StudyID , SiteID:fields.SiteID}, function (err, sitePersons) {
                        //发送短信提醒
                        //发送药物号不足提醒
                        var htmlStr = '<h2>中心:' + sitePersons[0].SiteNam + '</h2>'
                        htmlStr = htmlStr + '<h2>药物号不足</h2>'
                        EMail.fasongxiujian({
                            from: "配送清单<k13918446402@qq.com>", // 发件地址
                            to: usersPersons[i].UserEmail, // 收件列表
                            subject: "药物号不足提醒", // 标题
                            html: htmlStr // html 内容
                        })
                        iterator(i+1)
                    })
                })(0);
            })
            users.find({StudyID:fields.StudyID ,UserFun:'M6'}, function (err, usersPersons) {
                //异步转同步
                (function iterator(i){
                    console.log('查找总仓管员')
                    if(i == usersPersons.length){
                        return
                    }
                    site.find({StudyID:fields.StudyID , SiteID:fields.SiteID}, function (err, sitePersons) {
                        //发送短信提醒
                        //发送药物号不足提醒
                        var htmlStr = '<h2>中心:' + sitePersons[0].SiteNam + '</h2>'
                        htmlStr = htmlStr + '<h2>药物号不足</h2>'
                        EMail.fasongxiujian({
                            from: "配送清单<k13918446402@qq.com>", // 发件地址
                            to: usersPersons[i].UserEmail, // 收件列表
                            subject: "药物号不足提醒", // 标题
                            html: htmlStr // html 内容
                        })
                        iterator(i+1)
                    })
                })(0);
            })
        }
        if (drugPersons.length == 0){
            res.send({
                'isSucceed': 200,
                'msg': '该中心已激活药物号不足'
            });
        }else{
            //设置为已使用
            drugCK.update({
                'id':drugPersons[0].id
            },{
                DDrugUseAYN:1 ,
                DDrugUseID:fields.userId
            },function () {
                console.log("药物号修改成功");
            })
            addSuccessPatient.update({
                'id':fields.userId
            },{
                'Random':randomPersons[0].RandoNum,
                'RandoM':RandoM,
                'Arm' : randomPersons[0].Arm,
                $push : {
                    'Drug' : drugPersons[0].DrugNum,
                    'DrugDate' : new Date()
                } ,
            },function () {
                console.log("新增联系人修改成功");
            })
            if (persons[0].RandoNumYN == 1){
                msg = msg + "随机号: " + randomPersons[0].RandoNum + "\n"
            }
            if (persons[0].DrugNumYN == 1) {
                msg = msg + "药物号: " + drugPersons[0].DrugNum + "\n"
            }
            if (persons[0].ArmYN == 1) {
                msg = msg + "分组信息: " + randomPersons[0].Arm + "\n"
            }
            if (persons[0].SubStudYN == 1) {
                msg = msg + "随机参加子研究: " + randomPersons[0].Arm + "\n"
            }
            if (persons[0].CStudyPeYN == 1) {
                msg = msg + "研究阶段: " + randomPersons[0].SubjFa + "\n"
            }
            console.log('提示')
            console.log(msg)
            //修改随机号已经使用
            random.update({
                'id':randomPersons[0].id
            },{
                isUse:1 ,
                UseUserId:fields.userId
            },function () {
                console.log("随机号修改成功");
                //输出
                res.send({
                    'isSucceed': 400,
                    'msg': msg
                });
                return
            })
        }
    })
}
//没有药物号公共方法
function meiyouyaowuhao(persons,randomPersons,RandoM,res) {
    var msg = '';
    addSuccessPatient.update({
        'id':fields.userId
    },{
        'Random':randomPersons[0].RandoNum,
        'RandoM':RandoM,
        'Arm' : randomPersons[0].Arm,
    },function () {
        console.log("新增联系人修改成功");
    })
    //取出随机号不取药物号
    if (persons[0].RandoNumYN == 1){
        msg = msg + "随机号: " + randomPersons[0].RandoNum + "\n"
    }
    if (persons[0].ArmYN == 1) {
        msg = msg + "分组信息: " + randomPersons[0].Arm + "\n"
    }
    if (persons[0].SubStudYN == 1) {
        msg = msg + "随机参加子研究: " + randomPersons[0].Arm + "\n"
    }
    if (persons[0].CStudyPeYN == 1) {
        msg = msg + "研究阶段: " + randomPersons[0].SubjFa + "\n"
    }
    //修改随机号已经使用
    random.update({
        'id':randomPersons[0].id
    },{
        isUse:1 ,
        UseUserId:fields.userId
    },function () {
        console.log("随机号修改成功");
        //输出
        res.send({
            'isSucceed': 400,
            'msg': msg
        });
        return
    })
}
//添加筛选失败受试者基础数据
exports.getAddFailPatientData = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //搜索新增失败中是否有该用户
        addFailPatient.find({StudyID : fields.StudyID,SubjMP : fields.SubjMP},function (err, persons) {
            if (persons.length != 0){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '该手机已经使用'
                });
            }else{
                addSuccessPatient.find({StudyID : fields.StudyID,SubjMP : fields.SubjMP},function (err, persons) {
                    if (persons.length != 0){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '该手机已经被使用'
                        });
                    }else{
                        addFailPatient.create({
                            StudyID:fields.StudyID,
                            SiteID:fields.SiteID,
                            ScreenYN:fields.ScreenYN,
                            ExcludeStandards:fields.ExcludeStandards,
                            SubjectDOB:fields.SubjectDOB,
                            SubjectSex:fields.SubjectSex,
                            SubjectIn:fields.SubjectIn,
                            DSSTDAT:new Date()
                        },function (err,data) {
                            console.log(err)
                            //创建用户号
                            addFailPatient.update({
                                'id' : data.id,
                            },{
                                'USubjectID' : data.SiteID + data.SubjID,
                            },function () {
                                res.send({
                                    'isSucceed' : 400,
                                    'USubjectID' : data.SiteID + data.SubjID
                                });
                            })
                        })
                    }
                })
            }
        })

    })
}
//查找所有受试者
exports.getLookupSuccessBasicsData = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        var data = [];
        //查找筛选成功受试者
        addSuccessPatient.chazhaomouyanjiumouzhongxin(fields.SiteID,fields.StudyID,function (err, persons) {
            if (err != null){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库错误'
                });
            }else {
                for (var i = 0 ; i < persons.length ; i++){
                    if (persons[i].Random == null){
                        data.push({
                            id : persons[i].id,
                            SubjIni : persons[i].SubjIni,
                            USubjID : persons[i].USubjID,
                            Random : -1,//随机号
                            Drug : -1,
                            DrugDate : -1,
                            isSuccess : 1,
                            persons : persons[i]
                        })
                    }else{
                        if (persons[i].Drug == null){
                            data.push({
                                id : persons[i].id,
                                SubjIni : persons[i].SubjIni,
                                USubjID : persons[i].USubjID,
                                Random : persons[i].Random,//随机号
                                Drug : -1,
                                DrugDate : -1,
                                isSuccess : 1,
                                persons : persons[i]
                            })
                        }else {
                            data.push({
                                id : persons[i].id,
                                SubjIni : persons[i].SubjIni,
                                USubjID : persons[i].USubjID,
                                Random : persons[i].Random,//随机号
                                Drug : persons[i].Drug,
                                DrugDate : persons[i].DrugDate,
                                isSuccess : 1,
                                persons : persons[i]
                            })
                        }
                    }
                }
                //查找筛选失败受试者
                addFailPatient.chazhaomouyanjiumouzhongxin(fields.SiteID, fields.StudyID, function (err, persons) {
                    if (err != null) {
                        res.send({
                            'isSucceed': 200,
                            'msg': '数据库错误'
                        });
                    } else {
                        for (var i = 0 ; i < persons.length ; i++){
                            data.push({
                                id : persons[i].id,
                                SubjIni : persons[i].SubjectIn,
                                USubjID : persons[i].USubjectID,
                                isSuccess : 0
                            })
                        }
                        res.send({
                            'isSucceed': 400,
                            'data': data
                        });
                    }
                })
            }
        })
    })
}

//模糊查询受试者
exports.getVagueBasicsData = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //模糊查询受试者
        console.log(fields)
        var data = [];
        var reg = new RegExp(fields.str, 'i'); //不区分大小写
        //查找筛选成功受试者
        var findJson = null;
        var FailFindJson = null;
        if (fields.SiteID == null){
            findJson = {$or:[
                {'USubjID':{$regex : reg}},
                {'SubjIni':{$regex : reg}},
                {'SubjMP':{$regex : reg}},
                {'SubjSex':{$regex : reg}}
            ]};
            FailFindJson = {$or:[
                {'USubjectID':{$regex : reg}},
                {'SubjectSex':{$regex : reg}},
                {'SubjectIn':{$regex : reg}}
            ]}
        }else{
            findJson = {$or:[
                {'USubjID':{$regex : reg}},
                {'SubjIni':{$regex : reg}},
                {'SubjMP':{$regex : reg}},
                {'SubjSex':{$regex : reg}}
            ],$and:[
                {'SiteID' : fields.SiteID},
                {'StudyID' : fields.StudyID}
            ]};
            FailFindJson = {$or:[
                {'USubjectID':{$regex : reg}},
                {'SubjectSex':{$regex : reg}},
                {'SubjectIn':{$regex : reg}}
            ],$and:[
                {'SiteID' : fields.SiteID},
                {'StudyID' : fields.StudyID}
            ]}
        }
        addSuccessPatient.find(findJson).exec((err, persons) => {
            if (err) {
                console.log(err);
            } else {
                for (var i = 0 ; i < persons.length ; i++){
                    if (persons[i].Random == null){
                        data.push({
                            id : persons[i].id,
                            SubjIni : persons[i].SubjIni,
                            USubjID : persons[i].USubjID,
                            Random : -1,//随机号
                            Drug : -1,
                            isSuccess : 1
                        })
                    }else{
                        if (persons[i].Drug == null){
                            data.push({
                                id : persons[i].id,
                                SubjIni : persons[i].SubjIni,
                                USubjID : persons[i].USubjID,
                                Random : persons[i].Random,//随机号
                                Drug : -1,
                                isSuccess : 1
                            })
                        }else {
                            data.push({
                                id : persons[i].id,
                                SubjIni : persons[i].SubjIni,
                                USubjID : persons[i].USubjID,
                                Random : persons[i].Random,//随机号
                                Drug : persons[i].Drug,
                                isSuccess : 1
                            })
                        }
                    }
                }
            }
            //查找筛选失败受试者
            addFailPatient.find(FailFindJson).exec((err, persons) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('查找失败---' + persons.length);
                    for (var i = 0 ; i < persons.length ; i++){
                        data.push({
                            id : persons[i].id,
                            SubjIni : persons[i].SubjectIn,
                            USubjID : persons[i].USubjectID,
                            isSuccess : 0
                        })
                    }
                    res.send({
                        'isSucceed': 400,
                        'data': data
                    });
                }
            });
        })
    })
}