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
    "SynchronizeUser" : Object, //同步的医生
    "CRFModeule" : Object,//研究数据
    "GroupUsers" : Array,//群成员
    "Date" : Date,
    "voiceUrls" : String,//语音路径
    "text" : String,//内容
    "voiceType" : Number,//图片状态,0:未读,1:已读
    "markType" : Number,//标记状态,0:未解决,1:已解决,2:不需要解决,3:取消标记
    "messageIDNum" : String,//消息识别号,用来记录是不是同一串消息,
    "serialNumber" : String,//流水号 研究编号+受试者编号+1
    "isSynchronizeMessage" : Boolean,//是否为同步后的数据
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