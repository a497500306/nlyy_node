var formidable = require('formidable');
var studyOffline = require('../../models/import/studyOffline');

exports.getHeartbeat = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        studyOffline.find({
            'StudyID' : fields.StudyID,
            'isOffline' : "1"
        },function (err,study) {
            if (err){
                res.send({
                    'isSucceed': 400,
                    'msg': '数据错误。'
                });
                return
            }
            if (study.length > 0){
                res.send({
                    'isSucceed': 222,
                    'msg': '研究已经下线。'
                });
                return
            }else{
                res.send({
                    'isSucceed': 400,
                    'msg': '研究没有下线。'
                });
                return
            }
        })
    })
}