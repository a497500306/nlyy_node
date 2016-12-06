/**
 * Created by maoli on 16/10/8.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var ApplicationAndAuditSchema = new mongoose.Schema({
    "id" : String,
    'StudySeq' : String,//研究序列号
    'StudyID' : String,//研究编号
    'BlindSta' : String,//设盲状态
    'SponsorF' : String,//申办方全称
    'SponsorS' : String,//申办方简称
    'StudNameF' : String,//研究标题全称
    'StudNameS' : String,//研究标题简称
    'CoorPI' : String,//全国PI
    'UserNam' : String,//用户名
    'UserTyp' : String,//用户单位类别
    'UserFun' : String,//用户职责
    'UserSite' : String,//负责中心范围
    'UserDepot' : String,//负责仓库范围
    'UserEmail' : String,//用户邮箱
    'UserMP' : String,//用户手机
    'EventApp' : String,//申请任务类型
    'EventRev' : String,//审核任务类型
    'EventUnbApp' : String,//揭盲申请子类型
    'EventUnbRev' : String,//揭盲审核子类型
    'EventAppNum' : String,//申请人种类数
    'EventAppUsers' : String,//申请人
    'EventRevNum' : String,//审核人种类数
    'EventRevOrd' : String,//审核次序
    'EventRevUsers' : String,//审核人
    "Date" : Date, //导入时间
});
ApplicationAndAuditSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
ApplicationAndAuditSchema.index({ "Date": 1});
ApplicationAndAuditSchema.index({ "SiteID": 1});
ApplicationAndAuditSchema.index({"RandoNum":1});

//model
var ApplicationAndAudit = mongoose.model("ApplicationAndAudit",ApplicationAndAuditSchema);

module.exports = ApplicationAndAudit;
