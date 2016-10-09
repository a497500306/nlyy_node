var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var siteSchema = new mongoose.Schema({
    "id":Number,           //研究ID
    "StudyID" : String,    //研究编号
    "SiteID" : String,    //中心编号
    "InvNam" : String,    //中心主要研究者
    "SiteCity" : String,   //中心所在城市
    "SiteAdd" : String,   //中心详细地址
    "SiteZipC" : String,  //中心邮编
    "SiteNam"  : String,   //中心名称
    "Date" : Date, //导入时间
});
siteSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
siteSchema.index({ "Date": 1});
siteSchema.index({ "SiteID": 1});

//查找所有中心
siteSchema.statics.chazhaozhongxin = function (StudyID,callback) {
    if (StudyID.length == 0){
        //参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }else{
        //取出该研究中的所有分仓库
        this.model('site').find({StudyID : StudyID},callback)
    }
}

//model
var site = mongoose.model("site",siteSchema);

module.exports = site;