/**
 * Created by maoli on 16/9/3.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var depotSchema = new mongoose.Schema({
    "StudyID" : String,    //研究编号
    "DepotID" : String,    //仓库编号
    "isTotalDepot" : Number,//是否为主仓库:1是,0不是
    "DepotNam" : String,    //仓库名
    "DepotCity" : String,    //仓库所在城市
    "DepotAdd" : String,   //仓库详细地址
    "DepotZipC" : String,   //仓库邮编
    "DepotKper" : String,  //仓管员姓名
    "DepotMP"  : String,   //仓管员手机
    "DepotEmail" : String, //仓管员电子邮箱
    "Date" : Date, //导入时间
});
depotSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'DepotID',
    startAt: 0,
    incrementBy: 1
});
//索引
depotSchema.index({ "Date": 1});

//model
var depot = mongoose.model("depot",depotSchema);

module.exports = depot;
