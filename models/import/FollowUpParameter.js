/**
 * Created by maoli on 16/10/8.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var FollowUpParameterSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,    //研究编号
    "VisitNam" : String,   //访视期
    "VisitDy" : String,   //计划访视日
    "VisitonTrtYN" : String,//是否为仿视期还是停药期
    "VisitWk" : String,//访视周
    "VisitNum" : String,//访视次序
    "ArmCD" : String,//治疗分组代码
    "Arm" : String,//治疗分组标签
    "VisitDyL" : String,//计划访视日下限
    "VisitDyU" : String,//计划访视日上限
    "VisitTrtYN" : String,
    "Date" : Date, //导入时间
});
FollowUpParameterSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
FollowUpParameterSchema.index({ "Date": 1});
FollowUpParameterSchema.index({ "StudyID": 1});

//model
var FollowUpParameter = mongoose.model("FollowUpParameter",FollowUpParameterSchema);

module.exports = FollowUpParameter;
