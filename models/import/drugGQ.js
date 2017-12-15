var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var drugGQSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,    //研究编号
    "DrugNum" : String,    //药物号
    "ArmCD" : String,    //治疗分组代码
    "Arm" : String,   //治疗分组标签
    "PackSeq" : String,   //编盲编号批次
    "DrugSeq" : Number,  //药物流水号
    "DrugExpryDTC" : Date, //药物有效期
    "DrugDigits" : Number, // 药物号位数
    "StudyDCross" : String,//交叉设计数据
    "DrugDose" : String,//药物剂量数据
    "DDrugNumRYN" : Number, // 属于分仓库已接收的药物号
    "DDrugNumAYN" : Number, // 属于分仓库已激活的药物号
    "DDrugDMNumYN" : Number, // 属于分仓库损坏和遗漏药物号
    "DDrugUseAYN" : Number, // 是否使用:1使用
    "DDrugUseID" : Number, // 使用者ID
    "DDrugDMNum" : Number,//分仓库损坏和遗漏药物号,已激活药物号对应的药物发现损坏或遗漏不见时，则对此药物号进行废弃
    "DrugId" : String,//确认签收批次ID--对应数据库YSZDryg  id
    "DrugDate" : Date,//批次时间YSZDryg  Date
    "UsedAddressId" : String, //是那个仓库
    "UsedCoreId" : String, //是那个中心
    "Date" : Date, //导入时间
});
drugGQSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
drugGQSchema.index({ "SiteID": 1});
drugGQSchema.index({"DrugNum":1});
drugGQSchema.index({"DrugSeq":1});
drugGQSchema.index({"DrugDate":1});
drugGQSchema.index({"DrugId":1});


//model
var drugGQ = mongoose.model("drugGQ",drugGQSchema);

module.exports = drugGQ;
