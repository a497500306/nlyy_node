/**
 * Created by maoli on 16/9/22.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var usersSchema = new mongoose.Schema({
    "id" : String,
    "StudySeq": String,    //研究序列号
    "StudyID" : String,    //研究编号
    "SponsorF" : String,   //申办方全称
    "SponsorS" : String,   //申办方简称
    "StudNameF" : String,  //研究标题全程
    "StudNameS" : String,  //研究标题简称
    "CoorPI"    : String,  //全国PI
    "UserNam"   : String,  //用户名
    "UserAcc"  : String,   //账号
    "UserTyp" : String,    //用户单位类别
    "UserFun" : String,    //用户职责
    "UserSiteYN" : Number, //是否负责全部中心
    "UserSite" : String,   //具体负责中心的编号
    "UserDepotYN" : Number,//是否负责全部仓库
    "UserDepot" : String,  //具体负责仓库的编号
    "UserEmail" : String,  //用户邮箱
    "UserMP"  : String,    //用户手机号
    "UserPassword" : String, // 用户密码
    "platform"  : String,    //ios和安卓
    "registrationId"  : String,    //推送id
    "isSynchronizeMessage" : Boolean, //是否同步了消息
    "Date" : Date, //导入时间
});
usersSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
usersSchema.index({ "Date": 1});
usersSchema.index({ "UserMP": 1});
usersSchema.index({ "StudySeq": 1});
usersSchema.index({ "StudyID": 1});

//查找是否有该手机号的用户
usersSchema.statics.chazhaoPhone = function (phone, callback) {
    this.model('users').find({UserAcc : phone},callback)
}

//model
var users = mongoose.model("users",usersSchema);

module.exports = users;
