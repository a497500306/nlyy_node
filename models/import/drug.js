/**
 * Created by maoli on 16/10/8.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
var LSDug = require('./LSDrug');
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var drugSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,    //研究编号
    "DrugNum" : String,    //药物号
    "ArmCD" : String,    //治疗分组代码
    "Arm" : String,   //治疗分组标签
    "PackSeq" : String,   //编盲编号批次
    "DrugSeq" : Number,  //药物流水号
    "DrugExpryDTC" : Date, //药物有效期
    "DrugDigits" : Number, // 药物号位数
    "StudyDCross" : String,//交叉设计数据
    "DrugDose" : String,//药物剂量数据
    "Date" : Date, //导入时间
});
drugSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
drugSchema.index({ "SiteID": 1});
drugSchema.index({"DrugNum":1});
drugSchema.index({"DrugSeq":1});

//取出某研究所有药物号
drugSchema.statics.chazhaoyousuoYWH = function (StudyID,callback) {
    if (StudyID.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }else{
        //取出该研究中的所有药物号
        // this.model('drug').find({StudyID : StudyID},callback)
        this.model('drug').find({StudyID : StudyID}).sort({DrugNum : 1}).exec(callback)
    }
}

//通过ID查找药物号
drugSchema.statics.chazhaoIDYWH = function (id,callback) {
    //取出该研究中的所有药物号
    this.model('drug').find({id : id}).sort({DrugNum : 1}).exec(callback)
}

//把数据放入临时数据库
drugSchema.statics.fangruLSDrug = function (data,callback) {

}

//model
var drug = mongoose.model("drug",drugSchema);

module.exports = drug;
