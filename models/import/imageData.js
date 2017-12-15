/**
 * Created by maoli on 16/10/10.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var ImageDataSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,    //研究编号
    "imageUrl" : String,    //图片地址
    "isAbandoned" : Number,//是否废弃
    "successPatientPhone" : String,//受试者手机号
    "successUSubjID" : String,//受试者手机号
    "uploadUserPhone" : String,//上传手机号
    "uploadName" : String,//上传的名字
    "Date" : Date, //导入时间
});
ImageDataSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});

//model
var imageData = mongoose.model("imageData",ImageDataSchema);

module.exports = imageData;
