/**
 * Created by maoli on 16/10/10.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var LSDrugSchema = new mongoose.Schema({
    "id" : String,
    "drugs" : [],    //药物数据
    "Users" : Object,    //用户数据
    "Address" : Object,    //分配地址数据
    "Type" : Number,    //分配地址类型:1仓库,2中心
    "Date" : Date, //导入时间
});
LSDrugSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
LSDrugSchema.index({ "Date": -1});
LSDrugSchema.index({ "SiteID": 1});


//model
var LSDrug = mongoose.model("LSDrug",LSDrugSchema);

module.exports = LSDrug;
