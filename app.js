
var express = require("express");
var app = express();
var db = require("./models/db.js");
var session = require('express-session');
var login = require('./controller/login');

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

//404错误
app.use('/',function (req, res) {
    console.log('404');
    res.send('404');
});
app.listen(3000);