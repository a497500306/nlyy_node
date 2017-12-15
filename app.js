TopClient = require( './ALYZM/topClient' ).TopClient;
var client = new TopClient({
    'appkey' : '23783814' ,
    'appsecret' : '63636a89dacc578085f6045bc06d96bc' ,
    'REST_URL' : 'http://gw.api.taobao.com/router/rest'
});

var express = require("express");
var app = express();
var db = require("./models/db.js");
var session = require('express-session');
var login = require('./controller/login');//登录
var ImportData = require('./controller/ImportData');//导入数据
var fs = require('fs');
var appLogin = require('./controller/APPJK/appLogin')//app登录相关
var appTool = require('./controller/APPJK/appTool')//app查询相关
var appChangKu = require('./controller/APPJK/appChangKu')//app查询相关
var appSSZSJ = require('./controller/APPJK/appSSZSJ')//app查询相关
var appTzrz = require('./controller/APPJK/appTzrz')//app查询相关
var appYjxx = require('./controller/APPJK/appYjxx')//app查询相关
var appSFGL = require('./controller/APPJK/appSFGL')//app查询相关
var appHeartbeat = require('./controller/APPJK/appHeartbeat')//app查询相关
var appImageData = require('./controller/APPJK/appImageData')//图片管理模块
var drug = require('./models/import/drug')//药物号
var drugCK = require('./models/import/drugCK')//药物号
var drugGQ = require('./models/import/drugGQ')//药物号

var schedule = require("node-schedule");
var yytx = require('./models/import/yytx');
var study = require('./models/import/study');
var recordingSMS = require('./models/import/recordingSMS')

//时间操作
var moment = require('moment');
moment().format();
//打开发送邮件
var Email = require('./models/EMail');//Email服务

// Email.fasongxiujian({
//     from: "Fred Foo <497500306@qq.com>", // 发件地址
//     to: "2649325650@qq.com, 413945416@qq.com", // 收件列表
//     subject: "Hello world", // 标题
//     html: "<b>thanks a for visiting!</b> 世界，你好！" // html 内容
// })

app.set("view engine","ejs");

//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

//每天凌晨两点运行
var rule = new schedule.RecurrenceRule();

rule.dayOfWeek = [0, new schedule.Range(1, 6)];

rule.hour = 2;

rule.minute = 0;

schedule.scheduleJob(rule, function(){
    //查询所有药物号
    var dateStr = moment().subtract(1, 'days').format('YYYY-MM-DD');
    //取出所有昨天过期药物号
    drug.find({"DrugExpryDTC" : {$lt : new Date()}}, function (err, persons) {
        if (err == null){
            for (var i = 0 ; i < persons.length ; i++){
                var newDrug = persons[i];
                //全部移动到过期数据库
                drugGQ.create({
                    "StudyID" : newDrug.StudyID,    //研究编号
                    "DrugNum" : newDrug.DrugNum,    //药物号
                    "ArmCD" : newDrug.ArmCD,    //治疗分组代码
                    "Arm" : newDrug.Arm,   //治疗分组标签
                    "PackSeq" : newDrug.PackSeq,   //编盲编号批次
                    "DrugSeq" : newDrug.DrugSeq,  //药物流水号
                    "DrugExpryDTC" : newDrug.DrugExpryDTC, //药物有效期
                    "DrugDigits" : newDrug.DrugDigits, // 药物号位数
                    "StudyDCross" : newDrug.StudyDCross,//交叉设计数据
                    "DrugDose" : newDrug.StudyDCross,//药物剂量数据
                },function (error) {

                });
                //删除drug数据库中过期药物号
                drug.remove({id:newDrug.id},function(err,result){
                    if(err){
                        console.log(err);
                    }else{

                    }
                });
            }
        }
    })
    //移动所有仓库中的药物号
    drugCK.find({"DrugExpryDTC" : {$lt : new Date()}}, function (err, persons) {
        if (err == null){
            for (var i = 0 ; i < persons.length ; i++){
                var newDrug = persons[i];
                //全部移动到过期数据库
                drugGQ.create({
                    "StudyID" : newDrug.StudyID,    //研究编号
                    "DrugNum" : newDrug.DrugNum,    //药物号
                    "ArmCD" : newDrug.ArmCD,    //治疗分组代码
                    "Arm" : newDrug.Arm,   //治疗分组标签
                    "PackSeq" : newDrug.PackSeq,   //编盲编号批次
                    "DrugSeq" : newDrug.DrugSeq,  //药物流水号
                    "StudyDCross" : newDrug.StudyDCross,//交叉设计数据
                    "DrugDose" : newDrug.StudyDCross,//药物剂量数据
                    "DrugExpryDTC" : newDrug.DrugExpryDTC, //药物有效期
                    "DrugDigits" : newDrug.DrugDigits, // 药物号位数
                    "DDrugNumRYN" : newDrug.DDrugNumRYN, // 属于分仓库已接收的药物号
                    "DDrugNumAYN" : newDrug.DDrugNumAYN, // 属于分仓库已激活的药物号
                    "DDrugDMNumYN" : newDrug.DDrugDMNumYN, // 属于分仓库损坏和遗漏药物号
                    "DDrugUseAYN" : newDrug.DDrugUseAYN, // 是否使用:1使用
                    "DDrugUseID" : newDrug.DDrugUseID, // 使用者ID
                    "DDrugDMNum" : newDrug.DDrugDMNum,//分仓库损坏和遗漏药物号,已激活药物号对应的药物发现损坏或遗漏不见时，则对此药物号进行废弃
                    "DrugId" : newDrug.DrugId,//确认签收批次ID--对应数据库YSZDryg  id
                    "DrugDate" : newDrug.DrugDate,//批次时间YSZDryg  Date
                    "UsedAddressId" : newDrug.UsedAddressId, //是那个仓库
                    "UsedCoreId" : newDrug.UsedCoreId, //是那个中心
                },function (error) {

                });
                //删除drug数据库中过期药物号
                drugCK.remove({id:newDrug.id},function(err,result){
                    if(err){
                        console.log(err);
                    }else{

                    }
                });
            }
        }
    })


});

//定时任务,用于发送用药提醒等
var rule1 = new schedule.RecurrenceRule();
rule1.minute = 30;
schedule.scheduleJob(rule1, function(){
    //搜索所有30分钟的用药提醒
    var shi = moment().format('HH')
    //搜索用药提醒
    yytx.find({tuisong1:shi + ":" + 30,kaishiStr:{$lte:new Date()},jiesuStr:{$gte:new Date()}}).exec(function(err, randomPersons) {
        //异步转同步
        (function iterator(i){
            if (i == randomPersons.length){
                return;
            }
            study.find({'StudyID' : randomPersons[i].StudyID},function (err, studyData) {
                if (err != null){
                    iterator(i+1)
                }else if (studyData.length == 0){
                    iterator(i+1)
                }else if (studyData[0].StudDEMOYN == 1){
                    var phone = randomPersons[i].phone
                    client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                        'extend' : '' ,
                        'sms_type' : 'normal' ,
                        'sms_free_sign_name' : '诺兰医药科技' ,
                        'sms_param' : {
                            studyID:randomPersons[i].StudyID ,
                            yytx:randomPersons[i].tuisongnr1.replace('研究温馨提示：',''),
                            date:(moment().format('YYYY-MM-DD h:mm:ss a'))
                        } ,
                        'rec_num' :  randomPersons[i].phone  ,
                        'sms_template_code' : "SMS_63885566"
                    }, function(error, response) {
                        if (error != null){
                            console.log(error)
                            iterator(i+1)
                        }else{
                            //发送成功,添加到数据库
                            recordingSMS.create({
                                "StudyID" : randomPersons[i].StudyID,    //研究编号
                                "content" : "【诺兰医药科技】" + randomPersons[i].StudyID +  randomPersons[i].tuisongnr1 + '，' + "完成时间" + (moment().format('YYYY-MM-DD h:mm:ss a')),    //内容

                                "patient" : randomPersons[i].patient,    //用户信息

                                "users" : randomPersons[i].users,      //添加这信息
                                "type" : 1,       //1:药物推送短信,2:随访短信
                                "Date" : new Date(), //导入时间
                            },function () {
                                iterator(i+1)
                            })
                        }
                    });
                }else{
                    iterator(i+1)
                }
            })
        })(0);
    });
    yytx.find({tuisong2:shi + ":" + 30,kaishiStr:{$lte:new Date()},jiesuStr:{$gte:new Date()}}).exec(function(err, randomPersons) {
        //异步转同步
        (function iterator(i){
            if (i == randomPersons.length){
                return;
            }
            study.find({'StudyID' : randomPersons[i].StudyID},function (err, studyData) {
                if (err != null){
                    iterator(i+1)
                }else if (studyData.length == 0){
                    iterator(i+1)
                }else if (studyData[0].StudDEMOYN == 1){
                    var phone = randomPersons[i].phone
                    client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                        'extend' : '' ,
                        'sms_type' : 'normal' ,
                        'sms_free_sign_name' : '诺兰医药科技' ,
                        'sms_param' : {
                            studyID:randomPersons[i].StudyID ,
                            yytx:randomPersons[i].tuisongnr2.replace('研究温馨提示：',''),
                            date:(moment().format('YYYY-MM-DD h:mm:ss a'))
                        } ,
                        'rec_num' :  randomPersons[i].phone  ,
                        'sms_template_code' : "SMS_63885566"
                    }, function(error, response) {
                        if (error != null){
                            console.log(error)
                            iterator(i+1)
                        }else{
                            //发送成功,添加到数据库
                            recordingSMS.create({
                                "StudyID" : randomPersons[i].StudyID,    //研究编号
                                "content" : "【诺兰医药科技】" + randomPersons[i].StudyID + randomPersons[i].tuisongnr2 + '，' + "完成时间" + (moment().format('YYYY-MM-DD h:mm:ss a')),    //内容

                                "patient" : randomPersons[i].patient,    //用户信息

                                "users" : randomPersons[i].users,      //添加这信息
                                "type" : 1,       //1:药物推送短信,2:随访短信
                                "Date" : new Date(), //导入时间
                            },function () {
                                iterator(i+1)
                            })
                        }
                    });
                }else{
                    iterator(i+1)
                }
            })
        })(0);
    });
    yytx.find({tuisong3:shi + ":" + 30,kaishiStr:{$lte:new Date()},jiesuStr:{$gte:new Date()}}).exec(function(err, randomPersons) {
        //异步转同步
        (function iterator(i){
            if (i == randomPersons.length){
                return;
            }
            study.find({'StudyID' : randomPersons[i].StudyID},function (err, studyData) {
                if (err != null){
                    iterator(i+1)
                }else if (studyData.length == 0){
                    iterator(i+1)
                }else if (studyData[0].StudDEMOYN == 1){
                    var phone = randomPersons[i].phone
                    client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                        'extend' : '' ,
                        'sms_type' : 'normal' ,
                        'sms_free_sign_name' : '诺兰医药科技' ,
                        'sms_param' : {
                            studyID:randomPersons[i].StudyID ,
                            yytx:randomPersons[i].tuisongnr3.replace('研究温馨提示：',''),
                            date:(moment().format('YYYY-MM-DD h:mm:ss a'))
                        } ,
                        'rec_num' :  randomPersons[i].phone  ,
                        'sms_template_code' : "SMS_63885566"
                    }, function(error, response) {
                        if (error != null){
                            console.log(error)
                            iterator(i+1)
                        }else{
                            //发送成功,添加到数据库
                            recordingSMS.create({
                                "StudyID" : randomPersons[i].StudyID,    //研究编号
                                "content" : "【诺兰医药科技】" + randomPersons[i].StudyID +  randomPersons[i].tuisongnr3 + '，' + "完成时间" + (moment().format('YYYY-MM-DD h:mm:ss a')),    //内容

                                "patient" : randomPersons[i].patient,    //用户信息

                                "users" : randomPersons[i].users,      //添加这信息
                                "type" : 1,       //1:药物推送短信,2:随访短信
                                "Date" : new Date(), //导入时间
                            },function () {
                                iterator(i+1)
                            })
                        }
                    });
                }else{
                    iterator(i+1)
                }
            })
        })(0);
    });

});

var rule2 = new schedule.RecurrenceRule();
rule2.minute = 0;

var i = schedule.scheduleJob(rule2, function(){
    //搜索所有30分钟的用药提醒
    var shi = moment().format('HH')
    //搜索用药提醒
    yytx.find({tuisong1:shi + ":" + "00",kaishiStr:{$lte:new Date()},jiesuStr:{$gte:new Date()}}).exec(function(err, randomPersons) {
        //异步转同步
        (function iterator(i){
            if (i == randomPersons.length){
                return;
            }
            study.find({'StudyID' : randomPersons[i].StudyID},function (err, studyData) {
                if (err != null){
                    iterator(i+1)
                }else if (studyData.length == 0){
                    iterator(i+1)
                }else if (studyData[0].StudDEMOYN == 1){
                    var phone = randomPersons[i].phone
                    client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                        'extend' : '' ,
                        'sms_type' : 'normal' ,
                        'sms_free_sign_name' : '诺兰医药科技' ,
                        'sms_param' : {
                            studyID:randomPersons[i].StudyID ,
                            yytx:randomPersons[i].tuisongnr1.replace('研究温馨提示：',''),
                            date:(moment().format('YYYY-MM-DD h:mm:ss a'))
                        } ,
                        'rec_num' :  randomPersons[i].phone  ,
                        'sms_template_code' : "SMS_63885566"
                    }, function(error, response) {
                        if (error != null){
                            console.log(error)
                            iterator(i+1)
                        }else{
                            //发送成功,添加到数据库
                            recordingSMS.create({
                                "StudyID" : randomPersons[i].StudyID,    //研究编号
                                "content" : "【诺兰医药科技】" + randomPersons[i].StudyID + randomPersons[i].tuisongnr1 + '，' + "完成时间" + (moment().format('YYYY-MM-DD h:mm:ss a')),    //内容

                                "patient" : randomPersons[i].patient,    //用户信息

                                "users" : randomPersons[i].users,      //添加这信息
                                "type" : 1,       //1:药物推送短信,2:随访短信
                                "Date" : new Date(), //导入时间
                            },function () {
                                iterator(i+1)
                            })
                        }
                    });
                }else{
                    iterator(i+1)
                }
            })
        })(0);
    });
    yytx.find({tuisong2:shi + ":" + "00",kaishiStr:{$lte:new Date()},jiesuStr:{$gte:new Date()}}).exec(function(err, randomPersons) {
        //异步转同步
        (function iterator(i){
            if (i == randomPersons.length){
                return;
            }
            study.find({'StudyID' : randomPersons[i].StudyID},function (err, studyData) {
                if (err != null){
                    iterator(i+1)
                }else if (studyData.length == 0){
                    iterator(i+1)
                }else if (studyData[0].StudDEMOYN == 1){
                    var phone = randomPersons[i].phone
                    client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                        'extend' : '' ,
                        'sms_type' : 'normal' ,
                        'sms_free_sign_name' : '诺兰医药科技' ,
                        'sms_param' : {
                            studyID:randomPersons[i].StudyID ,
                            yytx:randomPersons[i].tuisongnr2.replace('研究温馨提示：',''),
                            date:(moment().format('YYYY-MM-DD h:mm:ss a'))
                        } ,
                        'rec_num' :  randomPersons[i].phone  ,
                        'sms_template_code' : "SMS_63885566"
                    }, function(error, response) {
                        if (error != null){
                            console.log(error)
                            iterator(i+1)
                        }else{
                            //发送成功,添加到数据库
                            recordingSMS.create({
                                "StudyID" : randomPersons[i].StudyID,    //研究编号
                                "content" : "【诺兰医药科技】" + randomPersons[i].StudyID + randomPersons[i].tuisongnr2 + '，' + "完成时间" + (moment().format('YYYY-MM-DD h:mm:ss a')),    //内容

                                "patient" : randomPersons[i].patient,    //用户信息

                                "users" : randomPersons[i].users,      //添加这信息
                                "type" : 1,       //1:药物推送短信,2:随访短信
                                "Date" : new Date(), //导入时间
                            },function () {
                                iterator(i+1)
                            })
                        }
                    });
                }else{
                    iterator(i+1)
                }
            })
        })(0);
    });
    yytx.find({tuisong3:shi + ":" + "00",kaishiStr:{$lte:new Date()},jiesuStr:{$gte:new Date()}}).exec(function(err, randomPersons) {
        //异步转同步
        (function iterator(i){
            if (i == randomPersons.length){
                return;
            }
            study.find({'StudyID' : randomPersons[i].StudyID},function (err, studyData) {
                if (err != null){
                    iterator(i+1)
                }else if (studyData.length == 0){
                    iterator(i+1)
                }else if (studyData[0].StudDEMOYN == 1){
                    var phone = randomPersons[i].phone
                    client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                        'extend' : '' ,
                        'sms_type' : 'normal' ,
                        'sms_free_sign_name' : '诺兰医药科技' ,
                        'sms_param' : {
                            studyID:randomPersons[i].StudyID ,
                            yytx:randomPersons[i].tuisongnr3.replace('研究温馨提示：',''),
                            date:(moment().format('YYYY-MM-DD h:mm:ss a'))
                        } ,
                        'rec_num' :  randomPersons[i].phone  ,
                        'sms_template_code' : "SMS_63885566"
                    }, function(error, response) {
                        if (error != null){
                            console.log(error)
                            iterator(i+1)
                        }else{
                            //发送成功,添加到数据库
                            recordingSMS.create({
                                "StudyID" : randomPersons[i].StudyID,    //研究编号
                                "content" : "【诺兰医药科技】" + randomPersons[i].StudyID + randomPersons[i].tuisongnr3 + '，' + "完成时间" + (moment().format('YYYY-MM-DD h:mm:ss a')),    //内容

                                "patient" : randomPersons[i].patient,    //用户信息

                                "users" : randomPersons[i].users,      //添加这信息
                                "type" : 1,       //1:药物推送短信,2:随访短信
                                "Date" : new Date(), //导入时间
                            },function () {
                                iterator(i+1)
                            })
                        }
                    });
                }else{
                    iterator(i+1)
                }
            })
        })(0);
    });
});

//路由中间件，静态页面
app.use(express.static("./public"));
app.use(express.static("./uploads"));
app.use(express.static("./assistant"));
app.use(express.static("./images"));
app.use(express.static("./voices"));
app.use(express.static("./public/upload/pay/"));

//测试界面
app.get("/cheshi",login.cheshi);

//登录界面
app.get("/admin",login.showAdmin);

//登录请求
app.post("/nlyy/login",login.doLogin);
//进入研究
app.post("/nlyy/enterStudy",login.enterStudy);
//选择研究列表
app.get("/selectStudy",login.showSelectStudy);
//管理首页
app.get('/home',login.showHome);
//修改密码
app.post('/node/resetPassword',login.doResetPassword);
//添加管理用户
app.post('/node/addAdminUser',login.addAdminUser);
/**************导入数据*****************/
//测试
app.post('/nlyy/wenjiancheshi',ImportData.wenjiancheshi);

//新增研究
app.post('/nlyy/addYzyj',ImportData.addYzyj);
//新增研究中心
app.post('/nlyy/addXzyjzx',ImportData.addXzyjzx);
//新增仓库
app.post('/nlyy/addXzck',ImportData.addXzck);
//设置管理用户
app.post('/nlyy/addSzhlyh',ImportData.addSzhlyh);
//导入用户数据
app.post('/nlyy/addDryhsj',ImportData.addDryhsj);
//导入药物号
app.post('/nlyy/addDrywh',ImportData.addDrywh);
//固定随机法导入随机号
app.post('/nlyy/addGdsjfdrsjh',ImportData.addGdsjfdrsjh);
//设置研究的随机化参数
app.post('/nlyy/addSzyjsjhcs',ImportData.addSzyjsjhcs);
//入选排除标准
app.post('/nlyy/addRxpcbz',ImportData.addRxpcbz);
//设置受试者随访参数
app.post('/nlyy/addSzsszsfcs',ImportData.addSzsszsfcs);
//设置申请人和审核人
app.post('/nlyy/addSzrwsqhsh',ImportData.addSzrwsqhsh);


//删除研究
app.post("/nlyy/deleteStudy",ImportData.deleteStudy);
//删除数据
app.post("/nlyy/deleteData",ImportData.deleteData);
//登录请求
app.post("/node/getHome",login.doHome);
//激活研究
app.post("/nlyy/activationStudy",ImportData.activationStudy);


/**************导出数据*****************/

//点击导出用户资料
app.post('/node/addDcyhzhzz',ImportData.addDcyhzhzz);

//点击导出图片资料
app.post('/node/addDctpzl',ImportData.addDctpzl);

//点击导出药物资料
app.post('/node/addDcyyywh',ImportData.addDcyyywh);

//点击导出随机资料
app.post('/node/addDcyysjh',ImportData.addDcyysjh);

//点击导出用户资料
app.post('/node/addDctpzl',ImportData.addDctpzl);

/*************APP接口******************/
//获取验证码接口
app.post("/app/getIDCode",appLogin.appIDCode);
//登录接口
app.post("/app/getLogin",appLogin.appLogin);
//获取研究方案和研究随机化参数数据
app.post("/app/getStudyAndResearchParameter",appLogin.appStudyAndResearchParameter);
//查询用户所有研究列表接口
app.post("/app/getStud",appTool.appGetStud);
//查询用户所有仓库接口
app.post("/app/getWarehouse",appTool.appGetWarehouse);
//查询某研究的所有分仓库
app.post("/app/getFengWarehouse",appTool.appGetFengWarehouse);
//查询某研究的所有中心
app.post("/app/getSite",appTool.appGetSite);
//确定按药物号个数分配
app.post("/app/getAssignYwhgsfp",appChangKu.appGetAssignYwhgsfp);
//取消按药物号个数分配
app.post("/app/getCancelYwhgsfp",appChangKu.appGetCancelYwhgsfp);
//按药物号个数分配
app.post("/app/getYwhgsfp",appChangKu.appGetYwhgsfp);
//智能分配
app.post("/app/getZnfp",appChangKu.appGetZnfp);
//逐个分配
app.post("/app/getZgfp",appChangKu.appGetZgfp);
//获取所有药物号
app.post("/app/getAllDrug",appChangKu.appGetAllDrug);
//区段分配
app.post("/app/getQdfp",appChangKu.appGetQdfp);
//逐个结合区段分配
app.post("/app/getZGJHQDQdfp",appChangKu.appGetZGJHQDQdfp);
//待运送药物清单列表
app.post("/app/getDysywqd",appChangKu.appGetDysywqd);
//确定运送待运送药物清单
app.post("/app/getAssignDysywqd",appChangKu.appGetAssignDysywqd);
//运送中药物清单列表
app.post("/app/getYszywqd",appChangKu.appGetYszywqd);
//待签收药物清单列表
app.post("/app/getDqsywqd",appChangKu.appGetDqsywqd);
//签收待签收药物清单
app.post("/app/getAssignDqsywqd",appChangKu.appGetAssignDqsywqd);
//以签收药物清单列表
app.post("/app/getYqsywqd",appChangKu.appGetYqsywqd);
//已送达药物清单列表
app.post("/app/getYsdywqd",appChangKu.appGetYsdywqd);
//全部激活某批次已签收仓库药物
app.post("/app/getAllOnActivation",appChangKu.getAllOnActivation);
//获取某批次已签收仓库药物列表
app.post("/app/getAllOnDrug",appChangKu.getAllOnDrug);
//激活选中的已签收的仓库药物
app.post("/app/getSelectedActivation",appChangKu.getSelectedActivation);
//废弃选中的已签收的仓库药物
app.post("/app/getSelectedAbandoned",appChangKu.getSelectedAbandoned);
//中心代签收药物清单
app.post("/app/getZXDqsywqd",appChangKu.getZXDqsywqd);
//获取中心仓管员信息
app.post("/app/getZXCGYData",appChangKu.getZXCGYData);
//中心已签收药物清单
app.post("/app/getZXYqsywqd",appChangKu.getZXYqsywqd);
//中心所有药物(已签收+代签收)清单
app.post("/app/getZXAllYwqd",appChangKu.getZXAllYwqd);
//中心药物号管理
app.post("/app/getZXYwhgl",appChangKu.getSelectedAbandoned);
//获取某中心某批次已签收仓库药物列表
app.post("/app/getZXAllOnDrug",appChangKu.getZXAllOnDrug);
//全部激活中心某批次已签收仓库药物
app.post("/app/getZXAllOnActivation",appChangKu.getZXAllOnActivation);
//中心药物使用情况
app.post("/app/getSiteDrugData",appChangKu.getSiteDrugData);
//查询药物号物流情况
app.post("/app/getDrugWLData",appChangKu.getDrugWLData);
//获取中心数据
app.post('/app/getSingleSite',appSSZSJ.getSite);
//判断中心是否停止入组
app.post('/app/getIsStopItSite',appSSZSJ.getIsStopItSite);
//添加受试者基础数据
app.post('/app/getAddBasicsData',appSSZSJ.getAddBasicsData);
//添加筛选成功受试者数据
app.post('/app/getAddSuccessBasicsData',appSSZSJ.getAddSuccessBasicsData);
//添加登记转成功受试者数据
app.post('/app/getAddBasisDataSuccessBasicsData',appSSZSJ.getAddBasisDataSuccessBasicsData);
//取随机号
app.post('/app/getRandomNumber',appSSZSJ.getRandomNumber);
//用药提醒
app.post('/app/getYytx',appSSZSJ.getYytx);
//补充药物号
app.post('/app/getBcywh',appSSZSJ.getBcywh);
//补充药物号考虑交叉设计
app.post('/app/getBcywhJcsj',appSSZSJ.getBcywhJcsj);
//补充药物号考虑药物剂量
app.post('/app/getBcywhYwjl',appSSZSJ.getBcywhYwjl);
//替换药物号
app.post('/app/getThywh',appSSZSJ.getThywh);
//替换药物号考虑交叉设计
app.post('/app/getThywhJcsj',appSSZSJ.getThywhJcsj);
//替换药物号考虑药物剂量
app.post('/app/getThywhYwjl',appSSZSJ.getThywhYwjl);
//中心所有以激活和未使用药物号
app.post('/app/getZXAllKYYwh',appSSZSJ.getZXAllYwh);
//查阅筛选失败例数分布
app.post('/app/getCysxsblsfb',appSSZSJ.getCysxsblsfb);
//查阅随机例数分布
app.post('/app/getCysjlsfb',appSSZSJ.getCysjlsfb);
//查阅退出或完成例数分布
app.post('/app/getCytchwclsfb',appSSZSJ.getCytchwclsfb);
//查阅退出或完成例数分布--单个中心
app.post('/app/getCytchwclsfbZX',appSSZSJ.getCytchwclsfbZX);

//添加筛选失败受试者基础数据
app.post('/app/getAddFailPatientData',appSSZSJ.getAddFailPatientData);
//添加登记受试者转失败受试者
app.post('/app/getAddBasisDataFailPatientData',appSSZSJ.getAddBasisDataFailPatientData);
//修改筛选失败受试者基础数据
app.post('/app/getUpdateFailPatientData',appSSZSJ.getUpdateFailPatientData);
//查找所有受试者
app.post('/app/getLookupSuccessBasicsData',appSSZSJ.getLookupSuccessBasicsData);
//模糊查询受试者
app.post('/app/getVagueBasicsData',appSSZSJ.getVagueBasicsData);
//模糊查询受试者User信息
app.post('/app/getVagueBasicsDataUser',appSSZSJ.getVagueBasicsDataUser);
//停止入组--查询中心
app.post('/app/getTzrzSite',appTzrz.getTzrzSite);
//停止入组--确定申请
app.post('/app/getApplyZXStopIt',appTzrz.getApplyZXStopIt);
//停止入组--待审核列表
app.post('/app/getZXStopItWaitForAudit',appTzrz.getZXStopItWaitForAudit);
//停止入组--审核操作
app.post('/app/getZXToExamine',appTzrz.getZXToExamine);
//停止入组--确定/拒绝停止入组
app.post('/app/getDetermineZXStopIt',appTzrz.getDetermineZXStopIt);
//停止入组--查询已停止入组列表
app.post('/app/getZXStopItTable',appTzrz.getZXStopItTable);
//停止入组--整个研究停止入组申请
app.post('/app/getApplyYJStopIt',appTzrz.getApplyYJStopIt);
//停止入组--整个研究待审核列表
app.post('/app/getYJStopItWaitForAudit',appTzrz.getYJStopItWaitForAudit);
//停止入组--整个研究审核操作
app.post('/app/getYJToExamine',appTzrz.getYJToExamine);
//停止入组--整个研究确定/拒绝停止入组
app.post('/app/getDetermineYJStopIt',appTzrz.getDetermineYJStopIt);
//研究下线--获取研究下线申请时相关数据
app.post('/app/getYjxxApplyData',appYjxx.getYjxxApplyData);
//研究下线--提交申请
app.post('/app/getYjxxApply',appYjxx.getYjxxApply);
//研究下线--待审核列表
app.post('/app/getYjxxApplyWaitForAudit',appYjxx.getYjxxApplyWaitForAudit);
//研究下线--审核操作
app.post('/app/getYjxxToExamine',appYjxx.getYjxxToExamine);
//研究下线--整个研究确定/拒绝下线
app.post('/app/getDetermineYjxxOffline',appYjxx.getDetermineYjxxOffline);
//研究下线--整个研究查询子研究受试者例数
app.post('/app/getZyjsszls',appYjxx.getZyjsszls);
//研究下线--整个研究查询延长期研究受试者例数
app.post('/app/getYcqyjsszls',appYjxx.getYcqyjsszls);

//添加受试者基线仿视日期
app.post('/app/getAddSszjxfsrq',appSFGL.getAddSszjxfsrq);
//查阅下阶段随访受试者
app.post('/app/getCyxjdnsfssz',appSFGL.getCyxjdnsfssz);
//发送预约随访短信
app.post('/app/getFsyysfdx',appSFGL.getFsyysfdx);
//发送受试者短信统计
app.post('/app/getSMSStatistics',appSFGL.getSMSStatistics);
//添加完成或退出受试者
app.post('/app/getAddOut',appSFGL.getAddOut);
//添加个人揭盲申请
app.post('/app/getUnblindingApplication',appSFGL.getUnblindingApplication);
//添加中心揭盲申请
app.post('/app/getSiteUnblindingApplication',appSFGL.getSiteUnblindingApplication);
//添加研究揭盲申请
app.post('/app/getStudyUnblindingApplication',appSFGL.getStudyUnblindingApplication);
//获取待揭盲列表
app.post('/app/getStayUnblindingApplication',appSFGL.getStayUnblindingApplication);
//获取待揭盲全部列表
app.post('/app/getAllStayUnblindingApplication',appSFGL.getAllStayUnblindingApplication);
//设置是否揭盲
app.post('/app/getIsUnblindingApplication',appSFGL.getIsUnblindingApplication);
//设置审批
app.post('/app/getTrialUnblindingApplication',appSFGL.getTrialUnblindingApplication);

/***************图片管理模块******************/
//查询模块组
app.post('/app/getImageModeulesList',appImageData.getImageModeulesList);
//查询页码组
app.post('/app/getImagePageNumberList',appImageData.getImagePageNumberList);
//查询页码上传人数统计
app.post('/app/getImagePageNumberListStatistics',appImageData.getImagePageNumberListStatistics);
//查询页码上传的人
app.post('/app/getImagePageNumberListUser',appImageData.getImagePageNumberListUser);
//添加一个模块组
app.post('/app/getAddImageModeulesList',appImageData.getAddImageModeulesList);
//查询一个模块组人数统计
app.post('/app/getAddImageModeulesListStatistics',appImageData.getAddImageModeulesListStatistics);
//查询某个模块组的人
app.post('/app/getAddImageModeulesListUser',appImageData.getAddImageModeulesListUser);

//添加一个页码
app.post('/app/getAddImagePageNumberList',appImageData.getAddImagePageNumberList);
//添加一张图片
app.post('/app/getAddImageUrls',appImageData.getAddImageUrls);
//删除一张图片
app.post('/app/getDeleteImageUrls',appImageData.getDeleteImageUrls);
//审核无误
app.post('/app/getReviewCorrect',appImageData.getReviewCorrect);
//撤销审核无误
app.post('/app/getRevokedReviewCorrect',appImageData.getRevokedReviewCorrect)
//添加质疑
app.post('/app/getAddQuestion',appImageData.getAddQuestion);
//撤销质疑
app.post('/app/getRevokedAddQuestion',appImageData.getRevokedAddQuestion);
//发送消息
app.post('/app/getSendAMessage',appImageData.getSendAMessage);
//质疑后重新提交审核
app.post('/app/getQuestionRevoked',appImageData.getQuestionRevoked);
//消息中心列表
app.post('/app/getNewsList',appImageData.getNewsList);
//消息标记为已读
app.post('/app/getNewsHaveRead',appImageData.getNewsHaveRead);
//显示中心联系人
app.post('/app/getShowSiteUsers',appImageData.getShowSiteUsers);

//图片上传
app.post('/app/imageUpdata',ImportData.imageUpdata);

//音频上传
app.post('/app/voiceUpdata',ImportData.voiceUpdata);


//长连接
app.post('/app/getHeartbeat',appHeartbeat.getHeartbeat);

//404错误
app.use('/',function (req, res) {
    console.log('404',req.url);
    res.send('404');
});

app.listen(3001);