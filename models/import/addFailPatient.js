/**
 * Created by maoli on 16/9/3.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var addFailPatientSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,    //研究编号
    "SiteID" : String,//中心编号
    "ScreenYN" : Number,//筛选结果
    "ScreenNRea1" : String,//筛选失败原因1
    "ScreenNRea2" : String,//筛选失败原因1
    "ScreenNRea3" : String,//筛选失败原因1
    "ScreenNRea4" : String,//筛选失败原因1
    "SubjID" : String,//受试者流水号
    "USubjectID" : String,//受试者编号
    "SubjectDOB" : String,//受试者出生日期
    "SubjectSex" : String,//受试者性别
    "SubjectIn" : String,//受试者姓名缩写
    'DSSTDAT' : Date, //导入时间
});
addFailPatientSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
addFailPatientSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'SubjID',
    startAt: 0,
    incrementBy: 1
});
//索引
addFailPatientSchema.index({ "Date": 1});
//查找该研究中该手机号是否使用
addFailPatientSchema.statics.chazhaomouyanjiushouji = function (SubjMP,callback) {
    if (SubjMP.length == 0){
        //参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }else{
        //取出该研究中的所有分仓库
        this.model('addFailPatient').find({SubjMP : SubjMP},callback)
    }
}
//查找某研究某中心所有失败用户
addFailPatientSchema.statics.chazhaomouyanjiumouzhongxin = function (SiteID,StudyID,callback) {
    if (SiteID.length == 0){
        //参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }else{
        //取出该研究中的所有分仓库
        this.model('addFailPatient').find({SiteID : SiteID,StudyID : StudyID},callback)
    }
}
//model
var addFailPatient = mongoose.model("addFailPatient",addFailPatientSchema);

module.exports = addFailPatient;
