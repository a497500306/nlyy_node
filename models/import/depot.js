/**
 * Created by maoli on 16/9/3.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var depotSchema = new mongoose.Schema({
    "id" : String,
    "StudyID" : String,    //研究编号
    "DepotID" : String,    //仓库编号
    "DepotGNYN" : Number,//是否为主仓库:1是,0不是
    "DepotBrYN" : Number,//是否为分仓库:1是,0不是
    "DepotNam" : String,    //仓库名
    "DepotCity" : String,    //仓库所在城市
    "DepotAdd" : String,   //仓库详细地址
    "DepotZipC" : String,   //仓库邮编
    "DepotKper" : String,  //仓管员姓名
    "DepotMP"  : String,   //仓管员手机
    "DepotEmail" : String, //仓管员电子邮箱
    "Date" : Date, //导入时间
});
depotSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
depotSchema.index({ "Date": 1});

//查找用户所有仓库
depotSchema.statics.chazhaoChangku = function (StudyID, id,UserDepotYN,UserDepot, callback) {
    if (StudyID.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    if (UserDepotYN == 1){
        //取出该研究中的所有仓库
        this.model('depot').find({StudyID : StudyID},callback)
    }else if(UserDepotYN == 0){
        if (UserDepot.length != 0){
            //查询某一个仓库
            this.model('depot').find({DepotID : UserDepot,StudyID : StudyID},callback)
        }else{
            //UserDepot参数错误
            callback({
                'isSucceed' : 200,
                'msg' : 'UserDepot参数错误'
            },null)
        }
    }else{
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'UserDepotYN参数错误'
        },null)
    }
}

//model
var depot = mongoose.model("depot",depotSchema);

module.exports = depot;
