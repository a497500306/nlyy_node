var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var studyStopItSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,    //研究编号
    "UserNam" : String, //申请人名称
    "UserMP" : String, // 申请人手机号
    "UserEmail" : String, // 申请人电子邮箱
    "isMessage" : String, // 是否推送短信给全国PI
    "isMail" : String, // 是否推送邮件给全国PI
    "Reason" : String, //原因
    "ToExamineUsers" : Array,//审核人
    "ToExaminePhone" : Array,//审核人手机号
    "ToExamineType" : Array,//是通过还是拒绝
    "ToExamineDate" : Array, //审核时间
    "isStopIt" : String,//是否确定停止:0为正常,1为停止,2为取消停止
    "StopItUsers" : String,//停止入组操作人
    "StopItPhone" : String,//停止入组操作手机号
    "StopItDate" : Date,//停止入组时间
    "Date" : Date, //导入时间
});
studyStopItSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
studyStopItSchema.index({ "Date": 1});
studyStopItSchema.index({ "StudySeq": 1});
studyStopItSchema.index({ "StudyID": 1});

//model
var studyStopIt = mongoose.model("studyStopIt",studyStopItSchema);

module.exports = studyStopIt;
