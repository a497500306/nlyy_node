

/*******************计算不平衡分***********************/
//极差法
exports.jichafa = function (nTrtGrpArray,addSuccessPersons,qiwangcha,persons,block){
    var bupinghen = [];
    for (var i = 0 ; i < nTrtGrpArray.length ; i++){
        var mou = 0;
        if (addSuccessPersons[0].SubjFa != ""){
            // var he = null;
            // for (var xx = 0 ; xx < qiwangcha[i][0].length ; xx++){
            //     if (he == null){
            //         he = qiwangcha[i][0][xx]
            //     }else{
            //         he = he - qiwangcha[i][0][xx]
            //     }
            // }
            var maxxx = qiwangcha[i][0].max();
            var minxx = qiwangcha[i][0].min();
            mou = mou + (Math.abs((qiwangcha[i][0].max() - qiwangcha[i][0].min()))) * parseInt(persons[0].WeightStraA);
        }
        if (addSuccessPersons[0].SubjFb != ""){
            // var he = null;
            // for (var xx = 0 ; xx < qiwangcha[i][1].length ; xx++){
            //     if (he == null){
            //         he = qiwangcha[i][1][xx]
            //     }else{
            //         he = he - qiwangcha[i][1][xx]
            //     }
            // }
            mou = mou + (Math.abs((qiwangcha[i][1].max() - qiwangcha[i][1].min()))) * parseInt(persons[0].WeightStraB);
        }
        if (addSuccessPersons[0].SubjFc != ""){
            // var he = null;
            // for (var xx = 0 ; xx < qiwangcha[i][2].length ; xx++){
            //     if (he == null){
            //         he = qiwangcha[i][2][xx]
            //     }else{
            //         he = he - qiwangcha[i][2][xx]
            //     }
            // }
            mou = mou + (Math.abs((qiwangcha[i][2].max() - qiwangcha[i][2].min()))) * parseInt(persons[0].WeightStraC);
        }
        if (addSuccessPersons[0].SubjFd != ""){
            // var he = null;
            // for (var xx = 0 ; xx < qiwangcha[i][3].length ; xx++){
            //     if (he == null){
            //         he = qiwangcha[i][3][xx]
            //     }else{
            //         he = he - qiwangcha[i][3][xx]
            //     }
            // }
            mou = mou + (Math.abs((qiwangcha[i][3].max() - qiwangcha[i][3].min()))) * parseInt(persons[0].WeightStraD);
        }
        if (addSuccessPersons[0].SubjFe != ""){
            // var he = null;
            // for (var xx = 0 ; xx < qiwangcha[i][4].length ; xx++){
            //     if (he == null){
            //         he = qiwangcha[i][4][xx]
            //     }else{
            //         he = he - qiwangcha[i][4][xx]
            //     }
            // }
            mou = mou + (Math.abs((qiwangcha[i][4].max() - qiwangcha[i][4].min()))) * parseInt(persons[0].WeightStraE);
        }
        if (addSuccessPersons[0].SubjFf != ""){
            // var he = null;
            // for (var xx = 0 ; xx < qiwangcha[i][5].length ; xx++){
            //     if (he == null){
            //         he = qiwangcha[i][5][xx]
            //     }else{
            //         he = he - qiwangcha[i][5][xx]
            //     }
            // }
            mou = mou + (Math.abs((qiwangcha[i][5].max() - qiwangcha[i][5].min()))) * parseInt(persons[0].WeightStraF);
        }
        if (addSuccessPersons[0].SubjFg != ""){
            // var he = null;
            // for (var xx = 0 ; xx < qiwangcha[i][6].length ; xx++){
            //     if (he == null){
            //         he = qiwangcha[i][6][xx]
            //     }else{
            //         he = he - qiwangcha[i][6][xx]
            //     }
            // }
            mou = mou + (Math.abs((qiwangcha[i][6].max() - qiwangcha[i][6].min()))) * parseInt(persons[0].WeightStraG);
        }
        if (addSuccessPersons[0].SubjFh != ""){
            // var he = null;
            // for (var xx = 0 ; xx < qiwangcha[i][7].length ; xx++){
            //     if (he == null){
            //         he = qiwangcha[i][7][xx]
            //     }else{
            //         he = he - qiwangcha[i][7][xx]
            //     }
            // }
            mou = mou + (Math.abs((qiwangcha[i][7].max() - qiwangcha[i][7].min()))) * parseInt(persons[0].WeightStraH);
        }
        if (addSuccessPersons[0].SubjFi != "") {
            // var he = null;
            // for (var xx = 0 ; xx < qiwangcha[i][qiwangcha[i].length - 1].length ; xx++){
            //     if (he == null){
            //         he = qiwangcha[i][qiwangcha[1].length - 1][xx]
            //     }else{
            //         he = he - qiwangcha[i][qiwangcha[1].length - 1][xx]
            //     }
            // }
            mou = mou + (Math.abs((qiwangcha[i][qiwangcha[1].length - 1].max() - qiwangcha[i][qiwangcha[1].length - 1].min()))) * parseInt(persons[0].WeightStraI);
        }
        bupinghen.push(mou)
    }
    console.log("使用极差法得到的不平衡得分")
    console.log(bupinghen)
    //判断不平衡得分是否相等
    var defen = 0;
    var isWangquan = 0;
    for (var i = 0 ; i < bupinghen.length ; i++){
        if (i == 0 ){
            defen = bupinghen[0]
        }else {
            if (defen != bupinghen[i]){
                isWangquan = 1
                break
            }
        }
    }
    if (isWangquan == 0 ){
        console.log('不平衡得分完全相等,使用完全随机')
        return this.wangquansuiji(persons,block)
    }else{
        //根据4种治疗选择方法进行随机
        if (persons[0].TrtSelMth == 1) {//直接法
            return this.zhijiefa(persons,nTrtGrpArray,bupinghen,block)

        }else if (persons[0].TrtSelMth == 2) {//指定概率法
            return this.zhidinggailv(bupinghen,persons,block)

        }else if (persons[0].TrtSelMth == 3) {//倒数法,比例法
            return this.bilifa(bupinghen,persons,nTrtGrpArray,block)

        }else {//完全随机法
            return this.wangquansuiji(persons,block)
        }
    }
}

//方差法
exports.fangchafa = function (nTrtGrpArray,addSuccessPersons,qiwangcha,persons,block){
    var bupinghen = [];
    for (var i = 0 ; i < nTrtGrpArray.length ; i++){
        var mou = 0;
        if (addSuccessPersons[0].SubjFa != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][0].length ; xx++){
                he = Math.pow(qiwangcha[i][0][xx],2) + he;
            }
            mou = mou + ((he/qiwangcha[i][0].length)) * parseInt(persons[0].WeightStraA);
        }
        if (addSuccessPersons[0].SubjFb != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][1].length ; xx++){
                he = Math.pow(qiwangcha[i][1][xx],2) + he;
            }
            mou = mou + ((he/qiwangcha[i][1].length)) * parseInt(persons[0].WeightStraB);
        }
        if (addSuccessPersons[0].SubjFc != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][2].length ; xx++){
                he = Math.pow(qiwangcha[i][2][xx],2) + he;
            }
            mou = mou + ((he/qiwangcha[i][2].length)) * parseInt(persons[0].WeightStraC);
        }
        if (addSuccessPersons[0].SubjFd != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][3].length ; xx++){
                he = Math.pow(qiwangcha[i][3][xx],2) + he;
            }
            mou = mou + ((he/qiwangcha[i][3].length)) * parseInt(persons[0].WeightStraD);
        }
        if (addSuccessPersons[0].SubjFe != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][4].length ; xx++){
                he = Math.pow(qiwangcha[i][4][xx],2) + he;
            }
            mou = mou + ((he/qiwangcha[i][4].length)) * parseInt(persons[0].WeightStraE);
        }
        if (addSuccessPersons[0].SubjFf != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][5].length ; xx++){
                he = Math.pow(qiwangcha[i][5][xx],2) + he;
            }
            mou = mou + ((he/qiwangcha[i][5].length)) * parseInt(persons[0].WeightStraF);
        }
        if (addSuccessPersons[0].SubjFg != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][6].length ; xx++){
                he = Math.pow(qiwangcha[i][6][xx],2) + he;
            }
            mou = mou + ((he/qiwangcha[i][6].length)) * parseInt(persons[0].WeightStraG);
        }
        if (addSuccessPersons[0].SubjFh != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][7].length ; xx++){
                he = Math.pow(qiwangcha[i][7][xx],2) + he;
            }
            mou = mou + ((he/qiwangcha[i][7].length)) * parseInt(persons[0].WeightStraH);
        }
        if (addSuccessPersons[0].SubjFi != "") {
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][qiwangcha[i].length - 1].length ; xx++){
                he = Math.pow(qiwangcha[i][qiwangcha[i].length - 1][xx],2) + he;
            }
            mou = mou + ((he/qiwangcha[i][qiwangcha[i].length - 1].length)) * parseInt(persons[0].WeightStraI);
        }
        bupinghen.push(mou)
    }
    console.log("使用方差法得到的不平衡得分")
    console.log(bupinghen)
    //判断不平衡得分是否相等
    var defen = 0;
    var isWangquan = 0;
    for (var i = 0 ; i < bupinghen.length ; i++){
        if (i == 0 ){
            defen = bupinghen[0]
        }else {
            if (defen != bupinghen[i]){
                isWangquan = 1
                break
            }
        }
    }
    if (isWangquan == 0 ){
        console.log('不平衡得分完全相等,使用完全随机')
        return this.wangquansuiji(persons,block)
    }else{
        //根据4种治疗选择方法进行随机
        if (persons[0].TrtSelMth == 1) {//直接法
            return this.zhijiefa(persons,nTrtGrpArray,bupinghen,block)

        }else if (persons[0].TrtSelMth == 2) {//指定概率法
            return this.zhidinggailv(bupinghen,persons,block)

        }else if (persons[0].TrtSelMth == 3) {//倒数法,比例法
            return this.bilifa(bupinghen,persons,nTrtGrpArray,block)

        }else {//完全随机法
            return this.wangquansuiji(persons,block)
        }
    }
}

//最大值法
exports.zuidazhifa = function (nTrtGrpArray,addSuccessPersons,qiwangcha,persons,block){
    var bupinghen = [];
    for (var i = 0 ; i < nTrtGrpArray.length ; i++){
        var mou = 0;
        if (addSuccessPersons[0].SubjFa != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][0].length ; xx++){
                if (xx == 0){
                    he = qiwangcha[i][0][xx]
                }else {
                    if (he < qiwangcha[i][0][xx]){
                        he = qiwangcha[i][0][xx]
                    }
                }
            }
            mou = mou + he * parseInt(persons[0].WeightStraA);
        }
        if (addSuccessPersons[0].SubjFb != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][1].length ; xx++){
                if (xx == 0){
                    he = qiwangcha[i][0][xx]
                }else {
                    if (he < qiwangcha[i][1][xx]){
                        he = qiwangcha[i][1][xx]
                    }
                }
            }
            mou = mou + he * parseInt(persons[0].WeightStraB);
        }
        if (addSuccessPersons[0].SubjFc != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][2].length ; xx++){
                if (xx == 0){
                    he = qiwangcha[i][2][xx]
                }else {
                    if (he < qiwangcha[i][2][xx]){
                        he = qiwangcha[i][2][xx]
                    }
                }
            }
            mou = mou + he * parseInt(persons[0].WeightStraC);
        }
        if (addSuccessPersons[0].SubjFd != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][3].length ; xx++){
                if (xx == 0){
                    he = qiwangcha[i][3][xx]
                }else {
                    if (he < qiwangcha[i][3][xx]){
                        he = qiwangcha[i][3][xx]
                    }
                }
            }
            mou = mou + he * parseInt(persons[0].WeightStraD);
        }
        if (addSuccessPersons[0].SubjFe != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][4].length ; xx++){
                if (xx == 0){
                    he = qiwangcha[i][4][xx]
                }else {
                    if (he < qiwangcha[i][4][xx]){
                        he = qiwangcha[i][4][xx]
                    }
                }
            }
            mou = mou + he * parseInt(persons[0].WeightStraE);
        }
        if (addSuccessPersons[0].SubjFf != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][5].length ; xx++){
                if (xx == 0){
                    he = qiwangcha[i][5][xx]
                }else {
                    if (he < qiwangcha[i][5][xx]){
                        he = qiwangcha[i][5][xx]
                    }
                }
            }
            mou = mou + he * parseInt(persons[0].WeightStraF);
        }
        if (addSuccessPersons[0].SubjFg != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][6].length ; xx++){
                if (xx == 0){
                    he = qiwangcha[i][6][xx]
                }else {
                    if (he < qiwangcha[i][6][xx]){
                        he = qiwangcha[i][6][xx]
                    }
                }
            }
            mou = mou + he * parseInt(persons[0].WeightStraG);
        }
        if (addSuccessPersons[0].SubjFh != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][7].length ; xx++){
                if (xx == 0){
                    he = qiwangcha[i][7][xx]
                }else {
                    if (he < qiwangcha[i][7][xx]){
                        he = qiwangcha[i][7][xx]
                    }
                }
            }
            mou = mou + he * parseInt(persons[0].WeightStraH);
        }
        if (addSuccessPersons[0].SubjFi != "") {
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][qiwangcha[i].length - 1].length ; xx++){
                if (xx == 0){
                    he = qiwangcha[i][qiwangcha[i].length - 1][xx]
                }else {
                    if (he < qiwangcha[i][qiwangcha[i].length - 1][xx]){
                        he = qiwangcha[i][qiwangcha[i].length - 1][xx]
                    }
                }
            }
            mou = mou + he * parseInt(persons[0].WeightStraI);
        }
        bupinghen.push(mou)
    }
    console.log("使用最大值法得到的不平衡得分")
    console.log(bupinghen)
    //根据4种治疗选择方法进行随机
    if (persons[0].TrtSelMth == 1) {//直接法
        return this.zhijiefa(persons,nTrtGrpArray,bupinghen,block)

    }else if (persons[0].TrtSelMth == 2) {//指定概率法
        return this.zhidinggailv(bupinghen,persons,block)

    }else if (persons[0].TrtSelMth == 3) {//倒数法,比例法
        return this.bilifa(bupinghen,persons,nTrtGrpArray,block)

    }else {//完全随机法
        return this.wangquansuiji(persons,block)
    }
}

/*******************随机分配***********************/
//直接法
exports.zhijiefa = function (persons,nTrtGrpArray,bupinghen,block){
    var arrayNuber = null;
    var fenpeiStrs = [];
    var alloRatio = persons[0].AlloRatio.split(",");
    var newBupinghen = [];
    for (var xx = 0 ; xx < alloRatio.length ; xx++){
        newBupinghen.push(bupinghen[xx]/alloRatio[xx]);
    }
    bupinghen = newBupinghen;
    arrayNuber = bupinghen.min()
    for (var i = 0 ; i < bupinghen.length ; i++){
        if (arrayNuber == bupinghen[i]){
            fenpeiStrs.push(nTrtGrpArray[i])
        }
    }

    if (fenpeiStrs.length > 1){
        console.log('有两组以上比例相等,这几组使用完全随机')
        //随机取数组中一个元素
        var n = Math.floor(Math.random() * fenpeiStrs.length + 1)-1;
        block(fenpeiStrs[n])
    }else{
        console.log(arrayNuber)
        block(fenpeiStrs[0])
    }
}

//指定概率法
exports.zhidinggailv = function (bupinghen,persons,block) {
    console.log('指定概率法')
    var highProb = persons[0].HighProb.split(",");
    var ntrtGrp = persons[0].NTrtGrp.split(",");
    var alloRatio = persons[0].AlloRatio.split(",");
    var newBupinghen = [];
    for (var xx = 0 ; xx < alloRatio.length ; xx++){
        newBupinghen.push(bupinghen[xx]/alloRatio[xx]);
    }
    bupinghen = newBupinghen;
    var ntrts = [];
    //不平衡分排序
    var bupinghenPX = bupinghen.sort(function (a,b) {
        return a - b
    });
    //概率排序
    var highProbPX = highProb.sort(function (a,b) {
        return b - a
    });

    if (bupinghen[0] > bupinghen[1]){
        //概率排序
        highProb = highProb.sort(function (a,b) {
            return a - b
        });
        for (var i = 0 ; i < highProb.length ; i++){
            console.log(ntrtGrp + '不平衡分为:' + bupinghen[i])

            var aa = highProb[i] * 100;
            for (var j = 0 ; j < aa ; j++) {
                ntrts.push(ntrtGrp[i])
            }
        }
        var n = Math.floor(Math.random() * ntrts.length + 1)-1;
        console.log('概率:' + highProb)
        // block(ntrts[n])
        zuizongsuiji(alloRatio,ntrtGrp,function (zhu) {
            block(zhu)
        })
    }else if (bupinghen[0] < bupinghen[1]){
        //概率排序
        highProb = highProb.sort(function (a,b) {
            return b - a
        });
        for (var i = 0 ; i < highProb.length ; i++){
            console.log(ntrtGrp + '不平衡分为:' + bupinghen[i])

            var aa = highProb[i] * 100;
            for (var j = 0 ; j < aa ; j++) {
                ntrts.push(ntrtGrp[i])
            }
        }
        var n = Math.floor(Math.random() * ntrts.length + 1)-1;
        console.log('概率:' + highProb)
        // block(ntrts[n])
        zuizongsuiji(alloRatio,ntrtGrp,function (zhu) {
            block(zhu)
        })
    }else{
        //完全随机
        console.log('完全随机')
        var n = Math.floor(Math.random() * ntrtGrp.length + 1)-1;
        // block(ntrtGrp[n])
        zuizongsuiji(alloRatio,ntrtGrp,function (zhu) {
            block(zhu)
        })
    }

}

//比例法
exports.bilifa = function (bupinghen,persons,nTrtGrpArray,block) {
    //取出总数
    var daoshuZ = 0;
    var weiling = [];
    var alloRatio = persons[0].AlloRatio.split(",");
    var newBupinghen = [];
    for (var xx = 0 ; xx < alloRatio.length ; xx++){
        newBupinghen.push(bupinghen[xx]/alloRatio[xx]);
    }
    bupinghen = newBupinghen;
    for (var  x = 0 ; x < bupinghen.length ; x++) {
        if (bupinghen[x] == 0) {
            weiling.push(nTrtGrpArray[x])
        }
        daoshuZ = (1/bupinghen[x]) + daoshuZ;
    }
    if (weiling.length != 0){
        console.log('有多个不平衡为零:' + weiling);
        var n = Math.floor(Math.random() * weiling.length + 1)-1;
        block(weiling[n])
        return;
    }
    //计算各个分组的比例
    var props = [];
    for (var i = 0 ; i < nTrtGrpArray.length ; i++){
        var prop = ((1/bupinghen[i])/daoshuZ) * 100
        // id = Math.ceil();
        var id = Math.ceil(prop);
        for (var j = 0 ; j < id ; j++){
            props.push(nTrtGrpArray[i])
        }
        console.log("比例:")
        console.log(((1/bupinghen[i])/daoshuZ) * 100)
    }
    var n = Math.floor(Math.random() * props.length + 1)-1;
    block(props[n])
}

//完全随机法
exports.wangquansuiji = function (persons,block) {
    var ntrtGrp = persons[0].NTrtGrp.split(",");//治疗组数
    var alloRatio = persons[0].AlloRatio.split(",");//受试者分组比例
    var glArray = [];
    for (var i = 0 ; i < alloRatio.length ; i++){//查看有多少个分组
        for (var j = 0 ; j < alloRatio[i] ; j++){//按照不同的比例添加对应个数的分组到glArray容器中
            glArray.push(i)
        }
    }
    //随机取数组中的元素
    var id = 0;
    var jj = 1;
    var ntrtInt = alloRatio[id];
    var str = null
    while(jj){//循环取任意随机数
        var suijishu = Math.random();
        id = Math.ceil(suijishu*10);
        if (id <= glArray.length){
            if (ntrtGrp[alloRatio[id]] != null){
                str = ntrtGrp[alloRatio[id]];
                console.log("随机数:" + suijishu)
                jj = 0
            }
        }
    }
    //需要放入的治疗组
    block(str)
}

function zuizongsuiji(alloRatio,ntrtGrp,block) {
    var zhuArray = [];
    for (var i = 0 ; i < alloRatio.length ; i++){
        for (var j = 0 ; j < alloRatio[i] ; j++){
            zhuArray.push(ntrtGrp[i])
        }
    }
    var n = Math.floor(Math.random() * zhuArray.length + 1)-1;
    block(zhuArray[n]);
}

/**
 * JS获取n至m随机整数
 * 琼台博客
 */
function rd(n,m){
    var c = m-n+1;
    var suijishu = Math.random();
    console.log("随机数:" + suijishu)
    return Math.floor(suijishu * c + n);
}