/**
 * Created by maoli on 16/9/3.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var addUnblindingApplicationSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,    //研究编号
    "SiteID" : String,//中心编号
    "userId" : String,//受试者id
    "SubjectID" : String,//受试者流水号
    "USubjectID" : String,//受试者编号
    "SubjectDOB" : String,//受试者出生日期
    "SubjectSex" : String,//受试者性别
    "SubjectIn" : String,//受试者姓名缩写
    "DSDE" : String,//完成状态
    "DSDECOD" : String,//完成代码
    "DSSTDAT" : Date,//完成或退出日期
    "DSCONT_OLE" : String,//参加延长期开放研究
    'Date' : Date, //导入时间
});
addUnblindingApplicationSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
addUnblindingApplicationSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'SubjID',
    startAt: 0,
    incrementBy: 1
});
//索引
addUnblindingApplicationSchema.index({ "Date": 1});

//model
var addUnblindingApplication = mongoose.model("addUnblindingApplication",addUnblindingApplicationSchema);

module.exports = addUnblindingApplication;