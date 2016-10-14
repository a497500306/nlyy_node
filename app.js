
var express = require("express");
var app = express();
var db = require("./models/db.js");
var session = require('express-session');
var login = require('./controller/login');//登录
var ImportData = require('./controller/ImportData');//导入数据

var appLogin = require('./controller/APPJK/appLogin')//app登录相关
var appTool = require('./controller/APPJK/appTool')//app查询相关
var appChangKu = require('./controller/APPJK/appChangKu')//app查询相关
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

//路由中间件，静态页面
app.use(express.static("./public"));
app.use(express.static("./uploads"));
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

//登录请求
app.post("/node/getHome",login.doHome);

/*************APP接口******************/
//获取验证码接口
app.post("/app/getIDCode",appLogin.appIDCode);
//登录接口
app.post("/app/getLogin",appLogin.appLogin);
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

//404错误
app.use('/',function (req, res) {
    console.log('404',req.url);
    res.send('404');
});

app.listen(3000);