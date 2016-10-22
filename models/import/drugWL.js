/**
 * Created by maoli on 16/10/10.
 */
var mongoose = require('mongoose');
var settings = require('../../settings');
var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
autoIncrement.initialize(mongoose.connection);   //初始化

//schema
var drugWLSchema = new mongoose.Schema({
    'id' : String,
    'StudyID' : String,
    'DrugNum' : String,
    'drugStrs' : Array,
    'drugDate' : Array,
});
drugWLSchema.plugin(autoIncrement.plugin, {
    model: 'Books',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});
//索引
drugWLSchema.index({ "StudyID": -1});
drugWLSchema.index({ "DrugNum": 1});


//model
var drugWL = mongoose.model("drugWL",drugWLSchema);

module.exports = drugWL;
