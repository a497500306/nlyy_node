/**
 * Created by maoli on 16/9/3.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var addOutPatientSchema = new mongoose.Schema({
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
addOutPatientSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
addOutPatientSchema.index({ "Date": 1});

//model
var addOutPatient = mongoose.model("addOutPatient",addOutPatientSchema);

module.exports = addOutPatient;
