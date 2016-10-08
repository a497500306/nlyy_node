/**
 * Created by maoli on 16/10/8.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var drugSchema = new mongoose.Schema({
    "StudyID" : String,    //研究编号
    "DrugNum" : String,    //药物号
    "ArmCD" : String,    //治疗分组代码
    "Arm" : String,   //治疗分组标签
    "PackSeq" : String,   //编盲编号批次
    "DrugSeq" : String,  //药物流水号
    "DrugExpryDTC" : String, //药物有效期
    "DrugDigits" : Number, // 药物号位数
    "Date" : Date, //导入时间
});
drugSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
drugSchema.index({ "Date": 1});
drugSchema.index({ "SiteID": 1});
drugSchema.index({"DrugNum":1});
drugSchema.index({"DrugSeq":1});

//model
var drug = mongoose.model("drug",drugSchema);

module.exports = drug;
