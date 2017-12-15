var JPush = require("../node_modules/jpush-sdk/lib/JPush/JPush")
var client = JPush.buildClient('bec7fb0c8870478c9210027f', 'db40827553aec9653d5b32a0',null, false)
var users = require('../models/import/users');
exports.JPushPush = function (text,phone) {
    users.find({
        UserMP:phone
    },function (err, userData) {
        if (err == null){
            if (userData.length != 0){
                if (userData[0].registrationId != ''){
                    if (userData[0].registrationId != null){
                        if (userData[0].platform == 'ios'){
                            client.push().setPlatform('ios')
                                .setAudience(JPush.registration_id(userData[0].registrationId))
                                .setNotification('诺兰研究', JPush.ios(text,null,0))
                                .setMessage('[诺兰研究]')
                                .setOptions(null, 60,null,true)//设置生产环境
                                .send(function(err, res) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log(res)
                                    }
                                });
                        }else{
                            client.push().setPlatform('android')
                                .setAudience(JPush.registration_id(userData[0].registrationId))
                                .setNotification('诺兰研究', JPush.android(text, null, 1))
                                .setMessage('[诺兰研究]')
                                .setOptions(null, 60)
                                .send(function(err, res) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log(res)
                                    }
                                });
                        }
                    }
                }
            }
        }
    })
}