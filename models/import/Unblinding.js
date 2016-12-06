var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var UnblindingSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,    //研究编号
    "StudySeq" : String,    //研究序列号
    "SiteID" : String,    //中心编号
    "SiteNam" : String,    //中心名称
    "ScreenYN" : String,    //筛选结果
    "Users" : Object,//用户信息
    "site" : Object,//中心信息
    "study" : Object,//研究信息
    "UserNam" : Array, //申请人名称
    "UserMP" : Array, // 申请人手机号
    'Reason' : Array, // 揭盲原因
    'Causal' : Array, //因果关系
    'UnblindingType' : String,//揭盲类型
    "UnblApplDTC" : Date, //揭盲申请日期
    "UnblCoplDTC" : Date, //揭盲完成日期
    "ToExamineUsers" : Array,//审核人
    "ToExaminePhone" : Array,//审核人手机号
    "ToExamineType" : Array,//是通过还是拒绝
    "ToExamineDate" : Array, //审核时间
    "isStopIt" : String,//是否确定停止:0为正常,1为停止,2为取消停止
    "UnblindingUsers" : String,//确定操作人
    "UnblindingPhone" : String,//确定操作人手机号
    'UnblindingDate' : Date,//确定操作日期
    "UnblindingProcess" : Array,//操作流程,记录到了那一步
    "UnblindingProcessDates" : Array,//操作流程,记录到了那一步的时间
    "Date" : Date, //导入时间
});
UnblindingSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
UnblindingSchema.index({ "Date": 1});
UnblindingSchema.index({ "StudySeq": 1});
UnblindingSchema.index({ "StudyID": 1});

//model
var Unblinding = mongoose.model("Unblinding",UnblindingSchema);

module.exports = Unblinding;
