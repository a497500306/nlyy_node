var users = require('../../models/import/users');
var formidable = require('formidable');
var depot = require('../../models/import/depot');
var site = require('../../models/import/site');
var drug = require('../../models/import/drug');
var LSDrug = require('../../models/import/LSDrug');
var DYSDrug = require('../../models/import/DYSDrug');
var drugWL = require('../../models/import/drugWL');
var YSZDrug = require('../../models/import/YSZDryg');
var drugCK = require('../../models/import/drugCK');
var mongoose = require('mongoose');
var EMail = require("../../models/EMail");

//按药物号个数分配
exports.appGetYwhgsfp = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        if(fields.DepotGNYN == 1) {
            //如果为主仓库
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
        }else if(fields.DepotBrYN == 1){
            //如果为分仓库
            drugCK.chazhaoyousuoYJHYWH(fields.DepotId,function (err, persons){
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
                                    drugCK.remove({id:persons.slice(0,fields.Number)[i].id},function(err,result){
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
                                                drugCK.create({
                                                    StudyID:persons[0].drugs[j].StudyID,
                                                    DrugSeq:persons[0].drugs[j].DrugSeq,
                                                    DrugNum:persons[0].drugs[j].DrugNum,
                                                    DrugDigits:persons[0].drugs[j].DrugDigits,
                                                    ArmCD:persons[0].drugs[j].ArmCD,
                                                    Arm:persons[0].drugs[j].Arm,
                                                    PackSeq:persons[0].drugs[j].PackSeq,
                                                    DrugExpryDTC:persons[0].drugs[j].DrugExpryDTC,
                                                    DDrugNumRYN:persons[0].drugs[j].DDrugNumRYN,
                                                    DDrugNumAYN:persons[0].drugs[j].DDrugNumAYN,
                                                    DDrugDMNumYN:persons[0].drugs[j].DDrugDMNumYN,
                                                    DDrugDMNum:persons[0].drugs[j].DDrugDMNum,
                                                    DrugId:persons[0].drugs[j].DrugId,
                                                    DrugDate:persons[0].drugs[j].DrugDate,
                                                    UsedAddressId:persons[0].drugs[j].UsedAddressId,
                                                    UsedCoreId:persons[0].drugs[j].UsedCoreId,
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
        }
    })
},
//确定分配
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
                    //添加到物流信息列表中
                    (function iterator(jj){
                        if(jj == persons[0].drugs.length){
                            return
                        }
                        drugWL.find({StudyID : persons[0].drugs[jj].StudyID,DrugNum : persons[0].drugs[jj].DrugNum},function (err, drugWLPersons){
                            if (err != null){
                                res.send({
                                    'isSucceed' : 200,
                                    'msg' : '数据不存在,请重新选择'
                                });
                                return
                            }else{
                                if (drugWLPersons.length == 0){
                                    console.log(persons[0].drugs.length)
                                    console.log(persons[0].drugs[jj])
                                    //添加
                                    drugWL.create({
                                        StudyID : persons[0].drugs[jj].StudyID,
                                        DrugNum : persons[0].drugs[jj].DrugNum,
                                        drugStrs : [fields.UsedAddress.DepotName + '分配药物号,等待发货'],
                                        drugDate : [new Date()]
                                    },function (error) {
                                        iterator(jj+1)
                                    })
                                }else{
                                    //更新
                                    drugWL.update({
                                        'StudyID' : persons[0].drugs[jj].StudyID,
                                        'DrugNum' : persons[0].drugs[jj].DrugNum,
                                    },{
                                        $push : {
                                            'drugStrs' : fields.UsedAddress.DepotName + '分配药物号,等待发货',
                                            'drugDate' : new Date()
                                        } ,
                                    },function () {
                                        console.log("修改成功");
                                        iterator(jj+1)
                                    })
                                }
                            }
                        })
                    })(0);
                    //添加到待运送中
                    DYSDrug.create({
                        drugs : persons[0].drugs,    //药物数据
                        Users : persons[0].Users,    //用户数据
                        Address : persons[0].Address,    //目的地
                        Type : persons[0].Type,    //分配地址类型:1仓库,2中心
                        UsedAddress : fields.UsedAddress, //出发地
                        isDelivery : 0, //是否已发货
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


                            //发送邮件
                            var htmlStr = ''
                            var yaowuhao = '';
                            for(var i = 0 ; i < persons[0].drugs.length ; i++){
                                if ((i + 1 )%3 == 0){
                                    yaowuhao = yaowuhao + persons[0].drugs[i].DrugNum + '；\n'
                                }else{
                                    yaowuhao = yaowuhao + persons[0].drugs[i].DrugNum + '；     '
                                }
                            }
                            if (persons[0].Type == 1){
                                htmlStr = htmlStr + '<h2>研究简称:'+ persons[0].Users.StudNameS + '</h2>'
                                htmlStr = htmlStr + '<h2>仓库编号:'+ persons[0].Address.DepotID + '</h2>'
                                htmlStr = htmlStr + '<h2>仓库名称:'+ persons[0].Address.DepotName + '</h2>'
                                htmlStr = htmlStr + '<h2>仓库地址:'+ persons[0].Address.DepotCity + " " + persons[0].Address.DepotAdd + '</h2>'
                                htmlStr = htmlStr + '<h2>仓管员姓名:'+ persons[0].Address.DepotKper + '</h2>'
                                htmlStr = htmlStr + '<h2>仓管员手机号:'+ persons[0].Address.DepotMP + '</h2>'
                                htmlStr = htmlStr + '<h2>药物号:</h2>'
                                htmlStr = htmlStr + '<h2>'+yaowuhao+'</h2>'
                            }else{
                                htmlStr = htmlStr + '<h2>研究简称:'+ persons[0].Users.StudNameS + '</h2>'
                                htmlStr = htmlStr + '<h2>中心编号:'+ persons[0].Address.SiteID + '</h2>'
                                htmlStr = htmlStr + '<h2>中心名称:'+ persons[0].Address.SiteNam + '</h2>'
                                htmlStr = htmlStr + '<h2>中心地址:'+ persons[0].Address.SiteCity  + " " + persons[0].Address.SiteAdd + '</h2>'
                                htmlStr = htmlStr + '<h2>药物号:</h2>'
                                htmlStr = htmlStr + '<h2>'+yaowuhao+'</h2>'
                            }
                            EMail.fasongxiujian({
                                from: "配送清单<k13918446402@qq.com>", // 发件地址
                                to: persons[0].Users.UserEmail, // 收件列表
                                subject: "配送清单", // 标题
                                html: htmlStr // html 内容
                            })


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
        if (fields.DepotGNYN == 1){
            //主仓库

            console.log(fields)
            //把数据到原来地方
            LSDrug.find({id : fields.id},function (err, persons){
                if (err == null){
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
                                res.send({
                                    'isSucceed' : 200,
                                    'msg' : '数据库正在维护,请稍后再试'
                                });
                            }else{
                                //返回成功
                                res.send({
                                    'isSucceed' : 400,
                                    'msg' : '操作完成'
                                });
                            }
                        });
                    }
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据库正在维护,请稍后再试'
                    });
                }
            })
        }else if (fields.DepotBrYN == 1){
            //分仓库
            console.log(fields)
            //把数据到原来地方
            LSDrug.find({id : fields.id},function (err, persons){
                if (err == null){
                    if (persons.length != 0){
                        //添加到药品库中
                        for (var j = 0 ; j < persons[0].drugs.length ; j++){
                            console.log(persons[0].drugs[j])
                            drugCK.create({
                                StudyID:persons[0].drugs[j].StudyID,
                                DrugSeq:persons[0].drugs[j].DrugSeq,
                                DrugNum:persons[0].drugs[j].DrugNum,
                                DrugDigits:persons[0].drugs[j].DrugDigits,
                                ArmCD:persons[0].drugs[j].ArmCD,
                                Arm:persons[0].drugs[j].Arm,
                                PackSeq:persons[0].drugs[j].PackSeq,
                                DrugExpryDTC:persons[0].drugs[j].DrugExpryDTC,
                                DDrugNumRYN:persons[0].drugs[j].DDrugNumRYN,
                                DDrugNumAYN:persons[0].drugs[j].DDrugNumAYN,
                                DDrugDMNumYN:persons[0].drugs[j].DDrugDMNumYN,
                                DDrugDMNum:persons[0].drugs[j].DDrugDMNum,
                                DrugId:persons[0].drugs[j].DrugId,
                                DrugDate:persons[0].drugs[j].DrugDate,
                                UsedAddressId:persons[0].drugs[j].UsedAddressId,
                                UsedCoreId:persons[0].drugs[j].UsedCoreId,
                                Date:persons[0].drugs[j].Date,
                            },function () {
                                console.log('添加到了药品库')
                            })
                        }
                        //删除临时数据
                        LSDrug.remove({id:persons[0].id},function(err){
                            if(err){
                                res.send({
                                    'isSucceed' : 200,
                                    'msg' : '数据库正在维护,请稍后再试'
                                });
                            }else{
                                //返回成功
                                res.send({
                                    'isSucceed' : 400,
                                    'msg' : '操作完成'
                                });
                            }
                        });
                    }
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据库正在维护,请稍后再试'
                    });
                }
            })
        }
    })
}

//逐个分配
exports.appGetZgfp = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        if (fields.DepotGNYN == 1){
            //如果是主仓库
            var datas = [];
            //异步转同步
            (function iterator(i){
                if(i == fields.ids.length){
                    console.log('执行完成')
                    //放入中间数据库
                    zhongjian(datas,fields.Users,fields.Address,fields.Type,fields.DepotGNYN,fields.DepotBrYN,fields.DepotId,res)
                    return
                }
                console.log(fields.ids[i])
                drug.chazhaoIDYWH(fields.ids[i],function (err, persons){
                    if (err != null){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '数据库正在维护,请稍后再试'
                        });
                        return
                    }else{
                        console.log('成功----------')
                        console.log(persons)
                        datas.push(persons[0])
                    }
                    iterator(i+1)
                })
            })(0);
        }else if(fields.DepotBrYN == 1){
            console.log('分仓库');
            console.log(fields);
            //如果是分仓库
            var datas = [];
            //异步转同步
            (function iterator(i){
                if(i == fields.ids.length){
                    console.log('执行完成')
                    //放入中间数据库
                    zhongjian(datas,fields.Users,fields.Address,fields.Type,fields.DepotGNYN,fields.DepotBrYN,fields.DepotId,res)
                    return
                }
                console.log(fields.ids[i])
                drugCK.chazhaoIDYJHYWH(fields.ids[i],fields.DepotId,function (err, persons){
                    if (err != null){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '数据库正在维护,请稍后再试'
                        });
                        return
                    }else{
                        console.log('成功----------')
                        console.log(persons)
                        datas.push(persons[0])
                    }
                    iterator(i+1)
                })
            })(0);
        }
    })
}

//获取该研究全部药物号
exports.appGetAllDrug = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        if (fields.DepotGNYN == 1){
            drug.chazhaoyousuoYWH(fields.StudyID,function (err, persons){
                if (err == null){
                    //返回成功
                    res.send({
                        'isSucceed' : 400,
                        'data' : persons
                    });
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据库正在维护,请稍后再试'
                    });
                }
            })
        }else if (fields.DepotBrYN == 1){
            drugCK.chazhaoyousuoYJHYWH(fields.DepotId,function (err, persons){
                if (err == null){
                    //返回成功
                    res.send({
                        'isSucceed' : 400,
                        'data' : persons
                    });
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据库正在维护,请稍后再试'
                    });
                }
            })
        }
    })
}

//区段分配
exports.appGetQdfp = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        if (fields.DepotGNYN == 1){
            //为主仓库
            var datas = [];
            var i = Number(fields.Min);
            var yaowuhao = fields.Min;
            // console.log('i=====' + i)
            (function iterator(i){
                console.log('i==' + i + 'Min==' + Number(fields.Min))
                var newDrugNum = '';
                if (i == Number(fields.Min)){
                    newDrugNum = yaowuhao
                }else{
                    newDrugNum = i.toString();
                    if (newDrugNum.length != datas[0].DrugDigits){
                        for (var jj = 0 ; jj <= datas[0].DrugDigits - newDrugNum.length; jj++){
                            newDrugNum = '0' + newDrugNum;
                            console.log('拼接')
                            console.log(newDrugNum)
                        }
                    }
                    console.log('完成')
                    console.log(newDrugNum)


                }
                if(i > fields.Max){
                    console.log('执行完成')
                    //放入中间数据库
                    zhongjian(datas,fields.Users,fields.Address,fields.Type,fields.DepotGNYN,fields.DepotBrYN,fields.DepotId,res)
                    return
                }
                console.log('i ==' + i);
                drug.find({DrugNum : newDrugNum, StudyID : fields.StudyID},function (err, persons){
                    if (err != null){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '数据库正在维护,请稍后再试'
                        });
                        return
                    }else if(persons.length == 0){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '该区段药物号有断层,请选择其他分配方式或重新选择区段'
                        });
                        return
                    }else{
                        console.log('成功----------')
                        console.log(persons)
                        datas.push(persons[0])
                    }
                    iterator(i+1)
                })
            })(i);
        }else if (fields.DepotBrYN == 1){
            //为分仓库
            var datas = [];
            var i = Number(fields.Min);
            var yaowuhao = fields.Min;
            // console.log('i=====' + i)
            (function iterator(i){
                console.log('i==' + i + 'Min==' + Number(fields.Min))
                var newDrugNum = '';
                if (i == Number(fields.Min)){
                    newDrugNum = yaowuhao
                }else{
                    newDrugNum = i.toString();

                    console.log('DrugDigits=====' + datas[0].DrugDigits)
                    if (newDrugNum.length != datas[0].DrugDigits){
                        for (var jj = 0 ; jj <= datas[0].DrugDigits - newDrugNum.length; jj++){
                            console.log('运行了几次DrugDigits=====' + datas[0].DrugDigits)
                            newDrugNum = '0' + newDrugNum;
                        }
                    }

                }
                if(i > fields.Max){
                    console.log('执行完成')
                    //放入中间数据库
                    zhongjian(datas,fields.Users,fields.Address,fields.Type,fields.DepotGNYN,fields.DepotBrYN,fields.DepotId,res)
                    return
                }
                console.log('i ==' + newDrugNum);
                drugCK.find({DrugNum : newDrugNum, StudyID : fields.StudyID,UsedAddressId:fields.DepotId},function (err, persons){
                    console.log(fields);
                    if (err != null){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '数据库正在维护,请稍后再试'
                        });
                        return
                    }else if(persons.length == 0){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '该区段药物号有断层,请选择其他分配方式或重新选择区段'
                        });
                        return
                    }else{
                        console.log('成功----------')
                        console.log(persons)
                        datas.push(persons[0])
                    }
                    iterator(i+1)
                })
            })(i);
        }

        //联合查询
        // drug.find({id : 211, StudyID : fields.StudyID},function (err, persons){
        //     console.log(persons);
        // })
    })
}
//逐个结合区段分配区段分配
exports.appGetZGJHQDQdfp = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        if (fields.DepotGNYN == 1){
            //主仓库
            var datas = [];
            var i = Number(fields.Min);
            var yaowuhao = fields.Min;
            // console.log('i=====' + i)
            (function iterator(i){
                console.log('i==' + i + 'Min==' + Number(fields.Min))
                var newDrugNum = '';
                if (i == Number(fields.Min)){
                    newDrugNum = yaowuhao
                }else{
                    newDrugNum = i.toString();
                    if (newDrugNum.length != datas[0].DrugDigits){
                        for (var jj = 0 ; jj <= datas[0].DrugDigits - newDrugNum.length + 1 ; jj++){
                            newDrugNum = '0' + newDrugNum;
                        }
                    }

                }
                if(i > fields.Max){
                    console.log('执行完成')
                    //放入中间数据库
                    res.send({
                        'isSucceed' : 400,
                        'data' : datas
                    });
                    return
                }
                console.log('i ==' + i);
                drug.find({DrugNum : newDrugNum, StudyID : fields.StudyID},function (err, persons){
                    if (err != null){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '数据库正在维护,请稍后再试'
                        });
                        return
                    }else if(persons.length == 0){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '该区段药物号有断层,请选择其他分配方式或重新选择区段'
                        });
                        return
                    }else{
                        console.log('成功----------')
                        console.log(persons)
                        datas.push(persons[0])
                    }
                    iterator(i+1)
                })
            })(i);
        }else if (fields.DepotBrYN == 1){
            //分仓库
            var datas = [];
            var i = Number(fields.Min);
            var yaowuhao = fields.Min;
            // console.log('i=====' + i)
            (function iterator(i){
                console.log('i==' + i + 'Min==' + Number(fields.Min))
                var newDrugNum = '';
                if (i == Number(fields.Min)){
                    newDrugNum = yaowuhao
                }else{
                    newDrugNum = i.toString();
                    if (newDrugNum.length != datas[0].DrugDigits){
                        for (var jj = 0 ; jj <= datas[0].DrugDigits - newDrugNum.length + 1 ; jj++){
                            newDrugNum = '0' + newDrugNum;
                        }
                    }

                }
                if(i > fields.Max){
                    console.log('执行完成')
                    //放入中间数据库
                    res.send({
                        'isSucceed' : 400,
                        'data' : datas
                    });
                    return
                }
                console.log('i ==' + i);
                drugCK.find({DrugNum : newDrugNum, StudyID : fields.StudyID, UsedAddressId : fields.DepotId},function (err, persons){
                    if (err != null){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '数据库正在维护,请稍后再试'
                        });
                        return
                    }else if(persons.length == 0){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '该区段药物号有断层,请选择其他分配方式或重新选择区段'
                        });
                        return
                    }else{
                        console.log('成功----------')
                        console.log(persons)
                        datas.push(persons[0])
                    }
                    iterator(i+1)
                })
            })(i);
        }
    })
}
//获取待运送药物清单
exports.appGetDysywqd = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //在待运送数据库中查找该用户该研究的所有数据,并且按时间先后排序
        DYSDrug.chazhaosuoyouDyslb(fields.UsedAddressId,fields.UserMP,function (err, persons){
            console.log(persons)
            if (err != null){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
                return
            }else{
                res.send({
                    'isSucceed' : 400,
                    'data' : persons
                });
                return
            }
        })
    })
}
//确定运送待运送药物清单
exports.appGetAssignDysywqd = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //把数据移动到待发货列表,发送邮件
        DYSDrug.find({id : fields.id , isDelivery : 0},function (err, persons){
            if (err == null){
                if (persons.length == 0){
                    console.log("数据不存在,请重新选择");
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据不存在,请重新选择'
                    });
                }else{
                    if (persons.length == 0 ){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '请勿重复操作'
                        });
                        return
                    }
                    //修改药物物流状态
                    for (var jj = 0 ; jj < persons[0].drugs.length ; jj ++){

                        console.log(persons[0].drugs[jj].StudyID + '   ' + persons[0].drugs[jj].DrugNum);
                        var ddd = persons[0].UsedAddress.DepotName + '已发货'
                        //更新
                        drugWL.update({
                            'StudyID' : persons[0].drugs[jj].StudyID,
                            'DrugNum' : persons[0].drugs[jj].DrugNum
                        },{
                            $push : {
                                'drugStrs' : ddd,
                                'drugDate' : new Date()
                            } ,
                        },function () {
                            console.log("修改成功");
                        })
                    }
                    //添加到运送中数据库
                    YSZDrug.create({
                        drugs : persons[0].drugs,    //药物数据
                        Users : persons[0].Users,    //用户数据
                        Address : persons[0].Address,    //目的地
                        Type : persons[0].Type,    //分配地址类型:1仓库,2中心
                        UsedAddress : persons[0].UsedAddress, //出发地
                        isSign : 0,//是否签收
                        Date : new Date(), //导入时间
                    },function (error) {
                        if (error != null){
                            console.log("数据移动失败");
                            res.send({
                                'isSucceed' : 200,
                                'msg' : '数据移动失败'
                            });
                        }else {
                            //把DYSDrug数据修改为已发货,更新
                            DYSDrug.update({'id' : fields.id},{'isDelivery' : 1,'DeliveryDate':new Date()},function () {
                                console.log("修改成功");
                            })
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

//运送中药物清单列表
exports.appGetYszywqd = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //在待运送数据库中查找该用户该研究的所有数据,并且按时间先后排序
        YSZDrug.chazhaosuoyouYsz(fields.UsedAddressId,fields.UserMP,function (err, persons){
            console.log(persons)
            if (err != null){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
                return
            }else{
                res.send({
                    'isSucceed' : 400,
                    'data' : persons
                });
                return
            }
        })
    })
}
//已送达药物清单列表
exports.appGetYsdywqd = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //在待运送数据库中查找该用户该研究的所有数据,并且按时间先后排序
        YSZDrug.chazhaosuoyouYSD(fields.UsedAddressId,fields.UserMP,function (err, persons){
            console.log(persons)
            if (err != null){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
                return
            }else{
                res.send({
                    'isSucceed' : 400,
                    'data' : persons
                });
                return
            }
        })
    })
}


//待签收药物清单列表
exports.appGetDqsywqd = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //在待运送数据库中查找该用户该研究的所有数据,并且按时间先后排序
        YSZDrug.chazhaosuoyouDQS(fields.AddressId,function (err, persons){
            console.log(persons)
            if (err != null){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
                return
            }else{
                res.send({
                    'isSucceed' : 400,
                    'data' : persons
                });
                return
            }
        })
    })
}

//签收待签收药物清单列表
exports.appGetAssignDqsywqd = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        //已签收
        YSZDrug.find({id : fields.id , isSign : 0},function (err, persons){
            if (err == null){
                if (persons.length == 0){
                    console.log("数据不存在,请重新选择");
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据不存在,请重新选择'
                    });
                }else{
                    console.log(fields.UsedAddress);
                    for (var i = 0 ; i < persons[0].drugs.length ; i++){
                        drugCK.create({
                            StudyID : persons[0].drugs[i].StudyID,
                            DrugNum : persons[0].drugs[i].DrugNum,
                            ArmCD : persons[0].drugs[i].ArmCD,
                            Arm : persons[0].drugs[i].Arm,
                            PackSeq : persons[0].drugs[i].PackSeq,
                            DrugSeq : persons[0].drugs[i].DrugSeq,
                            DrugDigits : persons[0].drugs[i].DrugDigits, // 药物号位数
                            DrugExpryDTC : persons[0].drugs[i].DrugExpryDTC,
                            DDrugNumRYN : 1,
                            DDrugNumAYN : 0,
                            DDrugDMNumYN : 0,
                            DDrugDMNum : 0,
                            DrugId : persons[0].id,
                            DrugDate : persons[0].Date,
                            UsedAddressId : fields.UsedAddressId,
                            UsedCoreId : fields.UsedCoreId,
                            Date : new Date(), //导入时间
                        },function (error) {
                            if (error != null){
                                console.log("数据移动失败");
                                res.send({
                                    'isSucceed' : 200,
                                    'msg' : '数据移动失败'
                                });
                            }
                        })

                        //修改物流信息
                        if (persons[0].Type == 1) {//仓库
                            //更新
                            drugWL.update({
                                'StudyID' : persons[0].drugs[i].StudyID,
                                'DrugNum' : persons[0].drugs[i].DrugNum
                            },{
                                $push : {
                                    'drugStrs' : persons[0].Address.DepotName + '已签收',
                                    'drugDate' : new Date()
                                } ,
                            },function () {
                                console.log("修改成功");
                            })
                        }else{
                            //先查找
                            drugWL.update({
                                'StudyID' : persons[0].drugs[i].StudyID,
                                'DrugNum' : persons[0].drugs[i].DrugNum
                            },{
                                $push : {
                                    'drugStrs' : persons[0].Address.SiteNam + '已签收',
                                    'drugDate' : new Date()
                                } ,
                            },function () {
                                console.log("修改成功");
                            })
                        }
                    }
                    //把DYSDrug数据修改为已发货
                    YSZDrug.update({'id' : fields.id},{'isSign' : 1,'SignDate':new Date()},function () {
                        //返回成功
                        res.send({
                            'isSucceed' : 400,
                            'msg' : '操作完成'
                        });
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

//已签收药物清单
exports.appGetYqsywqd = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //在待运送数据库中查找该用户该研究的所有数据,并且按时间先后排序
        YSZDrug.chazhaosuoyouYQS(fields.AddressId,function (err, persons){
            console.log(persons)
            if (err != null){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
                return
            }else{
                res.send({
                    'isSucceed' : 400,
                    'data' : persons
                });
                return
            }
        })
    })
}

//全部激活某批次已签收仓库药物
exports.getAllOnActivation = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        drugCK.chazhaomoupiciYWH(fields.DrugId,fields.UsedAddressId,function (err, persons){
            if (err != null){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
                return
            }else{
                if (persons.length != 0){
                    for (var i = 0 ; i < persons.length ; i++){
                        //修改物流信息
                        drugWL.update({
                            'StudyID' : persons[i].StudyID,
                            'DrugNum' : persons[i].DrugNum
                        },{
                            $push : {
                                'drugStrs' : '激活',
                                'drugDate' : new Date()
                            } ,
                        },function () {
                            console.log("修改成功");
                        })
                        //把DYSDrug数据修改为已发货,更新
                        drugCK.update({'id' : persons[i].id},{'DDrugNumAYN' : 1 , 'DDrugDMNumYN' : 0 ,},function () {
                            console.log("修改成功");
                        })
                    }
                    res.send({
                        'isSucceed' : 400,
                        'msg' : '全部激活完成'
                    });
                    return
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据库正在维护,请稍后再试'
                    });
                    return
                }
            }
        })
    })
}

//获取某批次已签收仓库药物列表
exports.getAllOnDrug = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        drugCK.chazhaomoupiciYWH(fields.DrugId,fields.UsedAddressId,function (err, persons){
            if (err != null){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
                return
            }else{
                if (persons.length != 0){
                    res.send({
                        'isSucceed' : 400,
                        'data' : persons
                    });
                    return
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据库正在维护,请稍后再试'
                    });
                }
                return
            }
        })
    })
}

//激活选中的已签收的仓库药物
exports.getSelectedActivation = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        if (fields.ids.length == 0){
            res.send({
                'isSucceed' : 200,
                'msg' : '数据有误'
            });
        }else{
            //异步转同步
            (function iterator(i){
                if(i == fields.ids.length){
                    console.log('执行完成')
                    res.send({
                        'isSucceed' : 400,
                        'msg' : '操作成功'
                    });
                    return
                }
                console.log(fields.ids[i])
                //修改药物号为激活状态
                drugCK.update({'id' : fields.ids[i]},{'DDrugNumAYN' : 1 , 'DDrugDMNumYN' : 0 ,},function (err, persons) {
                    console.log(persons)
                    drugCK.find({'id' : fields.ids[i]},function (err, persons){
                        //修改物流信息
                        drugWL.update({
                            'StudyID' : persons[0].StudyID,
                            'DrugNum' : persons[0].DrugNum
                        },{
                            $push : {
                                'drugStrs' : '激活',
                                'drugDate' : new Date()
                            } ,
                        },function () {
                            console.log("修改成功");
                        })
                    })
                    iterator(i+1)
                })
            })(0);
        }
    })
}
//废弃选中的已签收的仓库药物
exports.getSelectedAbandoned = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        if (fields.ids.length == 0){
            res.send({
                'isSucceed' : 200,
                'msg' : '数据有误'
            });
        }else{
            //异步转同步
            (function iterator(i){
                if(i == fields.ids.length){
                    console.log('执行完成')
                    res.send({
                        'isSucceed' : 400,
                        'msg' : '操作成功'
                    });
                    return
                }
                console.log(fields.ids[i])
                //修改药物号为激活状态
                drugCK.update({'id' : fields.ids[i]},{'DDrugNumAYN' : 0 , 'DDrugDMNumYN' : 1 ,},function () {
                    console.log("修改成功");
                    drugCK.find({'id' : fields.ids[i]},function (err, persons){
                        //修改物流信息
                        drugWL.update({
                            'StudyID' : persons[0].StudyID,
                            'DrugNum' : persons[0].DrugNum
                        },{
                            $push : {
                                'drugStrs' : '废弃',
                                'drugDate' : new Date()
                            } ,
                        },function () {
                            console.log("修改成功");
                        })
                    })
                    iterator(i+1)
                })
            })(0);
        }
    })
}

//中心代签收药物清单
exports.getZXDqsywqd = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        //在待运送数据库中查找该用户该研究的所有数据,并且按时间先后排序
        YSZDrug.chazhaosuoyouZXDQS(fields.StudyID,fields.UserSiteYN,fields.UserSite,function (err, persons){
            console.log(persons)
            if (err != null){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
                return
            }else{
                res.send({
                    'isSucceed' : 400,
                    'data' : persons
                });
                return
            }
        })
    })
}

//中心已签收药物清单
exports.getZXYqsywqd = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //在待运送数据库中查找该用户该研究的所有数据,并且按时间先后排序
        YSZDrug.chazhaosuoyouZXYQS(fields.StudyID,fields.UserSiteYN,fields.UserSite,function (err, persons){
            console.log(persons)
            if (err != null){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
                return
            }else{
                res.send({
                    'isSucceed' : 400,
                    'data' : persons
                });
                return
            }
        })
    })
}

//中心所有药物(已签收+代签收)清单
exports.getZXAllYwqd = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        
        //在待运送数据库中查找该用户该研究的所有数据,并且按时间先后排序
        YSZDrug.chazhaosuoyouZXQD(fields.StudyID,fields.UserSiteYN,fields.UserSite,function (err, persons){
            console.log(persons)
            if (err != null){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
                return
            }else{
                res.send({
                    'isSucceed' : 400,
                    'data' : persons
                });
                return
            }
        })
    })
}

//获取某中心某批次已签收仓库药物列表
exports.getZXAllOnDrug = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        drugCK.chazhaomoupiciZXYWH(fields.DrugId,fields.UsedCoreId,function (err, persons){
            if (err != null){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
                return
            }else{
                if (persons.length != 0){
                    res.send({
                        'isSucceed' : 400,
                        'data' : persons
                    });
                    return
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据库正在维护,请稍后再试'
                    });
                }
                return
            }
        })
    })
}
//全部激活中心某批次已签收仓库药物
exports.getZXAllOnActivation = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields)
        drugCK.chazhaomoupiciZXYWH(fields.DrugId,fields.UsedCoreId,function (err, persons){
            if (err != null){
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
                return
            }else{
                if (persons.length != 0){
                    for (var i = 0 ; i < persons.length ; i++){
                        //修改物流信息
                        drugWL.update({
                            'StudyID' : persons[i].StudyID,
                            'DrugNum' : persons[i].DrugNum
                        },{
                            $push : {
                                'drugStrs' : '激活',
                                'drugDate' : new Date()
                            } ,
                        },function () {
                            console.log("修改成功");
                        })
                        //把DYSDrug数据修改为已发货,更新
                        drugCK.update({'id' : persons[i].id},{'DDrugNumAYN' : 1 , 'DDrugDMNumYN' : 0 ,},function () {
                            console.log("修改成功");
                        })
                    }
                    res.send({
                        'isSucceed' : 400,
                        'msg' : '全部激活完成'
                    });
                    return
                }else{
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据库正在维护,请稍后再试'
                    });
                    return
                }
            }
        })
    })
}

//中心药物使用情况
exports.getSiteDrugData = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //查询目前库存量
        /*StudyID : Users.Users.StudyID,
         UsedCoreId : Users.Users.UserSite,*/
        var data = {
            UsedCoreId : null,
            StudyID : null,
            MQKCL : null,
            YQSYWL : null,
            YJHYWL : null,
            YFFYWL : null,
            YFQYWL : null,
            YJMYWL : null,
            YTHYWL : null,
        };
        data.UsedCoreId = fields.UsedCoreId,
        data.StudyID = fields.StudyID,
        drugCK.find({
            UsedCoreId : fields.UsedCoreId,
            StudyID : fields.StudyID,
            DDrugNumAYN: 1,
            $or:[
                {DDrugUseAYN:0},
                {DDrugUseAYN:null}
            ]},function (err, persons){
                if (err != null){
                    console.log(err)
                    res.send({
                        'isSucceed' : 200,
                        'msg' : '数据库正在维护,请稍后再试'
                    });
                    return
            }else {
                console.log(persons.length)
                data.MQKCL = persons.length;
                //查找已签收药物量
                    drugCK.find({
                        UsedCoreId : fields.UsedCoreId,
                        StudyID : fields.StudyID
                        },function (err, persons){
                        if (err != null){
                            console.log(err)
                            res.send({
                                'isSucceed' : 200,
                                'msg' : '数据库正在维护,请稍后再试'
                            });
                            return
                        }else {
                            console.log(persons.length)
                            data.YQSYWL = persons.length;
                            //查找已激活药物量
                            drugCK.find({
                                UsedCoreId : fields.UsedCoreId,
                                StudyID : fields.StudyID,
                                DDrugNumAYN: 1
                            },function (err, persons){
                                if (err != null){
                                    console.log(err)
                                    res.send({
                                        'isSucceed' : 200,
                                        'msg' : '数据库正在维护,请稍后再试'
                                    });
                                    return
                                }else {
                                    console.log(persons.length)
                                    data.YJHYWL = persons.length;
                                    //查找已发放药物量
                                    drugCK.find({
                                        UsedCoreId : fields.UsedCoreId,
                                        StudyID : fields.StudyID,
                                        DDrugUseAYN: 1
                                    },function (err, persons){
                                        if (err != null){
                                            console.log(err)
                                            res.send({
                                                'isSucceed' : 200,
                                                'msg' : '数据库正在维护,请稍后再试'
                                            });
                                            return
                                        }else {
                                            console.log(persons.length)
                                            data.YFFYWL = persons.length;
                                            //查找已废弃药物量
                                            drugCK.find({
                                                UsedCoreId : fields.UsedCoreId,
                                                StudyID : fields.StudyID,
                                                DDrugDMNumYN: 1
                                            },function (err, persons){
                                                if (err != null){
                                                    console.log(err)
                                                    res.send({
                                                        'isSucceed' : 200,
                                                        'msg' : '数据库正在维护,请稍后再试'
                                                    });
                                                    return
                                                }else {
                                                    console.log(persons.length)
                                                    data.YFQYWL = persons.length;
                                                    //查找已揭盲药物量
                                                    data.YJMYWL = '目前还未开发';
                                                    //查找已替换药物量
                                                    data.YTHYWL = '目前还未开发';
                                                    res.send({
                                                        'isSucceed' : 400,
                                                        'data' : data
                                                    });
                                                    return
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
            }
        })
    })
}

//查询药物号物流情况
exports.getDrugWLData = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //在导入药物号中查询
        drug.find({StudyID : fields.StudyID, DrugNum:fields.DrugNum},function (err, persons){
            if (err != null){
                console.log('gggg')
                res.send({
                    'isSucceed' : 200,
                    'msg' : '数据库正在维护,请稍后再试'
                });
                return
            }else{
                if (persons.length != 0){
                    console.log('ssss')
                    //总仓库未发出
                    res.send({
                        'isSucceed' : 400,
                        'data' : null,
                        'msg' : '未从总仓库发出'
                    });
                    return
                }else {
                    drugWL.find({
                        StudyID : fields.StudyID,
                        DrugNum:fields.DrugNum
                    },function (err, drugWLPersons) {
                        if (err != null) {
                            console.log('gggg')
                            res.send({
                                'isSucceed': 200,
                                'msg': '数据库正在维护,请稍后再试'
                            });
                            return
                        }else{
                            res.send({
                                'isSucceed' : 400,
                                'data' : drugWLPersons[0]
                            });
                            return
                        }
                    })
                }
            }
        })
    })
}

zhongjian = function (drugs,Users,Address,Type,DepotGNYN,DepotBrYN,DepotId,res) {
    if (DepotGNYN == 1) {
        //为主仓库
        //把数据放入临时数据库
        LSDrug.create({
            drugs : drugs,    //药物数据
            Users : Users,    //用户数据
            Address : Address,    //分配地址数据
            Type : Type,    //分配地址数据
            Date : new Date(), //导入时间
        },function (error,data) {
            console.log('保存成功');
            if (error == null){
                //删除药品库数据
                for (var i = 0 ; i < drugs.length ; i++){
                    if (drugs[i] == undefined){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '请勿重复操作,请返回重新选择'
                        });
                        return
                    }
                    drug.remove({id:drugs[i].id},function(err,result){
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
    }else  if (DepotBrYN == 1){
        //为分仓库
        //把数据放入临时数据库
        LSDrug.create({
            drugs : drugs,    //药物数据
            Users : Users,    //用户数据
            Address : Address,    //分配地址数据
            Type : Type,    //分配地址数据
            Date : new Date(), //导入时间
        },function (error,data) {
            console.log('保存成功');
            if (error == null){
                //删除药品库数据
                for (var i = 0 ; i < drugs.length ; i++){
                    if (drugs[i] == undefined){
                        res.send({
                            'isSucceed' : 200,
                            'msg' : '请勿重复操作,请返回重新选择'
                        });
                        return
                    }
                    drugCK.remove({id:drugs[i].id},function(err,result){
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
                                drugCK.create({
                                    StudyID:persons[0].drugs[j].StudyID,
                                    DrugSeq:persons[0].drugs[j].DrugSeq,
                                    DrugNum:persons[0].drugs[j].DrugNum,
                                    DrugDigits:persons[0].drugs[j].DrugDigits,
                                    ArmCD:persons[0].drugs[j].ArmCD,
                                    Arm:persons[0].drugs[j].Arm,
                                    PackSeq:persons[0].drugs[j].PackSeq,
                                    DrugExpryDTC:persons[0].drugs[j].DrugExpryDTC,
                                    DDrugNumRYN:persons[0].drugs[j].DDrugNumRYN,
                                    DDrugNumAYN:persons[0].drugs[j].DDrugNumAYN,
                                    DDrugDMNumYN:persons[0].drugs[j].DDrugDMNumYN,
                                    DDrugDMNum:persons[0].drugs[j].DDrugDMNum,
                                    DrugId:persons[0].drugs[j].DrugId,
                                    DrugDate:persons[0].drugs[j].DrugDate,
                                    UsedAddressId:persons[0].drugs[j].UsedAddressId,
                                    UsedCoreId:persons[0].drugs[j].UsedCoreId,
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