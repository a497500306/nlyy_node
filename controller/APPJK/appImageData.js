var formidable = require('formidable');
var mongoose = require('mongoose');
var userModeules = require('../../models/import/userModeules')
var users = require('../../models/import/users')
var researchParameter = require('../../models/import/researchParameter')
var ApplicationAndAudit = require('../../models/import/ApplicationAndAudit');
var questionPatient = require('../../models/import/questionPatient')
var imageData = require('../../models/import/imageData')
var JPushTool = require('../../JPushTool/JPushaTool');
var MLArray = require('../../MLArray');

//查询模块数组
exports.getImageModeulesList = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        userModeules.find({StudyID: fields.StudyID,"CRFModeuType" : 0,"Subjects.id" : fields.Subjects.id,CRFModeulesName:fields.CRFModeulesName}).sort({Date : 1}).exec(function (err, persons1) {
            res.send({
                'isSucceed' : 400,
                'data' : persons1
            });
        })
    })
}

//查询页码上传的人
exports.getImagePageNumberListUser = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        var json = {
            $or:[]
        }
        if (fields.UserSiteYN == 1){
            json.$or.push({StudyID: fields.StudyID,CRFModeulesName:fields.CRFModeulesName,CRFModeulesNum:fields.CRFModeulesNum})
        }else{
            var sites = fields.UserSite.split(",");
            for (var zz = 0 ; zz < sites.length ; zz++){
                json.$or.push({StudyID: fields.StudyID,CRFModeulesName:fields.CRFModeulesName,CRFModeulesNum:fields.CRFModeulesNum,"Subjects.persons.SiteID":sites[zz]})
            }
        }
        var data = [];
        userModeules.find(json).sort({Date : 1}).exec(function (err, persons1) {
            for (var i = 0 ; i < persons1.length ;i++){
                var um = persons1[i]
                if (um.imageUrls.length != 0){
                    data.push(persons1[i].Subjects);
                }
            }
            res.send({
                'isSucceed' : 400,
                'data' : data
            });
            return;
        })
    })
}

//查询页码上传人数统计
exports.getImagePageNumberListStatistics = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        researchParameter.find({StudyID: fields.StudyID},function (err, researchData) {
            if (researchData.length != 0){
                var data = [];
                (function iterator(i){
                    if (i == researchData[0].CRFMaxNum){
                        res.send({
                            'isSucceed' : 400,
                            'data' : data
                        });
                        return;
                    }else{
                        var xxx = 0;
                        var json = {
                            $or:[]
                        }
                        if (fields.UserSiteYN == 1){
                            json.$or.push({StudyID: fields.StudyID,CRFModeulesName:'页码',CRFModeulesNum:i})
                        }else{
                            var sites = fields.UserSite.split(",");
                            for (var zz = 0 ; zz < sites.length ; zz++){
                                json.$or.push({StudyID: fields.StudyID,CRFModeulesName:'页码',CRFModeulesNum:i,"Subjects.persons.SiteID":sites[zz]})
                            }
                        }
                        userModeules.find(json).sort({Date : 1}).exec(function (err, persons1) {
                            for (var jj = 0 ; jj < persons1.length ; jj++){
                                var um = persons1[jj];
                                if (um.imageUrls.length != 0){
                                    xxx = xxx + 1
                                }
                            }
                            data.push(xxx);
                            iterator(i + 1);
                        })
                    }
                })(0);
            }else{
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据错误'
                });
            }
        })
    })
}

//查询页码组
exports.getImagePageNumberList = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        userModeules.find({StudyID: fields.StudyID,"CRFModeuType" : 1,"Subjects.id" : fields.Subjects.id,CRFModeulesName:fields.CRFModeulesName}).sort({Date : 1}).exec(function (err, persons1) {
            if (persons1.length == 0){
                researchParameter.find({StudyID: fields.StudyID},function (err, researchData) {
                    (function iterator(i){
                        if (i == researchData[0].CRFMaxNum){
                            userModeules.find({StudyID: fields.StudyID,"CRFModeuType" : 1,"Subjects.id" : fields.Subjects.id,CRFModeulesName:fields.CRFModeulesName}).sort({Date : 1}).exec(function (err, newPersons) {
                                res.send({
                                    'isSucceed' : 400,
                                    'data' : newPersons
                                });
                                return;
                            })
                        }else{
                            userModeules.create({
                                "StudyID": fields.StudyID,    //研究编号
                                "Users": fields.Users, //添加的医生
                                "Subjects": fields.Subjects, //受试者
                                "CRFModeulesName": fields.CRFModeulesName,//研究名称
                                "CRFModeulesNum": i,//个数
                                "CRFModeuType": 1,
                                "imageType": 0,
                                "Date": new Date(),
                                "ReviewPhones": [],
                                "questionDate": [],//质疑时间
                                "imageUrls": [],//图片路径数组
                            }, function (err, userData) {
                                iterator(i + 1);
                            })
                        }
                    })(0);
                })
            }else{
            res.send({
                'isSucceed' : 400,
                'data' : persons1
            });
            }
        })
    })
}

//查询某个模块组的人
exports.getAddImageModeulesListUser = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        var data = [];
        var json = {
            $or:[]
        }
        if (fields.UserSiteYN == 1){
            json.$or.push({StudyID: fields.StudyID,CRFModeulesName:fields.CRFModeulesName,CRFModeulesNum:0})
        }else{
            var sites = fields.UserSite.split(",");
            for (var zz = 0 ; zz < sites.length ; zz++){
                json.$or.push({StudyID: fields.StudyID,CRFModeulesName:fields.CRFModeulesName,CRFModeulesNum:0,"Subjects.persons.SiteID":sites[zz]})
            }
        }
        userModeules.find(json).sort({Date : 1}).exec(function (err, persons1) {
            for (var i = 0 ; i < persons1.length ;i++){
                data.push(persons1[i].Subjects);
            }
            res.send({
                'isSucceed' : 400,
                'data' : data
            });
            return;
        })
    })
}
//查询一个模块组人数统计
exports.getAddImageModeulesListStatistics = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        researchParameter.find({StudyID: fields.StudyID},function (err, researchData) {
            if (researchData.length != 0){
                var data = [];
                var CRFModeules = researchData[0].CRFModeules.split(",");
                (function iterator(i){
                    if (i == CRFModeules.length){
                        res.send({
                            'isSucceed' : 400,
                            'data' : data
                        });
                        return;
                    }else{
                        var xxx = 0;
                        var json = {
                            $or:[]
                        }
                        if (fields.UserSiteYN == 1){
                            json.$or.push({StudyID: fields.StudyID,CRFModeulesName:CRFModeules[i],CRFModeulesNum:0})
                        }else{
                            var sites = fields.UserSite.split(",");
                            for (var zz = 0 ; zz < sites.length ; zz++){
                                json.$or.push({StudyID: fields.StudyID,CRFModeulesName:CRFModeules[i],CRFModeulesNum:0,"Subjects.persons.SiteID":sites[zz]})
                            }
                        }
                        userModeules.find(json).sort({Date : 1}).exec(function (err, persons1) {
                            for (var jj = 0 ; jj < persons1.length ; jj++){
                                var um = persons1[jj];
                                    xxx = xxx + 1
                            }
                            data.push(xxx);
                            iterator(i + 1);
                        })
                    }
                })(0);
            }else{
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据错误'
                });
            }
        })
    })
}

//添加一个模块组
exports.getAddImageModeulesList = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        userModeules.find({StudyID: fields.StudyID,"Subjects.id" : fields.Subjects.id,CRFModeulesName:fields.CRFModeulesName}).sort({Date : 1}).exec(function (err, persons1) {
            userModeules.create({
                "StudyID": fields.StudyID,    //研究编号
                "Users": fields.Users, //添加的医生
                "Subjects": fields.Subjects, //受试者
                "CRFModeulesName": fields.CRFModeulesName,//研究名称
                "CRFModeulesNum": persons1.length,//个数
                "CRFModeuType" : 0,
                "imageType" : 0,
                "Date": new Date(),
                "ReviewPhones" : [],
                "questionDate" : [],//质疑时间
                "imageUrls" : [],//图片路径数组
            }, function (err,userData) {
                res.send({
                    'isSucceed' : 400,
                    'data' : userData
                });
                return
            })
        })
    })
}

//添加一个页码
exports.getAddImagePageNumberList = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        researchParameter.find({StudyID: fields.StudyID},function (err, researchData) {
            userModeules.find({
                StudyID: fields.StudyID,
                "Subjects.id": fields.Subjects.id,
                CRFModeulesName: fields.CRFModeulesName
            }).sort({Date: 1}).exec(function (err, persons1) {
                if (researchData[0].CRFMaxNum == persons1.length){
                    res.send({
                        'isSucceed': 200,
                        'msg': '已达到最大页码上限'
                    });
                    return;
                }
                userModeules.create({
                    "StudyID": fields.StudyID,    //研究编号
                    "Users": fields.Users, //添加的医生
                    "Subjects": fields.Subjects, //受试者
                    "CRFModeulesName": fields.CRFModeulesName,//研究名称
                    "CRFModeulesNum": persons1.length,//个数
                    "CRFModeuType": 1,
                    "imageType": 0,
                    "Date": new Date(),
                    "ReviewPhones": [],
                    "questionDate": [],//质疑时间
                    "imageUrls": [],//图片路径数组
                }, function (err, userData) {
                    res.send({
                        'isSucceed': 400,
                        'data': userData
                    });
                    return
                })
            })
        })
    })
}

//添加一张图片
exports.getAddImageUrls = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //保存到数据库
        imageData.create({
            "StudyID" : fields.StudyID,    //研究编号
            "imageUrl" : fields.imageUrl,    //图片地址
            "isAbandoned" : 0,//是否废弃
            "successPatientPhone" :fields.Subjects.persons.SubjIni,
            "successUSubjID" : (typeof(fields.Subjects.persons.USubjID)=="undefined" ? fields.Subjects.persons.USubjectID : fields.Subjects.persons.USubjID),
            "uploadUserPhone" :fields.uploadUserPhone,
            "uploadName" : fields.uploadName,
            "Date" : new Date(), //导入时间
        },function (err, data) {

        })
        //判断该研究是什么状态
        userModeules.find({
            id:fields.id,
        },function (err, data) {
            if (data[0].imageType == 1 || data[0].imageType == 0) {
                userModeules.update({
                    id: fields.id,
                }, {
                    $push: {imageUrls: fields.imageUrl},
                    imageType: 1
                }, function (err, userModelesData) {
                    userModeules.find({
                        StudyID: fields.StudyID,
                        "Subjects.id": fields.Subjects.id,
                        CRFModeulesName: fields.CRFModeulesName
                    }).sort({Date: 1}).exec(function (err, persons1) {
                        //搜索用户
                        users.find({
                            $or:[
                                {'StudyID':fields.StudyID,"UserFun" : "S1"},
                                {'StudyID':fields.StudyID,"UserFun" : "H3"},
                                {'StudyID':fields.StudyID,"UserFun" : "H2"},
                                {'StudyID':fields.StudyID,"UserFun" : "H5"},
                                {'StudyID':fields.StudyID,"UserFun" : "M1"},
                                {'StudyID':fields.StudyID,"UserFun" : "M8"},
                                {'StudyID':fields.StudyID,"UserFun" : "M4"},
                                {'StudyID':fields.StudyID,"UserFun" : "M5"},
                                {'StudyID':fields.StudyID,"UserFun" : "M7"}
                            ]
                        },function (err, userData) {
                            var phones = [];
                            for (var i = 0; i < userData.length; i++) {
                                var userDict = userData[i];
                                if (userDict.UserSiteYN == 1) {
                                    phones.push(userDict.UserMP);
                                } else {
                                    var UserSites = userDict.UserSite.split(",");
                                    for (var j = 0; j < UserSites.length; j++) {
                                        if (UserSites[j] == fields.Subjects.persons.SiteID) {
                                            phones.push(userDict.UserMP);
                                        }
                                    }
                                }
                            }
                            //取出相同手机号
                            phones = MLArray.unique(phones);
                            var string = fields.StudyID + '研究' + fields.Subjects.persons.SiteID + "中心受试者：" + (typeof(fields.Subjects.persons.SubjIni!="undefined") ? fields.Subjects.persons.SubjIni : fields.Subjects.persons.SubjectIn)  + '添加了一张图片。';
                            //发送推送
                            for (var i = 0; i < phones.length; i++) {
                                JPushTool.JPushPush(string, phones[i]);
                            }
                        })
                        res.send({
                            'isSucceed': 400,
                            'data': persons1
                        });
                        return
                    })
                })
            }else if(data[0].imageType == 6){
                userModeules.update({
                    id: fields.id,
                }, {
                    $push: {imageUrls: fields.imageUrl},
                    imageType: 1
                }, function (err, userModelesData) {
                    userModeules.find({
                        StudyID: fields.StudyID,
                        "Subjects.id": fields.Subjects.id,
                        CRFModeulesName: fields.CRFModeulesName
                    }).sort({Date: 1}).exec(function (err, persons1) {
                        //搜索用户
                        users.find({
                            $or:[
                                {'StudyID':fields.StudyID,"UserFun" : "S1"},
                                {'StudyID':fields.StudyID,"UserFun" : "H3"},
                                {'StudyID':fields.StudyID,"UserFun" : "H2"},
                                {'StudyID':fields.StudyID,"UserFun" : "H5"},
                                {'StudyID':fields.StudyID,"UserFun" : "M1"},
                                {'StudyID':fields.StudyID,"UserFun" : "M8"},
                                {'StudyID':fields.StudyID,"UserFun" : "M4"},
                                {'StudyID':fields.StudyID,"UserFun" : "M5"},
                                {'StudyID':fields.StudyID,"UserFun" : "M7"}
                            ]
                        },function (err, userData) {
                            var phones = [];
                            for (var i = 0; i < userData.length; i++) {
                                var userDict = userData[i];
                                if (userDict.UserSiteYN == 1) {
                                    phones.push(userDict.UserMP);
                                } else {
                                    var UserSites = userDict.UserSite.split(",");
                                    for (var j = 0; j < UserSites.length; j++) {
                                        if (UserSites[j] == fields.Subjects.persons.SiteID) {
                                            phones.push(userDict.UserMP);
                                        }
                                    }
                                }
                            }
                            //取出相同手机号
                            phones = MLArray.unique(phones);
                            var string = fields.StudyID + '研究' + fields.Subjects.persons.SiteID + "中心受试者：" + (typeof(fields.Subjects.persons.SubjIni!="undefined") ? fields.Subjects.persons.SubjIni : fields.Subjects.persons.SubjectIn) + '质疑后添加了一张图片。';
                            //发送推送
                            for (var i = 0; i < phones.length; i++) {
                                JPushTool.JPushPush(string, phones[i]);
                            }
                        })
                        res.send({
                            'isSucceed': 400,
                            'data': persons1
                        });
                        return
                    })
                })
            }else{
                res.send({
                    'isSucceed': 200,
                    'msg': '正在审核中,不能上传'
                });
                return
            }
        })
    })
}

//删除一张图片
exports.getDeleteImageUrls = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //判断状态
        userModeules.find({
            id:fields.dataID
        },function (err, userM) {
            //"imageType" : Number,//图片状态,0:没有上传图片,1:等待审核,2:正在审核,3:审核通过,4:冻结,5:作废,6:质疑中
            if (userM[0].imageType == 2 || userM[0].imageType == 3 || userM[0].imageType == 4){
                //删除成功
                res.send({
                    'isSucceed': 200,
                    'msg': '删除失败'
                });
                return
            }
            userModeules.update({
                id:fields.dataID
            },{
                $pull : {imageUrls : fields.imageUrl},
            },function (err) {
                userModeules.find({id:fields.dataID},function (err, newData) {
                    imageData.update({
                        imageUrl:fields.imageUrl
                    },{
                        isAbandoned:1
                    },function (err) {
                        if (newData[0].imageUrls.length == 0){
                            userModeules.update({
                                id:fields.dataID
                            },{
                                imageType : 0,
                            },function (err) {
                                //删除成功
                                res.send({
                                    'isSucceed': 400,
                                    'msg': '删除成功'
                                });
                                return
                            })
                        }else {
                            userModeules.update({
                                id:fields.dataID
                            },{
                                imageType : 1,
                            },function (err) {
                                //删除成功
                                res.send({
                                    'isSucceed': 400,
                                    'msg': '删除成功'
                                });
                                return
                            })
                        }
                    })
                })
            })
        })
    })
}

//审核无误
exports.getReviewCorrect = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //查找研究随机化参数
        researchParameter.find({StudyID: fields.StudyID}, function (err, persons) {
            userModeules.find({id:fields.id},function (err, data) {
                var isCF = false;
                for (var i = 0 ; i < data[0].ReviewPhones.length ; i++){
                    if (fields.ReviewPhones == data[0].ReviewPhones[i]){
                        isCF = true;
                    }
                }
                if (isCF == true){
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '请勿重复审核'
                    });
                    return
                }
                userModeules.update({
                    id:fields.id,
                },{
                    $push : {ReviewPhones : fields.ReviewPhones},
                },function (err) {
                    userModeules.find({id:fields.id},function (err, newData) {
                        // var phones = persons[0].CRFReviewPhones.split(",");
                        var phones = [];
                        var registrationIdArray = [];
                        //搜索用户
                        users.find({
                            $or:[
                                {'StudyID':fields.StudyID,"UserFun" : "M8"},
                                {'StudyID':fields.StudyID,"UserFun" : "M4"},
                                {'StudyID':fields.StudyID,"UserFun" : "M7"}
                            ]
                        },function (err, userData) {
                            for (var i = 0 ; i < userData.length ; i++){
                                var userDict = userData[i];
                                if (userDict.UserSiteYN == 1){
                                    phones.push(userDict.UserMP);
                                    registrationIdArray.push(userDict.registrationId);
                                }else{
                                    var UserSites = userDict.UserSite.split(",");
                                    for (var j = 0 ; j < UserSites.length ; j++){
                                        if (UserSites[j] == newData[0].Subjects.persons.SiteID){
                                            phones.push(userDict.UserMP);
                                            registrationIdArray.push(userDict.registrationId);
                                        }
                                    }
                                }
                            }
                            //取出相同手机号
                            phones = MLArray.unique(phones);
                            registrationIdArray = MLArray.unique(registrationIdArray);
                            if (newData[0].ReviewPhones.length == phones.length){
                                userModeules.update({
                                    id:fields.id,
                                },{
                                    imageType : 3,
                                },function (err) {
                                    userModeules.find({StudyID: fields.StudyID,"Subjects.id" : fields.Subjects.id,CRFModeulesName:fields.CRFModeulesName}).sort({Date : 1}).exec(function (err, persons1) {
                                        var string = newData[0].StudyID + '研究' + newData[0].CRFModeulesName + (newData[0].CRFModeulesNum + 1) + '被' + fields.ReviewPhones + '审核通过，审核全部通过，数据被冻结';
                                        //发送通知
                                        for (var i = 0 ; i < phones.length ; i++){
                                            JPushTool.JPushPush(string,phones[i]);
                                        }
                                        res.send({
                                            'isSucceed' : 400,
                                            'data' : persons1
                                        });
                                        return
                                    })
                                })
                            }else{
                                userModeules.update({
                                    id:fields.id,
                                },{
                                    imageType : 2,
                                },function (err) {
                                    userModeules.find({StudyID: fields.StudyID,"Subjects.id" : fields.Subjects.id,CRFModeulesName:fields.CRFModeulesName}).sort({Date : 1}).exec(function (err, persons1) {
                                        var string = newData[0].StudyID + '研究' + newData[0].CRFModeulesName + (newData[0].CRFModeulesNum + 1) + '被' + fields.ReviewPhones + '审核通过';
                                        //发送通知
                                        for (var i = 0 ; i < phones.length ; i++){
                                            JPushTool.JPushPush(string,phones[i]);
                                        }
                                        res.send({
                                            'isSucceed' : 400,
                                            'data' : persons1
                                        });
                                        return
                                    })
                                })
                            }
                        });
                    })
                })
            })
        })
    })
}

//撤销审核无误
exports.getRevokedReviewCorrect = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        userModeules.find({id:fields.id},function (err, data) {
            var isReview = false;
            for (var i = 0 ; i < data[0].ReviewPhones.length ; i++){
                if (fields.ReviewPhones == data[0].ReviewPhones[i]){
                    isReview = true;
                }
            }
            if (isReview == false){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '该用户还未审核'
                });
                return
            }
            if (data[0].imageType == 2 || data[0].imageType == 3) {
                userModeules.update({
                    id: fields.id,
                }, {
                    $pull: {ReviewPhones: fields.ReviewPhones},
                }, function (err) {
                    userModeules.find({
                        id: fields.id,
                    }, function (err, userMM) {
                        if (userMM[0].ReviewPhones.length == 0) {
                            userModeules.update({
                                id: fields.id,
                            }, {
                                imageType: 1,
                            }, function (err) {
                                userModeules.find({
                                    StudyID: fields.StudyID,
                                    "Subjects.id": fields.Subjects.id,
                                    CRFModeulesName: fields.CRFModeulesName
                                }).sort({Date: 1}).exec(function (err, persons1) {
                                    res.send({
                                        'isSucceed': 400,
                                        'data': persons1
                                    });
                                    return
                                })
                            })
                        } else if (userMM[0].imageType == 3){
                            userModeules.update({
                                id: fields.id,
                            }, {
                                imageType: 2,
                            }, function (err) {
                                userModeules.find({
                                    StudyID: fields.StudyID,
                                    "Subjects.id": fields.Subjects.id,
                                    CRFModeulesName: fields.CRFModeulesName
                                }).sort({Date: 1}).exec(function (err, persons1) {
                                    res.send({
                                        'isSucceed': 400,
                                        'data': persons1
                                    });
                                    return
                                })
                            })
                        }else {
                            userModeules.find({
                                StudyID: fields.StudyID,
                                "Subjects.id": fields.Subjects.id,
                                CRFModeulesName: fields.CRFModeulesName
                            }).sort({Date: 1}).exec(function (err, persons1) {
                                res.send({
                                    'isSucceed': 400,
                                    'data': persons1
                                });
                                return
                            })
                        }
                    })

                })
            }else{
                res.send({
                    'isSucceed' : 200,
                    'msg' : '不能撤销审核'
                });
                return
            }
        })
    })
}

//发送消息
exports.getSendAMessage = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        fields.selectUsers.push(fields.addUsers);
        //删除相同手机号用户
        var array = [];
        array.push(fields.addUsers)
        var newUsers = fields.selectUsers;
        for (var n = 0 ; n < newUsers.length ; n++){
            if (array.length == 0){
                array.push(newUsers[n])
            }else{
                var isSS = false;
                for (var x = 0 ; x < array.length ; x++){
                    if (array[x].UserMP == newUsers[n].UserMP){
                        isSS = true;
                        break;
                    }
                }
                if (isSS == false){
                    array.push(newUsers[n]);
                }
            }
        }
        fields.selectUsers = array;
        var uuid = generateUUID();
        (function iterator(i){
            if (i == fields.selectUsers.length){
                res.send({
                    'isSucceed': 400,
                    'msg': '发送成功'
                });
                return
            }
            //0:未解决,1:已解决,2:不需要解决,3:取消标记
            questionPatient.create({
                "StudyID": fields.StudyID,    //研究编号
                "CRFModeule": null,//研究数据
                "voiceUrls": fields.voiceUrls,//语音路径
                "text": fields.text,//内容
                "addUsers": fields.addUsers, //添加这条数据的医生
                "Users": fields.selectUsers[i], //质疑的医生
                "GroupUsers" : fields.selectUsers,//群组数据
                "Date": new Date(),
                "voiceType": 0,//图片状态,0:未读,1:已读,2:已解决
                "messageIDNum" : uuid,
                "markType" : 0
            }, function (err, userData) {
                var string = fields.StudyID + '研究收到一条消息：' +  fields.text
                //发送通知
                JPushTool.JPushPush(string,fields.selectUsers[i].UserMP)
                iterator(i + 1);
            })
        })(0);
    })
}

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

//撤销质疑
exports.getRevokedAddQuestion = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        userModeules.find({id:fields.id},function (err, usermodeuledata) {
            if (usermodeuledata[0].imageType != 6){
                res.send({
                    'isSucceed': 200,
                    'msg': '不能撤销质疑'
                });
                return;
            }
            var imageType = null;
            var phones = [];
            var registrationIdArray = [];
            //搜索用户
            users.find({
                $or:[
                    {'StudyID':fields.StudyID,"UserFun" : "M8"},
                    {'StudyID':fields.StudyID,"UserFun" : "M4"},
                    {'StudyID':fields.StudyID,"UserFun" : "M7"}
                ]
            },function (err, userData) {
                for (var i = 0; i < userData.length; i++) {
                    var userDict = userData[i];
                    if (userDict.UserSiteYN == 1) {
                        phones.push(userDict.UserMP);
                        registrationIdArray.push(userDict.registrationId);
                    } else {
                        var UserSites = userDict.UserSite.split(",");
                        for (var j = 0; j < UserSites.length; j++) {
                            if (UserSites[j] == usermodeuledata[0].Subjects.persons.SiteID) {
                                phones.push(userDict.UserMP);
                                registrationIdArray.push(userDict.registrationId);
                            }
                        }
                    }
                }
                //取出相同手机号
                phones = MLArray.unique(phones);
                registrationIdArray = MLArray.unique(registrationIdArray);
                if (usermodeuledata[0].ReviewPhones.length == phones.length) {
                    imageType = 3;
                }else{
                    imageType = 2;
                }
                userModeules.update({
                    id: fields.id,
                }, {
                    $push: {question: null, questionDate: new Date()},
                    questionImageUrls: [],
                    imageUrls: usermodeuledata[0].questionImageUrls,
                    ReviewPhones: usermodeuledata[0].ReviewPhones,
                    imageType: imageType
                }, function (err) {
                    res.send({
                        'isSucceed': 400,
                        'msg': '撤销质疑成功'
                    });
                    return
                })
            })
        })
    })
}

//添加质疑
exports.getAddQuestion = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
            if (fields.isReply == true){//回复
                if (fields.GroupUsers == null || fields.GroupUsers.length == 0){
                    questionPatient.create({
                        "StudyID": fields.StudyID,    //研究编号
                        "CRFModeule": fields.CRFModeule,//研究数据
                        "voiceUrls": fields.voiceUrls,//语音路径
                        "text": fields.text,//内容
                        "addUsers": fields.addUsers, //添加这条数据的医生
                        "Users": fields.Users, //质疑的医生
                        "Date": new Date(),
                        "GroupUsers" : fields.GroupUsers,
                        "voiceType": 0,//图片状态,0:未读,1:已读,2:已解决
                        "messageIDNum" : fields.messageIDNum,
                        "markType" : fields.markType
                    }, function (err, userData) {
                        questionPatient.create({
                            "StudyID": fields.StudyID,    //研究编号
                            "CRFModeule": fields.CRFModeule,//研究数据
                            "voiceUrls": fields.voiceUrls,//语音路径
                            "text": fields.text,//内容
                            "addUsers": fields.addUsers, //添加这条数据的医生
                            "Users": fields.addUsers, //质疑的医生
                            "Date": new Date(),
                            "GroupUsers" : fields.GroupUsers,
                            "voiceType": 0,//图片状态,0:未读,1:已读,2:已解决
                            "messageIDNum" : fields.messageIDNum,
                            "markType" : fields.markType
                        }, function (err, userData) {
                            // var string = fields.StudyID + '研究收到一条消息：' +  fields.text
                            // //发送通知
                            // JPushTool.JPushPush(string,fields.Users.UserMP)
                            // res.send({
                            //     'isSucceed': 400,
                            //     'msg': userData
                            // });
                            // return
                            var string = fields.StudyID + '研究收到一条消息：' +  fields.text
                            //发送通知
                            JPushTool.JPushPush(string,fields.Users.UserMP)
                            res.send({
                                'isSucceed': 400,
                                'msg': userData
                            });
                            return
                        })
                    })
                }else{
                    (function iterator(i){
                        if (i == fields.GroupUsers.length){
                            res.send({
                                'isSucceed': 400,
                                'msg': '回复成功'
                            });
                            return
                        }else{
                            questionPatient.create({
                                "StudyID": fields.StudyID,    //研究编号
                                "CRFModeule": fields.CRFModeule,//研究数据
                                "voiceUrls": fields.voiceUrls,//语音路径
                                "text": fields.text,//内容
                                "addUsers": fields.addUsers, //添加这条数据的医生
                                "Users": fields.GroupUsers[i], //质疑的医生
                                "Date": new Date(),
                                "voiceType": 0,//图片状态,0:未读,1:已读,2:已解决
                                "GroupUsers" : fields.GroupUsers,
                                "messageIDNum" : fields.messageIDNum,
                                "markType" : fields.markType
                            }, function (err, userData) {
                                var string = fields.StudyID + '研究收到一条消息：' +  fields.text
                                //发送通知
                                JPushTool.JPushPush(string,fields.Users.UserMP);
                                iterator(i + 1);
                            })
                        }
                    })(0);
                }
            }else if (fields.CRFModeule == null){
            questionPatient.create({
                "StudyID": fields.StudyID,    //研究编号
                "CRFModeule": fields.CRFModeule,//研究数据
                "voiceUrls": fields.voiceUrls,//语音路径
                "text": fields.text,//内容
                "addUsers": fields.addUsers, //添加这条数据的医生
                "Users": fields.Users, //质疑的医生
                "Date": new Date(),
                "voiceType": 0,//图片状态,0:未读,1:已读,2:已解决
                "messageIDNum" : fields.messageIDNum,
                "markType" : fields.markType
            }, function (err, userData) {
                // if (fields.CRFModeule != null){
                //     userModeules.update({
                //         id:fields.CRFModeule.id,
                //     },{
                //         $push : {question : userData,questionDate : new Date()},
                //         questionImageUrls : fields.CRFModeule.imageUrls,
                //         imageUrls:[],
                //         imageType:6
                //     },function (err) {
                //         var string = fields.StudyID + '研究收到一条消息：' +  fields.text
                //         //发送通知
                //         JPushTool.JPushPush(string,fields.Users.UserMP)
                //         res.send({
                //             'isSucceed': 400,
                //             'data': userData
                //         });
                //         return
                //     })
                // }else{
                    var string = fields.StudyID + '研究收到一条消息：' +  fields.text
                    //发送通知
                    JPushTool.JPushPush(string,fields.Users.UserMP)
                    res.send({
                        'isSucceed': 400,
                        'msg': userData
                    });
                    return
                // }
            })
        }else{
            if (fields.CRFModeule.imageUrls.length == 0){
                res.send({
                    'isSucceed': 200,
                    'msg': '没有发现任何上传内容'
                });
                return;
            }
            var json = {
                $or:[
                    {"StudyID": fields.StudyID,"UserFun":"H2"},
                    {"StudyID": fields.StudyID,"UserFun":"H3"},
                    {"StudyID": fields.StudyID,"UserFun":"H5"},
                    {"StudyID": fields.StudyID,"UserFun":"S1"}
                ]
            }
            users.find(json,function (err, userData) {
                var newUsers = [];
                for (var  i = 0 ; i < userData.length ; i++){
                    var userJson = userData[i];
                    if (userJson.UserSiteYN == 1){
                        newUsers.push(userJson);
                    }else{
                        var UserSites = userJson.UserSite.split(",");
                        for (var j = 0 ; j < UserSites.length ; j++){
                            if (UserSites[j] == fields.CRFModeule.Subjects.persons.SiteID){
                                newUsers.push(userJson);
                                break;
                            }
                        }
                    }
                }
                //删除相同手机号用户
                var array = [];
                array.push(fields.addUsers)
                for (var n = 0 ; n < newUsers.length ; n++){
                    if (array.length == 0){
                        array.push(newUsers[n])
                    }else{
                        var isSS = false;
                        for (var x = 0 ; x < array.length ; x++){
                            if (array[x].UserMP == newUsers[n].UserMP){
                                isSS = true;
                                break;
                            }
                        }
                        if (isSS == false){
                            array.push(newUsers[n]);
                        }
                    }
                }
                (function iterator(i){
                    if (i == array.length){
                        userModeules.update({
                            id:fields.CRFModeule.id,
                        },{
                            $push : {question : userData,questionDate : new Date()},
                            questionImageUrls : fields.CRFModeule.imageUrls,
                            imageType:6
                        },function (err) {
                            res.send({
                                'isSucceed': 400,
                                'msg': '质疑成功'
                            });
                            return
                        })
                    }else{
                        questionPatient.create({
                            "StudyID": fields.StudyID,    //研究编号
                            "CRFModeule": fields.CRFModeule,//研究数据
                            "voiceUrls": fields.voiceUrls,//语音路径
                            "text": fields.text,//内容
                            "addUsers": fields.addUsers, //添加这条数据的医生
                            "Users": array[i], //质疑的医生
                            "Date": new Date(),
                            "voiceType": 0,//图片状态,0:未读,1:已读,2:已解决
                            "messageIDNum" : fields.messageIDNum,
                            "markType" : fields.markType
                        }, function (err, userData) {
                            userModeules.update({
                                id:fields.CRFModeule.id,
                            },{
                                $push : {question : userData,questionDate : new Date()},
                                questionImageUrls : fields.CRFModeule.imageUrls,
                                imageType:6
                            },function (err) {
                                var string = fields.StudyID + '研究收到一条消息：' +  fields.text
                                //发送通知
                                JPushTool.JPushPush(string,array[i].UserMP)
                                iterator(i + 1);
                            })
                        })
                    }
                })(0);
            })
        }
    })
}

//标记
exports.getMarkType = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (fields.messageIDNum != null && fields.messageIDNum.length > 0){
            questionPatient.update({
                "messageIDNum" : fields.messageIDNum
            },{ $set: {
                    markType: fields.markType
                }
            }, {multi:true},function (err) {
                res.send({
                    'isSucceed': 400,
                    'msg': '更新成功'
                });
                return
            })
        }else{
            res.send({
                'isSucceed': 200,
                'msg': '数据错误'
            });
            return
        }
    })
}

//质疑后重新提交审核
exports.getQuestionRevoked = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        userModeules.find({
            id:fields.id
        },function (err, userM) {
            if (userM[0].imageType != 6) {
                res.send({
                    'isSucceed': 200,
                    'msg': '该数据没在质疑状态'
                });
                return;
            }
            if (userM[0].imageUrls.length == 0){
                res.send({
                    'isSucceed': 200,
                    'msg': '请上传最少一张图片'
                });
                return;
            }
            userModeules.update({
                id: fields.id,
            }, {
                questionImageUrls: [],
                imageType: 1,
                ReviewPhones:[],
            }, function (err) {
                userModeules.find({
                    StudyID: fields.StudyID,
                    "Subjects.id": fields.Subjects.id,
                    CRFModeulesName: fields.CRFModeulesName
                }).sort({Date: 1}).exec(function (err, persons1) {
                    questionPatient.update({
                        "StudyID": fields.StudyID,
                        "CRFModeule.id": fields.id,
                        "voiceType" : {$ne:2}
                    }, {
                        "voiceType": 2
                    }, function (err,ssss) {
                        res.send({
                            'isSucceed': 400,
                            'data': persons1
                        });
                        return
                    })
                })
            })
        })
    })
}

//消息中心列表
exports.getNewsList = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        questionPatient.find({
            "StudyID": fields.StudyID,
            "Users.UserMP" : fields.UserMP
        }).sort({Date : -1}).exec(function (err, data) {
            res.send({
                'isSucceed': 400,
                'data': data
            });
            return
        })
    })
}

//显示中心联系人
exports.getShowSiteUsers = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (fields.UserSite == null){
            users.find({StudyID:fields.StudyID},function (err, userData) {
                var phone = [];
                for (var i = 0 ; i < userData.length ; i++){
                      phone.push(userData[i].UserMP)
                }
                //删除相同手机号
                phone = MLArray.unique(phone);
                var newUsers = new Array();
                //找出用户
                for (var n = 0 ; n < phone.length ; n++){
                    for (var m = 0 ; m < userData.length ; m++){
                        var xxx = userData[m]
                        if (xxx.UserMP == phone[n]){
                            var mxmx = m;
                            newUsers.push(xxx);
                            break;
                        }
                    }
                }
                res.send({
                    'isSucceed': 400,
                    'data': newUsers
                });
                return
            })
        }else{
            var myUserSites = fields.UserSite.split(",");
            users.find({StudyID:fields.StudyID},function (err, userData) {
                var phone = [];
                for (var i = 0 ; i < userData.length ; i++){
                    if ( typeof(userData[i].UserSite)!="undefined"){
                        var userSites = userData[i].UserSite.split(",");
                        for (var j = 0 ; j < userSites.length ; j++){
                            for (var x = 0 ; x < myUserSites.length ; x++){
                                if (myUserSites[x] == userSites[j]){
                                    phone.push(userData[i].UserMP)
                                }
                            }
                        }
                    }else if (userData[i].UserSiteYN == 1){
                        phone.push(userData[i].UserMP)
                    }
                }
                //删除相同手机号
                phone = MLArray.unique(phone);
                var newUsers = new Array();
                //找出用户
                for (var n = 0 ; n < phone.length ; n++){
                    for (var m = 0 ; m < userData.length ; m++){
                        var xxx = userData[m]
                        if (xxx.UserMP == phone[n]){
                            newUsers.push({
                                UserMP:xxx.UserMP,
                                UserNam:xxx.UserNam,
                                UserSite:xxx.UserSite
                            });
                            break;
                        }
                    }
                }
                res.send({
                    'isSucceed': 400,
                    'data': newUsers
                });
                return
            })
        }
    })
}

//消息标记为已读
exports.getNewsHaveRead = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        questionPatient.update({
            id:fields.id
        },{
            voiceType:1
        },function (err) {
            res.send({
                'isSucceed': 400,
                'msg': '修改成功'
            });
            return
        })
    })
}