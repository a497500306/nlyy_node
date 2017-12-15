var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var recordingSMSSchema = new mongoose.Schema({
    "id":Number,           //ID
    "StudyID" : String,    //研究编号
    "content" : String,    //内容

    "patient" : Object,    //用户信息

    "users" : Object,      //添加这信息
    "type" : Number,       //1:药物推送短信,2:随访短信
    "Date" : Date, //导入时间
});
recordingSMSSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
recordingSMSSchema.index({ "Date": 1});
recordingSMSSchema.index({ "SiteID": 1});

//model
var recordingSMS = mongoose.model("recordingSMS",recordingSMSSchema);

module.exports = recordingSMS;