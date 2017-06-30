/**
 * Created by Rolle on 2016/11/3.
 */
var formidable = require('formidable');
var site = require('../../models/import/site');
var researchParameter = require('../../models/import/researchParameter');
var addSuccessPatient = require('../../models/import/addSuccessPatient');
var addFailPatient = require('../../models/import/addFailPatient');
var addOutPatient = require('../../models/import/addOutPatient');
var ApplicationAndAudit = require('../../models/import/ApplicationAndAudit');
var users = require('../../models/import/users');
var EMail = require("../../models/EMail");
var study = require('../../models/import/study');
var studyOffline = require('../../models/import/studyOffline');
var addOutPatientSchema = require('../../models/import/addOutPatient');

//研究下线--获取研究下线申请时相关数据
exports.getYjxxApplyData = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //获取总样本量
        gitData(fields.StudyID,function (data) {
            console.log('研究下线--获取研究下线申请时相关数据')
            console.log(data)
            res.send({
                'isSucceed': 400,
                'data': data
            });
        })
    })
}


//研究下线--提交申请
exports.getYjxxApply = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //添加数据
        studyOffline.find({
            StudyID : fields.StudyID
        }).exec((err, persons) => {
            if (persons.length > 0){
                for(var i = 0 ; i < persons.length ; i++){
                    if (persons[0].isOffline == 1){//如果停止,则输出
                        res.send({
                            'isSucceed': 200,
                            'msg': '该研究已经下线'
                        });
                        return
                    }
                    if (persons[0].isOffline == 0){//该中心已经申请
                        res.send({
                            'isSucceed': 200,
                            'msg': '该研究已申请下线'
                        });
                        return
                    }
                    if (persons[0].isOffline == null){//该中心已经申请
                        res.send({
                            'isSucceed': 200,
                            'msg': '该研究已经申请'
                        });
                        return
                    }
                }
            }
            //添加数据
            studyOffline.create({
                StudyID : fields.StudyID,
                UserNam : fields.UserNam,
                ToExamineUsers : [],
                ToExaminePhone : [],
                ToExamineDate : [],
                ToExamineType : [],
                OfflineUsers : null,
                OfflinePhone : null,
                OfflineDate : null,
                isOffline:0,
                Date : new Date(), //导入时间
            },function (error) {
                if (error != null){
                    res.send({
                        'isSucceed': 200,
                        'msg': '数据添加失败'
                    });
                }else{
                    res.send({
                        'isSucceed': 400,
                        'msg': '申请成功'
                    });
                }
            })
        })
    })
}


//研究下线--待审核列表
exports.getYjxxApplyWaitForAudit = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //列表
        studyOffline.find({
            StudyID : fields.StudyID,
            isOffline:0
        }).exec((err, persons) => {
            if (persons.length > 0){
                gitData(fields.StudyID,function (data) {
                    res.send({
                        'isSucceed': 400,
                        'data': [{'data':data,'persons':persons[0]}]
                    });
                })
            }else{
                res.send({
                    'isSucceed': 400,
                    'data': persons
                });
            }
        })
    })
}

//研究下线--审核操作
exports.getYjxxToExamine = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //取出审批数据
        //取出申请和审核
        ApplicationAndAudit.find({
            "StudyID": fields.StudyID,
            'EventApp': '4',
            'EventRev': '4'
        }, function (err, persons) {
            var applaa = null;
            for (var i = 0; i < persons.length; i++) {
                if (persons[i].EventRev == '4') {
                    applaa = persons[i];
                    break;
                }
            }
            if (applaa == null) {
                res.send({
                    'isSucceed': 400,
                    'msg': '未找到相关数据,请联系服务商'
                });
                return;
            }
            //判断是否需要按顺序
            if (applaa.EventRevOrd == '3'){//需要按顺序
                //取出该研究中的审核身份的所有人
                users.find({"StudyID": fields.StudyID}, function (err, persons) {
                    studyOffline.find({"id": fields.id}, function (err, UnblindingPersons) {
                        var shUsers = persons;
                        var splits = applaa.EventRevUsers.split(",");
                        //判断该用户是否审核
                        for (var i = 0 ; i < UnblindingPersons[0].ToExamineUsers.length ; i++){
                            if (UnblindingPersons[0].ToExamineUsers[i] == fields.ToExaminePhone){
                                res.send({
                                    'isSucceed': 400,
                                    'msg': '请勿重复操作'
                                });
                                return
                            }
                        }
                        //查找该用户的所有身份
                        users.find({"StudyID": fields.StudyID, 'UserMP' : fields.ToExaminePhone}, function (err, persons) {
                            //判断该用户的最低身份
                            var shenfen = null;
                            for (var i = 0 ; i < splits.length ; i++){
                                for (var j = 0 ; j < persons.length ; j++){
                                    if (persons[j].UserFun == splits[i]){
                                        shenfen = i;
                                        break;
                                    }
                                }
                                if (shenfen != null){
                                    break;
                                }
                            }
                            //判断是不是最低身份
                            if (shenfen == 0){//是最低身份直接保存
                                //查看该用户是否已经审核
                                studyOffline.find({
                                    id : fields.id,
                                    ToExaminePhone : fields.ToExaminePhone
                                }).exec((err, persons) => {
                                    if (err != null){
                                        res.send({
                                            'isSucceed': 200,
                                            'msg': '数据库错误'
                                        });
                                    }else{
                                        studyOffline.find({
                                            id : fields.id
                                        }).exec((err, persons1) => {
                                            if (persons1[0].isOffline == 1){
                                                res.send({
                                                    'isSucceed': 400,
                                                    'msg': '该研究已经下线'
                                                });
                                                return
                                            }
                                            if (persons.length == 0){
                                                studyOffline.update({
                                                    'id' : fields.id,
                                                },{
                                                    $push : {
                                                        'ToExamineUserData' : fields.ToExamineUserData,
                                                        'ToExamineUsers' : fields.ToExamineUsers,
                                                        'ToExaminePhone' : fields.ToExaminePhone,
                                                        'ToExamineType' : fields.ToExamineType,
                                                        'ToExamineDate' : new Date()
                                                    } ,
                                                },function () {
                                                    res.send({
                                                        'isSucceed': 400,
                                                        'msg': '操作成功'
                                                    });
                                                })
                                            }else{
                                                res.send({
                                                    'isSucceed': 400,
                                                    'msg': '您已经审核过该申请'
                                                });
                                            }
                                        })
                                    }
                                })
                            }else{//判断之前身份是否完成
                                for (var i = 0 ; i < shenfen ; i++){
                                    //查看所有用户有多少具有该权限
                                    var dataU = [];
                                    var unDataU = [];
                                    for (var j = 0 ; j < shUsers.length ; j++){
                                        if (shUsers[j].UserFun == splits[i]){
                                            dataU.push(shUsers[j].UserMP)
                                        }
                                    }
                                    for (var x = 0 ; x < dataU.length ; x++){
                                        for (var y = 0 ; y < UnblindingPersons[0].ToExamineUserData.length ; y++){
                                            console.log(UnblindingPersons[0].ToExamineUserData)
                                            var sss = UnblindingPersons[0].ToExamineUserData[y];
                                            if (UnblindingPersons[0].ToExamineUserData[y].UserMP == dataU[x]){
                                                unDataU.push(UnblindingPersons[0].ToExamineUserData[y].UserMP)
                                            }
                                        }
                                    }
                                    if (dataU.length != unDataU.length){
                                        res.send({
                                            'isSucceed': 400,
                                            'msg': '前面还有用户未审核完成'
                                        });
                                        return;
                                    }
                                }
                                //查看该用户是否已经审核
                                studyOffline.find({
                                    id : fields.id,
                                    ToExaminePhone : fields.ToExaminePhone
                                }).exec((err, persons) => {
                                    if (err != null){
                                        res.send({
                                            'isSucceed': 200,
                                            'msg': '数据库错误'
                                        });
                                    }else{
                                        studyOffline.find({
                                            id : fields.id
                                        }).exec((err, persons1) => {
                                            if (persons1[0].isOffline == 1){
                                                res.send({
                                                    'isSucceed': 400,
                                                    'msg': '该研究已经下线'
                                                });
                                                return
                                            }
                                            if (persons.length == 0){
                                                studyOffline.update({
                                                    'id' : fields.id,
                                                },{
                                                    $push : {
                                                        'ToExamineUserData' : fields.ToExamineUserData,
                                                        'ToExamineUsers' : fields.ToExamineUsers,
                                                        'ToExaminePhone' : fields.ToExaminePhone,
                                                        'ToExamineType' : fields.ToExamineType,
                                                        'ToExamineDate' : new Date()
                                                    } ,
                                                },function () {
                                                    res.send({
                                                        'isSucceed': 400,
                                                        'msg': '操作成功'
                                                    });
                                                })
                                            }else{
                                                res.send({
                                                    'isSucceed': 400,
                                                    'msg': '您已经审核过该申请'
                                                });
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    })
                })
            }else{
                //查看该用户是否已经审核
                studyOffline.find({
                    id : fields.id,
                    ToExaminePhone : fields.ToExaminePhone
                }).exec((err, persons) => {
                    if (err != null){
                        res.send({
                            'isSucceed': 200,
                            'msg': '数据库错误'
                        });
                    }else{
                        studyOffline.find({
                            id : fields.id
                        }).exec((err, persons1) => {
                            if (persons1[0].isOffline == 1){
                                res.send({
                                    'isSucceed': 400,
                                    'msg': '该研究已经下线'
                                });
                                return
                            }
                            if (persons.length == 0){
                                studyOffline.update({
                                    'id' : fields.id,
                                },{
                                    $push : {
                                        'ToExamineUserData' : fields.ToExamineUserData,
                                        'ToExamineUsers' : fields.ToExamineUsers,
                                        'ToExaminePhone' : fields.ToExaminePhone,
                                        'ToExamineType' : fields.ToExamineType,
                                        'ToExamineDate' : new Date()
                                    } ,
                                },function () {
                                    res.send({
                                        'isSucceed': 400,
                                        'msg': '操作成功'
                                    });
                                })
                            }else{
                                res.send({
                                    'isSucceed': 400,
                                    'msg': '您已经审核过该申请'
                                });
                            }
                        })
                    }
                })
            }
        })
    })
}


//研究下线--整个研究确定/拒绝下线
exports.getDetermineYjxxOffline = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields);
        //取出申请和审核
        ApplicationAndAudit.find({"StudyID": fields.StudyID ,'EventApp' : '4','EventRev' : '4'}, function (err, persons) {
            var applaa = null;
            for(var i = 0 ; i < persons.length ; i++){
                // if (persons[i].EventUnbRev == '3'){
                    applaa = persons[0];
                //     break;
                // }
            }
            if (applaa == null){
                res.send({
                    'isSucceed': 200,
                    'msg': '未找到相关数据,请联系服务商'
                });
                return;
            }
            users.find({"StudyID": fields.StudyID}, function (err, persons) {
                studyOffline.find({"id": fields.id}, function (err, UnblindingPersons) {
                    //取出符合符合条件的用户
                    var shUsers = [];
                    var splits = applaa.EventRevUsers.split(",");
                    for (var i = 0 ; i < persons.length ; i++){
                        for (var j = 0 ; j < splits.length ; j++){
                            if (persons[i].UserFun == splits[j]){
                                shUsers.push(persons[i]);
                                break;
                            }
                        }
                    }
                    //判断审核次序
                    /*1=单个审核人；2=全部审核人；3=逐步审核*/
                    var isWC = false;
                    if (applaa.EventRevOrd == '1'){
                        for (var i = 0 ; i < splits.length ; i++){
                            //查看所有用户有多少具有该权限
                            var dataU = [];
                            var unDataU = [];
                            for (var j = 0 ; j < shUsers.length ; j++){
                                if (shUsers[j].UserFun == splits[i]){
                                    dataU.push(shUsers[j].UserMP)
                                }
                            }
                            for (var x = 0 ; x < dataU.length ; x++){
                                for (var y = 0 ; y < UnblindingPersons[0].ToExamineUserData.length ; y++){
                                    if (UnblindingPersons[0].ToExamineUserData[y].UserMP == dataU[x]){
                                        unDataU.push(UnblindingPersons[0].ToExamineUserData[y].UserMP)
                                    }
                                }
                            }
                            if (unDataU.length != 0){
                                isWC = true;
                            }
                        }
                        if (isWC == false){
                            res.send({
                                'isSucceed': 200,
                                'msg': '未审核完成,不能进行研究下线操作'
                            });
                            return;
                        }
                    }else{
                        //取出符合符合条件的用户
                        var xySHUsers = [];
                        var splits = applaa.EventRevUsers.split(",");
                        for (var i = 0 ; i < persons.length ; i++){
                            for (var j = 0 ; j < splits.length ; j++){
                                if (persons[i].UserFun == splits[j]){
                                    xySHUsers.push(persons[i]);
                                    break;
                                }
                            }
                        }
                        var shUsers = [];
                        for (var i = 0 ; i < xySHUsers.length ; i++){
                            if (i == 0 ){
                                shUsers.push(xySHUsers[i])
                            }else{
                                var isAdd = true;
                                for (var j = 0 ; j < shUsers.length ; j++){
                                    if (xySHUsers[i].UserMP == shUsers[j].UserMP){
                                        isAdd = false;
                                        break;
                                    }
                                }
                                if (isAdd == true){
                                    shUsers.push(xySHUsers[i])
                                    console.log(xySHUsers[i].UserMP)
                                }
                            }
                        }
                        if (shUsers.length == UnblindingPersons[0].ToExamineUsers.length){
                            isWC = true;
                        }
                    }
                    if (isWC == false){
                        res.send({
                            'isSucceed': 200,
                            'msg': '未审核完成,不能进行研究下线操作'
                        });
                        return;
                    }
                    //查看该用户是否已经审核
                    console.log('研究下线--整个研究确定/拒绝下线')
                    studyOffline.find({
                        'id' : fields.id,
                    }).exec((err, persons) => {
                        if (persons[0].isOffline == 2 || persons[0].isOffline == 1){
                            res.send({
                                'isSucceed': 400,
                                'msg': '该申请已经操作完成'
                            });
                        }else{
                            if (fields.isOffline == 1){
                                study.update({
                                    'StudyID' : persons[0].StudyID,
                                },{
                                    'StudIsOffline' : 1,
                                    "StudOfflineUsers" : fields.StudOfflineUsers, //停止入组操作人
                                    "StudOfflinePhone" : fields.StudOfflinePhone, //停止入组操作手机号
                                    'StudOfflineDate' : new Date()
                                },function () {
                                    // //把该研究的所有中心全部停止入组
                                    // console.log(persons[0].StudyID)
                                    // site.find({
                                    //     'StudyID' : persons[0].StudyID,
                                    // }).exec((err, persons22) => {
                                    //     for (var i = 0 ; i < persons22.length ; i++) {
                                    //         site.update({
                                    //             'id' : persons22[i].id,
                                    //         },{
                                    //             'isStopIt' : 1,
                                    //         },function (err,ddd) {
                                    //             console.log('所有中心停止入组')
                                    //         })
                                    //     }
                                    // })
                                })
                            }
                            studyOffline.update({
                                'id' : fields.id,
                            },{
                                'OfflineUsers' : fields.StudOfflineUsers,
                                'OfflinePhone' : fields.StudOfflineUsers,
                                'isOffline' : fields.isOffline,
                                'OfflineDate' : new Date()
                            },function () {
                                res.send({
                                    'isSucceed': 400,
                                    'msg': '操作成功'
                                });
                            })
                        }
                    })
                })
            })
        })
    })
}

//研究下线--整个研究查询子研究受试者例数
exports.getZyjsszls = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //查询子研究受试者例数
        addSuccessPatient.find({
            'StudyID' : fields.StudyID,
            'SubjStudYN' : "是",
        }).exec((err, persons) => {
            res.send({
                'isSucceed': 400,
                'data': persons.length
            });
        })
    })
}

//研究下线--整个研究查询延长期研究受试者例数
exports.getYcqyjsszls = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //查询子研究受试者例数
        addOutPatient.find({
            'StudyID' : fields.StudyID,
            'DSCONT_OLE' : "是"
        }).exec((err, persons) => {
            res.send({
                'isSucceed': 400,
                'data': persons.length
            });
        })
    })
}

var gitData = function (StudyID,block) {
    var data = {
         "AllAampleNumber" : String, //总样本量
         "AllRandomNumber" : String, //总随机例数
         "AllCompleteNumber" : String, //总完成例数
         "AllFallOffNumber" : String, //总脱落例数
         "IsStudyStopIt" : String, //研究是否已经停止入组
    };
    /*"AllAampleNumber" : String, //总样本量=<新增成功受试者>+<新增失败受试者>
     "AllRandomNumber" : String, //总随机例数=总完成例数+总脱落例数
     "AllCompleteNumber" : String, //总完成例数
     "AllFallOffNumber" : String, //总脱落例数=提前退出研究的受试者例数
     "IsStudyStopIt" : String, //研究是否已经停止入组*/
    addSuccessPatient.find({
        StudyID : StudyID,
    }).exec((err, persons) => {
        addFailPatient.find({
            StudyID : StudyID,
        }).exec((err, persons1) => {
            //获取总样本量
            data.AllAampleNumber = persons.length + persons1.length
            var ssss = 0;
            for (var i = 0 ; i < persons.length ; i++) {
                if (persons[i].Random != null){
                    if (persons[i].Random.length > 0 ){
                        ssss = ssss + 1
                    }
                }
            }
            //查询总随机例数
            addSuccessPatient.find({
                StudyID : StudyID,
                Random:{$ne:null}
            }).exec((err, persons2) => {
                // data.AllRandomNumber = ssss;
                data.AllRandomNumber = persons2.length;
                addOutPatientSchema.find({StudyID:StudyID ,DSDE:'完成研究'}, function (err, FailPersons) {
                    //总完成数
                    data.AllCompleteNumber = FailPersons.length
                    //总脱落例数
                    addOutPatientSchema.find({StudyID:StudyID ,DSDE:{$ne:'完成研究'}}, function (err, OutPersons) {
                        data.AllFallOffNumber = OutPersons.length
                        //判断是否停止入组
                        study.find({
                            StudyID : StudyID,
                        }).exec((err, persons) => {
                            if (persons[0].StudIsStopIt != 1){
                                //是否停止入组--没有停止入组
                                data.IsStudyStopIt = '否'
                            }else{
                                //是否停止入组--停止入组
                                data.IsStudyStopIt = '是'
                            }
                            block(data)
                        })
                    })
                })
            })
        })
    })
}
