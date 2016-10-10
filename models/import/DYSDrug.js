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
    "Date" : Date, //导入时间
});
DYSDrugSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
DYSDrugSchema.index({ "Date": 1});
DYSDrugSchema.index({ "SiteID": 1});


//model
var DYSDrug = mongoose.model("DYSDrug",DYSDrugSchema);

module.exports = DYSDrug;
