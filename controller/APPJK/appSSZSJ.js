/**
 * Created by maoli on 16/10/19.
 */
var formidable = require('formidable');
var MLArray = require('../../MLArray')
var site = require('../../models/import/site');
var ApplicationAndAuditSchema = require('../../models/import/ApplicationAndAudit');
var researchParameter = require('../../models/import/researchParameter');
var addSuccessPatient = require('../../models/import/addSuccessPatient');
var addFailPatient = require('../../models/import/addFailPatient');
var addOutPatient = require('../../models/import/addOutPatient');
var random = require('../../models/import/random');
var drugCK = require('../../models/import/drugCK');
var users = require('../../models/import/users');
var drugWL = require('../../models/import/drugWL');
var yytx = require('../../models/import/yytx');
var randomTool = require('../../randomTool/MLRandomTool');
var EMail = require("../../models/EMail");
var appTool = require("./appTool");
var async = require("async");
const Locker = require('lockman');
var locker = new Locker('demo');

TopClient = require( '../../ALYZM/topClient' ).TopClient;
var client = new TopClient({
    'appkey' : '23783814' ,
    'appsecret' : '63636a89dacc578085f6045bc06d96bc' ,
    'REST_URL' : 'http://gw.api.taobao.com/router/rest'
});

//时间操作
var moment = require('moment');
moment().format();
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

//添加受试者基础数据
exports.getAddBasicsData = function (req, res, next) {
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
                        //设置患者SubjID(流水号)
                        addSuccessPatient.find({StudyID : fields.StudyID,SiteID : fields.SiteID},function (err, spersons) {
                            if (err != null){
                                console.log('addSuccessPatient');
                                console.log(err);
                                res.send({
                                    'isSucceed' : 200,
                                    'msg' : 'C服务器忙碌,请移步到随机列表'
                                });
                            }else {
                                //判断是否有中心人数限制
                                researchParameter.find({StudyID : fields.StudyID},function (err, researchData) {
                                    if (err != null) {
                                        res.send({
                                            'isSucceed': 200,
                                            'msg': '服务器忙碌,请移步到随机列表'
                                        });
                                        return;
                                    }
                                    if (researchData[0].SizeLInSiteYN == 1){
                                        if (spersons.length >= researchData[0].SizeLInSite){
                                            res.send({
                                                'isSucceed' : 200,
                                                'msg' : '超过中心最大例数限制。'
                                            });
                                            return
                                        }
                                    }
                                    addFailPatient.find({
                                        StudyID: fields.StudyID,
                                        SiteID: fields.SiteID
                                    }, function (err, fpersons) {
                                        if (err != null) {
                                            console.log('addFailPatient');
                                            console.log(err);
                                            res.send({
                                                'isSucceed': 200,
                                                'msg': 'F服务器忙碌,请移步到随机列表'
                                            });
                                        } else {
                                            addSuccessPatient.create({
                                                SubjID: fpersons.length + spersons.length + 1,
                                                StudySeq: fields.StudySeq,
                                                StudyID: fields.StudyID,
                                                SiteID: fields.SiteID,
                                                SiteNam: fields.SiteNam,
                                                SubjDOB: fields.SubjDOB,
                                                SubjSex: fields.SubjSex,
                                                SubjIni: fields.SubjIni,
                                                SubjMP: fields.SubjMP,
                                                RandoM: fields.RandoM,
                                                SubjStudYN: fields.SubjStudYN,
                                                isBasicData:1,
                                                Date: new Date()
                                            }, function (err, data) {
                                                if (err != null) {
                                                    console.log(err)
                                                    res.send({
                                                        'isSucceed': 200,
                                                        'msg': '添加失败,请重新确定'
                                                    });
                                                } else {
                                                    var subjId = null;
                                                    if (data.SubjID == null) {
                                                        subjId = fpersons.length + spersons.length + 1;
                                                    } else {
                                                        subjId = data.SubjID;
                                                    }
                                                    for (var i = subjId.length; i < 4; i++) {
                                                        subjId = "0" + subjId;
                                                    }
                                                    subjId = data.SiteID + subjId
                                                    //创建用户号
                                                    addSuccessPatient.update({
                                                        'id': data.id,
                                                    }, {
                                                        'USubjID': subjId,
                                                    }, function () {
                                                        res.send({
                                                            'isSucceed': 400,
                                                            'USubjID': subjId,
                                                            'id': data.id
                                                        });
                                                    })
                                                }
                                            })
                                        }
                                    })
                                })
                            }
                        })
                    }
                })
            }
        })
    })
}

//添加登记转成功受试者数据
exports.getAddBasisDataSuccessBasicsData = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        addSuccessPatient.find({
            id:fields.id
        },function (err, patientData) {
            if (patientData[0].isBasicData == 0){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '请勿重复操作'
                });
                return;
            }
            addSuccessPatient.update({
                id:fields.id
            },{
                SubjID: fields.SubjID,
                StudySeq: fields.StudySeq,
                StudyID: fields.StudyID,
                SiteID: fields.SiteID,
                SiteNam: fields.SiteNam,
                ScreenYN: fields.ScreenYN,
                SubjDOB: fields.SubjDOB,
                SubjSex: fields.SubjSex,
                SubjIni: fields.SubjIni,
                SubjMP: fields.SubjMP,
                RandoM: fields.RandoM,
                SubjFa: fields.SubjFa,
                SubjFb: fields.SubjFb,
                SubjFc: fields.SubjFc,
                SubjFd: fields.SubjFd,
                SubjFe: fields.SubjFe,
                SubjFf: fields.SubjFf,
                SubjFg: fields.SubjFg,
                SubjFh: fields.SubjFh,
                SubjFi: fields.SubjFi,
                SubjStudYN: fields.SubjStudYN,
                isBasicData:0,
                Date: new Date()
            },function (err) {
                res.send({
                    'isSucceed': 400,
                    'USubjID': fields.USubjID,
                    'id': fields.id
                });
            })
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
                        //设置患者SubjID(流水号)
                        addSuccessPatient.find({StudyID : fields.StudyID,SiteID : fields.SiteID},function (err, spersons) {
                            if (err != null){
                                console.log('addSuccessPatient');
                                console.log(err);
                                res.send({
                                    'isSucceed' : 200,
                                    'msg' : 'C服务器忙碌,请移步到随机列表'
                                });
                            }else {
                                //判断是否有中心人数限制
                                researchParameter.find({StudyID : fields.StudyID},function (err, researchData) {
                                    if (err != null) {
                                        res.send({
                                            'isSucceed': 200,
                                            'msg': '服务器忙碌,请移步到随机列表'
                                        });
                                        return;
                                    }
                                    if (researchData[0].SizeLInSiteYN == 1){
                                        if (spersons.length >= researchData[0].SizeLInSite){
                                            res.send({
                                                'isSucceed' : 200,
                                                'msg' : '超过中心最大例数限制。'
                                            });
                                            return
                                        }
                                    }
                                    addFailPatient.find({
                                        StudyID: fields.StudyID,
                                        SiteID: fields.SiteID
                                    }, function (err, fpersons) {
                                        if (err != null) {
                                            console.log('addFailPatient');
                                            console.log(err);
                                            res.send({
                                                'isSucceed': 200,
                                                'msg': 'F服务器忙碌,请移步到随机列表'
                                            });
                                        } else {
                                            addSuccessPatient.create({
                                                SubjID: fpersons.length + spersons.length + 1,
                                                StudySeq: fields.StudySeq,
                                                StudyID: fields.StudyID,
                                                SiteID: fields.SiteID,
                                                SiteNam: fields.SiteNam,
                                                ScreenYN: fields.ScreenYN,
                                                SubjDOB: fields.SubjDOB,
                                                SubjSex: fields.SubjSex,
                                                SubjIni: fields.SubjIni,
                                                SubjMP: fields.SubjMP,
                                                RandoM: fields.RandoM,
                                                SubjFa: fields.SubjFa,
                                                SubjFb: fields.SubjFb,
                                                SubjFc: fields.SubjFc,
                                                SubjFd: fields.SubjFd,
                                                SubjFe: fields.SubjFe,
                                                SubjFf: fields.SubjFf,
                                                SubjFg: fields.SubjFg,
                                                SubjFh: fields.SubjFh,
                                                SubjFi: fields.SubjFi,
                                                SubjStudYN: fields.SubjStudYN,
                                                isBasicData:0,
                                                Date: new Date()
                                            }, function (err, data) {
                                                if (err != null) {
                                                    console.log(err)
                                                    res.send({
                                                        'isSucceed': 200,
                                                        'msg': '添加失败,请重新确定'
                                                    });
                                                } else {
                                                    var subjId = null;
                                                    if (data.SubjID == null) {
                                                        subjId = fpersons.length + spersons.length + 1;
                                                    } else {
                                                        subjId = data.SubjID;
                                                    }
                                                    for (var i = subjId.length; i < 4; i++) {
                                                        subjId = "0" + subjId;
                                                    }
                                                    subjId = data.SiteID + subjId
                                                    //创建用户号
                                                    addSuccessPatient.update({
                                                        'id': data.id,
                                                    }, {
                                                        'USubjID': subjId,
                                                    }, function () {
                                                        res.send({
                                                            'isSucceed': 400,
                                                            'USubjID': subjId,
                                                            'id': data.id
                                                        });
                                                    })
                                                }
                                            })
                                        }
                                    })
                                })
                            }
                        })
                    }
                })
            }
        })
    })
}

//修改筛选失败受试者基础数据
exports.getUpdateFailPatientData = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //搜索新增失败中是否有该用户
        addFailPatient.find({StudyID : fields.StudyID,SubjMP : fields.phone},function (err, persons) {
            if (persons.length != 0) {
                if (persons[0].id != fields.id){
                    res.send({
                        'isSucceed': 200,
                        'msg': '该手机已经使用'
                    });
                    return
                }
            }
            addSuccessPatient.find({StudyID: fields.StudyID, SubjMP: fields.phone}, function (err, persons) {
                if (persons.length != 0) {
                    if (persons[0].id != fields.id){
                        res.send({
                            'isSucceed': 200,
                            'msg': '该手机已经使用'
                        });
                        return
                    }
                }
                //修改用药提醒中的数据
                addSuccessPatient.find({id: fields.id}, function (err, persons11) {
                    if (persons11.length != 0){
                        yytx.update({
                            phone:persons11[0].SubjMP,
                            StudyID: fields.StudyID
                        },{
                            phone : fields.phone,
                        },[false, true],function () {

                        })
                    }
                    addSuccessPatient.update({
                        'id': fields.id,
                    }, {
                        //手机号
                        'SubjMP': fields.phone,
                        'SubjIni': fields.name,
                        'SubjDOB': fields.csDate,
                        'SubjSex': fields.xb
                    }, function (err, data) {
                        if (err != null) {
                            res.send({
                                'isSucceed': 200,
                                'USubjectID': '修改失败!'
                            });
                            return
                        } else {
                            res.send({
                                'isSucceed': 400,
                                'USubjectID': '修改成功!'
                            });
                            return
                        }
                    })
                })
            })
        })
    })
}
//添加登记受试者转失败受试者
exports.getAddBasisDataFailPatientData = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        addSuccessPatient.find({
            id:fields.id
        },function (err, patientData) {
            if (patientData.length == 0){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '请勿重复操作'
                });
                return;
            }else {
                var data = patientData[0];
                addSuccessPatient.remove({
                    id:fields.id
                },function (err) {
                    if (err != null){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '请勿重复操作'
                        });
                        return;
                    }
                    //搜索新增失败中是否有该用户
                    addFailPatient.create({
                        id:fields.id,
                        SubjID:fields.SubjID,
                        StudyID:fields.StudyID,
                        SiteID:fields.SiteID,
                        ScreenYN:fields.ScreenYN,
                        ExcludeStandards:fields.ExcludeStandards,
                        SubjectDOB:fields.SubjectDOB,
                        SubjectSex:fields.SubjectSex,
                        SubjectIn:fields.SubjectIn,
                        USubjectID:fields.USubjID,
                        DSSTDAT:new Date()
                    },function (err,data) {
                        if (err != null) {
                            console.log(err)
                            res.send({
                                'isSucceed' : 200,
                                'msg' : '添加失败,请重新确定'
                            });
                        }else {
                            res.send({
                                'isSucceed' : 400,
                                'USubjectID' : fields.USubjID
                            });
                        }
                    })
                })
            }
        })
    })
}

//添加筛选失败受试者基础数据
exports.getAddFailPatientData = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //设置患者SubjID(流水号)
        addSuccessPatient.find({StudyID : fields.StudyID,SiteID : fields.SiteID},function (err, spersons) {
            addFailPatient.find({StudyID : fields.StudyID,SiteID : fields.SiteID},function (err, fpersons) {
                //搜索新增失败中是否有该用户
                addFailPatient.create({
                    SubjID:fpersons.length + spersons.length + 1,
                    StudyID:fields.StudyID,
                    SiteID:fields.SiteID,
                    ScreenYN:fields.ScreenYN,
                    ExcludeStandards:fields.ExcludeStandards,
                    SubjectDOB:fields.SubjectDOB,
                    SubjectSex:fields.SubjectSex,
                    SubjectIn:fields.SubjectIn,
                    DSSTDAT:new Date()
                },function (err,data) {
                    if (err != null) {
                        console.log(err)
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '添加失败,请重新确定'
                        });
                    }else {
                        var subjId = "" + data.SubjID;
                        for (var i = subjId.length ; i < 4 ; i++){
                            subjId = "0" + subjId;
                        }
                        subjId = data.SiteID + subjId
                        //创建用户号
                        addFailPatient.update({
                            'id' : data.id,
                        },{
                            'USubjectID' : subjId,
                        },[false, true],function () {
                            res.send({
                                'isSucceed' : 400,
                                'USubjectID' : subjId
                            });
                        })
                    }
                })
            })
        })
    })
}

//用药提醒
exports.getYytx = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields);
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
                    //用户信息
                    patient : fields.patient,
                    //添加这信息
                    users : fields.users,
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
                },[false, true],function () {
                    res.send({
                        'isSucceed': 400,
                        'msg': '添加成功'
                    });
                })
            }
        })
    })
}

//补充药物号考虑药物剂量
exports.getBcywhYwjl = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //判断改用户是否以揭盲
        addSuccessPatient.find({'id':fields.userId}, function (err, userPersons) {
            if (userPersons[0].isUnblinding == 1){
                res.send({
                    'isSucceed': 200,
                    'msg': '该受试者已揭盲,不能补充药物号'
                });
            }else{
                //药物号
                researchParameter.find({StudyID: fields.StudyID}, function (err, persons1) {
                    var fenzhu = persons1[0].NTrtGrp.split(",");
                    drugCK.find({
                        StudyID:fields.StudyID ,
                        Arm : userPersons[0].Arm,
                        UsedCoreId:fields.SiteID,
                        DrugDose:fields.DrugDose,
                        DDrugNumAYN: 1,
                        DDrugDMNumYN: {$ne:1},
                        DDrugUseAYN:{$ne:1},
                        DrugExpryDTC : {$gte:new Date()},
                    }).sort({DrugSeq : 1}).exec(function(err, drugPersons) {
                        if (err != null) {
                            console.log(err)
                            console.log('错误')
                        }
                        var newDrug = null;
                        if (persons1[0].NTrtGrp.length != 0){
                            for (var i = 0 ; i < drugPersons.length ; i++){
                                if (drugPersons[i].Arm == fields.Arm){
                                    newDrug = drugPersons[i];
                                    break;
                                }
                            }
                            if (newDrug == null) {
                                res.send({
                                    'isSucceed': 200,
                                    'msg': '该中心某组已激活药物号不足'
                                });
                                return
                            }
                        }
                        if (drugPersons.length < 6) {
                            fasongyoujian(fields)
                        }
                        if (drugPersons.length == 0) {
                            res.send({
                                'isSucceed': 200,
                                'msg': '该中心已激活药物号不足'
                            });
                            return
                        } else {
                            //设置为已使用
                            drugCK.update({
                                'id':newDrug.id
                            },{
                                DDrugUseAYN:1 ,
                                DDrugUseID:fields.userId
                            },[false, true],function () {
                                console.log("药物号修改成功");
                            })
                            addSuccessPatient.update({
                                'id':fields.userId
                            },{
                                $push : {
                                    'Drug' : newDrug.DrugNum,
                                    'DrugDate' : new Date(),
                                    'DrugDoer' : fields.user.id,
                                    'DrugDose' : fields.DrugDose
                                } ,
                            },[false, true],function () {
                                drugWL.update({
                                    'StudyID' : fields.StudyID,
                                    'DrugNum' : newDrug.DrugNum
                                },{
                                    $push : {
                                        'drugStrs' : "药物号经替补发放",
                                        'drugDate' : new Date()
                                    } ,
                                },[false, true],function () {
                                    console.log("修改成功");
                                })
                                res.send({
                                    'isSucceed': 200,
                                    'msg': '药物号:' + newDrug.DrugNum
                                });
                            })
                        }
                    })
                })
            }
        })
    })
}
//补充药物号考虑交叉设计
exports.getBcywhJcsj = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //判断改用户是否以揭盲
        addSuccessPatient.find({'id':fields.userId}, function (err, userPersons) {
            if (userPersons[0].isUnblinding == 1){
                res.send({
                    'isSucceed': 200,
                    'msg': '该受试者已揭盲,不能补充药物号'
                });
            }else{
                //药物号
                researchParameter.find({StudyID: fields.StudyID}, function (err, persons1) {
                    random.find({
                        "StudyID" : fields.StudyID,
                        "RandoNum" : userPersons[0].Random
                    },function (err, randomPersons) {
                        //取出随机号对应的数据
                        var StudyDCross = persons1[0].StudyDCross.split(",");
                        var wezhi = StudyDCross.indexOf(fields.StudyDCross);
                        var CrossCodes = randomPersons[0].CrossCode.split(",");
                        var newStudyDCross = CrossCodes[wezhi];
                        var fenzhu = persons1[0].NTrtGrp.split(",");
                        drugCK.find({
                            StudyID:fields.StudyID ,
                            // Arm : userPersons[0].Arm,
                            UsedCoreId:fields.SiteID,
                            StudyDCross:newStudyDCross,
                            DDrugNumAYN: 1,
                            DDrugDMNumYN: {$ne:1},
                            DDrugUseAYN:{$ne:1},
                            DrugExpryDTC : {$gte:new Date()},
                        }).sort({DrugSeq : 1}).exec(function(err, drugPersons) {
                            if (err != null) {
                                console.log(err)
                                console.log('错误')
                            }
                            var newDrug = null;
                            newDrug = drugPersons[0];
                            if (drugPersons.length < 6) {
                                fasongyoujian(fields)
                            }
                            if (drugPersons.length == 0) {
                                res.send({
                                    'isSucceed': 200,
                                    'msg': '该中心已激活药物号不足'
                                });
                                return
                            } else {
                                //设置为已使用
                                drugCK.update({
                                    'id':newDrug.id
                                },{
                                    DDrugUseAYN:1 ,
                                    DDrugUseID:fields.userId
                                },[false, true],function () {
                                    console.log("药物号修改成功");
                                })
                                addSuccessPatient.update({
                                    'id':fields.userId
                                },{
                                    $push : {
                                        'Drug' : newDrug.DrugNum,
                                        'DrugDate' : new Date(),
                                        'DrugDoer' : fields.user.id,
                                        'StudyDCross' : fields.StudyDCross
                                    } ,
                                },[false, true],function () {
                                    drugWL.update({
                                        'StudyID' : fields.StudyID,
                                        'DrugNum' : newDrug.DrugNum
                                    },{
                                        $push : {
                                            'drugStrs' : "药物号经替补发放",
                                            'drugDate' : new Date()
                                        } ,
                                    },[false, true],function () {
                                        console.log("修改成功");
                                    })
                                    res.send({
                                        'isSucceed': 200,
                                        'msg': '药物号:' + newDrug.DrugNum
                                    });
                                })
                            }
                        })
                    })
                })
            }
        })
    })
}

//补充药物号
exports.getBcywh = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //判断改用户是否以揭盲
        addSuccessPatient.find({'id':fields.userId}, function (err, userPersons) {
            if (userPersons[0].isUnblinding == 1){
                res.send({
                    'isSucceed': 200,
                    'msg': '该受试者已揭盲,不能补充药物号'
                });
            }else{
                //药物号
                researchParameter.find({StudyID: fields.StudyID}, function (err, persons1) {
                    var fenzhu = persons1[0].NTrtGrp.split(",");
                    drugCK.find({
                        StudyID:fields.StudyID ,
                        Arm : userPersons[0].Arm,
                        UsedCoreId:fields.SiteID,
                        DDrugNumAYN: 1,
                        DDrugDMNumYN: {$ne:1},
                        DDrugUseAYN:{$ne:1},
                        DrugExpryDTC : {$gte:new Date()},
                    }).sort({DrugSeq : 1}).exec(function(err, drugPersons) {
                        if (err != null) {
                            console.log(err)
                            console.log('错误')
                        }
                        var newDrug = null;
                        if (persons1[0].NTrtGrp.length != 0){
                            for (var i = 0 ; i < drugPersons.length ; i++){
                                if (drugPersons[i].Arm == fields.Arm){
                                    newDrug = drugPersons[i];
                                    break;
                                }
                            }
                            if (newDrug == null) {
                                res.send({
                                    'isSucceed': 200,
                                    'msg': '该中心某组已激活药物号不足'
                                });
                                return
                            }
                        }
                        if (drugPersons.length < 6) {
                            fasongyoujian(fields)
                        }
                        if (drugPersons.length == 0) {
                            res.send({
                                'isSucceed': 200,
                                'msg': '该中心已激活药物号不足'
                            });
                            return
                        } else {
                            //设置为已使用
                            drugCK.update({
                                'id':newDrug.id
                            },{
                                DDrugUseAYN:1 ,
                                DDrugUseID:fields.userId
                            },[false, true],function () {
                                console.log("药物号修改成功");
                            })
                            addSuccessPatient.update({
                                'id':fields.userId
                            },{
                                $push : {
                                    'Drug' : newDrug.DrugNum,
                                    'DrugDate' : new Date(),
                                    'DrugDoer' : fields.user.id
                                } ,
                            },[false, true],function () {
                                drugWL.update({
                                    'StudyID' : fields.StudyID,
                                    'DrugNum' : newDrug.DrugNum
                                },{
                                    $push : {
                                        'drugStrs' : "药物号经替补发放",
                                        'drugDate' : new Date()
                                    } ,
                                },[false, true],function () {
                                    console.log("修改成功");
                                })
                                res.send({
                                    'isSucceed': 200,
                                    'msg': '药物号:' + newDrug.DrugNum
                                });
                            })
                        }
                    })
                })
            }
        })
    })
}

//中心所有以激活和未使用药物号
exports.getZXAllYwh = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        drugCK.find({
            StudyID:fields.StudyID ,
            UsedCoreId:fields.SiteID,
            DDrugNumAYN: 1,
            DDrugDMNumYN: {$ne:1},
            DDrugUseAYN:{$ne:1}
        }).sort({DrugSeq : 1}).exec(function(err, drugPersons) {
            if (drugPersons.length == 0) {
                res.send({
                    'isSucceed': 200,
                    'msg': '该中心已激活药物号不足'
                });
                return
            } else {
                res.send({
                    'isSucceed': 400,
                    'data': drugPersons
                });
            }
        })
    })
}

//替换药物号考虑药物剂量
exports.getThywhYwjl = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //判断改用户是否以揭盲
        //判断改用户是否以揭盲
        addSuccessPatient.find({'id':fields.userId}, function (err, userPersons) {
            if (userPersons[0].isUnblinding == 1) {
                res.send({
                    'isSucceed': 200,
                    'msg': '该受试者已揭盲,不能补充药物号'
                });
            } else {
                //查询改替换的药物号是否废弃
                drugCK.find({
                    'DrugNum': fields.DrugNum,
                    'StudyID': fields.StudyID,
                    'DDrugDMNumYN': 1
                }, function (err, isFQPersons) {
                    if (isFQPersons.length == 0) {
                        addSuccessPatient.find({'id': fields.userId}, function (err, userPersons) {
                            if (userPersons.length > 0) {
                                //药物号
                                researchParameter.find({StudyID: fields.StudyID}, function (err, persons1) {
                                    var fenzhu = persons1[0].NTrtGrp.split(",");
                                    drugCK.find({
                                        StudyID: fields.StudyID,
                                        UsedCoreId: fields.SiteID,
                                        DDrugNumAYN: 1,
                                        DDrugDMNumYN: {$ne: 1},
                                        DrugExpryDTC: {$gte: new Date()},
                                        Arm: userPersons[0].Arm,
                                        DrugDose:fields.DrugDose,
                                        DDrugUseAYN: {$ne: 1}
                                    }).sort({DrugSeq : 1}).exec(function (err, drugPersons) {
                                        if (err != null) {
                                            console.log(err)
                                            console.log('错误')
                                        }
                                        var newDrug = null;
                                        if (persons1[0].NTrtGrp.length != 0) {
                                            for (var i = 0; i < drugPersons.length; i++) {
                                                if (drugPersons[i].Arm == fields.Arm) {
                                                    newDrug = drugPersons[i];
                                                    break;
                                                }
                                            }
                                            if (newDrug == null) {
                                                res.send({
                                                    'isSucceed': 200,
                                                    'msg': '该中心某组已激活药物号不足'
                                                });
                                                return
                                            }
                                        }
                                        if (drugPersons.length < 6) {
                                            fasongyoujian(fields)
                                        }
                                        if (drugPersons.length == 0) {
                                            res.send({
                                                'isSucceed': 200,
                                                'msg': '该中心已激活药物号不足'
                                            });
                                            return
                                        } else {
                                            //设置为已使用
                                            //查看药物号是否过期

                                            drugCK.update({
                                                'id': newDrug.id
                                            }, {
                                                DDrugUseAYN: 1,
                                                DDrugUseID: fields.userId
                                            }, [false, true], function (err) {
                                                if (err != null) {
                                                    console.log("替换药物号失败");
                                                    console.log(err);
                                                }
                                            }),
                                                //替换的药物号设置为已废弃
                                                drugCK.update({
                                                    'DrugNum': fields.DrugNum,
                                                    'StudyID': fields.StudyID,
                                                }, {
                                                    DDrugDMNumYN: 1
                                                }, [false, true], function (err) {
                                                    if (err != null) {
                                                        console.log("替换药物号失败");
                                                        console.log(err);
                                                    }
                                                })
                                            addSuccessPatient.find({
                                                'id': fields.userId
                                            }, function (sss, user) {
                                                addSuccessPatient.update({
                                                    'id': fields.userId
                                                }, {
                                                    $push: {
                                                        'Drug': "替换药物号为" + newDrug.DrugNum,
                                                        'DrugDate': new Date(),
                                                        'DrugDoer' : fields.user.id,
                                                        'DrugDose' : fields.DrugDose
                                                    },
                                                }, [false, true], function (sss, ddd) {
                                                    console.log(sss, ddd)
                                                    //这里修改中心替换药物号个数+1
                                                    site.find({
                                                        StudyID: fields.StudyID,
                                                        SiteID: fields.SiteID
                                                    }, function (err, sitePersons) {
                                                        var ThywhGS = 0;
                                                        if (sitePersons[0].ThywhGS != null) {
                                                            ThywhGS = sitePersons[0].ThywhGS + 1
                                                        } else {
                                                            ThywhGS = 1
                                                        }

                                                        site.update({
                                                            StudyID: fields.StudyID,
                                                            SiteID: fields.SiteID
                                                        }, {
                                                            ThywhGS: ThywhGS
                                                        }, [false, true], function (sss, ddd) {

                                                        })
                                                    })
                                                    drugWL.update({
                                                        'DrugNum': fields.DrugNum,
                                                        'StudyID': fields.StudyID,
                                                    }, {
                                                        $push: {
                                                            'drugStrs': "药物号已废弃",
                                                            'drugDate': new Date()
                                                        },
                                                    }, [false, true], function () {
                                                        console.log("修改成功");
                                                    })
                                                    drugWL.update({
                                                        'StudyID': fields.StudyID,
                                                        'DrugNum': newDrug.DrugNum
                                                    }, {
                                                        $push: {
                                                            'drugStrs': "药物号经替补发放",
                                                            'drugDate': new Date()
                                                        },
                                                    }, [false, true], function () {
                                                        console.log("修改成功");
                                                    })
                                                    res.send({
                                                        'isSucceed': 200,
                                                        'msg': '替换药物号为:' + newDrug.DrugNum
                                                    });
                                                });
                                            })
                                        }
                                    })
                                })
                            } else {
                                res.send({
                                    'isSucceed': 200,
                                    'msg': '未找到该用户'
                                });
                            }
                        })
                    } else {
                        res.send({
                            'isSucceed': 200,
                            'msg': '该药物已经被替换过,请勿重复替换'
                        });
                    }
                })
            }
        })
    })
}

//替换药物号考虑交叉设计
exports.getThywhJcsj = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //判断改用户是否以揭盲
        //判断改用户是否以揭盲
        addSuccessPatient.find({'id':fields.userId}, function (err, userPersons) {
            if (userPersons[0].isUnblinding == 1) {
                res.send({
                    'isSucceed': 200,
                    'msg': '该受试者已揭盲,不能补充药物号'
                });
            } else {
                //查询改替换的药物号是否废弃
                drugCK.find({
                    'DrugNum': fields.DrugNum,
                    'StudyID': fields.StudyID,
                    'DDrugDMNumYN': 1
                }, function (err, isFQPersons) {
                    if (isFQPersons.length == 0) {
                        addSuccessPatient.find({'id': fields.userId}, function (err, userPersons) {
                            if (userPersons.length > 0) {
                                //药物号
                                researchParameter.find({StudyID: fields.StudyID}, function (err, persons1) {
                                    random.find({
                                        "StudyID" : fields.StudyID,
                                        "RandoNum" : userPersons[0].Random
                                    },function (err, randomPersons) {
                                        //取出随机号对应的数据
                                        var StudyDCross = persons1[0].StudyDCross.split(",");
                                        var wezhi = StudyDCross.indexOf(fields.StudyDCross);
                                        var CrossCodes = randomPersons[0].CrossCode.split(",");
                                        var newStudyDCross = CrossCodes[wezhi];
                                        var fenzhu = persons1[0].NTrtGrp.split(",");
                                        drugCK.find({
                                            StudyID: fields.StudyID,
                                            UsedCoreId: fields.SiteID,
                                            DDrugNumAYN: 1,
                                            DDrugDMNumYN: {$ne: 1},
                                            DrugExpryDTC: {$gte: new Date()},
                                            // Arm: userPersons[0].Arm,
                                            StudyDCross:newStudyDCross,
                                            DDrugUseAYN: {$ne: 1}
                                        }).sort({DrugSeq : 1}).exec(function (err, drugPersons) {
                                            if (err != null) {
                                                console.log(err)
                                                console.log('错误')
                                            }
                                            var newDrug = null;
                                            newDrug = drugPersons[0];
                                            if (drugPersons.length < 6) {
                                                fasongyoujian(fields)
                                            }
                                            if (drugPersons.length == 0) {
                                                res.send({
                                                    'isSucceed': 200,
                                                    'msg': '该中心已激活药物号不足'
                                                });
                                                return
                                            } else {
                                                //设置为已使用
                                                //查看药物号是否过期

                                                drugCK.update({
                                                    'id': newDrug.id
                                                }, {
                                                    DDrugUseAYN: 1,
                                                    DDrugUseID: fields.userId
                                                }, [false, true], function (err) {
                                                    if (err != null) {
                                                        console.log("替换药物号失败");
                                                        console.log(err);
                                                    }
                                                }),
                                                    //替换的药物号设置为已废弃
                                                    drugCK.update({
                                                        'DrugNum': fields.DrugNum,
                                                        'StudyID': fields.StudyID,
                                                    }, {
                                                        DDrugDMNumYN: 1
                                                    }, [false, true], function (err) {
                                                        if (err != null) {
                                                            console.log("替换药物号失败");
                                                            console.log(err);
                                                        }
                                                    })
                                                addSuccessPatient.find({
                                                    'id': fields.userId
                                                }, function (sss, user) {
                                                    addSuccessPatient.update({
                                                        'id': fields.userId
                                                    }, {
                                                        $push: {
                                                            'Drug': "替换药物号为" + newDrug.DrugNum,
                                                            'DrugDate': new Date(),
                                                            'DrugDoer' : fields.user.id,
                                                            'StudyDCross' : fields.StudyDCross
                                                        },
                                                    }, [false, true], function (sss, ddd) {
                                                        console.log(sss, ddd)
                                                        //这里修改中心替换药物号个数+1
                                                        site.find({
                                                            StudyID: fields.StudyID,
                                                            SiteID: fields.SiteID
                                                        }, function (err, sitePersons) {
                                                            var ThywhGS = 0;
                                                            if (sitePersons[0].ThywhGS != null) {
                                                                ThywhGS = sitePersons[0].ThywhGS + 1
                                                            } else {
                                                                ThywhGS = 1
                                                            }

                                                            site.update({
                                                                StudyID: fields.StudyID,
                                                                SiteID: fields.SiteID
                                                            }, {
                                                                ThywhGS: ThywhGS
                                                            }, [false, true], function (sss, ddd) {

                                                            })
                                                        })
                                                        drugWL.update({
                                                            'DrugNum': fields.DrugNum,
                                                            'StudyID': fields.StudyID,
                                                        }, {
                                                            $push: {
                                                                'drugStrs': "药物号已废弃",
                                                                'drugDate': new Date()
                                                            },
                                                        }, [false, true], function () {
                                                            console.log("修改成功");
                                                        })
                                                        drugWL.update({
                                                            'StudyID': fields.StudyID,
                                                            'DrugNum': newDrug.DrugNum
                                                        }, {
                                                            $push: {
                                                                'drugStrs': "药物号经替补发放",
                                                                'drugDate': new Date()
                                                            },
                                                        }, [false, true], function () {
                                                            console.log("修改成功");
                                                        })
                                                        res.send({
                                                            'isSucceed': 200,
                                                            'msg': '替换药物号为:' + newDrug.DrugNum
                                                        });
                                                    });
                                                })
                                            }
                                        })
                                    })
                                })
                            } else {
                                res.send({
                                    'isSucceed': 200,
                                    'msg': '未找到该用户'
                                });
                            }
                        })
                    } else {
                        res.send({
                            'isSucceed': 200,
                            'msg': '该药物已经被替换过,请勿重复替换'
                        });
                    }
                })
            }
        })
    })
}

//替换药物号
exports.getThywh = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields);
        //判断改用户是否以揭盲
        //判断改用户是否以揭盲
        addSuccessPatient.find({'id':fields.userId}, function (err, userPersons) {
            if (userPersons[0].isUnblinding == 1) {
                res.send({
                    'isSucceed': 200,
                    'msg': '该受试者已揭盲,不能补充药物号'
                });
            } else {
                //查询改替换的药物号是否废弃
                drugCK.find({
                    'DrugNum': fields.DrugNum,
                    'StudyID': fields.StudyID,
                    'DDrugDMNumYN': 1
                }, function (err, isFQPersons) {
                    if (isFQPersons.length == 0) {
                        addSuccessPatient.find({'id': fields.userId}, function (err, userPersons) {
                            if (userPersons.length > 0) {
                                //药物号
                                researchParameter.find({StudyID: fields.StudyID}, function (err, persons1) {
                                    var fenzhu = persons1[0].NTrtGrp.split(",");
                                    drugCK.find({
                                        StudyID: fields.StudyID,
                                        UsedCoreId: fields.SiteID,
                                        DDrugNumAYN: 1,
                                        DDrugDMNumYN: {$ne: 1},
                                        DrugExpryDTC: {$gte: new Date()},
                                        Arm: userPersons[0].Arm,
                                        DDrugUseAYN: {$ne: 1}
                                    }).sort({DrugSeq : 1}).exec(function (err, drugPersons) {
                                        if (err != null) {
                                            console.log(err)
                                            console.log('错误')
                                        }
                                        var newDrug = null;
                                        if (persons1[0].NTrtGrp.length != 0) {
                                            for (var i = 0; i < drugPersons.length; i++) {
                                                if (drugPersons[i].Arm == fields.Arm) {
                                                    newDrug = drugPersons[i];
                                                    break;
                                                }
                                            }
                                            if (newDrug == null) {
                                                res.send({
                                                    'isSucceed': 200,
                                                    'msg': '该中心某组已激活药物号不足'
                                                });
                                                return
                                            }
                                        }
                                        if (drugPersons.length < 6) {
                                            fasongyoujian(fields)
                                        }
                                        if (drugPersons.length == 0) {
                                            res.send({
                                                'isSucceed': 200,
                                                'msg': '该中心已激活药物号不足'
                                            });
                                            return
                                        } else {
                                            //设置为已使用
                                            //查看药物号是否过期

                                            drugCK.update({
                                                'id': newDrug.id
                                            }, {
                                                DDrugUseAYN: 1,
                                                DDrugUseID: fields.userId
                                            }, [false, true], function (err) {
                                                if (err != null) {
                                                    console.log("替换药物号失败");
                                                    console.log(err);
                                                }
                                            }),
                                                //替换的药物号设置为已废弃
                                                drugCK.update({
                                                    'DrugNum': fields.DrugNum,
                                                    'StudyID': fields.StudyID,
                                                }, {
                                                    DDrugDMNumYN: 1
                                                }, [false, true], function (err) {
                                                    if (err != null) {
                                                        console.log("替换药物号失败");
                                                        console.log(err);
                                                    }
                                                })
                                            addSuccessPatient.find({
                                                'id': fields.userId
                                            }, function (sss, user) {
                                                addSuccessPatient.update({
                                                    'id': fields.userId
                                                }, {
                                                    $push: {
                                                        'Drug': "替换药物号为" + newDrug.DrugNum,
                                                        'DrugDate': new Date(),
                                                        'DrugDoer' : fields.user.id
                                                    },
                                                }, [false, true], function (sss, ddd) {
                                                    console.log(sss, ddd)
                                                    //这里修改中心替换药物号个数+1
                                                    site.find({
                                                        StudyID: fields.StudyID,
                                                        SiteID: fields.SiteID
                                                    }, function (err, sitePersons) {
                                                        var ThywhGS = 0;
                                                        if (sitePersons[0].ThywhGS != null) {
                                                            ThywhGS = sitePersons[0].ThywhGS + 1
                                                        } else {
                                                            ThywhGS = 1
                                                        }

                                                        site.update({
                                                            StudyID: fields.StudyID,
                                                            SiteID: fields.SiteID
                                                        }, {
                                                            ThywhGS: ThywhGS
                                                        }, [false, true], function (sss, ddd) {

                                                        })
                                                    })
                                                    drugWL.update({
                                                        'DrugNum': fields.DrugNum,
                                                        'StudyID': fields.StudyID,
                                                    }, {
                                                        $push: {
                                                            'drugStrs': "药物号已废弃",
                                                            'drugDate': new Date()
                                                        },
                                                    }, [false, true], function () {
                                                        console.log("修改成功");
                                                    })
                                                    drugWL.update({
                                                        'StudyID': fields.StudyID,
                                                        'DrugNum': newDrug.DrugNum
                                                    }, {
                                                        $push: {
                                                            'drugStrs': "药物号经替补发放",
                                                            'drugDate': new Date()
                                                        },
                                                    }, [false, true], function () {
                                                        console.log("修改成功");
                                                    })
                                                    res.send({
                                                        'isSucceed': 200,
                                                        'msg': '替换药物号为:' + newDrug.DrugNum
                                                    });
                                                });
                                            })
                                        }
                                    })
                                })
                            } else {
                                res.send({
                                    'isSucceed': 200,
                                    'msg': '未找到该用户'
                                });
                            }
                        })
                    } else {
                        res.send({
                            'isSucceed': 200,
                            'msg': '该药物已经被替换过,请勿重复替换'
                        });
                    }
                })
            }
        })
    })
    // var form = new formidable.IncomingForm();
    // form.parse(req,function (err, fields, files) {
    //     console.log(fields)
    //     //药物号
    //     drugCK.find({StudyID:fields.StudyID ,UsedCoreId:fields.SiteID,DDrugNumAYN: 1,DDrugUseAYN:{$ne:1}}).sort('DrugNum').exec(function(err, drugPersons) {
    //         if (err != null) {
    //             console.log(err)
    //             console.log('错误')
    //         }
    //         console.log('中心已激活药物号个数')
    //         console.log(drugPersons.length)
    //         if (drugPersons.length < 20) {
    //             users.find({
    //                 StudyID: fields.StudyID,
    //                 UserFun: 'H4',
    //                 UserSite: fields.SiteID
    //             }, function (err, usersPersons) {
    //                 //异步转同步
    //                 (function iterator(i) {
    //                     console.log('查找仓管员')
    //                     if (i == usersPersons.length) {
    //                         return
    //                     }
    //                     site.find({StudyID: fields.StudyID, SiteID: fields.SiteID}, function (err, sitePersons) {
    //                         //发送短信提醒
    //                         //发送药物号不足提醒
    //                         var htmlStr = '<h2>中心:' + sitePersons[0].SiteNam + '</h2>'
    //                         htmlStr = htmlStr + '<h2>药物号不足</h2>'
    //                         EMail.fasongxiujian({
    //                             from: "配送清单<k13918446402@qq.com>", // 发件地址
    //                             to: usersPersons[i].UserEmail, // 收件列表
    //                             subject: "药物号不足提醒", // 标题
    //                             html: htmlStr // html 内容
    //                         })
    //                         iterator(i + 1)
    //                     })
    //                 })(0);
    //             })
    //             users.find({StudyID: fields.StudyID, UserFun: 'M6'}, function (err, usersPersons) {
    //                 //异步转同步
    //                 (function iterator(i) {
    //                     console.log('查找总仓管员')
    //                     if (i == usersPersons.length) {
    //                         return
    //                     }
    //                     site.find({StudyID: fields.StudyID, SiteID: fields.SiteID}, function (err, sitePersons) {
    //                         //发送短信提醒
    //                         //发送药物号不足提醒
    //                         var htmlStr = '<h2>中心:' + sitePersons[0].SiteNam + '</h2>'
    //                         htmlStr = htmlStr + '<h2>药物号不足</h2>'
    //                         EMail.fasongxiujian({
    //                             from: "配送清单<k13918446402@qq.com>", // 发件地址
    //                             to: usersPersons[i].UserEmail, // 收件列表
    //                             subject: "药物号不足提醒", // 标题
    //                             html: htmlStr // html 内容
    //                         })
    //                         iterator(i + 1)
    //                     })
    //                 })(0);
    //             })
    //         }
    //         if (drugPersons.length == 0) {
    //             res.send({
    //                 'isSucceed': 200,
    //                 'msg': '该中心已激活药物号不足'
    //             });
    //         } else {
    //             //设置为已使用
    //             drugCK.update({
    //                 'id':fields.newDrug.id
    //             },{
    //                 DDrugUseAYN:1 ,
    //                 DDrugUseID:fields.userId
    //             },function () {
    //                 console.log("药物号修改成功");
    //             })
    //             drugCK.update({
    //                 'StudyID':fields.StudyID,
    //                 'DrugNum':fields.DrugNum
    //             },{
    //                 'DDrugNumAYN' : 0 ,
    //                 'DDrugDMNumYN' : 1
    //             },function () {
    //                 console.log("药物号修改成功");
    //                 //修改物流信息
    //                 drugWL.update({
    //                     'StudyID' : fields.StudyID,
    //                     'DrugNum' : fields.DrugNum
    //                 },{
    //                     $push : {
    //                         'drugStrs' : '替换药物号',
    //                         'drugDate' : new Date()
    //                     } ,
    //                 },function () {
    //                     console.log("修改成功");
    //                 })
    //             })
    //             addSuccessPatient.update({
    //                 'id':fields.userId
    //             },{
    //                 $push : {
    //                     'Drug' : "替换药物号为" + fields.newDrug.DrugNum,
    //                     'DrugDate' : new Date()
    //                 } ,
    //             },function () {
    //                 res.send({
    //                     'isSucceed': 400,
    //                     'msg': '替换的药物号为:' + fields.newDrug.DrugNum
    //                 });
    //             })
    //         }
    //     })
    // })
}

//发送邮件
fasongyoujian = function (fields) {
    users.find({StudyID: fields.StudyID , UserFun: 'M6'}, function (err, usersPersons) {
        if (err != null){
            return
        }
        if (usersPersons.length == 0){
            return
        }
        var userArray = usersPersons;
        users.find({StudyID: fields.StudyID , UserSite: fields.SiteID,UserFun: 'H4'}, function (err, NewUsersPersons) {
            if (err != null){
                return
            }
            if (NewUsersPersons.length == 0){
                return
            }

            var usersPersons = [];
            for (var j = 0; j < userArray.length; j++) {
                var userModel = userArray[j]
                if (userModel.UserSiteYN == '1') {
                    usersPersons.push(userModel)
                } else {
                    var siteIDs = userModel.UserSite.split(",");
                    for (var x = 0; x < siteIDs.length; x++) {
                        var siteIDStr = siteIDs[x]
                        if (siteIDStr == fields.SiteID) {
                            usersPersons.push(userModel)
                        }
                    }
                }
            }
            //异步转同步
            (function iterator(i) {
                console.log('查找仓管员')
                if (i == usersPersons.length) {
                    return
                }
                site.find({StudyID: fields.StudyID, SiteID: fields.SiteID}, function (err, sitePersons) {
                    ApplicationAndAuditSchema.find({StudyID: fields.StudyID}, function (err, ApplicationAndAuditSchemaPersons) {
                        drugCK.find({
                            StudyID: fields.StudyID,
                            UsedCoreId: fields.SiteID,
                            DDrugUseAYN: 1
                        }).sort({DrugSeq : 1}).exec(function (err, sydrugPersons) {
                            drugCK.find({

                                // StudyID:fields.StudyID ,
                                // UsedCoreId:fields.SiteID,
                                // DDrugNumAYN: 1,
                                // DDrugDMNumYN: {$ne:1},
                                // DDrugUseAYN:{$ne:1},
                                // DrugExpryDTC : {$gte:new Date()}

                                UsedCoreId: fields.SiteID,
                                StudyID: fields.StudyID,
                                DDrugNumAYN: {$ne: 0},
                                DDrugDMNumYN: {$ne: 1},
                                DrugExpryDTC: {$gte: new Date()},
                                $or: [
                                    {DDrugUseAYN: 0},
                                    {DDrugUseAYN: null}
                                ]
                            }).sort({DrugSeq : 1}).exec(function (err, kcdrugPersons) {
                                //发送短信提醒
                                //发送药物号不足提醒
                                var htmlStr = '<h2>研究编号:' + sitePersons[0].StudyID + '</h2>'
                                htmlStr = htmlStr + '<h2>研究标题全称:' + ApplicationAndAuditSchemaPersons[0].StudNameF + '</h2>'
                                htmlStr = htmlStr + '<h2>研究标题简称:' + ApplicationAndAuditSchemaPersons[0].StudNameS + '</h2>'
                                htmlStr = htmlStr + '<h2>研究中心编号:' + sitePersons[0].SiteID + '</h2>'
                                htmlStr = htmlStr + '<h2>研究中心名称:' + sitePersons[0].SiteNam + '</h2>'
                                htmlStr = htmlStr + '<h2>研究中心地址:' + sitePersons[0].SiteAdd + '</h2>'
                                htmlStr = htmlStr + '<h2>研究中心邮编:' + sitePersons[0].SiteZipC + '</h2>'
                                htmlStr = htmlStr + '<h2>药品管理员姓名:' + NewUsersPersons[0].UserNam + '</h2>'
                                htmlStr = htmlStr + '<h2>药品管理员手机:' + NewUsersPersons[0].UserMP + '</h2>'
                                var kcdrugL = kcdrugPersons.length;
                                // if (kcdrugPersons.length - 1 >= 0){
                                //     kcdrugL = kcdrugL - 1
                                // }
                                htmlStr = htmlStr + '<h2>目前库存量:' + kcdrugL + '</h2>'
                                htmlStr = htmlStr + '<h2>已使用药物量:' + sydrugPersons.length + '</h2>'
                                if (kcdrugPersons.length == 0) {
                                    htmlStr = htmlStr + '<h2>该研究中心已经无药物号可取，请立即补充药物！</h2>'
                                } else {
                                    htmlStr = htmlStr + '<h2>该研究中心库存药物量已到临界值/不足，请尽快补充药物！</h2>'
                                }
                                EMail.fasongxiujian({
                                    from: "诺兰随机专用APP<k13918446402@qq.com>", // 发件地址
                                    to: usersPersons[i].UserEmail, // 收件列表
                                    subject: fields.StudyID + "药物号不足提醒", // 标题
                                    html: htmlStr // html 内容
                                })
                                var jsonss = {
                                    studyID: fields.StudyID,
                                    yytx: fields.StudyID + "药物号不足提醒",
                                    date: (moment().format('YYYY-MM-DD h:mm:ss a'))
                                }
                                client.execute('alibaba.aliqin.fc.sms.num.send', {
                                    'extend': '',
                                    'sms_type': 'normal',
                                    'sms_free_sign_name': '诺兰医药科技',
                                    'sms_param': {
                                        studyID: fields.StudyID,
                                        yytx: fields.StudyID + "药物号不足提醒",
                                        date: (moment().format('YYYY-MM-DD h:mm:ss a'))
                                    },
                                    'rec_num': usersPersons[i].UserMP,
                                    'sms_template_code': "SMS_63885566"
                                }, function (error, response) {
                                    if (error != null) {
                                        console.log(error)
                                    }
                                });
                            })
                        })
                    })
                    iterator(i + 1)
                })
            })(0);
        })
    })
}
//取随机号
var q = async.queue(function(task, callback) {
    callback();
}, 1);

exports.getRandomNumber = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        q.push({name:Date().toString(), run: function(err){
            console.log('t1 executed');
        }}, function(err) {
            console.log(q.length());
        // locker.acquire(function(){
            //判断中心是否停止入组
            site.find({StudyID: fields.StudyID, SiteID: fields.SiteID}, function (err, siteN) {
                if (siteN[0].isStopIt == "1") {
                    res.send({
                        'isSucceed': 200,
                        'msg': '中心已经停止入组！'
                    });
                    //locker.release();
                    return;
                }
                //判断中心是否揭盲
                if (siteN[0].isUnblinding == "1") {
                    res.send({
                        'isSucceed': 200,
                        'msg': '中心已经揭盲！'
                    });
                    //locker.release();
                    return;
                }
                //判断该用户是否取了随机号
                addSuccessPatient.find({'id':fields.userId}).exec((err, newPersons) => {
                    if (newPersons[0].Random != null){
                        res.send({
                            'isSucceed': 200,
                            'msg': '请勿重复获取随机号！'
                        });
                        //locker.release();
                        return;
                    };

                //添加随机号操作时间
                addSuccessPatient.update({
                    'id': fields.userId
                }, {
                    'RandomDate': new Date(),
                    'RandomUserPhone' : fields.user.UserMP
                }, function () {
                });
                    //异步转同步
                    (function iterator(i) {
                        //取出研究随机化参数信息
                        researchParameter.find({StudyID: fields.StudyID}, function (err, persons) {
                            if (err != null) {
                                res.send({
                                    'isSucceed': 200,
                                    'msg': '数据库错误'
                                });
                                //locker.release();
                                return;
                            } else {
                                if (persons[0].length == 0) {
                                    res.send({
                                        'isSucceed': 200,
                                        'msg': '未找到该研究随机化信息'
                                    });
                                    //locker.release();
                                    return;
                                } else if (persons[0].Random != null) {
                                    res.send({
                                        'isSucceed': 200,
                                        'msg': '该受试者已经获取了随机号,请勿重复获取'
                                    });
                                    //locker.release();
                                    return;
                                } else {
                                    if (persons[0].RandoM == 1) {//无分层因素固定随机:先到先得
                                        //取随机号
                                        random.find({
                                            StudyID: fields.StudyID,
                                            isUse: {$ne: 1}
                                        }).sort('RandoNum').exec(function (err, randomPersons) {
                                            if (randomPersons.length == 0) {
                                                res.send({
                                                    'isSucceed': 200,
                                                    'msg': '随机号已用完'
                                                });
                                                //locker.release();
                                                return
                                            } else {
                                                //判断是否取药物号
                                                if (persons[0].BlindSta == 2) {//单盲实验
                                                    //是否提供药物号
                                                    if (persons[0].DrugNSBlind == 1) {//是
                                                        //取出随机号和药物号
                                                        youyaowuhaoquyaowuhao(persons, fields, randomPersons, persons[0].RandoM, res)
                                                    } else {//否
                                                        meiyouyaowuhao(persons, randomPersons, persons[0].RandoM, res, fields)
                                                    }
                                                } else if (persons[0].BlindSta == 3) {//开放
                                                    //判断是否提供药物号
                                                    if (persons[0].DrugNOpen == 1) {//是
                                                        //取出随机号和药物号
                                                        youyaowuhaoquyaowuhao(persons, fields, randomPersons, persons[0].RandoM, res)
                                                    } else {//否
                                                        //取出随机号不取药物号
                                                        meiyouyaowuhao(persons, randomPersons, persons[0].RandoM, res, fields)
                                                    }
                                                } else {//双盲实验
                                                    //取出随机号和药物号
                                                    youyaowuhaoquyaowuhao(persons, fields, randomPersons, persons[0].RandoM, res)
                                                }
                                            }
                                        })
                                    } else if (persons[0].RandoM == 2) {//有分层因素固定随机:判断分层因素,后先到先得
                                        //取随机号
                                        random.find({
                                            StudyID: fields.StudyID,
                                            SubjFa: fields.SubjFa == '' ? null : fields.SubjFa,
                                            SubjFb: fields.SubjFb == '' ? null : fields.SubjFb,
                                            SubjFc: fields.SubjFc == '' ? null : fields.SubjFc,
                                            SubjFd: fields.SubjFd == '' ? null : fields.SubjFd,
                                            SubjFe: fields.SubjFe == '' ? null : fields.SubjFe,
                                            SubjFf: fields.SubjFf == '' ? null : fields.SubjFf,
                                            SubjFg: fields.SubjFg == '' ? null : fields.SubjFg,
                                            SubjFh: fields.SubjFh == '' ? null : fields.SubjFh,
                                            SubjFi: fields.SubjFi == '' ? null : fields.SubjFi,
                                            isUse: {$ne: 1}
                                        }).sort('RandoNum').exec(function (err, randomPersons) {
                                            if (randomPersons.length == 0) {
                                                res.send({
                                                    'isSucceed': 200,
                                                    'msg': '随机号已用完'
                                                });
                                                //locker.release();
                                                return
                                            } else {
                                                //判断是否取药物号
                                                if (persons[0].BlindSta == 2) {//单盲实验
                                                    //是否提供药物号
                                                    if (persons[0].DrugNSBlind == 1) {//是
                                                        //取出随机号
                                                        youyaowuhaoquyaowuhao(persons, fields, randomPersons, persons[0].RandoM, res)
                                                    } else {//否
                                                        //取出随机号不取药物号
                                                        meiyouyaowuhao(persons, randomPersons, persons[0].RandoM, res, fields)
                                                    }
                                                } else if (persons[0].BlindSta == 3) {//开放
                                                    //判断是否提供药物号
                                                    if (persons[0].DrugNOpen == 1) {//是
                                                        //取出随机号
                                                        youyaowuhaoquyaowuhao(persons, fields, randomPersons, persons[0].RandoM, res)
                                                    } else {//否
                                                        //取出随机号不取药物号
                                                        meiyouyaowuhao(persons, randomPersons, persons[0].RandoM, res, fields)
                                                    }
                                                } else {//双盲实验
                                                    //取出随机号
                                                    youyaowuhaoquyaowuhao(persons, fields, randomPersons, persons[0].RandoM, res)
                                                }
                                            }
                                        })
                                    } else if (persons[0].RandoM == 3) {//动态随机
                                        //判断是否取药物号
                                        if (persons[0].BlindSta == 2) {//单盲实验
                                            //是否提供药物号
                                            if (persons[0].DrugNSBlind == 1) {//是
                                                dongtaisuijiYouyaowuhao(persons, fields, persons[0].RandoM, res)
                                            } else {//否
                                                dongtaisuijiWuyaowuhao(persons, fields, persons[0].RandoM, res)
                                            }
                                        } else if (persons[0].BlindSta == 3) {//开放
                                            //判断是否提供药物号
                                            if (persons[0].DrugNOpen == 1) {//是
                                                dongtaisuijiYouyaowuhao(persons, fields, persons[0].RandoM, res)
                                            } else {//否
                                                dongtaisuijiWuyaowuhao(persons, fields, persons[0].RandoM, res)
                                            }
                                        } else {//双盲实验
                                            dongtaisuijiYouyaowuhao(persons, fields, persons[0].RandoM, res)
                                        }
                                    } else {
                                        res.send({
                                            'isSucceed': 200,
                                            'msg': '研究随机化信息中随机方法错误'
                                        });
                                        //locker.release();
                                        return
                                    }
                                }
                            }
                        })
                    })(0);
                })
            })

            console.log(fields);


        })

        });
    // })
}
//动态随机
//有药物号动态随机
function dongtaisuijiYouyaowuhao(persons,fields,RandoM,res) {
    //获取0~1中的一个小数
    var rand = Math.random();
    //药物号
    researchParameter.find({StudyID: fields.StudyID}, function (err, persons1) {
        var fenzhu = persons1[0].NTrtGrp.split(",");
        //异步转同步
        (function iterator(j){
            if(j == fenzhu.length){
                dongtaisuijiWuyaowuhao(persons,fields,RandoM,res,"123")
                return
            }
            var drugJson = {}
            // "StudyDCross" : String,//交叉设计数据
            //     "DrugDose" : String,//药物剂量数据
            if (fields.StudyDCross != null){
                    //取出随机号对应的数据
                    // var StudyDCross = persons1[0].StudyDCross.split(",");
                    // var wezhi = StudyDCross.indexOf(fields.StudyDCross);
                    // var CrossCodes = randomPersons[0].CrossCode.split(",");
                    // var newStudyDCross = CrossCodes[wezhi];
                drugJson = {
                    StudyID:fields.StudyID ,
                    // Arm:fenzhu[j],
                    UsedCoreId:fields.SiteID,DDrugNumAYN: 1,
                    DDrugDMNumYN: {$ne:1},
                    DDrugUseAYN:{$ne:1},
                    DrugExpryDTC : {$gte:new Date()},
                    StudyDCross:fields.StudyDCross
                }
            }else if (fields.DrugDose != null){
                drugJson = {
                    StudyID:fields.StudyID ,
                    Arm:fenzhu[j],
                    UsedCoreId:fields.SiteID,DDrugNumAYN: 1,
                    DDrugDMNumYN: {$ne:1},
                    DDrugUseAYN:{$ne:1},
                    DrugExpryDTC : {$gte:new Date()},
                    DrugDose:fields.DrugDose
                }
            }else{
                drugJson = {
                    StudyID:fields.StudyID ,
                    Arm:fenzhu[j],
                    UsedCoreId:fields.SiteID,DDrugNumAYN: 1,
                    DDrugDMNumYN: {$ne:1},
                    DDrugUseAYN:{$ne:1},
                    DrugExpryDTC : {$gte:new Date()},
                }
            }
            //药物号
            drugCK.find(drugJson).sort({DrugSeq : 1}).exec(function(err, drugPersons) {
                if (err != null){
                    res.send({
                        'isSucceed': 200,
                        'msg': '数据库错误'
                    });
                    //locker.release();
                    return;
                }
                if (drugPersons.length < 6){
                    fasongyoujian(fields)
                }
                if (drugPersons.length == 0){
                    res.send({
                        'isSucceed': 200,
                        'msg': '该中心已激活药物号不足'
                    });
                    //locker.release();
                    return;
                }else {
                    iterator(j+1)
                }
            })
        })(0);
    })
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
                //locker.release();
                return
            }else{
                var glArray = [];
                for (var i = 0 ; i < alloRatio.length ; i++){
                    for (var j = 0 ; j < alloRatio[i] ; j++){
                        glArray.push(ntrtGrp[i])
                    }
                }
                //随机取数组中的元素
                var n = Math.floor(Math.random() * glArray.length + 1)-1;
                //需要放入的治疗组
                var ntrtGrp = glArray[n];
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
                //比例
                var alloRatio = persons[0].AlloRatio.split(",");
                var zongBili = 0;
                for (var i = 0 ; i < nTrtGrpArray.length ; i++){
                    SubjFs[nTrtGrpArray[i]] = [];
                    zongBili = zongBili + parseInt(alloRatio[i])
                }
                console.log(zongBili);
                console.log(SubjFs);
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
                //计算出比例
                var bili = [];
                for (var  x = 0 ; x < nTrtGrpArray.length ; x++){
                    bili.push(parseInt(alloRatio[x])/zongBili);
                }
                //计算出总人数
                for (var i = 0 ; i < nTrtGrpArray.length ; i++){
                    //算出添加受试者后的受试者期望人数
                    var zongR = [0,0,0,0,0,0,0,0,0];
                    for (var j = 0 ; j < nTrtGrpArray.length ; j++){
                        if (addSuccessPersons[0].SubjFa != ""){
                            if (j == nTrtGrpArray.length - 1){
                                console.log(zongR[0] + rensus[j][0] + 1)
                                var iii = (zongR[0] + rensus[j][0] + 1)
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
                                var iii = (zongR[1] + rensus[j][1] + 1)
                                zongR.splice(1,1,iii)
                            }else{
                                var iii = zongR[1] + rensus[j][1]
                                zongR.splice(1,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFc != ""){
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[2] + rensus[j][2] + 1)
                                zongR.splice(2,1,iii)
                            }else{
                                var iii = zongR[2] + rensus[j][2]
                                zongR.splice(2,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFd != ""){
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[3] + rensus[j][3] + 1)
                                zongR.splice(3,1,iii)
                            }else{
                                var iii = zongR[3] + rensus[j][3]
                                zongR.splice(3,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFe != ""){
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[4] + rensus[j][4] + 1)
                                zongR.splice(4,1,iii)
                            }else{
                                var iii = zongR[4] + rensus[j][4]
                                zongR.splice(4,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFf != ""){
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[5] + rensus[j][5] + 1)
                                zongR.splice(5,1,iii)
                            }else{
                                var iii = zongR[5] + rensus[j][5]
                                zongR.splice(5,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFg != ""){
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[6] + rensus[j][6] + 1)
                                zongR.splice(6,1,iii)
                            }else{
                                var iii = zongR[6] + rensus[j][6]
                                zongR.splice(6,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFh != ""){
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[7] + rensus[j][7] + 1)
                                zongR.splice(7,1,iii)
                            }else{
                                var iii = zongR[7] + rensus[j][7]
                                zongR.splice(7,1,iii)
                            }
                        }
                        if (addSuccessPersons[0].SubjFi != "") {
                            if (j == nTrtGrpArray.length - 1){
                                var iii = (zongR[zongR.length - 1] + rensus[j][rensus[j].length - 1] + 1)
                                zongR.splice(8,1,iii)
                            }else{
                                var iii = zongR[zongR.length - 1] + rensus[j][rensus[j].length - 1]
                                zongR.splice(8,1,iii)
                            }
                        }
                    }
                    console.log("123123123")
                    console.log(zongR)
                    var array = [];//[[[0,2,2],[3,3,2],[3,1,2]],[假设B],]
                    if (addSuccessPersons[0].SubjFa != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][0] - (zongR[0] * bili[y])
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][0] - (zongR[0] * bili[y])
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFb != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][1] - (zongR[1] * bili[y])
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][1] - (zongR[1] * bili[y])
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFc != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][2] - (zongR[2] * bili[y])
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][2] - (zongR[2] * bili[y])
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFd != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][3] - (zongR[3] * bili[y])
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][3] - (zongR[3] * bili[y])
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFe != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][4] - (zongR[4] * bili[y])
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][4] - (zongR[4] * bili[y])
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFf != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][5] - (zongR[5] * bili[y])
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][5] - (zongR[5] * bili[y])
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFg != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][6] - (zongR[6] * bili[y])
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][6] - (zongR[6] * bili[y])
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFh != ""){
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][7] - (zongR[7] * bili[y])
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][7] - (zongR[7] * bili[y])
                                qiwangchaju.push(acj)
                            }
                        }
                        array.push(qiwangchaju)
                    }
                    if (addSuccessPersons[0].SubjFi != "") {
                        var qiwangchaju = [];
                        for (var y = 0 ; y < nTrtGrpArray.length ; y++){
                            if (y == i){
                                var acj =  qiwangrenshu[i][qiwangrenshu[i].length - 1] - (zongR[zongR.length - 1] * bili[y])
                                qiwangchaju.push(acj)
                            }else {
                                var acj =  rensus[y][rensus[y].length - 1] - (zongR[zongR.length - 1] * bili[y])
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
                    randomTool.jichafa(nTrtGrpArray,addSuccessPersons,qiwangcha,persons,function (ntrgrp) {
                        //存储随机号
                        chuchunyonghu(RandoM,drugPersons,persons,ntrgrp,res,fields)
                    })
                }else if (persons[0].FormulaImSc == 2) {//方差法
                    randomTool.fangchafa(nTrtGrpArray,addSuccessPersons,qiwangcha,persons,function (ntrgrp) {
                        //储存随机号
                        chuchunyonghu(RandoM,drugPersons,persons,ntrgrp,res,fields)
                    })
                }else {//最大值法
                    randomTool.zuidazhifa(nTrtGrpArray,addSuccessPersons,qiwangcha,persons,function (ntrgrp) {
                        //储存随机号
                        chuchunyonghu(RandoM,drugPersons,persons,ntrgrp,res,fields)
                    })
                }
            })
        }
    })
}

//储存用户
function chuchunyonghu(RandoM,drugPersons,persons,ntrtGrp,res,fields) {
    //判断该用户是否取了随机号
    addSuccessPatient.find({'id':fields.userId}).exec((err, newPersons) => {
        if (newPersons[0].Random != null) {
            res.send({
                'isSucceed': 200,
                'msg': '请勿重复获取随机号！'
            });
            //locker.release();
            return;
        }
        random.find({StudyID: fields.StudyID}, function (err, newRandomPersons) {
            var rr = newRandomPersons.length + 1 + '';
            var xxx = 4 - rr.length;
            var aa = '';
            for (var kk = 0; kk < xxx; kk++) {
                aa = aa + '0'
            }
            rr = aa + rr;
            random.create({
                StudyID: fields.StudyID,    //研究编号
                // "StratumN" : Number,    //分层结果代码:1=01中心既往未接受化疗者，2=01中心既往已接受化疗者，3=02中心既往未接受化疗者，4=02中心既
                // // 往已接受化疗者，5=03中心既往未接受化疗者，6=03中心既往已接受化疗者，7=04中心既往未接受化疗者，8=04中心既往已接受化疗者，9=05中心既往未接受化疗者，
                // // 10=06中心既往已接受化疗者。
                // "Stratum" : String,  //分层结果:01中心既往未接受化疗者，01中心既往已接受化疗者，02中心既往未接受化疗者，02中心既往已接受化疗者，03中心既往未接受化疗者，03中心既往已接受化疗者，04中心既往未接受化疗者，04中心既往已接受化疗者，05中心既往未接受化疗者，05中心既往已接受化疗者。
                // "BlockSeq" : Number, //层内区组号
                // "SeqInBlock" : Number, // 区组内序号
                // "ArmCD" : String, //治疗分组代码
                "StudyDs": persons[0].StudyDs,    //研究设计:1=平行设计；2=交叉设计
                "StudyPeNum": persons[0].StudyPeNum,   //研究阶段个数:适用于StudyDs=2；StudyDs=1不适用
                "RandoNum": rr, //随机号
                "Arm": ntrtGrp, //治疗分组标签
                "SubjFa": fields.SubjFa == '' ? null : fields.SubjFa,
                "SubjFb": fields.SubjFb == '' ? null : fields.SubjFb,
                "SubjFc": fields.SubjFc == '' ? null : fields.SubjFc,
                "SubjFd": fields.SubjFd == '' ? null : fields.SubjFd,
                "SubjFe": fields.SubjFe == '' ? null : fields.SubjFe,
                "SubjFf": fields.SubjFf == '' ? null : fields.SubjFf,
                "SubjFg": fields.SubjFg == '' ? null : fields.SubjFg,
                "SubjFh": fields.SubjFh == '' ? null : fields.SubjFh,
                "SubjFi": fields.SubjFi == '' ? null : fields.SubjFi,
                "isUse": 1, //是否使用;1为使用
                "UseUserId": fields.userId, //使用者ID
                Date: new Date(), //导入时间
            }, function (error, data) {
                var msg = ""
                if (drugPersons == null) {
                    addSuccessPatient.update({
                        'id': fields.userId
                    }, {
                        'RandoDoer': fields.user.id,
                        'Random': data.RandoNum,
                        'RandoM': RandoM,
                        'Arm': data.Arm,
                    }, [false, true], function () {
                        console.log("新增联系人修改成功");
                        addSuccessPatient.find({'id': fields.userId}).exec((err, newPersons) => {
                            if (persons[0].RandoNumYN == 1) {
                                msg = msg + "随机号: " + data.RandoNum + "\n"
                            }
                            if (persons[0].ArmYN == 1) {
                                msg = msg + "分组信息: " + data.Arm + "\n"
                            }
                            if (persons[0].SubStudYN == 1) {
                                if (newPersons[0].SubjStudYN == "否") {
                                    msg = msg + "随机参加子研究: " + "否" + "\n"
                                } else {
                                    var isArray = ["是", "否"];
                                    var t = Math.floor(Math.random() * isArray.length + 1) - 1;
                                    var isStr = isArray[t];
                                    msg = msg + "随机参加子研究: " + isStr + "\n"
                                    addSuccessPatient.update({
                                        'id': fields.userId
                                    }, {
                                        'SubjStudYN': isStr
                                    }, function () {
                                    })
                                }
                            }
                            if (persons[0].CStudyPeYN == 1) {
                                msg = msg + "研究阶段: " + persons[0].StudyPeNum + "\n"
                            }
                            console.log('提示')
                            console.log(msg)

                            suijiyoujian(fields, persons, [data], "无");
                            //输出
                            res.send({
                                'isSucceed': 400,
                                'msg': msg
                            });
                            //locker.release();
                            return
                        })
                    })
                } else {
                    var drugJson = {}
                    // "StudyDCross" : String,//交叉设计数据
                    //     "DrugDose" : String,//药物剂量数据
                    if (fields.StudyDCross != null){
                        //取出随机号对应的数据
                        var StudyDCross = persons[0].StudyDCross.split(",");
                        var wezhi = StudyDCross.indexOf(fields.StudyDCross);
                        var CrossCodes = data.CrossCode.split(",");
                        var newStudyDCross = CrossCodes[wezhi];
                        drugJson = {
                            StudyID: fields.StudyID,
                            // Arm: ntrtGrp,
                            UsedCoreId: fields.SiteID,
                            DDrugNumAYN: 1,
                            DDrugDMNumYN: {$ne: 1},
                            DDrugUseAYN: {$ne: 1},
                            DrugExpryDTC: {$gte: new Date()},
                            StudyDCross:newStudyDCross
                        }
                    }else if (fields.DrugDose != null){
                        drugJson = {
                            StudyID: fields.StudyID,
                            Arm: ntrtGrp,
                            UsedCoreId: fields.SiteID,
                            DDrugNumAYN: 1,
                            DDrugDMNumYN: {$ne: 1},
                            DDrugUseAYN: {$ne: 1},
                            DrugExpryDTC: {$gte: new Date()},
                            DrugDose:fields.DrugDose
                        }
                    }else{
                        drugJson = {
                            StudyID: fields.StudyID,
                            Arm: ntrtGrp,
                            UsedCoreId: fields.SiteID,
                            DDrugNumAYN: 1,
                            DDrugDMNumYN: {$ne: 1},
                            DDrugUseAYN: {$ne: 1},
                            DrugExpryDTC: {$gte: new Date()}
                        }
                    }
                    drugCK.find(drugJson).sort({DrugSeq: 1}).exec(function (err, drugPersons) {
                        if (drugPersons.length == 0) {
                            //输出
                            res.send({
                                'isSucceed': 200,
                                'msg': '网络异常,请重试!'
                            });
                            //删除刚刚保存的数据
                            random.remove({id: data.id}, function (err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("删除成功");
                                }
                            });
                            //删除用户
                            addSuccessPatient.remove({id: fields.userId}, function (err) {

                            });
                            return;
                        }
                        //设置为已使用
                        drugCK.update({
                            'id': drugPersons[0].id
                        }, {
                            DDrugUseAYN: 1,
                            DDrugUseID: fields.userId
                        }, [false, true], function () {
                            console.log("药物号修改成功");
                        })
                        var push = {
                            'Drug': drugPersons[0].DrugNum,
                            'DrugDate': new Date(),
                            'DrugDoer': fields.user.id
                        }
                        if (fields.StudyDCross != null){
                            push = {
                                'Drug': drugPersons[0].DrugNum,
                                'DrugDate': new Date(),
                                'DrugDoer': fields.user.id,
                                'StudyDCross' : fields.StudyDCross
                            }
                        }
                        if (fields.DrugDose != null){
                            push = {
                                'Drug': drugPersons[0].DrugNum,
                                'DrugDate': new Date(),
                                'DrugDoer': fields.user.id,
                                'DrugDose' : fields.DrugDose
                            }
                        }
                        addSuccessPatient.update({
                            'id': fields.userId
                        }, {

                            'RandoDoer': fields.user.id,
                            'Random': data.RandoNum,
                            'RandoM': RandoM,
                            'Arm': data.Arm,
                            $push: push,
                        }, [false, true], function () {
                            addSuccessPatient.find({'id': fields.userId}).exec((err, newPersons) => {
                                if (persons[0].RandoNumYN == 1) {
                                    msg = msg + "随机号: " + data.RandoNum + "\n"
                                }
                                if (persons[0].DrugNumYN == 1) {
                                    msg = msg + "药物号: " + drugPersons[0].DrugNum + "\n"
                                }
                                if (persons[0].ArmYN == 1) {
                                    msg = msg + "分组信息: " + data.Arm + "\n"
                                }
                                if (persons[0].SubStudYN == 1) {
                                    if (newPersons[0].SubjStudYN == "否") {
                                        msg = msg + "随机参加子研究: " + "否" + "\n"
                                    } else {
                                        var isArray = ["是", "否"];
                                        var t = Math.floor(Math.random() * isArray.length + 1) - 1;
                                        var isStr = isArray[t];
                                        msg = msg + "随机参加子研究: " + isStr + "\n"
                                        addSuccessPatient.update({
                                            'id': fields.userId
                                        }, {
                                            'SubjStudYN': isStr
                                        }, function () {
                                        })
                                    }
                                }
                                if (persons[0].CStudyPeYN == 1) {
                                    msg = msg + "研究阶段: " + persons[0].StudyPeNum + "\n"
                                }
                                console.log('提示')
                                console.log(msg)


                                suijiyoujian(fields, persons, [data], drugPersons[0].DrugNum);
                                drugWL.update({
                                    'StudyID': fields.StudyID,
                                    'DrugNum': drugPersons[0].DrugNum
                                }, {
                                    $push: {
                                        'drugStrs': "药物号已正常发放",
                                        'drugDate': new Date(),
                                    },
                                }, [false, true], function () {
                                    console.log("修改成功");
                                })
                                //输出
                                res.send({
                                    'isSucceed': 400,
                                    'msg': msg
                                });
                                //locker.release();
                                return
                            })
                        })
                    })
                }
            })
        })
    })
}

//有药物号公共方法
function youyaowuhaoquyaowuhao(persons,fields,randomPersons,RandoM,res) {
    var msg = '操作成功\n';
    console.log(fields)
    //取出随机号和药物号
    var drugJson = {}
    // "StudyDCross" : String,//交叉设计数据
    //     "DrugDose" : String,//药物剂量数据
    if (fields.StudyDCross != null){
        //取出随机号对应的数据
        var StudyDCross = persons[0].StudyDCross.split(",");
        var wezhi = StudyDCross.indexOf(fields.StudyDCross);
        var CrossCodes = randomPersons[0].CrossCode.split(",");
        var newStudyDCross = CrossCodes[wezhi];
        drugJson = {
            // Arm:randomPersons[0].Arm,
            StudyID:fields.StudyID ,
            UsedCoreId:fields.SiteID,
            DDrugNumAYN: 1,
            DDrugDMNumYN: {$ne:1},
            DDrugUseAYN:{$ne:1},
            DrugExpryDTC : {$gte:new Date()},
            StudyDCross:newStudyDCross
        }
    }else if (fields.DrugDose != null){
        drugJson = {
            StudyID:fields.StudyID ,
            UsedCoreId:fields.SiteID,
            DDrugNumAYN: 1,
            Arm:randomPersons[0].Arm,
            DDrugDMNumYN: {$ne:1},
            DDrugUseAYN:{$ne:1},
            DrugExpryDTC : {$gte:new Date()},
            DrugDose:fields.DrugDose
        }
    }else{
        drugJson = {
            StudyID:fields.StudyID ,
            UsedCoreId:fields.SiteID,
            DDrugNumAYN: 1,
            Arm:randomPersons[0].Arm,
            DDrugDMNumYN: {$ne:1},
            DDrugUseAYN:{$ne:1},
            DrugExpryDTC : {$gte:new Date()},
        }
    }
    //药物号
    drugCK.find(drugJson).sort({DrugSeq : 1}).exec(function(err, drugPersons) {
        if (err != null){
            res.send({
                'isSucceed': 200,
                'msg': '数据库错误!'
            });
            //locker.release();
            return;
        }
        //判断该用户是否取了随机号
        addSuccessPatient.find({'id':fields.userId}).exec((err, newPersons) => {
            if (newPersons[0].Random != null) {
                res.send({
                    'isSucceed': 200,
                    'msg': '请勿重复获取随机号！'
                });
                //locker.release();
                return;
            }
            if (drugPersons.length < 6) {
                fasongyoujian(fields)
            }
            if (drugPersons.length == 0) {
                res.send({
                    'isSucceed': 200,
                    'msg': '该中心已激活药物号不足'
                });
                //locker.release();
                return
            } else {
                //设置为已使用
                drugCK.update({
                    'id': drugPersons[0].id
                }, {
                    DDrugUseAYN: 1,
                    DDrugUseID: fields.userId
                }, [false, true], function () {
                    console.log("药物号修改成功");
                })
                var push = {
                    'Drug': drugPersons[0].DrugNum,
                    'DrugDate': new Date(),
                    'DrugDoer': fields.user.id
                }
                if (fields.StudyDCross != null){
                    push = {
                        'Drug': drugPersons[0].DrugNum,
                        'DrugDate': new Date(),
                        'DrugDoer': fields.user.id,
                        'StudyDCross' : fields.StudyDCross
                    }
                }
                if (fields.DrugDose != null){
                    push = {
                        'Drug': drugPersons[0].DrugNum,
                        'DrugDate': new Date(),
                        'DrugDoer': fields.user.id,
                        'DrugDose' : fields.DrugDose
                    }
                }
                addSuccessPatient.update({
                    'id': fields.userId
                }, {
                    'RandoDoer': fields.user.id,
                    'Random': randomPersons[0].RandoNum,
                    'RandoM': RandoM,
                    'Arm': randomPersons[0].Arm,
                    $push: push,
                }, [false, true], function () {
                    addSuccessPatient.find({'id': fields.userId}).exec((err, newPersons) => {
                        console.log("新增联系人修改成功");
                        if (persons[0].RandoNumYN == 1) {
                            msg = msg + "随机号: " + randomPersons[0].RandoNum + "\n"
                        }
                        if (persons[0].DrugNumYN == 1) {
                            msg = msg + "药物号: " + drugPersons[0].DrugNum + "\n"
                        }
                        if (persons[0].ArmYN == 1) {
                            msg = msg + "分组信息: " + randomPersons[0].Arm + "\n"
                        }
                        if (persons[0].SubStudYN == 1) {
                            if (newPersons[0].SubjStudYN == "否") {
                                msg = msg + "随机参加子研究: " + "否" + "\n"
                            } else {
                                var isArray = ["是", "否"];
                                var t = Math.floor(Math.random() * isArray.length + 1) - 1;
                                var isStr = isArray[t];
                                msg = msg + "随机参加子研究: " + isStr + "\n"
                                addSuccessPatient.update({
                                    'id': fields.userId
                                }, {
                                    'SubjStudYN': isStr
                                }, function () {
                                })
                            }
                        }
                        if (persons[0].CStudyPeYN == 1) {
                            msg = msg + "研究阶段: " + persons[0].StudyPeNum + "\n"
                        }
                        suijiyoujian(fields, persons, randomPersons, drugPersons[0].DrugNum);
                        console.log('提示')
                        console.log(msg)
                        drugWL.update({
                            'StudyID': fields.StudyID,
                            'DrugNum': drugPersons[0].DrugNum
                        }, {
                            $push: {
                                'drugStrs': '药物号已正常发放',
                                'drugDate': new Date()
                            },
                        }, function () {
                            console.log("修改成功");
                        })
                        //修改随机号已经使用
                        random.update({
                            'id': randomPersons[0].id
                        }, {
                            isUse: 1,
                            UseUserId: fields.userId
                        }, function () {
                            console.log("随机号修改成功");
                            //输出
                            res.send({
                                'isSucceed': 400,
                                'msg': msg
                            });
                            //locker.release();
                            return
                        })
                    })
                })
            }
        })
    })
}
//没有药物号公共方法
function meiyouyaowuhao(persons,randomPersons,RandoM,res,fields) {
    var msg = '';
    //判断该用户是否取了随机号
    addSuccessPatient.find({'id':fields.userId}).exec((err, newPersons) => {
        if (newPersons[0].Random != null) {
            res.send({
                'isSucceed': 200,
                'msg': '请勿重复获取随机号！'
            });
            //locker.release();
            return;
        }
        addSuccessPatient.update({
            'id': fields.userId
        }, {
            'RandoDoer': fields.user.id,
            'Random': randomPersons[0].RandoNum,
            'RandoM': RandoM,
            'Arm': randomPersons[0].Arm,
        }, function () {
            console.log("新增联系人修改成功");
            addSuccessPatient.find({'id': fields.userId}).exec((err, newPersons) => {
                //取出随机号不取药物号
                if (persons[0].RandoNumYN == 1) {
                    msg = msg + "随机号: " + randomPersons[0].RandoNum + "\n"
                }
                if (persons[0].ArmYN == 1) {
                    msg = msg + "分组信息: " + randomPersons[0].Arm + "\n"
                }
                if (persons[0].SubStudYN == 1) {
                    if (newPersons[0].SubjStudYN == "否") {
                        msg = msg + "随机参加子研究: " + "否" + "\n"
                    } else {
                        var isArray = ["是", "否"];
                        var t = Math.floor(Math.random() * isArray.length + 1) - 1;
                        var isStr = isArray[t];
                        msg = msg + "随机参加子研究: " + isStr + "\n"
                        addSuccessPatient.update({
                            'id': fields.userId
                        }, {
                            'SubjStudYN': isStr
                        }, function () {
                        })
                    }
                }
                if (persons[0].CStudyPeYN == 1) {
                    msg = msg + "研究阶段: " + persons[0].StudyPeNum + "\n"
                }
                suijiyoujian(fields, persons, randomPersons, "无");
                //修改随机号已经使用
                random.update({
                    'id': randomPersons[0].id
                }, {
                    isUse: 1,
                    UseUserId: fields.userId
                }, function () {
                    console.log("随机号修改成功");
                    //输出
                    res.send({
                        'isSucceed': 400,
                        'msg': msg
                    });
                    //locker.release();
                    return
                })
            })
        })
    })
}

//发送邮件
suijiyoujian = function(fields,persons,randomPersons,DrugNum){
    //发送邮件
    var emas = [];
    var phones = [];
    emas.push(fields.czzUser.UserEmail)
    phones.push(fields.czzUser.UserMP)
    var grps = persons[0].NTrtGrp.split(",");
    var htmlStr = ''
    var duanxinStr = fields.sjzUser.USubjID + (grps.length == 1 ? "受试者已给予研究治疗" : '受试者随机成功') + '；' + ((persons[0].BlindSta == 1) ? '' : ('分组为：' + randomPersons[0].Arm + '，') )
    if (persons[0].BlindSta == 1){//双盲
        if (fields.SubjFa == ''){//无分层
            htmlStr = htmlStr + "<h2>" + fields.StudyID + "研究温馨提示：受试者" + fields.sjzUser.USubjID + "</h2>"
            htmlStr = htmlStr + "<h2>" + fields.sjzUser.SubjIni + "已经于"+ (moment().format('YYYY-MM-DD h:mm:ss a'))  + (grps.length == 1 ? "成功完成给予研究治疗</h2>" :"成功完成随机</h2>")
            if (grps.length != 1) {
                htmlStr = htmlStr + "<h2>随机号为" + randomPersons[0].RandoNum + "</h2>"
            }
            htmlStr = htmlStr + "<h2>首次分配药物号为" + DrugNum + "</h2>"
            duanxinStr = duanxinStr + (grps.length == 1 ? "" : ('随机号为：' + randomPersons[0].RandoNum + '；')) +  '首次分配药物号为：' + DrugNum + '，'
        }else{//有分层
            htmlStr = htmlStr + "<h2>" + fields.StudyID + "研究温馨提示：受试者" + fields.sjzUser.USubjID + "</h2>"
            htmlStr = htmlStr + "<h2>" + fields.sjzUser.SubjIni + "已经于"+ (moment().format('YYYY-MM-DD h:mm:ss a'))  + (grps.length == 1 ? "成功完成给予研究治疗</h2>" :"成功完成随机</h2>")
            if (grps.length != 1) {
                htmlStr = htmlStr + "<h2>随机号为" + randomPersons[0].RandoNum + "</h2>"
            }
            htmlStr = htmlStr + "<h2>首次分配药物号为" + DrugNum + "</h2>"
            htmlStr = htmlStr + '<h2>分层因素如下：' + '</h2>'
            duanxinStr = duanxinStr + (grps.length == 1 ? "" : ('随机号为：' + randomPersons[0].RandoNum + '；')) +  '首次分配药物号为：' + DrugNum + '，'
            duanxinStr = duanxinStr + '分层因素如下：'
            if (fields.SubjFa != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraA + '：' + fields.SubjFa + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraA + '：' + fields.SubjFa + '，'
            }
            if (fields.SubjFb != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraB + '：' + fields.SubjFb + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraB + '：' + fields.SubjFb + '，'
            }
            if (fields.SubjFc != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraC + '：' + fields.SubjFc + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraC + '：' + fields.SubjFc + '，'
            }
            if (fields.SubjFd != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraD + '：' + fields.SubjFd + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraD + '：' + fields.SubjFd + '，'
            }
            if (fields.SubjFe != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraE + '：' + fields.SubjFe + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraE + '：' + fields.SubjFe + '，'
            }
            if (fields.SubjFf != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraF + '：' + fields.SubjFf + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraF + '：' + fields.SubjFf + '，'
            }
            if (fields.SubjFg != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraG + '：' + fields.SubjFg + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraG + '：' + fields.SubjFg + '，'
            }
            if (fields.SubjFh != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraH + '：' + fields.SubjFh + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraH + '：' + fields.SubjFh + '，'
            }
            if (fields.SubjFi != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraI + '：' + fields.SubjFi + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraI + '：' + fields.SubjFi + '，'
            }
        }
    }else{//非双盲
        if (fields.SubjFa == ''){//无分层
            htmlStr = htmlStr + "<h2>" + fields.StudyID + "研究温馨提示:受试者" + fields.sjzUser.USubjID + "</h2>"
            htmlStr = htmlStr + "<h2>" + fields.sjzUser.SubjIni + "已经于"+ (moment().format('YYYY-MM-DD h:mm:ss a'))  + (grps.length == 1 ? "成功完成给予研究治疗</h2>" :"成功完成随机</h2>")
            if (grps.length != 1) {
                htmlStr = htmlStr + "<h2>随机号为" + randomPersons[0].RandoNum + "</h2>"
            }
            htmlStr = htmlStr + "<h2>分组为" + randomPersons[0].Arm +"</h2>"
            if (grps.length != 1) {
                duanxinStr = duanxinStr + '随机号为：' + randomPersons[0].RandoNum + '、'
            }
        }else{//有分层
            htmlStr = htmlStr + "<h2>" + fields.StudyID + "研究温馨提示:受试者" + fields.sjzUser.USubjID + "</h2>"
            htmlStr = htmlStr + "<h2>" + fields.sjzUser.SubjIni + "已经于"+ (moment().format('YYYY-MM-DD h:mm:ss a'))  + (grps.length == 1 ? "成功完成给予研究治疗</h2>" :"成功完成随机</h2>")
            if (grps.length != 1) {
                htmlStr = htmlStr + "<h2>随机号为" + randomPersons[0].RandoNum + "</h2>"
            }
            htmlStr = htmlStr + "<h2>分组为" + randomPersons[0].Arm +"</h2>"
            htmlStr = htmlStr + '<h2>分层因素如下：' + '</h2>'
            if (grps.length != 1) {
                duanxinStr = duanxinStr + '随机号为：' + randomPersons[0].RandoNum + '、'
            }
            duanxinStr = duanxinStr + '分层因素如下：'
            if (fields.SubjFa != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraA + '：' + fields.SubjFa + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraA + '：' + fields.SubjFa + '，'
            }
            if (fields.SubjFb != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraB + '：' + fields.SubjFb + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraB + '：' + fields.SubjFb + '，'
            }
            if (fields.SubjFc != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraC + '：' + fields.SubjFc + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraC + '：' + fields.SubjFc + '，'
            }
            if (fields.SubjFd != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraD + '：' + fields.SubjFd + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraD + '：' + fields.SubjFd + '，'
            }
            if (fields.SubjFe != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraE + '：' + fields.SubjFe + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraE + '：' + fields.SubjFe + '，'
            }
            if (fields.SubjFf != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraF + '：' + fields.SubjFf + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraF + '：' + fields.SubjFf + '，'
            }
            if (fields.SubjFg != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraG + '：' + fields.SubjFg + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraG + '：' + fields.SubjFg + '，'
            }
            if (fields.SubjFh != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraF + '：' + fields.SubjFh + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraF + '：' + fields.SubjFh + '，'
            }
            if (fields.SubjFi != ''){
                htmlStr = htmlStr + '<h2>' + persons[0].LabelStraI + '：' + fields.SubjFi + '</h2>'
                duanxinStr = duanxinStr +  persons[0].LabelStraI + '：' + fields.SubjFi + '，'
            }
        }
    }
    duanxinStr=duanxinStr.substr(0,duanxinStr.length-1)
    users.find({
        $or:[
            {
                UserFun: 'H2',
                StudyID: fields.StudyID,
                UserSite: fields.SiteID,
            },
            {
                StudyID:fields.StudyID,
                UserFun: 'C1',
            }
        ]}, function (err, usersPersons) {
        for (var j = 0 ; j < usersPersons.length ; j++){
            if (usersPersons[j].UserEmail != emas[0]){
                var isEmasID = false;
                var isPhoneID = false;
                for (var x = 0 ; x < emas.length ; x++){
                    if (emas[x] == usersPersons[j].UserEmail){
                        isEmasID = true;
                    }
                }
                for (var y = 0 ; y < phones.length ; y++){
                    if (phones[y] == usersPersons[j].UserMP){
                        isPhoneID = true;
                    }
                }
                if (isEmasID == false){
                    emas.push(usersPersons[j].UserEmail);
                }
                if (isPhoneID == false){
                    phones.push(usersPersons[j].UserMP)
                }
            }
        }
        var jsonss = {
            studyID:fields.StudyID ,
            yytx:"受试者" + fields.sjzUser.USubjID + (grps.length == 1 ? "已给予研究治疗" :"完成随机"),
            date:(moment().format('YYYY-MM-DD h:mm:ss a'))
        }

        emas = MLArray.unique(emas);
        for (var i = 0 ; i < emas.length ; i++){
            EMail.fasongxiujian({
                from: "诺兰随机专用APP<k13918446402@qq.com>", // 发件地址
                to: emas[i], // 收件列表
                subject: fields.StudyID + (grps.length == 1 ? "已给予研究治疗" : "随机成功"), // 标题
                html: htmlStr // html 内容
            })
        }
        //短信内容
        phones = MLArray.unique(phones);
        for (var i = 0 ; i < phones.length ; i++){
            client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                'extend' : '' ,
                'sms_type' : 'normal' ,
                'sms_free_sign_name' : '诺兰医药科技' ,
                'sms_param' : {
                    studyID:fields.StudyID ,
                    yytx:duanxinStr,
                    date:(moment().format('YYYY-MM-DD h:mm:ss a'))
                } ,
                'rec_num' : phones[i] ,
                'sms_template_code' : "SMS_63885566"
            }, function(error, response) {
                if (error != null){
                    console.log(error)
                }
            });
        }
    })
}

//查找所有受试者
exports.getLookupSuccessBasicsData = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        appTool.addSuccessUpdate(fields.StudyID,fields.SiteID,function () {
            var data = [];
            var findJson = null;
            if (fields.SiteID.indexOf(',') != -1 ) {
                var sites = fields.SiteID.split(",");
                findJson = {$or:[]};
                for (var i = 0 ; i < sites.length ; i++){
                    findJson.$or.push({
                        'StudyID' : fields.StudyID,
                        'SiteID' : sites[i]
                    })
                }
            }else{
                findJson = {SiteID : fields.SiteID,StudyID : fields.StudyID}
            }
            //查找筛选成功受试者
            addSuccessPatient.find(findJson).sort('-USubjID').exec(function (err, persons){
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
                                isOut : persons[i].isOut == 1 ? 1 : 0,
                                isUnblinding : persons[i].isUnblinding == 1 ? 1 : 0,
                                Arm : persons[i].Arm,
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
                                    isOut : persons[i].isOut == 1 ? 1 : 0,
                                    isUnblinding : persons[i].isUnblinding == 1 ? 1 : 0,
                                    Arm : persons[i].Arm,
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
                                    isOut : persons[i].isOut == 1 ? 1 : 0,
                                    isUnblinding : persons[i].isUnblinding == 1 ? 1 : 0,
                                    Arm : persons[i].Arm,
                                    isSuccess : 1,
                                    persons : persons[i]
                                })
                            }
                        }
                    }
                    //查找筛选失败受试者
                    addFailPatient.find(findJson).sort('-USubjID').exec(function (err, persons){
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
    })
}

//模糊查询受试者
exports.getVagueBasicsData = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //模糊查询受试者
        var data = [];
        var reg = new RegExp(fields.str, 'i'); //不区分大小写
        //查找筛选成功受试者
        var findJson = null;
        var FailFindJson = null;
        if (fields.SiteID == ''){
            findJson = {$or:[
                {'USubjID':{$regex : reg}},
                {'SubjIni':{$regex : reg}},
                {'SubjMP':{$regex : reg}},
                {'SubjSex':{$regex : reg}},
            ],$and:[
                {'StudyID' : fields.StudyID}
            ]};
            FailFindJson = {$or:[
                {'USubjectID':{$regex : reg}},
                {'SubjIni':{$regex : reg}},
                {'SubjMP':{$regex : reg}},
                {'SubjSex':{$regex : reg}},
            ],$and:[
                {'StudyID' : fields.StudyID}
            ]};
        }else if (fields.SiteID.indexOf(',') != -1 ) {
            var sites = fields.SiteID.split(",");
            findJson = {$or:[
                {'USubjID':{$regex : reg}},
                {'SubjIni':{$regex : reg}},
                {'SubjMP':{$regex : reg}},
                {'SubjSex':{$regex : reg}}
            ],$and:[]};
            FailFindJson = {$or:[
                {'USubjID':{$regex : reg}},
                {'SubjIni':{$regex : reg}},
                {'SubjMP':{$regex : reg}},
                {'SubjSex':{$regex : reg}}
            ],$and:[]}
            var xxxx = {'StudyID' : {$in:[]},'SiteID':{$in:[]}}
            for (var i = 0 ; i < sites.length ; i++){
                xxxx.StudyID.$in.push(fields.StudyID)
                xxxx.SiteID.$in.push(sites[i])
            }
            FailFindJson.$and.push(xxxx)
            findJson.$and.push(xxxx)
        }else if (fields.SiteID == null){
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
                            isSuccess : 1,
                            phone:persons[i].SubjMP,
                            isOut : persons[i].isOut == 1 ? 1 : 0,
                            isUnblinding : persons[i].isUnblinding == 1 ? 1 : 0,
                            persons:persons[i],
                            Arm : persons[i].Arm,
                        })
                    }else{
                        if (persons[i].Drug == null){
                            data.push({
                                id : persons[i].id,
                                SubjIni : persons[i].SubjIni,
                                USubjID : persons[i].USubjID,
                                Random : persons[i].Random,//随机号
                                Drug : -1,
                                phone:persons[i].SubjMP,
                                isOut : persons[i].isOut == 1 ? 1 : 0,
                                isUnblinding : persons[i].isUnblinding == 1 ? 1 : 0,
                                Arm : persons[i].Arm,
                                persons:persons[i],
                                isSuccess : 1
                            })
                        }else {
                            data.push({
                                id : persons[i].id,
                                SubjIni : persons[i].SubjIni,
                                USubjID : persons[i].USubjID,
                                Random : persons[i].Random,//随机号
                                Drug : persons[i].Drug,
                                isOut : persons[i].isOut == 1 ? 1 : 0,
                                phone:persons[i].SubjMP,
                                persons:persons[i],
                                isUnblinding : persons[i].isUnblinding == 1 ? 1 : 0,
                                Arm : persons[i].Arm,
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
                            isSuccess : 0,
                            persons:persons[i]
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


//模糊查询受试者User信息
exports.getVagueBasicsDataUser = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //模糊查询受试者
        console.log(fields)
        var data = [];
        var reg = new RegExp(fields.str, 'i'); //不区分大小写
        //查找筛选成功受试者
        var findJson = null;
        var FailFindJson = null;
        if (fields.UserDepotYN == 1){
            findJson = {$or:[
                {'USubjID':{$regex : reg}},
                {'SubjIni':{$regex : reg}},
                {'SubjMP':{$regex : reg}},
                {'SubjSex':{$regex : reg}},
            ],$and:[
                {'StudyID' : fields.StudyID}
            ]};
            FailFindJson = {$or:[
                {'USubjID':{$regex : reg}},
                {'SubjIni':{$regex : reg}},
                {'SubjMP':{$regex : reg}},
                {'SubjSex':{$regex : reg}},
            ],$and:[
                {'StudyID' : fields.StudyID}
            ]};
        }else if (fields.SiteID.indexOf(',') != -1 ) {
            var sites = fields.SiteID.split(",");
            findJson = {$or:[
                {'USubjID':{$regex : reg}},
                {'SubjIni':{$regex : reg}},
                {'SubjMP':{$regex : reg}},
                {'SubjSex':{$regex : reg}}
            ],$and:[]};
            FailFindJson = {$or:[
                {'USubjID':{$regex : reg}},
                {'SubjIni':{$regex : reg}},
                {'SubjMP':{$regex : reg}},
                {'SubjSex':{$regex : reg}}
            ],$and:[]}
            var xxxx = {'StudyID' : {$in:[]},'SiteID':{$in:[]}}
            for (var i = 0 ; i < sites.length ; i++){
                xxxx.StudyID.$in.push(fields.StudyID)
                xxxx.SiteID.$in.push(sites[i])
            }
            FailFindJson.$and.push(xxxx)
            findJson.$and.push(xxxx)
        }else{
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
                            isSuccess : 1,
                            users:persons[i]
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
                                users:persons[i]
                            })
                        }else {
                            data.push({
                                id : persons[i].id,
                                SubjIni : persons[i].SubjIni,
                                USubjID : persons[i].USubjID,
                                Random : persons[i].Random,//随机号
                                Drug : persons[i].Drug,
                                isSuccess : 1,
                                users:persons[i],
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
                            isSuccess : 0,
                            users:persons[i]
                        })
                    }
                    if (data.length == 0){

                        res.send({
                            'isSucceed': 200,
                            'msg': '没有找到受试者'
                        });
                        return
                    }else{
                        res.send({
                            'isSucceed': 400,
                            'data': data
                        });
                    }
                }
            });
        })
    })
}
//查阅筛选例数分布
exports.getCysxsblsfb = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //查询该研究有多少中心
        site.chazhaozhongxin(fields.StudyID,function (err,persons) {
            var data = [];
            (function iterator(i) {
                var siteData = persons[i];
                if (i == persons.length) {
                    console.log(data);
                    res.send({
                        'isSucceed': 400,
                        'data': data
                    });
                    return
                }
                addFailPatient.find({StudyID:fields.StudyID ,SiteID:siteData.SiteID}, function (err, FailPersons) {
                    var dd = [siteData.SiteID,FailPersons.length];
                    data.push(dd);
                    iterator(i + 1)
                })
            })(0);
        })

    })
}
//新的查阅筛选失败例数分布
exports.getNewCysxsblsfb = function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //查询该研究有多少中心
        site.chazhaozhongxin(fields.StudyID,function (err,persons) {
            var data = [];
            var total = 0;
            var names = [];
            (function iterator(i) {
                var siteData = persons[i];
                if (i == persons.length) {
                    res.send({
                        'isSucceed': 400,
                        'data': data,
                        'total' : total,
                        'names' : names
                    });
                    return
                }
                names.push(siteData.SiteNam)
                var findJson = {
                    StudyID:fields.StudyID ,
                    SiteID:siteData.SiteID
                }
                if (fields.startingDate != null && fields.endDate != null) {
                    findJson.DSSTDAT = {"$gte" : fields.startingDate , "$lt" : fields.endDate}
                }
                addFailPatient.find(findJson, function (err, FailPersons) {
                    var dd = [siteData.SiteID,FailPersons.length];
                    data.push(dd);
                    total = total + FailPersons.length
                    iterator(i + 1)
                })
            })(0);
        })
    })
}

//查阅随机例数分布
exports.getCysjlsfb = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //查询该研究有多少中心
        site.chazhaozhongxin(fields.StudyID,function (err,persons) {
            var data = [];
            (function iterator(i) {
                var siteData = persons[i];
                if (i == persons.length) {
                    res.send({
                        'isSucceed': 400,
                        'data': data
                    });
                    return
                }
                addSuccessPatient.find({StudyID:fields.StudyID ,SiteID:siteData.SiteID ,Random:{$ne:null}}, function (err, FailPersons) {
                    var dd = [siteData.SiteID,FailPersons.length];
                    data.push(dd);
                    iterator(i + 1)
                })
            })(0);
        })
    })
}

//查阅随机例数分布
exports.getNewCysjlsfb = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //查询该研究有多少中心
        site.chazhaozhongxin(fields.StudyID,function (err,persons) {
            var data = [];
            var total = 0;
            var names = [];
            (function iterator(i) {
                var siteData = persons[i];
                if (i == persons.length) {
                    res.send({
                        'isSucceed': 400,
                        'data': data,
                        'total' : total,
                        'names' : names
                    });
                    return
                }
                names.push(siteData.SiteNam)
                var findJson = {
                    StudyID:fields.StudyID ,
                    SiteID:siteData.SiteID ,
                    Random:{$ne:null}
                }
                if (fields.startingDate != null && fields.endDate != null) {
                    findJson.Date = {"$gte" : fields.startingDate , "$lt" : fields.endDate}
                }
                addSuccessPatient.find(findJson, function (err, FailPersons) {
                    var dd = [siteData.SiteID,FailPersons.length];
                    data.push(dd);
                    total = total + FailPersons.length
                    iterator(i + 1)
                })
            })(0);
        })
    })
}

//查阅退出或完成例数分布
exports.getCytchwclsfb = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //查询该研究有多少中心
        site.chazhaozhongxin(fields.StudyID,function (err,persons) {
            var data = [];
            (function iterator(i) {
                var siteData = persons[i];
                if (i == persons.length) {
                    res.send({
                        'isSucceed': 400,
                        'data': data
                    });
                    return
                }
                addOutPatient.find({StudyID:fields.StudyID ,SiteID:siteData.SiteID}, function (err, FailPersons) {
                    var dd = [siteData.SiteID,FailPersons.length];
                    data.push(dd);
                    iterator(i + 1)
                })
            })(0);
        })
    })
}

//新的查阅退出或完成例数分布
exports.getNewCytchwclsfb = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //查询该研究有多少中心
        site.chazhaozhongxin(fields.StudyID,function (err,persons) {
            var total = 0;
            var names = [];
            var data = [];
            (function iterator(i) {
                var siteData = persons[i];
                if (i == persons.length) {
                    res.send({
                        'isSucceed': 400,
                        'data': data,
                        'total' : total,
                        'names' : names
                    });
                    return
                }
                names.push(siteData.SiteNam)
                var findJson = {
                    StudyID:fields.StudyID ,
                    SiteID:siteData.SiteID
                }
                if (fields.startingDate != null && fields.endDate != null) {
                    findJson.DSSTDAT = {"$gte" : fields.startingDate , "$lt" : fields.endDate}
                }
                addOutPatient.find(findJson, function (err, FailPersons) {
                    var dd = [siteData.SiteID,FailPersons.length];
                    data.push(dd);
                    total = total + FailPersons.length
                    iterator(i + 1)
                })
            })(0);
        })
    })
}

//查阅退出或完成例数分布--单个中心
exports.getCytchwclsfbZX = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        addOutPatient.find({StudyID:fields.StudyID ,SiteID:fields.SiteID}, function (err, FailPersons) {
            var dd = [fields.SiteID,FailPersons.length];
            var data = [dd];
            res.send({
                'isSucceed': 400,
                'data': data
            });
        })
    })
}

//新的查阅退出或完成例数分布--单个中心
exports.getNewCytchwclsfbZX  = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        site.find({StudyID:fields.StudyID ,SiteID:fields.SiteID}, function (err, persons) {
            var total = 0;
            var names = [];
            var data = [];
            (function iterator(i) {
                var siteData = persons[i];
                if (i == persons.length) {
                    res.send({
                        'isSucceed': 400,
                        'data': data,
                        'total' : total,
                        'names' : names
                    });
                    return
                }
                names.push(siteData.SiteNam)
                var findJson = {
                    StudyID:fields.StudyID,
                    SiteID:fields.SiteID
                }
                if (fields.startingDate != null && fields.endDate != null) {
                    findJson.DSSTDAT = {"$gte" : fields.startingDate , "$lt" : fields.endDate}
                }
                addOutPatient.find(findJson, function (err, FailPersons) {
                    var dd = [siteData.SiteID,FailPersons.length];
                    data.push(dd);
                    total = total + FailPersons.length
                    iterator(i + 1)
                })
            })(0);
        })
    })
}