TopClient = require( './ALYZM/topClient' ).TopClient;
var client = new TopClient({
    'appkey' : '23500106' ,
    'appsecret' : '7938816533f3fc698534761d15d8f66b' ,
    'REST_URL' : 'http://gw.api.tbsandbox.com/router/rest'
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
var schedule = require("node-schedule");
var yytx = require('./models/import/yytx')
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

//定时任务,用于发送用药提醒等
var rule = new schedule.RecurrenceRule();

rule.minute = 30;

var j = schedule.scheduleJob(rule, function(){
    //搜索所有30分钟的用药提醒
    var shi = moment().format('HH')
    //搜索用药提醒
    yytx.find({tuisong1:shi + ":" + 30,kaishiStr:{$lte:new Date()},jiesuStr:{$gte:new Date()}}).exec(function(err, randomPersons) {
        console.log(randomPersons.length)
        for (var i = 0 ; i < randomPersons.length ; i++){
            client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                'extend' : '' ,
                'sms_type' : 'normal' ,
                'sms_free_sign_name' : '诺兰医药科技' ,
                'sms_param' : {
                    "yytx":randomPersons[i].tuisongnr1 ,
                } ,
                'rec_num' : randomPersons[i].phone ,
                'sms_template_code' : "SMS_27540231"
            }, function(error, response) {

            });
        }
    });
    yytx.find({tuisong2:shi + ":" + 30,kaishiStr:{$lte:new Date()},jiesuStr:{$gte:new Date()}}).exec(function(err, randomPersons) {
        console.log(randomPersons.length)
        for (var i = 0 ; i < randomPersons.length ; i++){
            client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                'extend' : '' ,
                'sms_type' : 'normal' ,
                'sms_free_sign_name' : '诺兰医药科技' ,
                'sms_param' : {
                    "yytx":randomPersons[i].tuisongnr2 ,
                } ,
                'rec_num' : randomPersons[i].phone ,
                'sms_template_code' : "SMS_27540231"
            }, function(error, response) {

            });
        }
    });
    yytx.find({tuisong3:shi + ":" + 30,kaishiStr:{$lte:new Date()},jiesuStr:{$gte:new Date()}}).exec(function(err, randomPersons) {
        console.log(randomPersons.length)
        for (var i = 0 ; i < randomPersons.length ; i++){
            client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                'extend' : '' ,
                'sms_type' : 'normal' ,
                'sms_free_sign_name' : '诺兰医药科技' ,
                'sms_param' : {
                    "yytx":randomPersons[i].tuisongnr3 ,
                } ,
                'rec_num' : randomPersons[i].phone ,
                'sms_template_code' : "SMS_27540231"
            }, function(error, response) {

            });
        }
    });

});

rule.minute = 1;

var i = schedule.scheduleJob(rule, function(){
    //搜索所有30分钟的用药提醒
    var shi = moment().format('HH')
    //搜索用药提醒
    yytx.find({tuisong1:shi + ":" + "00",kaishiStr:{$lte:new Date()},jiesuStr:{$gte:new Date()}}).exec(function(err, randomPersons) {
        console.log(randomPersons.length)
        for (var i = 0 ; i < randomPersons.length ; i++){
            client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                'extend' : '' ,
                'sms_type' : 'normal' ,
                'sms_free_sign_name' : '诺兰医药科技' ,
                'sms_param' : {
                    "yytx":randomPersons[i].tuisongnr1 ,
                } ,
                'rec_num' : randomPersons[i].phone ,
                'sms_template_code' : "SMS_16250342"
            }, function(error, response) {

            });
        }
    });
    yytx.find({tuisong2:shi + ":" + "00",kaishiStr:{$lte:new Date()},jiesuStr:{$gte:new Date()}}).exec(function(err, randomPersons) {
        console.log(randomPersons.length)
        for (var i = 0 ; i < randomPersons.length ; i++){
            client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                'extend' : '' ,
                'sms_type' : 'normal' ,
                'sms_free_sign_name' : '诺兰医药科技' ,
                'sms_param' : {
                    "yytx":randomPersons[i].tuisongnr2 ,
                } ,
                'rec_num' : randomPersons[i].phone ,
                'sms_template_code' : "SMS_16250342"
            }, function(error, response) {

            });
        }
    });
    yytx.find({tuisong3:shi + ":" + "00",kaishiStr:{$lte:new Date()},jiesuStr:{$gte:new Date()}}).exec(function(err, randomPersons) {
        console.log(randomPersons.length)
        for (var i = 0 ; i < randomPersons.length ; i++){
            client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
                'extend' : '' ,
                'sms_type' : 'normal' ,
                'sms_free_sign_name' : '诺兰医药科技' ,
                'sms_param' : {
                    "yytx":randomPersons[i].tuisongnr3 ,
                } ,
                'rec_num' : randomPersons[i].phone ,
                'sms_template_code' : "SMS_16250342"
            }, function(error, response) {

            });
        }
    });
});

//路由中间件，静态页面
app.use(express.static("./public"));
app.use(express.static("./uploads"));
app.use(express.static("./assistant"));
//登录界面
app.get("/admin",login.showAdmin);

//登录请求
app.post("/nlyy/login",login.doLogin);
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


//删除数据
app.post("/nlyy/deleteData",ImportData.deleteData);
//登录请求
app.post("/node/getHome",login.doHome);

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
//添加成功受试者基础数据
app.post('/app/getAddSuccessBasicsData',appSSZSJ.getAddSuccessBasicsData);
//取随机号
app.post('/app/getRandomNumber',appSSZSJ.getRandomNumber);
//用药提醒
app.post('/app/getYytx',appSSZSJ.getYytx);
//补充药物号
app.post('/app/getBcywh',appSSZSJ.getBcywh);
//替换药物号
app.post('/app/getThywh',appSSZSJ.getThywh);
//查阅筛选失败例数分布
app.post('/app/getCysxsblsfb',appSSZSJ.getCysxsblsfb);
//查阅随机例数分布
app.post('/app/getCysjlsfb',appSSZSJ.getCysjlsfb);
//查阅退出或完成例数分布
app.post('/app/getCytchwclsfb',appSSZSJ.getCytchwclsfb);

//添加筛选失败受试者基础数据
app.post('/app/getAddFailPatientData',appSSZSJ.getAddFailPatientData);
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
//设置是否揭盲
app.post('/app/getIsUnblindingApplication',appSFGL.getIsUnblindingApplication);
//设置审批
app.post('/app/getTrialUnblindingApplication',appSFGL.getTrialUnblindingApplication);

//404错误
app.use('/',function (req, res) {
    console.log('404',req.url);
    res.send('404');
});

app.listen(3000);