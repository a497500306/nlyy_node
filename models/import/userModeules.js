var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var userModeulesSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : {type : String , index : true },    //研究编号
    "Users" : Object, //添加的医生
    "Subjects" : Object, //受试者
    "CRFModeuType" : Number,//0位模块,1位页码
    "CRFModeulesName" : String,//研究名称
    "CRFModeulesNum" : Number,//个数
    "Date" : Date,
    "question" : Array,//质疑数据
    "questionDate" : Array,//质疑时间
    "questionImageUrls" : Array,//质疑的图片路径数组
    "imageUrls" : Array,//图片路径数组
    "imageType" : Number,//图片状态,0:没有上传图片,1:等待审核,2:正在审核,3:冻结,4:无用的,5:作废,6:质疑中
    "ReviewPhones" : Array,//审核过的用户
})

userModeulesSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});

//model
var userModeules = mongoose.model("userModeules",userModeulesSchema);

module.exports = userModeules;