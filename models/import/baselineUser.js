/**
 * Created by maoli on 16/9/3.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var baselineUserSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,//研究编号
    "SiteID" : String,//中心编号
    "userId" : String,//用户ID
    "user":{},//用户对象
    "isComplete":Number,//是否完成随访
    "isStopDrug":Number,//是否停药
    "stopDrugDate":Date,//停止用药日期
    "baselineDate":Date,//基线日期
    "Date" : Date, //导入时间
});
baselineUserSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
baselineUserSchema.index({ "Date": 1});



//model
var baselineUser = mongoose.model("baselineUser",baselineUserSchema);

module.exports = baselineUser;
