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
        addFailPatient.chazhaomouyanjiushouji(fields.SubjMP,function (err, persons) {
            if (persons.length != 0){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '该手机已经使用'
                });
            }else{
                addSuccessPatient.chazhaomouyanjiushouji(fields.SubjMP,function (err, persons) {
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
//取随机号
exports.getRandomNumber = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //异步转同步
        (function iterator(i) {
            console.log(fields)
            //取出研究随机化参数信息
            researchParameter.find({StudyID:fields.StudyID}, function (err, persons) {
                if (err != null){
                    res.send({
                        'isSucceed': 200,
                        'msg': '数据库错误'
                    });
                }else{
                    if (persons.length == 0){
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
                                    if (persons.BlindSta == 2){//单盲实验
                                        //是否提供药物号
                                        if (persons.DrugNSBlind == 1){//是
                                            //取出随机号和药物号
                                            youyaowuhaoquyaowuhao(persons,fields,randomPersons,persons[0].RandoM,res)
                                        }else{//否
                                            meiyouyaowuhao(persons,randomPersons,persons[0].RandoM,res)
                                        }
                                    }else if (persons.BlindSta == 3){//开放
                                        //判断是否提供药物号
                                        if (persons.DrugNOpen == 1){//是
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
                                    if (persons.BlindSta == 2){//单盲实验
                                        //是否提供药物号
                                        if (persons.DrugNSBlind == 1){//是
                                            //取出随机号
                                            youyaowuhaoquyaowuhao(persons,fields,randomPersons,persons[0].RandoM,res)
                                        }else{//否
                                            //取出随机号不取药物号
                                            meiyouyaowuhao(persons,randomPersons,persons[0].RandoM,res)
                                        }
                                    }else if (persons.BlindSta == 3){//开放
                                        //判断是否提供药物号
                                        if (persons.DrugNOpen == 1){//是
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
                            if (persons.BlindSta == 2){//单盲实验
                                //是否提供药物号
                                if (persons.DrugNSBlind == 1){//是

                                }else{//否

                                }
                            }else if (persons.BlindSta == 3){//开放
                                //判断是否提供药物号
                                if (persons.DrugNOpen == 1){//是

                                }else{//否

                                }
                            }else{//双盲实验

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
                $push : {
                    'Drug' : drugPersons[0].DrugNum
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
        addFailPatient.chazhaomouyanjiushouji(fields.SubjMP,function (err, persons) {
            if (persons.length != 0){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '该手机已经使用'
                });
            }else{
                addSuccessPatient.chazhaomouyanjiushouji(fields.SubjMP,function (err, persons) {
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