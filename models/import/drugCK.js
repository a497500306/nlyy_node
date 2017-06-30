/**
 * Created by maoli on 16/10/8.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
var LSDug = require('./LSDrug');
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var drugCKSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,    //研究编号
    "DrugNum" : String,    //药物号
    "ArmCD" : String,    //治疗分组代码
    "Arm" : String,   //治疗分组标签
    "PackSeq" : String,   //编盲编号批次
    "DrugSeq" : Number,  //药物流水号
    "DrugExpryDTC" : Date, //药物有效期
    "DrugDigits" : Number, // 药物号位数
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
drugCKSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
drugCKSchema.index({ "SiteID": 1});
drugCKSchema.index({"DrugNum":1});
drugCKSchema.index({"DrugSeq":1});
drugCKSchema.index({"DrugDate":1});
drugCKSchema.index({"DrugId":1});

//取出某仓库的所有药物号
drugCKSchema.statics.chazhaoyousuoYWH = function (DepotId,callback) {
    if (DepotId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }else{
        //取出该研究中的所有药物号
        // this.model('drug').find({StudyID : StudyID},callback)
        this.model('drugCK').find({UsedAddressId : DepotId}).sort({DrugNum : 1}).exec(callback)
    }
}
//取出某仓库的所有已激活药物号
drugCKSchema.statics.chazhaoyousuoYJHYWH = function (DepotId,callback) {
    if (DepotId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }else{
        //取出该研究中的所有药物号
        // this.model('drug').find({StudyID : StudyID},callback)
        this.model('drugCK').find({UsedAddressId : DepotId , DDrugNumAYN : 1, DDrugDMNumYN: {$ne:1}}).sort({DrugNum : 1}).exec(callback)
    }
}
//通过ID查找药物号
drugCKSchema.statics.chazhaoIDYWH = function (id,DepotId,callback) {
    //取出该研究中的所有药物号
    this.model('drugCK').find({id : id,UsedAddressId:DepotId}).sort({DrugNum : 1}).exec(callback)
}
//通过ID查找已激活药物号
drugCKSchema.statics.chazhaoIDYJHYWH = function (id,DepotId,callback) {
    //取出该研究中的所有药物号
    this.model('drugCK').find({id : id,UsedAddressId:DepotId,DDrugNumRYN : 1}).sort({DrugNum : 1}).exec(callback)
}
//取出某仓库某批次所有药物号
drugCKSchema.statics.chazhaomoupiciYWH = function (DrugId,UsedAddressId,callback) {
    if (DrugId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    if (UsedAddressId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    //取出该研究中的所有药物号
    // this.model('drug').find({StudyID : StudyID},callback)
    this.model('drugCK').find({DrugId : DrugId , UsedAddressId : UsedAddressId}).sort({DrugNum : 1}).exec(callback)
}
//取出某中心某批次所有药物号
drugCKSchema.statics.chazhaomoupiciZXYWH = function (DrugId,UsedCoreId,callback) {
    if (DrugId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    if (UsedCoreId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    //取出该研究中的所有药物号
    // this.model('drug').find({StudyID : StudyID},callback)
    this.model('drugCK').find({DrugId : DrugId , UsedCoreId : UsedCoreId}).sort({DrugNum : 1}).exec(callback)
}
//model
var drugCK = mongoose.model("drugCK",drugCKSchema);

module.exports = drugCK;
