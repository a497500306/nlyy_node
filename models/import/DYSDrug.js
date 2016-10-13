/**
 * Created by maoli on 16/10/10.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var DYSDrugSchema = new mongoose.Schema({
    "id" : String,
    "drugs" : [],    //药物数据
    "Users" : Object,    //用户数据
    "Address" : Object,    //分配地址数据
    "Type" : Number,    //分配地址类型:1仓库,2中心
    'UsedAddress' : Object,//出发地
    'isDelivery' : Number,//是否发货:1已发货
    "Date" : Date, //导入时间
});
DYSDrugSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
DYSDrugSchema.index({ "Date": -1});
DYSDrugSchema.index({ "SiteID": 1});

//取出某研究某用户的所有待运送列表
DYSDrugSchema.statics.chazhaosuoyouDyslb = function (UsedAddressId,UserId,callback) {
    console.log('查找待运送')
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
    this.model('DYSDrug').find({'Users.id' : UserId , 'UsedAddress.id' : UsedAddressId, 'isDelivery' : 0}).sort('-id').exec(callback)
}
//model
var DYSDrug = mongoose.model("DYSDrug",DYSDrugSchema);

module.exports = DYSDrug;
