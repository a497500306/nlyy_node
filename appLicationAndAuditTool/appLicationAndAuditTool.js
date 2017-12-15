var ApplicationAndAudit = require('../models/import/ApplicationAndAudit');
var users = require('../models/import/users')
//判断审核进度
exports.getTrialUnblindingApplication = function (EventApp, EventRev,UnblindingType, model,id,ToExaminePhone,StudyID,res,block) {
    ApplicationAndAudit.find({
        "StudyID": StudyID,
        'EventApp': EventApp,
        'EventRev': EventRev
    }, function (err, persons) {
        var applaa = null;
        for (var i = 0; i < persons.length; i++) {
            if (persons[i].EventUnbRev == UnblindingType) {
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
            users.find({"StudyID": StudyID}, function (err, persons) {
                model.find({"id": id}, function (err, UnblindingPersons) {
                    var shUsers = persons;
                    var splits = applaa.EventRevUsers.split(",");
                    //判断该用户是否审核
                    for (var i = 0 ; i < UnblindingPersons[0].ToExamineUsers.length ; i++){
                        if (UnblindingPersons[0].ToExamineUsers[i] == ToExaminePhone){
                            res.send({
                                'isSucceed': 400,
                                'msg': '请勿重复操作'
                            });
                            return
                        }
                    }
                    //查找该用户的所有身份
                    users.find({"StudyID": StudyID, 'UserMP' : ToExaminePhone}, function (err, persons) {
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
                            //更新数据
                            model.find({"id": id, "ToExaminePhone": ToExaminePhone}, function (err, persons) {
                                if (persons.length == 0) {
                                    block()
                                } else {
                                    res.send({
                                        'isSucceed': 400,
                                        'msg': '请勿重复操作'
                                    });
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
                            //更新数据
                            model.find({"id": id, "ToExaminePhone": ToExaminePhone}, function (err, persons) {
                                if (persons.length == 0) {
                                    block()
                                } else {
                                    res.send({
                                        'isSucceed': 400,
                                        'msg': '请勿重复操作'
                                    });
                                }
                            })
                        }
                    })
                })
            })
        }else{
            //更新数据
            model.find({"id": id, "ToExaminePhone": ToExaminePhone}, function (err, persons) {
                if (persons.length == 0) {
                    block()
                } else {
                    res.send({
                        'isSucceed': 400,
                        'msg': '请勿重复操作'
                    });
                }
            })
        }
    })
}