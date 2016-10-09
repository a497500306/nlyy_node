/**
 * Created by maoli on 16/10/8.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var researchParameterSchema = new mongoose.Schema({
    "StudyID" : String,    //研究编号
    "StudySeq" : String,    //研究序列号
    "StudyDs" : Number,    //研究设计
    "StudyPeNum" : Number,   //研究阶段个数
    "RandoM" : Number,   //随机方法
    "BlindSta" : Number,  //设盲状态
    "DrugNSBlind" : Number, //单盲试验提供药物号
    "DrugNOpen" : Number, //开放试验提供药物号
    "NTrtGrp" : Number, //治疗组数
    "AlloRatio" : Number, //受试者分组比例
    "RandoSeed" : Number, //随机种子数
    "SizeInGrp" : Number, //可查询各组随机例数
    "SizeLInStraYN" : Number, //是否设置层内例数限制
    "SizeLInStra" : Number, //层内限制例数
    "SizeLInSiteYN" : Number, //是否设置中心最大例数限制
    "SizeLInSite" : Number, //中心最大例数限制
    "Nstra" : Number, //分层因素的个数
    "LabelStraA" : String, //第一个分层因素的标签
    "LabelStraB" : String, //第二个分层因素的标签
    "LabelStraC" : String, //第三个分层因素的标签
    "LabelStraD" : String, //第四个分层因素的标签
    "WeightStraA" : Number, //第一个分层因素的权重
    "WeightStraB" : Number, //第二个分层因素的权重
    "WeightStraC" : Number, //第三个分层因素的权重
    "WeightStraD" : Number, //第四个分层因素的权重
    "FormulaImSc" : Number, //不平衡分数算法
    "TrtSelMth" : Number, //随机选择治疗方法
    "HighProb" : Number, //指定概率法概率高值
    "LowProb" : Number, //指定概率法概率低值
    "SignRuleYN" : Number, //是否考虑分层因素完全重复（SIGN RULE）
    "ArmCDYN" : Number, //随机号是否导出治疗分组
    "RandoNumYN" : Number, //取随机号时是否显示随机号
    "DrugNumYN" : Number, //取随机号时是否显示药物号
    "ArmYN" : Number, //取随机号时是否显示分组情况
    "SubStudYN" : Number, //取随机号时是否显示随机抽中参加子研究
    "CStudyPeYN" : Number, //取随机号时是否显示目前研究阶段
    "Date" : Date, //导入时间
});
researchParameterSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
researchParameterSchema.index({ "Date": 1});
researchParameterSchema.index({ "SiteID": 1});
researchParameterSchema.index({"StudySeq":1});

//model
var researchParameter = mongoose.model("researchParameter",researchParameterSchema);

module.exports = researchParameter;