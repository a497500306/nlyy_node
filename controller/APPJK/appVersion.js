var formidable = require('formidable');

exports.appDetectNewVersion = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log("版本号:" + JSON.stringify(fields))
        if (fields.version == null) {
            res.send({
                'isSucceed': 200,
                'msg': '传参错误'
            });
        }else{
            var version = parseInt(fields.version)
            console.log(version)

            //1.普通更新,2.强制更新
            if (version < 2){
                res.send({
                    'updateType': 2,
                    'title' : '发现新版本',
                    'text' : '做了一些优化',
                    'isSucceed': 400,
                    'msg': '正确'
                });
            }else{
                res.send({
                    'updateType': 0,
                    'title' : '是最新版本',
                    'text' : '是最新版本',
                    'isSucceed': 400,
                    'msg': '正确'
                });
            }
        }
    })
}