var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var studySchema = new mongoose.Schema({
    "id" : Number,
    "StudySeq" : Number, // 研究序列号
    "StudyID" : String,    //研究编号
    "SponsorF" : String,   //申办方全称
    "SponsorS" : String,      //申办方简称
    "StudNameF" : String,     //研究标题全称
    "StudNameS": String,   //研究标题简称
    "CoorPIPhone": String,   //全国PI手机号
    "CoorPI": String,   //全国PI
    "CoorPIEMail": String,   //全国PI邮箱
    "TherArea": String,   //治疗领域
    "StudyPh": Number,   //研究分期 1=I期，2=II期，3=III期，4=IV期，5=生物等效性，9=其他
    "StudySize": Number,   //研究总样本量
    "AccrualCmpYN": Number,   //受试者入组是否中心之间竞争  1=是；0=否
    "AccrualPerS": Number,   //中心平均入组例数
    "AccrualT": Number,   //研究总招募月数
    "AccrualConf": Number,   //研究招募信心度
    "ExtStudYN" : Number, //是否有延长期研究
    "SubStudYN" : Number, //是否有子研究
    "SubStudInYN" : Number, //参加子研究是否是随机抽取
    "StudOnlineYN" : Number, //研究是否在线
    "StudDEMOYN" : Number, //属于演示版研究
    "StudSimuYN" : Number, //属于真实研究模拟版

    "StudStopItType" : String, //该研究停止入组模式:1:中心全部停止入组,2:研究同意停止入组
    "StudIsStopIt" : String, //该研究是否停止入组
    "StudStopItUsers" : String, //停止入组操作人
    "StudStopItPhone" : String, //停止入组操作手机号
    "StudStopItDate" : Date,//停止入组时间
    "Date" : Date, //导入时间
});
studySchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
studySchema.index({ "Date": 1});
studySchema.index({ "StudySeq": 1});
studySchema.index({ "StudyID": 1});

//model
var study = mongoose.model("study",studySchema);

module.exports = study;
