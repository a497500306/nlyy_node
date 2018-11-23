/**
 * Created by maoli on 16/9/3.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var addSuccessPatientSchema = new mongoose.Schema({
    "id" : String,
    "StudySeq" : String,    //研究序列号
    "StudyID" : String,    //研究编号
    "SiteID" : String,//中心编号
    "SiteNam" : String,//中心名称
    "ScreenYN" : Number,//筛选结果
    "SubjID" : String,//受试者流水号
    "USubjID" : String,//受试者编号  由中心编号和受试者流水号合并而成；整个研究内受试者编号唯一
    "SubjDOB" : String,//受试者出生日期
    "SubjSex" : String,//受试者性别
    "SubjIni" : String,//受试者姓名缩写
    "SubjMP" : String,//受试者手机
    "RandoM" : Number,//随机方法
    "SubjFa" : String,//随机分层因素a
    "SubjFb" : String,//随机分层因素b
    "SubjFc" : String,//随机分层因素c
    "SubjFd" : String,//随机分层因素d
    "SubjFe" : String,//随机分层因素e
    "SubjFf" : String,//随机分层因素f
    "SubjFg" : String,//随机分层因素g
    "SubjFh" : String,//随机分层因素h
    "SubjFi" : String,//随机分层因素i
    "Random" : String,//随机号

    "RandoDoer" : String,//完成随机者user id
    "baselineDate":Date,//基线仿视日期
    "stopDrugDate":Date,//停止用药日期
    "Arm" : String, //治疗分组标签
    "Drug" : Array,//药物号数组
    "StudyDCross" : Array,//交叉设计数据
    "DrugDose" : Array,//药物剂量数据
    "DrugDoer" : Array,//取药物号者ID
    "DrugDate" : Array,//取药物号时间数组
    "SubjStudYN" : String,//受试者是否参加子研究
    "isUnblinding" : String,//是否揭盲
    "UnblindingType" : String,//揭盲类型
    "UnblindingDate" : Date, //揭盲时间
    "isOut" : String,//是否完成或退出
    'isBasicData' : Number,//是否为基础数据,1为是
    "Date" : Date, //导入时间
    "RandomDate" : Date,//操作取随机号的时间, 成功失败都会记录
    "RandomUserPhone" : String,//随机操作者手机号
});
addSuccessPatientSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
addSuccessPatientSchema.index({ "Date": 1});

//查找该研究中该手机号是否使用
addSuccessPatientSchema.statics.chazhaomouyanjiushouji = function (SubjMP,callback) {
    if (SubjMP.length == 0){
        //参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }else{
        //取出该研究中的所有分仓库
        this.model('addSuccessPatient').find({SubjMP : SubjMP},callback)
    }
}
//查找某研究某中心所有成功受试者
addSuccessPatientSchema.statics.chazhaomouyanjiumouzhongxin = function (SiteID,StudyID,callback) {
    if (SiteID.length == 0){
        //参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }else{
        console.log('获取成功列表')
        //取出该研究中的所有分仓库
        this.model('addSuccessPatient').find({SiteID : SiteID,StudyID : StudyID}).sort('-USubjID').exec(callback)
    }
}
//model
var addSuccessPatient = mongoose.model("addSuccessPatient",addSuccessPatientSchema);

module.exports = addSuccessPatient;
