
var express = require("express");
var app = express();
var db = require("./models/db.js");
var session = require('express-session');
var login = require('./controller/login');//登录
var ImportData = require('./controller/ImportData');//导入数据
//打开发送邮件
// var Email = require('./models/EMail');//Email服务

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

//登录请求
app.post("/node/getHome",login.doHome);

//404错误
app.use('/',function (req, res) {
    console.log('404',req.url);
    res.send('404');
});

app.listen(3000);