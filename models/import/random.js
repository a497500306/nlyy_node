/**
 * Created by maoli on 16/10/8.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var randomSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,    //研究编号
    "StratumN" : Number,    //分层结果代码:1=01中心既往未接受化疗者，2=01中心既往已接受化疗者，3=02中心既往未接受化疗者，4=02中心既
    // 往已接受化疗者，5=03中心既往未接受化疗者，6=03中心既往已接受化疗者，7=04中心既往未接受化疗者，8=04中心既往已接受化疗者，9=05中心既往未接受化疗者，
    // 10=06中心既往已接受化疗者。
    "StudyDs" : Number,    //研究设计:1=平行设计；2=交叉设计
    "StudyPeNum" : Number,   //研究阶段个数:适用于StudyDs=2；StudyDs=1不适用
    "CStudyPe" : Number,   //目前所处研究阶段:适用于StudyDs=2，其取值≤StudyPeNum；StudyDs=1不适用
    "Stratum" : String,  //分层结果:01中心既往未接受化疗者，01中心既往已接受化疗者，02中心既往未接受化疗者，02中心既往已接受化疗者，03中心既往未接受化疗者，03中心既往已接受化疗者，04中心既往未接受化疗者，04中心既往已接受化疗者，05中心既往未接受化疗者，05中心既往已接受化疗者。
    "BlockSeq" : Number, //层内区组号
    "SeqInBlock" : Number, // 区组内序号
    "RandoNum" : String, //随机号
    "ArmCD" : String, //治疗分组代码
    "Arm" : String, //治疗分组标签
    "Date" : Date, //导入时间
});
randomSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
randomSchema.index({ "Date": 1});
randomSchema.index({ "SiteID": 1});
randomSchema.index({"RandoNum":1});

//model
var random = mongoose.model("random",randomSchema);

module.exports = random;
