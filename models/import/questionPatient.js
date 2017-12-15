var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var questionPatientSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,    //研究编号
    "addUsers" : Object, //添加这条数据的医生
    "Users" : Object, //质疑的医生
    "CRFModeule" : Object,//研究数据
    "GroupUsers" : Array,//群成员
    "Date" : Date,
    "voiceUrls" : String,//语音路径
    "text" : String,//内容
    "voiceType" : Number,//图片状态,0:未读,1:已读,2:已解决
});
questionPatientSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});

//model
var questionPatient = mongoose.model("questionPatient",questionPatientSchema);

module.exports = questionPatient;