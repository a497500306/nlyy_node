/**
 * Created by maoli on 16/10/10.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var YSZDrugSchema = new mongoose.Schema({
    "id" : String,
    "drugs" : [],    //药物数据
    "Users" : Object,    //用户数据
    "Address" : Object,    //分配地址数据
    "Type" : Number,    //分配地址类型:1仓库,2中心
    'UsedAddress' : Object,//出发地
    'isSign' : Number,//是否签收:1已签收
    "Date" : Date, //导入时间
});
YSZDrugSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
YSZDrugSchema.index({ "Date": 1});
YSZDrugSchema.index({ "SiteID": 1});

//取出某研究某用户的所有运送中列表
YSZDrugSchema.statics.chazhaosuoyouYsz = function (UsedAddressId,UserId,callback) {
    console.log(UsedAddressId + UserId + callback)
    if (UsedAddressId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    if (UserId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    this.model('YSZDrug').find({'Users.id' : UserId , 'UsedAddress.id' : UsedAddressId, 'isSign' : 0}).sort({Data : 1}).exec(callback)
}
//取出某研究某用户的所有已送达列表
YSZDrugSchema.statics.chazhaosuoyouYSD = function (UsedAddressId,UserId,callback) {
    if (UsedAddressId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    if (UserId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    this.model('YSZDrug').find({'Users.id' : UserId , 'UsedAddress.id' : UsedAddressId, 'isSign' : 1}).sort({Data : 1}).exec(callback)
}
//取出某研究某用户的所有待签收列表
YSZDrugSchema.statics.chazhaosuoyouDQS = function (AddressId,callback) {
    if (AddressId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    this.model('YSZDrug').find({'Address.id' : AddressId, 'isSign' : 0}).sort({Data : 1}).exec(callback)
}
//取出某研究某用户的所有已签收列表
YSZDrugSchema.statics.chazhaosuoyouYQS = function (AddressId,callback) {
    if (AddressId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    this.model('YSZDrug').find({'Address.id' : AddressId, 'isSign' : 1}).sort({Data : 1}).exec(callback)
}
//model
var YSZDrug = mongoose.model("YSZDrug",YSZDrugSchema);

module.exports = YSZDrug;
