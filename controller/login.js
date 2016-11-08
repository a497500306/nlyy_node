var formidable = require('formidable');
var settings = require("../settings");

var dbHelper = require('../models/dbHelper');

var adminUser = require("../models/adminUsers");//管理用户
var study = require("../models/import/study");//新增研究
var site = require("../models/import/site");//新增研究中心
var depot = require("../models/import/depot");//新增仓库
var random = require("../models/import/random");//新增固定随机法随机号
var ExcludeStandard = require("../models/import/ExcludeStandard");//新增固定随机法随机号
var drug = require("../models/import/drug");//新增药物号
var users = require('../models/import/users');//导入用户数据
var researchParameter = require('../models/import/researchParameter');//设置研究的随机化参数

//显示登录界面
exports.showAdmin = function (req, res, next) {
    res.render("./login");
}

//修改密码
exports.doResetPassword = function (req, res, next) {
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //搜索用户名
        adminUser.find({"name" : req.session.name},function (err, result) {
            console.log(result[0]["password"],fields["usedPassword"]);
            if (result[0]["password"] == fields["usedPassword"]) {
                result[0]["password"] = fields["newPassword"]
                result[0].save(function (error) {
                    if (error){
                        res.send({
                            'isSucceed' : "200",
                            'msg' : '修改失败'
                        });
                        return;
                    }
                    res.send({
                        'isSucceed' : "1",
                        'msg' : '修改成功'
                    });
                    return;
                })
            }else{//初始密码填写错误
                res.send({
                    'isSucceed' : "200",
                    'msg' : '旧密码不匹配'
                });
                return;
            }
        });
    })
}

//添加管理用户
exports.addAdminUser = function (req, res, next) {
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields);
        //查找是否有该用户
        adminUser.find({"name":fields["name"]},function (err, result) {
            if (result.length == 0 ){//没有该用户
                adminUser.create(fields,function (error) {
                    if (error){
                        res.send({
                            'isSucceed' : "200",
                            'msg' : '保存失败'
                        });
                        return;
                    }
                    res.send({
                        'isSucceed' : "1",
                        'msg' : '保存成功'
                    });
                    return;
                });
            }else{//改用户被注册
                res.send({
                    'isSucceed' : "200",
                    'msg' : '改用户被注册'
                });
                return;
            }
        })
    })
}


//登录交互
exports.doLogin = function (req, res, next) {
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields);
        adminUser.find(fields,function (err, result) {
            console.log(result);
            if (result.length == 1){
                //登录成功
                //成功后返回
                //记录session
                req.session.login = "1";
                req.session.name = result[0].name;
                req.session.read = result[0].read;
                req.session.write = result[0].write;
                req.session.addUser = result[0].addUser;
                res.send({
                    'isSucceed' : "1",
                    'msg' : '成功',
                    'url' : settings.fwqUrl + '/home',
                    'addUser' : req.session.addUser
                });
                return;
            }else{
                res.send({
                    'isSucceed' : "3",
                    'msg' : '账号或密码错误'
                });
                return;
            }
        })
    })
}

//进入管理界面
exports.showHome = function (req, res, next) {
    if(req.session.login!= '1'){
        res.render("login");
        return;
    }
    console.log("进来了");
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        console.log(fields);
    });

        res.render("mshome",{
            "userName": req.session.name
    });
}

//管理页面获取网络请求
exports.doHome = function (req, res, next) {
    if(req.session.login!= '1'){
        res.render("./login");
        return;
    }
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        if (fields.id == "xzyj"){//新增研究
            var keys = ['研究序列号','研究编号','申办方全称','申办方简称','研究标题全称','研究标题简称','全国PI手机号',
                '全国PI','全国PI邮箱','治疗领域','研究分期','研究总样本量'
                ,'受试者入组是否中心之间竞争','中心平均入组例数','研究总招募月数','研究招募信心度','是否有延长期研究','是否有子研究','参加子研究是否是随机抽取',
                '研究是否在线','属于演示版研究','属于真实研究模拟版','添加时间','操作'];
            var keyEn = ['StudySeq','StudyID','SponsorF','SponsorS','StudNameF','StudNameS','CoorPIPhone','CoorPI',
                'CoorPIEMail','TherArea','StudyPh','StudySize','AccrualCmpYN'
                ,'AccrualPerS','AccrualT','AccrualConf','ExtStudYN','SubStudYN','SubStudInYN','StudOnlineYN',
                'StudDEMOYN','StudSimuYN','Date','操作'];
            showTable(fields, res , req ,study , keys , keyEn , "/nlyy/addYzyj");

        }else if(fields.id == "szyjsjhcs"){//设置研究随机化参数
            var keys =  ['研究序列号','研究编号','研究设计','研究阶段个数','随机方法','设盲状态','单盲试验提供药物号','开放试验提供药物号','治疗组数'
                        ,'受试者分组比例','随机种子数','可查询各组随机例数','是否设置层内例数限制','层内限制例数','是否设置中心最大例数限制'
                        ,'中心最大例数限制','分层因素的个数','第一个分层因素的标签','第一个分层因素的取值','第二个分层因素的标签','第二个分层因素的取值'
                        ,'第三个分层因素的标签','第三个分层因素的取值','第四个分层因素的标签','第四个分层因素的取值','第五个分层因素的标签','第五个分层因素的取值'
                        ,'第六个分层因素的标签','第六个分层因素的取值','第七个分层因素的标签','第七个分层因素的取值','第八个分层因素的标签','第八个分层因素的取值'
                        ,'是否按中心分层','第九个分层因素的标签','第九个分层因素的取值'
                        ,'第一个分层因素的权重','第二个分层因素的权重','第三个分层因素的权重','第四个分层因素的权重','第五个分层因素的权重','不平衡分数算法'
                        ,'第六个分层因素的权重','第七个分层因素的权重','第八个分层因素的权重','第九个分层因素的权重','随机选择治疗方法','指定概率法概率高值'
                        ,'指定概率法概率低值','是否考虑分层因素完全重复（SIGN RULE）','随机号是否导出治疗分组','取随机号时是否显示随机号','取随机号时是否显示药物号','取随机号时是否显示分组情况'
                        ,'取随机号时是否显示随机抽中参加子研究','取随机号时是否显示目前研究阶段','添加时间','操作'];
            var keyEn = ['StudySeq','StudyID','StudyDs','StudyPeNum','RandoM','BlindSta','DrugNSBlind','DrugNOpen','NTrtGrp'
                        ,'AlloRatio','RandoSeed','SizeInGrp','SizeLInStraYN','SizeLInStra','SizeLInSiteYN'
                        ,'SizeLInSite','Nstra','LabelStraA','LabelStraAL','LabelStraB','LabelStraBL','LabelStraC','LabelStraCL','LabelStraD','LabelStraDL'
                        ,'LabelStraE','LabelStraEL','LabelStraF','LabelStraFL','LabelStraG','LabelStraGL'
                         ,'LabelStraH','LabelStraHL','StraSiteYN','LabelStraI','LabelStraIL','WeightStraA','WeightStraB','WeightStraC','WeightStraD'
                        ,'WeightStraE','WeightStraF','WeightStraG','WeightStraH','WeightStraI','FormulaImSc','TrtSelMth','HighProb'
                        ,'LowProb','SignRuleYN','ArmCDYN','RandoNumYN','DrugNumYN','ArmYN'
                        ,'SubStudYN','CStudyPeYN','Date','操作'];
            showTable(fields, res , req ,researchParameter , keys , keyEn , "/nlyy/addSzyjsjhcs");
            console.log('显示设置研究随机化参数');

        }else if(fields.id == "xzyjzx"){//新增研究中心
            var keys =  ['研究编号','中心编号','中心主要研究者','中心所在城市','中心详细地址','中心邮编','中心名称',
                '添加时间','操作'];
            var keyEn = ['StudyID','SiteID','InvNam','SiteCity','SiteAdd','SiteZipC','SiteNam','Date','操作'];
            showTable(fields, res , req ,site , keys , keyEn , "/nlyy/addXzyjzx");
            console.log('新增研究中心');

        }else if(fields.id == "xzck"){//新增仓库
            var keys =  ['研究编号','仓库编号','仓库名称','仓库所在城市','仓库详细地址','仓库邮编','仓管员姓名','仓管员手机','仓管员电子邮箱','是否为总仓库','是否为分仓库',
                '添加时间','操作'];
            var keyEn = ['StudyID','DepotID','DepotName','DepotCity','DepotAdd','DepotZipC','DepotKper','DepotMP','DepotEmail','DepotGNYN','DepotBrYN','Date','操作'];
            showTable(fields, res , req ,depot , keys , keyEn , "/nlyy/addXzck");
            console.log('新增仓库');
        }else if(fields.id == "dryjrxpcbz"){//导入研究入选排除标准
            var keys =  ['研究编号','入组标准类别','入组标准类别亚分类','入组标准类别的代码','入组标准序号','入组标准内容','添加时间','操作'];
            var keyEn = ['StudyID','IECat','IECatn','IESEQ','IESCat','IETest','Date','操作'];
            showTable(fields, res , req ,ExcludeStandard , keys , keyEn , "/nlyy/addRxpcbz");
            console.log('导入研究入选排除标准');
        }else if(fields.id == "gdsjfdrsjh"){//固定随机法导入随机号
            var keys =  ['研究编号','分层结果代码','研究设计','研究阶段个数','目前所处研究阶段','分层结果','层内区组号','区组内序号','随机号','治疗分组代码','治疗分组标签','添加时间','操作'];
            var keyEn = ['StudyID','StratumN','StudyDs','StudyPeNum','CStudyPe','Stratum','BlockSeq','SeqInBlock','RandoNum','ArmCD','Arm','Date','操作'];
            showTable(fields, res , req ,random , keys , keyEn , "/nlyy/addGdsjfdrsjh");
            console.log('固定随机法导入随机号');
        }else if(fields.id == "drywh"){//导入药物号
            var keys =  ['研究编号','药物号','药物号位数','治疗分组代码','治疗分组标签','编盲编号批次','药物流水号','药物有效期','添加时间','操作'];
            var keyEn = ['StudyID','DrugNum','DrugDigits','ArmCD','Arm','PackSeq','DrugSeq','DrugExpryDTC','Date','操作'];
            showTable(fields, res , req ,drug , keys , keyEn , "/nlyy/addDrywh");
            console.log('导入药物号');
        }else if(fields.id == "nztjssjsywaqkc"){//内置统计算式计算药物安全库存

        }else if(fields.id == "szsszsfcs"){//设置受试者随访参数

        }else if(fields.id == "szrwsqhsh"){//设置任务申请和审核

        }else if(fields.id == "szhlyh"){//设置管理用户
            var keys =  ['账号','密码','可写','管理用户','操作'];
            var keyEn = ['name','password','write','addUser','操作'];
            showTable(fields, res , req ,adminUser , keys , keyEn , "/nlyy/addSzhlyh");
        }else if(fields.id == "dryh") {//导入用户数据
            var keys =  ['研究序列号','研究编号','申办方全称','申办方简称','研究标题全称','研究标题简称','全国PI','用户名','账号',
                '用户单位类别','用户职责','是否负责全部中心','具体负责中心的编号','是否负责全部仓库','具体负责仓库的编号',
                '用户邮箱','用户手机','操作'];
            var keyEn = ['StudySeq','StudyID','SponsorF','SponsorS','StudNameF','StudNameS','CoorPI','UserNam','UserAcc',
                'UserTyp','UserFun','UserSiteYN','UserSite','UserDepotYN','UserDepot','UserEmail','UserMP','操作'];
            showTable(fields, res , req ,users , keys , keyEn , "/nlyy/addDryhsj");
            console.log('导入用户数据111');
        }else if(fields.id == "dcsj") {//导出数据
            console.log("导出数据")
        }
        return;
    });
}

showTable = function (fields, res , req , model , keys , keysEn , importUrl) {
    dbHelper.pageQuery(Number(fields.page),10,model,"",{},{
        Date: 'desc'
    },function (error, $page) {
        if(error){
            next(error);
        }else{
            $page['read'] = req.session.read;
            $page['write'] = req.session.write;
            $page['addUser'] = req.session.addUser;
            $page['keys'] = keys;
            $page['keysEn'] = keysEn;
            $page['importUrl'] = importUrl;
            res.send($page)
        }
    })
}