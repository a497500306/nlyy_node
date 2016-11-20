var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var yytxSchema = new mongoose.Schema({
    "id" : String,
    "Date" : Date, //导入时间
    //开始时间
    'kaishiStr' : Date,
    //结束时间
    'jiesuStr' : Date,
    //推送时间
    'tuisong1' : String,
    //推送内容
    'tuisongnr1' : String,
    //推送时间
    'tuisong2' : String,
    //推送内容
    'tuisongnr2' : String,
    //推送时间
    'tuisong3' : String,
    //推送内容
    'tuisongnr3' : String,
    //研究ID
    "StudyID" : String,    //研究编号
    //用户手机
    "phone" : String,//用户手机
});
yytxSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
yytxSchema.index({ "Date": 1});

//model
var yytx = mongoose.model("yytx",yytxSchema);

module.exports = yytx;