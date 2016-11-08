/**
 * Created by maoli on 16/10/8.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var ExcludeStandardSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,    //研究编号
    "IECat" : String,
    "IECatn" : String,
    "IESEQ" : String,
    "IESCat" : String,
    "IETest" : String,
    "Date" : Date, //导入时间
});
ExcludeStandardSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
ExcludeStandardSchema.index({ "Date": 1});
ExcludeStandardSchema.index({ "StudyID": 1});

//model
var Exclude = mongoose.model("Exclude",ExcludeStandardSchema);

module.exports = Exclude;
