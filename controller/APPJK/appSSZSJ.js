/**
 * Created by maoli on 16/10/19.
 */
var formidable = require('formidable');
var site = require('../../models/import/site');
var researchParameter = require('../../models/import/researchParameter');
var addSuccessPatient = require('../../models/import/addSuccessPatient');
var addFailPatient = require('../../models/import/addFailPatient');
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
        // addFailPatient.chazhaomouyanjiushouji(fields.SubjMP,function (err, persons) {
        //     if (persons.length != 0){
        //         res.send({
        //             'isSucceed' : 200,
        //             'msg' : '该手机已经使用'
        //         });
        //     }else{
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
                                    'USubjID' : data.SiteID + data.SubjID
                                });
                            })
                        })
                    }
                })
        //     }
        // })

    })
}

//添加筛选失败受试者基础数据
exports.getAddFailPatientData = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //搜索新增失败中是否有该用户
        // addFailPatient.chazhaomouyanjiushouji(fields.SubjMP,function (err, persons) {
        //     if (persons.length != 0){
        //         res.send({
        //             'isSucceed' : 200,
        //             'msg' : '该手机已经使用'
        //         });
        //     }else{
        //         addSuccessPatient.chazhaomouyanjiushouji(fields.SubjMP,function (err, persons) {
        //             if (persons.length != 0){
        //                 res.send({
        //                     'isSucceed' : 200,
        //                     'msg' : '该手机已经使用'
        //                 });
        //             }else{
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
                //     }
                // })
        //     }
        // })

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