var users = require('../../models/import/users');
var formidable = require('formidable');
var depot = require('../../models/import/depot');
var site = require('../../models/import/site');
var drug = require('../../models/import/drug');
var LSDrug = require('../../models/import/LSDrug');
var DYSDrug = require('../../models/import/DYSDrug');
var mongoose = require('mongoose');

//按药物号个数分配
exports.appGetYwhgsfp = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        drug.chazhaoyousuoYWH(fields.StudyID,function (err, persons){
            if (err != null){
                if (err.isSucceed == "200"){
                    res.send(err);
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据库正在维护,请稍后再试'
                    });
                }
            }else{
                if (persons.length < fields.Number){
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '您输入的药物数量过多,最多为' + persons.length + '个'
                    });
                }else{
                    //把数据放入临时数据库
                    LSDrug.create({
                        drugs : persons.slice(0,fields.Number),    //药物数据
                        Users : fields.Users,    //用户数据
                        Address : fields.Address,    //分配地址数据
                        Type : fields.Type,    //分配地址数据
                        Date : new Date(), //导入时间
                        },function (error,data) {
                        console.log('保存成功');
                        if (error == null){
                            //删除药品库数据
                            for (var i = 0 ; i < persons.slice(0,fields.Number).length ; i++){
                                drug.remove({id:persons.slice(0,fields.Number)[i].id},function(err,result){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        console.log("删除成功");
                                    }
                                });
                            }
                            var oneSecond = 1000 * 300; // one second = 1000 x 1 ms
                            setTimeout(function() {
                                //查找临时数据库中是否还有该数据,如果有则删除临时数据库的这条数据,并添加到药品库中,没有则跳过
                                LSDrug.find({id : data.id},function (err, persons) {
                                    if (persons.length != 0){
                                        //添加到药品库中
                                        for (var j = 0 ; j < persons[0].drugs.length ; j++){
                                            console.log(persons[0].drugs[j])
                                            drug.create({
                                                StudyID:persons[0].drugs[j].StudyID,
                                                DrugSeq:persons[0].drugs[j].DrugSeq,
                                                DrugNum:persons[0].drugs[j].DrugNum,
                                                DrugDigits:persons[0].drugs[j].DrugDigits,
                                                ArmCD:persons[0].drugs[j].ArmCD,
                                                Arm:persons[0].drugs[j].Arm,
                                                PackSeq:persons[0].drugs[j].PackSeq,
                                                DrugExpryDTC:persons[0].drugs[j].DrugExpryDTC,
                                                Date:persons[0].drugs[j].Date,
                                            },function () {
                                                console.log('添加到了药品库')
                                            })
                                        }
                                        //删除临时数据
                                        LSDrug.remove({id:persons[0].id},function(err){
                                            if(err){
                                                console.log(err);
                                            }else{
                                                console.log("临时数据删除成功");
                                            }
                                        });
                                    }
                                })
                            }, oneSecond);
                            res.send({
                                'isSucceed' : 400,
                                'data' : data
                            });
                        }else{
                            res.send({
                                'isSucceed' : 200,
                                'msg' : '中间数据错误'
                            });
                        }
                    })
                }
            }
        })
    })
},
//确定按药物号个数分配
exports.appGetAssignYwhgsfp = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        //把数据移动到待发货列表,发送邮件
        LSDrug.find({id : fields.id},function (err, persons){
            if (err == null){
                if (persons.length == 0){
                    console.log("数据不存在,请重新选择");
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据不存在,请重新选择'
                    });
                }else{
                    DYSDrug.create({
                        drugs : persons[0].drugs,    //药物数据
                        Users : persons[0].Users,    //用户数据
                        Address : persons[0].Address,    //分配地址数据
                        Type : persons[0].Type,    //分配地址类型:1仓库,2中心
                        Date : new Date(), //导入时间
                    },function (error) {
                        if (error != null){
                            console.log("数据移动失败");
                            res.send({
                                'isSucceed' : 200,
                                'msg' : '数据移动失败'
                            });
                        }else {
                            LSDrug.remove({id:persons[0].id},function(err,result){
                                if(err){
                                    console.log(err);
                                }else{
                                    console.log("删除成功");
                                }
                            });
                            //返回成功
                            res.send({
                                'isSucceed' : 400,
                                'msg' : '操作完成'
                            });
                        }
                    })
                }
            }else{
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
            }
        })
    })
}
//取消按药物号个数分配
exports.appGetCancelYwhgsfp = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        //把数据移动到待发货列表,发送邮件
        LSDrug.find({id : fields.id},function (err, persons){
            if (err == null){
                if (persons.length == 0){
                    console.log("数据不存在,请重新选择");
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据不存在,请重新选择'
                    });
                }else{
                    LSDrug.remove({id:persons[0].id},function(err,result){
                        if(err != null){
                            console.log(err);
                        }else{
                            console.log("删除成功");
                        }
                    });
                    //返回成功
                    res.send({
                        'isSucceed' : 400,
                        'msg' : '操作完成'
                    });
                }
            }else{
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
            }
        })
    })
}