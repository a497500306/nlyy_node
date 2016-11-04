var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var studyOfflineSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,    //研究编号
    "UserNam" : String, //申请人名称

    "ToExamineUsers" : Array,//审核人
    "ToExaminePhone" : Array,//审核人手机号
    "ToExamineType" : Array,//是通过还是拒绝
    "ToExamineDate" : Array, //审核时间
    "isOffline" : String,//是否确定下线:0为正常,1为停止,2为取消停止
    "OfflineUsers" : String,//停止入组操作人
    "OfflinePhone" : String,//停止入组操作手机号
    "OfflineDate" : Date,//停止入组时间
    "Date" : Date, //导入时间
});
studyOfflineSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
studyOfflineSchema.index({ "Date": 1});
studyOfflineSchema.index({ "StudySeq": 1});
studyOfflineSchema.index({ "StudyID": 1});

//model
var studyOffline = mongoose.model("studyOffline",studyOfflineSchema);

module.exports = studyOffline;
