/**
 * Created by maoli on 16/9/2.
 */
var nodemailer = require("nodemailer");

// 开启一个 SMTP 连接池
var smtpTransport = nodemailer.createTransport("SMTP",{
    host: "smtp.qq.com", // 主机
    secureConnection: true, // 使用 SSL
    port: 465, // SMTP 端口
    auth: {
        user: "k13918446402@qq.com", // 账号
        pass: "alocyruycopabheb" // 密码
    }
});

// 设置邮件内容
// var mailOptions = {
//     from: "Fred Foo <497500306@qq.com>", // 发件地址
//     to: "2649325650@qq.com, 413945416@qq.com", // 收件列表
//     subject: "Hello world", // 标题
//     html: "<b>thanks a for visiting!</b> 世界，你好！" // html 内容
// }

// 发送邮件
exports.fasongxiujian = function (mailOptions) {
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log("错误" + error);
        }else{
            console.log("Message sent: " + response.message);
        }
        smtpTransport.close(); // 如果没用，关闭连接池
    });
}