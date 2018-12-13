var nowpage = 1;
var id = '';

//根据操作权限做相应的显示
if (localStorage.addUser == 'true'){
    $("#szhlyhUi").show();
}else {
    $("#szhlyhUi").hide();
}
//获得焦点隐藏错误框
$("input").focus(function(){
    $("#cuowukuang").fadeOut();
    $("#daochucuowukuang").fadeOut();
    $("#quanxiantishi").fadeOut();
    $("#tianjiaCuowukuang").fadeOut();
});
//隐藏修改密码错误提示
$("#cuowukuang").fadeOut();
$("#daochucuowukuang").fadeOut();
$("#tianjiaCuowukuang").fadeOut();
$("#quanxiantishi").hide();



//设置模板
$('.sub-header')[0].innerHTML = "欢迎来到诺兰医药管理平台";
$(document).ready(function () {
    $('ul.nav > li').click(function (e) {
        e.preventDefault();
        $('ul.nav > li').removeClass('active');
        $(this).addClass('active');
        var a = this.getElementsByTagName('a')
        if (id != a[0].id) {
            id = a[0].id;
            nowpage = 1;
        }
        var text = a[0].text;

        postData(id,text,nowpage);

    })
});


//点击导出用户资料
$('#dcyhzhzz').on('click', function () {
    $.post('node/addDcyhzhzz',{
        "id":dataId
    },function (result) {
        if (result.isSucceed == 200){
            $("#daochucuowukuang").html(result.msg);
            $("#daochucuowukuang").fadeIn();
            setTimeout("$(\"#daochucuowukuang\").fadeOut();",3000)
        }else if (result.isSucceed == 400){
            $("#daochucuowukuang").fadeOut();
            window.open(window.location.protocol + "//" + window.location.host + '/' + result.ExcelName);
        }
    });
});

$('#dcxxjl').on('click', function () {
    $.post('node/addDcxxjl',{
        "id":dataId
    },function (result) {
        if (result.isSucceed == 200){
            $("#daochucuowukuang").html(result.msg);
            $("#daochucuowukuang").fadeIn();
            setTimeout("$(\"#daochucuowukuang\").fadeOut();",3000)
        }else if (result.isSucceed == 400){
            $("#daochucuowukuang").fadeOut();
            window.open(window.location.protocol + "//" + window.location.host + '/' + result.ExcelName);
        }
    });
});

//点击导出图片资料
$('#dctpzl').on('click', function () {
    $.post('node/addDctpzl',{
        "id":dataId
    },function (result) {
        if (result.isSucceed == 200){
            $("#daochucuowukuang").html(result.msg);
            $("#daochucuowukuang").fadeIn();
            setTimeout("$(\"#daochucuowukuang\").fadeOut();",3000)
        }else if (result.isSucceed == 400){
            $("#daochucuowukuang").fadeOut();
            window.open(window.location.protocol + "//" + window.location.host + '/' + result.ExcelName);
        }
    });
});

//点击导出药物资料
$('#dcyyywh').on('click', function () {
    $.post('node/addDcyyywh',{
        "id":dataId
    },function (result) {
        if (result.isSucceed == 200){
            $("#daochucuowukuang").html(result.msg);
            $("#daochucuowukuang").fadeIn();
            setTimeout("$(\"#daochucuowukuang\").fadeOut();",3000)
        }else if (result.isSucceed == 400){
            $("#daochucuowukuang").fadeOut();
            window.open(window.location.protocol + "//" + window.location.host + '/' + result.ExcelName);
        }
    });
});

//点击导出随机资料
$('#dcyysjh').on('click', function () {
    $.post('node/addDcyysjh',{
        "id":dataId
    },function (result) {
        if (result.isSucceed == 200){
            $("#daochucuowukuang").html(result.msg);
            $("#daochucuowukuang").fadeIn();
            setTimeout("$(\"#daochucuowukuang\").fadeOut();",3000)
        }else if (result.isSucceed == 400){
            $("#daochucuowukuang").fadeOut();
            window.open(window.location.protocol + "//" + window.location.host + '/' + result.ExcelName);
        }
    });
});
function getQueryString()
{
    var url = window.location.href;
    var num = url.indexOf("?");
    var str = url.substr(num + 1);
    var arr = str.split("&");
    var name = "";
    var value = "";
    for(var i = 0; i < arr.length; i++)
    {
        num = arr[i].indexOf("=");
        if(num > 0)
        {
            name = arr[i].substring(0, num);
            value = arr[i].substr(num + 1);
            this[name] = value;
        }
    }
}
function postData(id,text,page) {
    var url = window.location.href;
    var json = {}
    if(url.indexOf("?")!=-1){
        var request = new getQueryString();
        json = {
            "id":id,
            "text":text,
            "page":page,
            "StudyID" : request.StudyID
        }
    }else{
        json = {
            "id":id,
            "text":text,
            "page":page,
            "StudyID" : ''
        }
    }
    $('.sub-header')[0].innerHTML = text;
    $.post('node/getHome',json,function (result) {
        console.log(result);
        //    显示模板
        //得到模板，弄成模板函数
        var compiled =_.template($("#liebiaomoban").html());
        //清空列表所有节点
        $("#liebiaodiv").html("");
        var html = compiled({
            result : result.keys,
            data : result.results,
            pageNumber : result.pageNumber,
            pageCount : Math.ceil(result.pageCount) - 1,
            importUrl : result.importUrl,
            resultEn : result.keysEn,
    });

        $('#liebiaodiv').append($(html));

        if (result.write == true){//判断是否显示上传模块
            $("#caozuomokuai").show();
        }else {
            $("#caozuomokuai").hide();
        }
         //隐藏添加用户BTN
        $("#tianjiayonghuBtn").hide();
        $("#daochushujuBtn").hide();
        //如果是设置管理用户则不显示上传
        if (result.importUrl == "/nlyy/addSzhlyh"){
            $("#caozuomokuai").hide();
            //显示添加用户BTN
            $("#tianjiayonghuBtn").show();
        }
        if (result.importUrl == "/nlyy/dcsj"){
            $("#caozuomokuai").hide();
            //显示添加用户BTN
            $("#daochushujuBtn").show();
        }
        //高亮
        $(".yemaanniu:eq(" + (nowpage - 1) + ")").addClass("active");

        //给所有的页码按钮，添加监听
        $('.yemaanniu').click(function(){
            nowpage =  parseInt($(this).attr("data-page"));

            postData(id,text,nowpage);
        });
    });
}

//点击修改密码确定
$('#xgmmQD').on('click', function () {
    //1.判断是否填写完成
    if ($('#yuanshimimaText').val() != "" && $('#xinmimaText').val() != "" && $('#quedingmimaText').val() != ""){//有值
        if ($('#xinmimaText').val() != $('#quedingmimaText').val()){//确认密码错误
            $("#cuowukuang").html("密码确认不一致");
            $("#cuowukuang").fadeIn();
        }else{//发送网络请求
            $.post('node/resetPassword',{
                "usedPassword":$('#yuanshimimaText').val(),
                "newPassword":$('#xinmimaText').val()
            },function (result) {
                //    显示模板
                $("#cuowukuang").html(result.msg);
                $("#cuowukuang").fadeIn();
                if (result.isSucceed == "1"){
                    //隐藏模态框
                    setTimeout("$('#xgmmModal').modal('hide')",500);
                }
            });
        }
    }else{//没有值
        $("#cuowukuang").html("未填写完成");
        $("#cuowukuang").fadeIn();
    }
});
//点击添加管理用户
$('#modalTianjiaBtn').on('click', function () {
    console.log($('#kexie').prop("checked"));
    console.log($('#guanliyonghu').prop("checked"));
   //判断是否输入正确
    if ($('#tianjiaUserText').val() != "" && $('#tianjiaMimaText').val() != ""){//添加用户
        $.post('node/addAdminUser',{
            "name":$('#tianjiaUserText').val(),
            "password":$('#tianjiaMimaText').val(),
            "write" : $('#kexie').prop("checked"),
            "addUser" : $('#guanliyonghu').prop("checked"),
            "read" : true
        },function (result) {
            //    显示模板
            $("#tianjiaCuowukuang").html(result.msg);
            $("#tianjiaCuowukuang").fadeIn();
            if (result.isSucceed == "1"){
                //隐藏模态框
                setTimeout("$('#tianjiaCuowukuang').modal('hide')",500);
            }
        });
    }else {//用户或者密码未输入
        $("#tianjiaCuowukuang").html("用户名或密码未输入");
        $("#tianjiaCuowukuang").fadeIn();
    }
});

var dianjiType = ''
var dataId = ''
var StudyID = ''
$('#shanchuButton').on('click', function () {
    $.post('nlyy/deleteData',{
        'id' : dataId,
        "dianType" : dianjiType
    },function (result) {
        location.reload()
    });
})

$('#shanchuYanjiuButton').on('click', function () {
    $.post('nlyy/deleteStudy',{
        'StudyID' : StudyID
    },function (result) {
        alert(result.msg)
        location.reload()
    });
})
$('#jinruButton').on('click', function () {
    $.post('nlyy/enterStudy',{
        'StudyID' : StudyID
    },function (result) {
        localStorage.addUser = result.addUser;
        location.href = result.url;
    });
})
$('#jihuoyanjiuButton').on('click', function () {
    $.post('nlyy/activationStudy',{
        'id' : dataId,
        "dianType" : dianjiType
    },function (result) {
        alert(result.msg)
    });
})
$('#xzyj').on('click', function () {
    dianjiType = 'xzyj'
})
$('#szyjsjhcs').on('click', function () {
    dianjiType = 'szyjsjhcs'
})
$('#xzyjzx').on('click', function () {
    dianjiType = 'xzyjzx'
})
$('#xzck').on('click', function () {
    dianjiType = 'xzck'
})
$('#dryjrxpcbz').on('click', function () {
    dianjiType = 'dryjrxpcbz'
})
$('#gdsjfdrsjh').on('click', function () {
     dianjiType = 'gdsjfdrsjh'
})
$('#drywh').on('click', function () {
     dianjiType = 'drywh'
})
$('#nztjssjsywaqkc').on('click', function () {
     dianjiType = 'nztjssjsywaqkc'
})
$('#szsszsfcs').on('click', function () {
     dianjiType = 'szsszsfcs'
})
$('#szrwsqhsh').on('click', function () {
     dianjiType = 'szrwsqhsh'
})
$('#dryh').on('click', function () {
     dianjiType = 'dryh'
})

function t(e){
    if (e.indexOf(',') != -1){
        var array = e.split(",");
        dataId = array[0];
        StudyID = array[1];
    }else{
        dataId = e;
    }
}

function daochuFun(e){
    if (e.indexOf(',') != -1){
        var array = e.split(",");
        dataId = array[0];
        StudyID = array[1];
    }else{
        dataId = e;
    }
};