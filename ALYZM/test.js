/**
 * Module dependencies.
 */

TopClient = require('./topClient').TopClient;


var client = new TopClient({
    'appkey' : '23500106' ,
    'appsecret' : '7938816533f3fc698534761d15d8f66b' ,
    'REST_URL' : 'http://gw.api.taobao.com/router/rest'
});

client.execute('taobao.user.get',
              {
                  'fields':'nick,type,sex,location',
                  'nick':'sandbox_c_1'
              },
              function (error,response) {
                  if(!error)
                    console.log(response);
                  else
                    console.log(error);
              })