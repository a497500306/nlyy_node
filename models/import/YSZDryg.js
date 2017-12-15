/**
 * Created by maoli on 16/10/10.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var YSZDrugSchema = new mongoose.Schema({
    "id" : String,
    "drugs" : [],    //药物数据
    "Users" : Object,    //用户数据
    "Address" : Object,    //分配地址数据
    "Type" : Number,    //分配地址类型:1仓库,2中心
    'UsedAddress' : Object,//出发地
    'isSign' : Number,//是否签收:1已签收
    'SignDate' : Date,//签收时间
    "Date" : Date, //导入时间
});
YSZDrugSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
YSZDrugSchema.index({ "Date": -1});
YSZDrugSchema.index({ "SiteID": 1});

//取出某研究某用户的所有运送中列表
YSZDrugSchema.statics.chazhaosuoyouYsz = function (UsedAddressId,UserMP,callback) {
    console.log(UsedAddressId + UserMP + callback)
    if (UsedAddressId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    if (UserMP.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    this.model('YSZDrug').find({'Users.UserMP' : UserMP , 'UsedAddress.id' : UsedAddressId, 'isSign' : 0}).sort('-id').exec(callback)
}
//取出某研究某用户的所有已送达列表
YSZDrugSchema.statics.chazhaosuoyouYSD = function (UsedAddressId,UserMP,callback) {
    if (UsedAddressId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    if (UserMP.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    this.model('YSZDrug').find({'Users.UserMP' : UserMP , 'UsedAddress.id' : UsedAddressId, 'isSign' : 1}).sort('-id').exec(callback)
}
//取出某研究某用户的所有待签收列表
YSZDrugSchema.statics.chazhaosuoyouDQS = function (AddressId,callback) {
    if (AddressId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    this.model('YSZDrug').find({'Address.id' : AddressId, 'isSign' : 0, 'Type' : 1}).sort('-id').exec(callback)
}
//取出某研究某用户的所有已签收列表
YSZDrugSchema.statics.chazhaosuoyouYQS = function (AddressId,callback) {
    if (AddressId.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    this.model('YSZDrug').find({'Address.id' : AddressId, 'isSign' : 1 , 'Type' : 1}).sort('-id').exec(callback)
}

//取出某研究某中心某用户的所有待签收列表
YSZDrugSchema.statics.chazhaosuoyouZXDQS = function (StudyID,UserSiteYN,UserSite,callback) {
    if (StudyID.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    if (UserSiteYN == 1){//是否负责全部中心
        this.model('YSZDrug').find({'Address.StudyID' : StudyID, 'isSign' : 0 , 'Type' : 2}).sort('-id').exec(callback)
    }else{
        if (UserSite.indexOf(',') != -1){

            var siteIDs = UserSite.split(",");
            var findJson = {$or:[]};
            for (var i = 0 ; i < siteIDs.length ; i++){
                findJson.$or.push(
                    {
                        'Address.StudyID' : StudyID,'Address.SiteID': siteIDs[i],'isSign' : 0 , 'Type' : 2
                    }
                )
            }
            this.model('YSZDrug').find(findJson).sort('-id').exec(callback)
        }else{
            this.model('YSZDrug').find({'Address.StudyID' : StudyID,'Address.SiteID': UserSite, 'isSign' : 0 , 'Type' : 2}).sort('-id').exec(callback)
        }
    }
}
//取出某研究某用户的所有已签收列表
YSZDrugSchema.statics.chazhaosuoyouZXYQS = function (StudyID,UserSiteYN,UserSite,callback) {
    if (StudyID.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    if (UserSiteYN == 1){//是否负责全部中心
        this.model('YSZDrug').find({'Address.StudyID' : StudyID, 'isSign' : 1 , 'Type' : 2}).sort('-id').exec(callback)
    }else{
        if (UserSite.indexOf(',') != -1){

            var siteIDs = UserSite.split(",");
            var findJson = {$or:[]};
            for (var i = 0 ; i < siteIDs.length ; i++){
                findJson.$or.push(
                    {
                        'Address.StudyID' : StudyID,'Address.SiteID': siteIDs[i],'isSign' : 1 , 'Type' : 2
                    }
                )
            }
            this.model('YSZDrug').find(findJson).sort('-id').exec(callback)
        }else{
            this.model('YSZDrug').find({'Address.StudyID' : StudyID,'Address.SiteID': UserSite, 'isSign' : 1 , 'Type' : 2}).sort('-id').exec(callback)
        }
    }
}

//取出某研究某用户的所有列表
YSZDrugSchema.statics.chazhaosuoyouZXQD = function (StudyID,UserSiteYN,UserSite,callback) {
    if (StudyID.length == 0){
        //UserDepotYN参数错误
        callback({
            'isSucceed' : 200,
            'msg' : 'StudyID参数错误'
        },null)
        return;
    }
    if (UserSiteYN == 1){//是否负责全部中心
        this.model('YSZDrug').find({'Address.StudyID' : StudyID, 'Type' : 2}).sort('-id').exec(callback)
    }else{
        if (UserSite.indexOf(',') != -1){

            var siteIDs = UserSite.split(",");
            var findJson = {$or:[]};
            for (var i = 0 ; i < siteIDs.length ; i++){
                findJson.$or.push(
                    {
                        'Address.StudyID' : StudyID,'Address.SiteID': siteIDs[i] , 'Type' : 2
                    }
                )
            }
            this.model('YSZDrug').find(findJson).sort('-id').exec(callback)
        }else{
            this.model('YSZDrug').find({'Address.StudyID' : StudyID,'Address.SiteID': UserSite, 'Type' : 2}).sort('-id').exec(callback)
        }
    }
}
//model
var YSZDrug = mongoose.model("YSZDrug",YSZDrugSchema);

module.exports = YSZDrug;
