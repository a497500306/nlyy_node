var nowpage = 1;
var id = '';
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

        console.log("123");


        postData(id,text,nowpage);

    })
});

function postData(id,text,page) {
    $('.sub-header')[0].innerHTML = text;
    $.post('node/getHome',{
        "id":id,
        "text":text,
        "page":page
    },function (result) {
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
            resultEn : result.keysEn
        });

        $('#liebiaodiv').append($(html));


        //高亮
        $(".yemaanniu:eq(" + (nowpage - 1) + ")").addClass("active");

        //给所有的页码按钮，添加监听
        $('.yemaanniu').click(function(){
            nowpage =  parseInt($(this).attr("data-page"));

            postData(id,text,nowpage);
        });
    });
}