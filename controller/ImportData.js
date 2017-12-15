var formidable = require('formidable');
var fs = require("fs");
var sd = require("silly-datetime");
var path = require("path");
var xlsx = require("node-xlsx");
var excelPort = require('excel-export');
var study = require('../models/import/study');//新增研究
var site = require("../models/import/site");//新增研究中心
var depot = require("../models/import/depot");//新增仓库
var researchParameter = require("../models/import/researchParameter");//设置研究的随机化参数
var ExcludeStandard = require("../models/import/ExcludeStandard");//导入入选排除标准
var FollowUpParameter = require("../models/import/FollowUpParameter");//导入入选排除标准
var drug = require("../models/import/drug");//导入药物号
var drugCK = require("../models/import/drugCK");//院内药物号
var drugWL = require("../models/import/drugWL");//院内药物号
var adminUser = require("../models/adminUsers");//管理用户
var users = require("../models/import/users");//用户表
var addSuccess = require("../models/import/addSuccessPatient");//筛选成功的用户
var random = require("../models/import/random");//随机号
var ApplicationAndAudit = require("../models/import/ApplicationAndAudit");//设置申请人和审核人
var ImageData = require("../models/import/imageData");//图片保存
var Unblinding = require("../models/import/Unblinding");//揭盲表
var settings = require('../settings');
const uuidV1 = require('uuid/v1');
//测试
//导入新增研究
exports.wenjiancheshi = function (req, res, next) {
    console.log("导入数据");
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    //配置上传路径
    form.uploadDir = __dirname + '/../middle/';
    form.parse(req,function (err, fields, files) {
        //上传完成移动到文件目录中
        if (err){
            next();     //这个中间件不受理这个请求了，往下走
            return;
        }
        res.send({
            'isSucceed' : 400,
            'msg' : '数据库正在维护,请稍后再试'
        });
        console.log(fields)
        console.log(files)
        console.log(files.img.size)
    })
}


//点击导出用户资料
exports.addDcyhzhzz = function (req, res, next) {
    var conf = {};
    conf.cols = [
        {caption:'StudySeq', type:'string'},
        {caption:'StudyID', type:'string'},
        {caption:'SponsorF', type:'string'},
        {caption:'SponsorS', type:'string'},
        {caption:'StudNameF', type:'string'},
        {caption:'StudNameS', type:'string'},
        {caption:'CoorPI', type:'string'},
        {caption:'UserNam', type:'string'},
        {caption:'UserTyp', type:'string'},
        {caption:'UserFun', type:'string'},
        {caption:'UserSite', type:'string'},
        {caption:'UserDepot', type:'string'},
        {caption:'UserEmail', type:'string'},
        {caption:'UserMP', type:'string'},
        {caption:'UserDAT', type:'string'},
        {caption:'UserEDAT', type:'string'},
    ];
    daochuExcel(req, res, conf, 'YHZL')
}
//点击导出图片资料
exports.addDctpzl = function (req, res, next) {
    var conf = {};
    conf.cols = [
        {caption:'StudyID', type:'string'},
        {caption:'imageUrl', type:'string'},
        {caption:'isAbandoned', type:'string'},
        {caption:'successPatientPhone', type:'string'},
        {caption:'successUSubjID', type:'string'},
        {caption:'uploadUserPhone', type:'string'},
        {caption:'uploadName', type:'string'},
        {caption:'date', type:'string'},
    ];
    daochuExcel(req, res, conf, 'DCTP')
}
//点击导出药物资料
exports.addDcyyywh = function (req, res, next) {
    var conf = {};
    conf.cols = [
        {caption:'StudyID', type:'string'},
        {caption:'SiteID', type:'string'},
        {caption:'SiteNam', type:'string'},
        {caption:'SubjID', type:'string'},
        {caption:'USubjID', type:'string'},
        {caption:'SubjDOB', type:'string'},
        {caption:'SubjSex', type:'string'},
        {caption:'SubjIni', type:'string'},
        {caption:'RandoDoer', type:'string'},
        {caption:'RandoDTC', type:'string'},
        {caption:'DrugNum', type:'string'},
        {caption:'DrugNumSt', type:'string'},
        {caption:'ArmCDYN', type:'string'},
        {caption:'ArmCD', type:'string'},
        {caption:'Arm', type:'string'},
        {caption:'DrugSeq', type:'string'},
        {caption:'DrugExpryDTC', type:'string'},
        {caption:'PackSeq', type:'string'},
        {caption:'DrugDose', type:'string'},
        {caption:'StudyDCross', type:'string'},
        {caption:'Study', type:'string'},
        {caption:'Dose', type:'string'},
    ];
    daochuExcel(req, res, conf, 'YWZL')
}

//点击导出随机资料
exports.addDcyysjh = function (req, res, next) {
    var conf = {};
    conf.cols = [
        {caption:'StudyID', type:'string'},
        {caption:'SiteID', type:'string'},
        {caption:'StudyDs', type:'string'},
        {caption:'StudyPeNum', type:'string'},
        {caption:'SiteNam', type:'string'},
        {caption:'USubjID', type:'string'},
        {caption:'SubjDOB', type:'string'},
        {caption:'SubjSex', type:'string'},
        {caption:'SubjIni', type:'string'},
        {caption:'SubjFa', type:'string'},
        {caption:'SubjFb', type:'string'},
        {caption:'SubjFc', type:'string'},
        {caption:'SubjFd', type:'string'},
        {caption:'SubjFe', type:'string'},
        {caption:'SubjFf', type:'string'},
        {caption:'SubjFg', type:'string'},
        {caption:'SubjFh', type:'string'},
        {caption:'SubjFi', type:'string'},
        {caption:'StratumN', type:'string'},
        {caption:'RandoNum', type:'string'},
        {caption:'RandoDTC', type:'string'},
        {caption:'RandoDoer', type:'string'},
        {caption:'ArmCDYN', type:'string'},
        {caption:'Arm', type:'string'},
        {caption:'UnblSubjYN', type:'string'},
        {caption:'UnblESubjYN', type:'string'},
        {caption:'UnblESiteYN', type:'string'},
        {caption:'UnblEStuYN', type:'string'},
        {caption:'UnblAppl', type:'string'},
        {caption:'UnblApplDTC', type:'string'},
        {caption:'UnblCoplDTC', type:'string'},
        {caption:'CrossCode', type:'string'},
    ];
    daochuExcel(req, res, conf, 'SJZL')
}

//到处Excel公共方法
daochuExcel = function (req, res, conf, name) {
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //查看研究是否已经停止
        study.find({id: fields.id}, function (err, persons) {
            if (err != null){
                res.send({
                    'isSucceed': 200,
                    'msg': '数据库错误'
                });
                return;
            }
            if (persons.length != 0){
                // if (persons[0].StudIsOffline != '1'){
                //     res.send({
                //         'isSucceed': 200,
                //         'msg': '研究还未下线,无法操作'
                //     });
                //     return;
                // }
            }else{
                res.send({
                    'isSucceed': 200,
                    'msg': '数据查询错误'
                });
                return;
            }
            if (name == "YHZL"){
                study.find({"id" : fields.id}, function (err, studyPersons) {
                    users.find({"StudyID": studyPersons[0].StudyID}, function (err, userPersons) {
                        var dataArray = [];
                        for (var j = 0; j < userPersons.length; j++) {
                            dataArray.push(
                                [
                                    userPersons[j].StudySeq, userPersons[j].StudyID, userPersons[j].SponsorF, userPersons[j].SponsorS, userPersons[j].StudNameF
                                    , userPersons[j].StudNameS, userPersons[j].CoorPI, userPersons[j].UserNam, userPersons[j].UserTyp
                                    , userPersons[j].UserFun
                                    , ((userPersons[j].UserSiteYN == "1" ? "1" : userPersons[j].UserSite) == null ? "" : (userPersons[j].UserSiteYN == "1" ? "1" : "2"))
                                    , ((userPersons[j].UserDepotYN == "1" ? "1" : userPersons[j].UserDepot) == null ? "" : (userPersons[j].UserDepotYN == "1" ? "1" : "2"))
                                    , userPersons[j].UserEmail
                                    , userPersons[j].UserMP
                                    , userPersons[j].Date
                                    , new Date()]
                            )
                        }
                        conf.rows = dataArray;
                        var result = excelPort.execute(conf);


                        var ttt = sd.format(new Date(), 'YYYYMMDDHHmmss');
                        var ran = parseInt(Math.random() * 89999 + 10000);

                        var uploadDir = 'public/upload/pay/';
                        var filePath = uploadDir + ran + ttt + name + ".xlsx";

                        fs.writeFile(filePath, result, 'binary', function (err) {
                            if (err) {
                                res.send({
                                    'isSucceed': 200,
                                    'msg': '导出错误,请联系开发人员'
                                });
                            } else {
                                res.send({
                                    'isSucceed': 400,
                                    'ExcelName': ran + ttt + name + ".xlsx"
                                });
                            }
                        });
                    })
                })
            }else if (name == 'SJZL'){
                study.find({"id" : fields.id}, function (err, studyPersons) {
                    researchParameter.find({"StudyID": studyPersons[0].StudyID},function (err,researchPerssons) {
                        addSuccess.find({"StudyID": studyPersons[0].StudyID}, function (err, successPerssons) {
                            var dataArray = [];
                            (function iterator(i) {
                                if (i == successPerssons.length) {
                                    conf.rows = dataArray;
                                    var result = excelPort.execute(conf);


                                    var ttt = sd.format(new Date(), 'YYYYMMDDHHmmss');
                                    var ran = parseInt(Math.random() * 89999 + 10000);

                                    var uploadDir = 'public/upload/pay/';
                                    var filePath = uploadDir + ran + ttt + name + ".xlsx";

                                    fs.writeFile(filePath, result, 'binary', function (err) {
                                        if (err) {
                                            res.send({
                                                'isSucceed': 200,
                                                'msg': '导出错误,请联系开发人员'
                                            });
                                        } else {
                                            res.send({
                                                'isSucceed': 400,
                                                'ExcelName': ran + ttt + name + ".xlsx"
                                            });
                                        }
                                    });
                                    return;
                                }
                                if (successPerssons[i].Random !== undefined) {
                                    random.find({
                                        "StudyID": studyPersons[0].StudyID,
                                        "RandoNum": successPerssons[i].Random
                                    }, function (err, randomPerssos) {
                                        users.find({
                                            "id": successPerssons[i].RandoDoer,
                                        }, function (err, usersPerssos) {
                                            var yisheng = (usersPerssos.length == 0 ? {UserNam:""} : usersPerssos[0]);
                                            var soushizhe = successPerssons[i];
                                            var suijihao = randomPerssos[0];
                                            if (soushizhe.UnblindingType == null || soushizhe.UnblindingType == "") {
                                                dataArray.push(
                                                    [suijihao.StudyID,
                                                        soushizhe.SiteID,
                                                        suijihao.StudyDs + "",
                                                        (suijihao.StudyDs == "2" ? suijihao.StudyPeNum : ""),
                                                        soushizhe.SiteNam,
                                                        soushizhe.USubjID,
                                                        soushizhe.SubjDOB,
                                                        soushizhe.SubjSex,
                                                        soushizhe.SubjIni,
                                                        soushizhe.SubjFa,
                                                        soushizhe.SubjFb,
                                                        soushizhe.SubjFc,
                                                        soushizhe.SubjFd,
                                                        soushizhe.SubjFe,
                                                        soushizhe.SubjFf,
                                                        soushizhe.SubjFg,
                                                        soushizhe.SubjFh,
                                                        soushizhe.SubjFi,
                                                        suijihao.StratumN + "",
                                                        suijihao.RandoNum,
                                                        soushizhe.Date,
                                                        yisheng.UserNam,
                                                        researchPerssons[0].ArmCDYN + "",
                                                        (researchPerssons[0].ArmCDYN+"" == "1" ? soushizhe.Arm : ""),
                                                        "0",
                                                        "0",
                                                        "0",
                                                        "0",
                                                        "",
                                                        "",
                                                        "",
                                                        randomPerssos[0].CrossCode
                                                    ]
                                                )
                                                iterator(i + 1);
                                            } else {
                                                Unblinding.find({"StudyID": studyPersons[0].StudyID}, function (err, UnblindingPerssons) {
                                                    var jiemang = null;
                                                    if (soushizhe.UnblindingType == "1") {
                                                        for (var jj = 0; jj < UnblindingPerssons.length; jj++) {
                                                            if (UnblindingPerssons[jj].UnblindingType == "1") {
                                                                if (UnblindingPerssons[jj].Users.id == soushizhe.id) {
                                                                    jiemang = UnblindingPerssons[jj];
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    } else if (soushizhe.UnblindingType == "2") {
                                                        for (var jj = 0; jj < UnblindingPerssons.length; jj++) {
                                                            if (UnblindingPerssons[jj].UnblindingType == "2") {
                                                                if (UnblindingPerssons[jj].Users.id == soushizhe.id) {
                                                                    jiemang = UnblindingPerssons[jj];
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    } else if (soushizhe.UnblindingType == "3") {
                                                        for (var jj = 0; jj < UnblindingPerssons.length; jj++) {
                                                            if (UnblindingPerssons[jj].UnblindingType == "3") {
                                                                if (UnblindingPerssons[jj].site.SiteID == soushizhe.SiteID) {
                                                                    jiemang = UnblindingPerssons[jj];
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    } else if (soushizhe.UnblindingType == "4") {
                                                        for (var jj = 0; jj < UnblindingPerssons.length; jj++) {
                                                            if (UnblindingPerssons[jj].UnblindingType == "4") {
                                                                if (UnblindingPerssons[jj].study.StudyID == soushizhe.StudyID) {
                                                                    jiemang = UnblindingPerssons[jj];
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    dataArray.push(
                                                        [
                                                            suijihao.StudyID,
                                                            soushizhe.SiteID,
                                                            suijihao.StudyDs + "",
                                                            (suijihao.StudyDs == "2" ? suijihao.StudyPeNum : ""),
                                                            soushizhe.SiteNam,
                                                            soushizhe.USubjID,
                                                            soushizhe.SubjDOB,
                                                            soushizhe.SubjSex,
                                                            soushizhe.SubjIni,
                                                            soushizhe.SubjFa,
                                                            soushizhe.SubjFb,
                                                            soushizhe.SubjFc,
                                                            soushizhe.SubjFd,
                                                            soushizhe.SubjFe,
                                                            soushizhe.SubjFf,
                                                            soushizhe.SubjFg,
                                                            soushizhe.SubjFh,
                                                            soushizhe.SubjFi,
                                                            suijihao.StratumN + "",
                                                            suijihao.RandoNum,
                                                            soushizhe.Date,
                                                            yisheng.UserNam,
                                                            researchPerssons[0].ArmCDYN + "",
                                                            (researchPerssons[0].ArmCDYN+"" == "1" ? soushizhe.Arm : ""),
                                                            (soushizhe.UnblindingType == "1" ? "1" : "0"),
                                                            (soushizhe.UnblindingType == "2" ? "1" : "0"),
                                                            (soushizhe.UnblindingType == "3" ? "1" : "0"),
                                                            (soushizhe.UnblindingType == "4" ? "1" : "0"),
                                                            jiemang.UserNam[0],
                                                            jiemang.UnblApplDTC,
                                                            jiemang.UnblindingDate,
                                                            ""
                                                        ]
                                                    )
                                                    iterator(i + 1);
                                                })
                                            }
                                        })
                                    })
                                }else{
                                    iterator(i + 1);
                                }
                            })(0);
                        })
                    })
                })
            }else if (name == "YWZL"){
                study.find({"id" : fields.id}, function (err, studyPersons) {
                    researchParameter.find({"StudyID": studyPersons[0].StudyID}, function (err, researchPerssons) {
                        addSuccess.find({"StudyID": studyPersons[0].StudyID}, function (err, successPerssons) {
                            var dataArray = [];
                            (function iterator(i) {
                                if (i == successPerssons.length) {
                                    conf.rows = dataArray;
                                    var result = excelPort.execute(conf);


                                    var ttt = sd.format(new Date(), 'YYYYMMDDHHmmss');
                                    var ran = parseInt(Math.random() * 89999 + 10000);

                                    var uploadDir = 'public/upload/pay/';
                                    var filePath = uploadDir + ran + ttt + name + ".xlsx";

                                    fs.writeFile(filePath, result, 'binary', function (err) {
                                        if (err) {
                                            res.send({
                                                'isSucceed': 200,
                                                'msg': '导出错误,请联系开发人员'
                                            });
                                        } else {
                                            res.send({
                                                'isSucceed': 400,
                                                'ExcelName': ran + ttt + name + ".xlsx"
                                            });
                                        }
                                    });
                                    return;
                                }else{
                                    random.find({
                                        "StudyID": studyPersons[0].StudyID,
                                        "RandoNum": successPerssons[i].Random
                                    }, function (err, randomPerssos) {
                                        users.find({
                                            "id": successPerssons[i].RandoDoer,
                                        }, function (err, usersPerssos) {
                                            var yisheng = (usersPerssos.length == 0 ? {UserNam: ""} : usersPerssos[0]);
                                            var soushizhe = successPerssons[i];
                                            var suijihao = randomPerssos[0];
                                            if (soushizhe.Drug.length > 0){
                                                 tongbucaozuo(suijihao,soushizhe,researchPerssons,studyPersons,dataArray,yisheng,function (data) {
                                                    dataArray = data;
                                                     iterator(i + 1);
                                                });
                                            }else{
                                                iterator(i + 1);
                                            }
                                        })
                                    })
                                }
                            })(0);
                        })
                    })
                })
            }else if (name == "DCTP"){
                study.find({"id" : fields.id}, function (err, studyPersons) {
                    ImageData.find({"StudyID": studyPersons[0].StudyID},function (err, imagedatas) {
                        var dataArray = [];
                        (function iterator(i) {
                            if (i == imagedatas.length){
                                conf.rows = dataArray;
                                var result = excelPort.execute(conf);


                                var ttt = sd.format(new Date(), 'YYYYMMDDHHmmss');
                                var ran = parseInt(Math.random() * 89999 + 10000);

                                var uploadDir = 'public/upload/pay/';
                                var filePath = uploadDir + ran + ttt + name + ".xlsx";

                                fs.writeFile(filePath, result, 'binary', function (err) {
                                    if (err) {
                                        res.send({
                                            'isSucceed': 200,
                                            'msg': '导出错误,请联系开发人员'
                                        });
                                    } else {
                                        res.send({
                                            'isSucceed': 400,
                                            'ExcelName': ran + ttt + name + ".xlsx"
                                        });
                                    }
                                });
                                return;
                            }else{
                                dataArray.push([
                                    imagedatas[i].StudyID,
                                    imagedatas[i].imageUrl,
                                    imagedatas[i].isAbandoned.toString(),
                                    (imagedatas[i].successPatientPhone == null ? '' : imagedatas[i].successPatientPhone),
                                    imagedatas[i].successUSubjID,
                                    (imagedatas[i].uploadUserPhone == null ? '' : imagedatas[i].uploadUserPhone),
                                    (imagedatas[i].uploadName == null ? '' : imagedatas[i].uploadName),
                                    imagedatas[i].Date,
                                ])
                                iterator(i + 1);
                            }
                        })(0);
                    })
                })
            }
        })
    })
}

tongbucaozuo = function (suijihao,soushizhe,researchPerssons,studyPersons,dataArray,yisheng,shuchu) {
        (function iterator(yy) {
            if (yy == soushizhe.Drug.length){
                shuchu(dataArray);
                return;
            }else{
                //判断是否为替换的药物号
                var DrugNumx = soushizhe.Drug[yy]
                if (soushizhe.Drug[yy].indexOf("替换药物号为")>= 0){
                    var items=DrugNumx.split("替换药物号为")
                    DrugNumx = items.join("");
                }

                users.find({
                    "id": soushizhe.DrugDoer[yy],
                }, function (err, xxusersPerssos) {
                    drugCK.find({
                        "StudyID": studyPersons[0].StudyID,
                        "DrugNum": DrugNumx
                    }, function (err, drugckPerssos) {
                        if (drugckPerssos.length == 0) {
                            if (drugckPerssos[0] == null) {
                                console.log('11111')
                            }
                            dataArray.push(
                                [
                                    suijihao.StudyID,
                                    soushizhe.SiteID,
                                    soushizhe.SiteNam,
                                    soushizhe.SubjID,
                                    soushizhe.USubjID,
                                    soushizhe.SubjDOB,
                                    soushizhe.SubjSex,
                                    soushizhe.SubjIni,
                                    xxusersPerssos.length == 0 ?  yisheng.UserNam : xxusersPerssos[0].UserNam,
                                    soushizhe.DrugDate[yy],
                                    DrugNumx,
                                    0,
                                    researchPerssons[0].ArmCDYN + "",
                                    (researchPerssons[0].ArmCDYN + "" == "1" ? drugckPerssos[0].ArmCD : ""),
                                    (researchPerssons[0].ArmCDYN + "" == "1" ? soushizhe.Arm : ""),
                                    drugckPerssos[0].DrugSeq + "",
                                    drugckPerssos[0].DrugExpryDTC,
                                    drugckPerssos[0].PackSeq,
                                    (typeof(drugckPerssos[0].DrugDose)=="undefined" ? '' : drugckPerssos[0].DrugDose),
                                    (typeof(drugckPerssos[0].StudyDCross)=="undefined" ? '' : drugckPerssos[0].StudyDCross),
                                    (soushizhe.StudyDCross.length == 0 ? '' : soushizhe.StudyDCross[yy]),
                                    (soushizhe.DrugDose.length == 0 ? '' : soushizhe.DrugDose[yy])
                                ]
                            )
                            iterator(yy + 1);
                        } else {
                            drugWL.find({
                                "StudyID": studyPersons[0].StudyID,
                                "DrugNum": drugckPerssos[0].DrugNum
                            }, function (err, drugwlPerssos) {
                                dataArray.push(
                                    [
                                        suijihao.StudyID,
                                        soushizhe.SiteID,
                                        soushizhe.SiteNam,
                                        soushizhe.SubjID,
                                        soushizhe.USubjID,
                                        soushizhe.SubjDOB,
                                        soushizhe.SubjSex,
                                        soushizhe.SubjIni,
                                        xxusersPerssos.length == 0 ?  yisheng.UserNam : xxusersPerssos[0].UserNam,
                                        soushizhe.DrugDate[yy],
                                        DrugNumx,
                                        drugwlPerssos[0].drugStrs[drugwlPerssos[0].drugStrs.length - 1],
                                        researchPerssons[0].ArmCDYN + "",
                                        (researchPerssons[0].ArmCDYN + "" == "1" ? drugckPerssos[0].ArmCD : ""),
                                        (researchPerssons[0].ArmCDYN + "" == "1" ? soushizhe.Arm : ""),
                                        drugckPerssos[0].DrugSeq + "",
                                        drugckPerssos[0].DrugExpryDTC,
                                        drugckPerssos[0].PackSeq,
                                        (typeof(drugckPerssos[0].DrugDose)=="undefined" ? '' : drugckPerssos[0].DrugDose),
                                        (typeof(drugckPerssos[0].StudyDCross)=="undefined" ? '' : drugckPerssos[0].StudyDCross),
                                        (soushizhe.StudyDCross.length == 0 ? '' : soushizhe.StudyDCross[yy]),
                                        (soushizhe.DrugDose.length == 0 ? '' : soushizhe.DrugDose[yy])
                                    ]
                                )
                                iterator(yy + 1);
                            })
                        }
                    })
                })
            }
        })(0);
}


//导入新增研究
exports.addYzyj = function (req, res, next) {
    addData(req, res, next, study);
}

//导入新增研究中心
exports.addXzyjzx = function (req, res, next) {
    addData(req, res, next, site);
}

//导入新增仓库
exports.addXzck = function (req, res, next) {
    addData(req, res, next, depot);
}

exports.addSzhlyh = function (req, res, next) {
    addData(req, res, next, adminUser);
}

//导入用户数据
exports.addDryhsj = function (req, res, next) {
    console.log("ssss");
    addData(req, res, next, users);
}
//导入药物号
exports.addDrywh = function (req, res, next) {
    console.log("导入药物号");
    addData(req, res, next, drug);
}
//固定随机法导入随机号
exports.addGdsjfdrsjh = function (req, res, next) {
    console.log("固定随机法导入随机号");
    addData(req, res, next, random);
}
//设置研究的随机化参数
exports.addSzyjsjhcs = function (req, res, next) {
    console.log("设置研究的随机化参数");
    addData(req, res, next, researchParameter);
}
//导入入选排除标准
exports.addRxpcbz = function (req, res, next) {
    console.log("导入入选排除标准");
    addData(req, res, next, ExcludeStandard);
}

//设置受试者随访参数
exports.addSzsszsfcs = function (req, res, next) {
    console.log("设置受试者随访参数");
    addData(req, res, next, FollowUpParameter);
}

//设置申请人和审核人
exports.addSzrwsqhsh = function (req, res, next) {
    console.log("设置申请人和审核人");
    addData(req, res, next, ApplicationAndAudit);
}

//激活研究
exports.activationStudy = function (req, res, next) {
    if(req.session.login!= '1'){
        res.render("./login");
        return;
    }
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        study.find({
            'id' : fields.id,
            'activationStudyYN' : 1
        },function (err,studyData) {
            if (studyData.length != 0){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '该研究已经激活'
                });
                return
            }
            study.update({
                'id' : fields.id,
            },{
                'activationStudyYN' : 1,
            },{multi:true},function (err,data) {
                res.send({
                    'isSucceed' : 400,
                    'msg' : '研究激活成功'
                });
                return
            })
        })
    })
}

//删除研究
exports.deleteStudy = function (req, res, next) {
    if(req.session.login!= '1'){
        res.render("./login");
        return;
    }
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        study.remove({StudyID : fields.StudyID}, (err)=>{//删除研究数据
            researchParameter.remove({StudyID : fields.StudyID}, (err)=>{//删除随机化参数数据
                site.remove({StudyID : fields.StudyID}, (err)=>{//删除研究中心数据
                    depot.remove({StudyID : fields.StudyID}, (err)=>{//删除仓库数据
                        ExcludeStandard.remove({StudyID : fields.StudyID}, (err)=> {//删除入选排除标准
                            random.remove({StudyID : fields.StudyID}, (err)=> {//删除随机号
                                drug.remove({StudyID : fields.StudyID}, (err)=> {//删除药物号
                                    FollowUpParameter.remove({StudyID : fields.StudyID}, (err)=> {//删除随访参数
                                        ApplicationAndAudit.remove({StudyID : fields.StudyID}, (err)=> {//删除任务申请和审核
                                            users.remove({StudyID : fields.StudyID}, (err)=> {//删除导入用户
                                                res.send({
                                                    'isSucceed' : 400,
                                                    'msg' : '删除成功'
                                                });
                                                return
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}

//删除数据
exports.deleteData = function (req, res, next) {
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log('点击删除')
        console.log(fields);
        if (fields.dianType == 'xzyj'){//删除选择研究
            shanchuData(study,fields.id,res);
        }else if (fields.dianType == 'szyjsjhcs') {//删除设置研究随机化参数
            shanchuData(researchParameter,fields.id,res);
        }else if (fields.dianType == 'xzyjzx') {//删除新增研究中心
            shanchuData(site,fields.id,res);
        }else if (fields.dianType == 'xzck') {//删除新增仓库
            shanchuData(depot,fields.id,res);
        }else if (fields.dianType == 'dryjrxpcbz') {//删除导入研究入选排除标准
            shanchuData(ExcludeStandard,fields.id,res);
        }else if (fields.dianType == 'gdsjfdrsjh') {//删除固定随机法导入随机号
            shanchuData(random,fields.id,res);
        }else if (fields.dianType == 'drywh') {//删除导入药物号
            shanchuData(drug,fields.id,res);
        }else if (fields.dianType == 'szsszsfcs') {//删除设置受试者随访参数
            shanchuData(FollowUpParameter,fields.id,res);
        }else if (fields.dianType == 'szrwsqhsh') {//删除设置任务申请和审核
            shanchuData(ApplicationAndAudit,fields.id,res);
        }else if (fields.dianType == 'dryh') {//删除导入用户数据
            shanchuData(users,fields.id,res);
        }else if (fields.dianType == 'nztjssjsywaqkc') {//删除内置统计算式计算药物安全库存

        }
    })
}
function shanchuData(model,id,res) {
    // 删除数据
    model.remove({id : id},
        (err)=>{
            res.redirect('/home');
        }
    )
}
//公共方法
var StudyID = '';
addData = function (req, res, next, name) {
    if(req.session.login!= '1'){
        res.render("login");
        return;
    }
    console.log("导入数据");
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    //配置上传路径
    form.uploadDir = __dirname + '/../middle/';
    form.parse(req,function (err, fields, files) {
        console.log("files------");
        console.log(files);
        console.log("files------");
        //上传完成移动到文件目录中
        if (err){
            next();     //这个中间件不受理这个请求了，往下走
            return;
        }
        if (files.excel.size == 0){
            res.send('未选择文件,请返回重新选择');
            return;
        }
        var ttt = sd.format(new Date(), 'YYYYMMDDHHmmss');
        var ran = parseInt(Math.random() * 89999 + 10000);
        var extname = path.extname(files.excel.name);
        var oldpath = files.excel.path;
        var newpath = path.normalize(__dirname + "/../file/" + ran + ttt + extname);
        fs.rename(oldpath,newpath,function(err){
            if(err){
                next();     //这个中间件不受理这个请求了，往下走
                return;
            }

            //操作excel
            var list = xlsx.parse(newpath);
            for (var i = 1 ; i < list[0].data.length ; i++){
                var model = {};
                var isStudyID = 0;
                for (var j = 0 ; j < list[0].data[i].length ; j++){
                    model[list[0].data[0][j]] = list[0].data[i][j]
                    if (typeof(model.StudyID)!="undefined"){
                        StudyID = model.StudyID
                    }
                }
                model['Date'] = new Date();
                if (list[0].data[i].length != 0){
                    name.create(model ,function (error) {
                        if (error){
                            console.log(error);
                            next();     //这个中间件不受理这个请求了，往下走
                            return;
                        }
                    });
                }
            }
            res.redirect('/home?' + 'StudyID='+StudyID);
        });
    });
}


//图片上传
exports.imageUpdata = function (req, res, next) {
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    //配置上传路径
    form.uploadDir = __dirname + '/../middle/';
    form.parse(req,function (err, fields, files) {
        //改名
        //上传完成移动到文件目录中
        if (err){
            res.send({
                'isSucceed' : 200,
                'msg' : '上传失败！'
            });
            return;
        }
        if (files.images.size == 0){
            res.send({
                'isSucceed' : 200,
                'msg' : '上传失败~'
            });
            return;
        }
        var oldpath = files.images.path;
        var extname = path.extname(files.images.name);
        var uuid = uuidV1();
        var newpath = path.normalize(__dirname + "/../images/" + uuid + extname);
        fs.rename(oldpath,newpath,function(err){
            if(err){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '上传失败。'
                });
                return;
            }
            var imageUrl = settings.fwqUrl + uuid + extname;
            //保存到数据库中
            res.send({
                'isSucceed' : 400,
                'url':imageUrl,
                'msg' : '上传成功。'
            });
            return;
        })
    })
}


//音频上传
exports.voiceUpdata = function (req, res, next) {
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    //配置上传路径
    form.uploadDir = __dirname + '/../middle/';
    form.parse(req,function (err, fields, files) {
        //改名
        //上传完成移动到文件目录中
        if (err){
            res.send({
                'isSucceed' : 200,
                'msg' : '上传失败！'
            });
            return;
        }
        if (files.voice.size == 0){
            res.send({
                'isSucceed' : 200,
                'msg' : '上传失败~'
            });
            return;
        }
        var oldpath = files.voice.path;
        var extname = path.extname(files.voice.name);
        var uuid = uuidV1();
        var newpath = path.normalize(__dirname + "/../voices/" + uuid + extname);
        var dishi = settings.fwqUrl + uuid + extname;
        fs.rename(oldpath,newpath,function(err){
            if(err){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '上传失败。'
                });
                return;
            }
            //保存到数据库中
            res.send({
                'isSucceed' : 400,
                'url':settings.fwqUrl + uuid + extname,
                'msg' : '上传成功。'
            });
            return;
        })
    })
}