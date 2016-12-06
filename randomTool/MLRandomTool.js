

/*******************计算不平衡分***********************/
//极差法
exports.jichafa = function (nTrtGrpArray,addSuccessPersons,qiwangcha,persons){
    var bupinghen = [];
    for (var i = 0 ; i < nTrtGrpArray.length ; i++){
        var mou = 0;
        if (addSuccessPersons[0].SubjFa != ""){
            var he = null;
            for (var xx = 0 ; xx < qiwangcha[i][0].length ; xx++){
                if (he == null){
                    he = qiwangcha[i][0][xx]
                }else{
                    he = he - qiwangcha[i][0][xx]
                }
            }
            mou = mou + Math.abs(he);
        }
        if (addSuccessPersons[0].SubjFb != ""){
            var he = null;
            for (var xx = 0 ; xx < qiwangcha[i][1].length ; xx++){
                if (he == null){
                    he = qiwangcha[i][1][xx]
                }else{
                    he = he - qiwangcha[i][1][xx]
                }
            }
            mou = mou + Math.abs(he);
        }
        if (addSuccessPersons[0].SubjFc != ""){
            var he = null;
            for (var xx = 0 ; xx < qiwangcha[i][2].length ; xx++){
                if (he == null){
                    he = qiwangcha[i][2][xx]
                }else{
                    he = he - qiwangcha[i][2][xx]
                }
            }
            mou = mou + Math.abs(he);
        }
        if (addSuccessPersons[0].SubjFd != ""){
            var he = null;
            for (var xx = 0 ; xx < qiwangcha[i][3].length ; xx++){
                if (he == null){
                    he = qiwangcha[i][3][xx]
                }else{
                    he = he - qiwangcha[i][3][xx]
                }
            }
            mou = mou + Math.abs(he);
        }
        if (addSuccessPersons[0].SubjFe != ""){
            var he = null;
            for (var xx = 0 ; xx < qiwangcha[i][4].length ; xx++){
                if (he == null){
                    he = qiwangcha[i][4][xx]
                }else{
                    he = he - qiwangcha[i][4][xx]
                }
            }
            mou = mou + Math.abs(he);
        }
        if (addSuccessPersons[0].SubjFf != ""){
            var he = null;
            for (var xx = 0 ; xx < qiwangcha[i][5].length ; xx++){
                if (he == null){
                    he = qiwangcha[i][5][xx]
                }else{
                    he = he - qiwangcha[i][5][xx]
                }
            }
            mou = mou + Math.abs(he);
        }
        if (addSuccessPersons[0].SubjFg != ""){
            var he = null;
            for (var xx = 0 ; xx < qiwangcha[i][6].length ; xx++){
                if (he == null){
                    he = qiwangcha[i][6][xx]
                }else{
                    he = he - qiwangcha[i][6][xx]
                }
            }
            mou = mou + Math.abs(he);
        }
        if (addSuccessPersons[0].SubjFh != ""){
            var he = null;
            for (var xx = 0 ; xx < qiwangcha[i][7].length ; xx++){
                if (he == null){
                    he = qiwangcha[i][7][xx]
                }else{
                    he = he - qiwangcha[i][7][xx]
                }
            }
            mou = mou + Math.abs(he);
        }
        if (addSuccessPersons[0].SubjFi != "") {
            var he = null;
            for (var xx = 0 ; xx < qiwangcha[i][qiwangcha[i].length - 1].length ; xx++){
                if (he == null){
                    he = qiwangcha[i][qiwangcha[1].length - 1][xx]
                }else{
                    he = he - qiwangcha[i][qiwangcha[1].length - 1][xx]
                }
            }
            mou = mou + Math.abs(he);
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
        return this.wangquansuiji(persons)
    }else{
        //根据4种治疗选择方法进行随机
        if (persons[0].TrtSelMth == 1) {//直接法
            return this.zhijiefa(nTrtGrpArray,bupinghen)

        }else if (persons[0].TrtSelMth == 2) {//指定概率法
            return this.zhidinggailv(persons)

        }else if (persons[0].TrtSelMth == 3) {//倒数法,比例法
            return this.bilifa(bupinghen,nTrtGrpArray)

        }else {//完全随机法
            return this.wangquansuiji(persons)
        }
    }
}

//方差法
exports.fangchafa = function (nTrtGrpArray,addSuccessPersons,qiwangcha,persons){
    var bupinghen = [];
    for (var i = 0 ; i < nTrtGrpArray.length ; i++){
        var mou = 0;
        if (addSuccessPersons[0].SubjFa != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][0].length ; xx++){
                he = Math.pow(qiwangcha[i][0][xx],2) + he;
            }
            mou = mou + (he/qiwangcha[i][0].length)
        }
        if (addSuccessPersons[0].SubjFb != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][1].length ; xx++){
                he = Math.pow(qiwangcha[i][1][xx],2) + he;
            }
            mou = mou + (he/qiwangcha[i][1].length)
        }
        if (addSuccessPersons[0].SubjFc != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][2].length ; xx++){
                he = Math.pow(qiwangcha[i][2][xx],2) + he;
            }
            mou = mou + (he/qiwangcha[i][2].length)
        }
        if (addSuccessPersons[0].SubjFd != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][3].length ; xx++){
                he = Math.pow(qiwangcha[i][3][xx],2) + he;
            }
            mou = mou + (he/qiwangcha[i][3].length)
        }
        if (addSuccessPersons[0].SubjFe != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][4].length ; xx++){
                he = Math.pow(qiwangcha[i][4][xx],2) + he;
            }
            mou = mou + (he/qiwangcha[i][4].length)
        }
        if (addSuccessPersons[0].SubjFf != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][5].length ; xx++){
                he = Math.pow(qiwangcha[i][5][xx],2) + he;
            }
            mou = mou + (he/qiwangcha[i][5].length)
        }
        if (addSuccessPersons[0].SubjFg != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][6].length ; xx++){
                he = Math.pow(qiwangcha[i][6][xx],2) + he;
            }
            mou = mou + (he/qiwangcha[i][6].length)
        }
        if (addSuccessPersons[0].SubjFh != ""){
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][7].length ; xx++){
                he = Math.pow(qiwangcha[i][7][xx],2) + he;
            }
            mou = mou + (he/qiwangcha[i][7].length)
        }
        if (addSuccessPersons[0].SubjFi != "") {
            var he = 0;
            for (var xx = 0 ; xx < qiwangcha[i][qiwangcha[i].length - 1].length ; xx++){
                he = Math.pow(qiwangcha[i][qiwangcha[i].length - 1][xx],2) + he;
            }
            mou = mou + (he/qiwangcha[i][qiwangcha[i].length - 1].length)
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
        return this.wangquansuiji(persons)
    }else{
        //根据4种治疗选择方法进行随机
        if (persons[0].TrtSelMth == 1) {//直接法
            return this.zhijiefa(nTrtGrpArray,bupinghen)

        }else if (persons[0].TrtSelMth == 2) {//指定概率法
            return this.zhidinggailv(persons)

        }else if (persons[0].TrtSelMth == 3) {//倒数法,比例法
            return this.bilifa(bupinghen,nTrtGrpArray)

        }else {//完全随机法
            return this.wangquansuiji(persons)
        }
    }
}

//最大值法
exports.zuidazhifa = function (nTrtGrpArray,addSuccessPersons,qiwangcha,persons){
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
            mou = mou + he
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
            mou = mou + he
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
            mou = mou + he
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
            mou = mou + he
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
            mou = mou + he
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
            mou = mou + he
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
            mou = mou + he
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
            mou = mou + he
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
            mou = mou + he
        }
        bupinghen.push(mou)
    }
    console.log("使用最大值法得到的不平衡得分")
    console.log(bupinghen)
    //根据4种治疗选择方法进行随机
    if (persons[0].TrtSelMth == 1) {//直接法
        return this.zhijiefa(nTrtGrpArray,bupinghen)

    }else if (persons[0].TrtSelMth == 2) {//指定概率法
        return this.zhidinggailv(persons)

    }else if (persons[0].TrtSelMth == 3) {//倒数法,比例法
        return this.bilifa(bupinghen,nTrtGrpArray)

    }else {//完全随机法
        return this.wangquansuiji(persons)
    }
}

/*******************随机分配***********************/
//直接法
exports.zhijiefa = function (nTrtGrpArray,bupinghen){
    var fenpeiStr = "";
    var arrayNuber = 0;
    var fenpeiStrs = [];
    for (var i = 0 ; i < nTrtGrpArray.length ; i++){
        if (i == 0 ){
            arrayNuber = bupinghen[i];
            fenpeiStr = nTrtGrpArray[i]
        }else {
            if (arrayNuber == bupinghen[i]){
                fenpeiStrs.push(nTrtGrpArray[i])
            }else {
                if (arrayNuber > bupinghen[i]){
                    arrayNuber = bupinghen[i]
                    fenpeiStr = nTrtGrpArray[i]
                    fenpeiStrs = [nTrtGrpArray[i]]
                }
            }
        }
    }

    if (fenpeiStrs.length > 1){
        console.log(arrayNuber)
        var jj = 1;
        var id = 0;
        console.log('有两组以上比例相等,这几组使用完全随机')
        while(jj){
            var suijisu = Math.random();
            id = Math.ceil(suijisu*10);
            if (id <= fenpeiStrs.length){
                console.log("随机数是:" + suijisu)
                jj = 0
            }
        }
        return fenpeiStrs[id]
    }else{
        console.log(arrayNuber)
        return fenpeiStr
    }
}

//指定概率法
exports.zhidinggailv = function (persons) {
    console.log('指定概率法')
    var highProb = persons[0].HighProb.split(",");
    var ntrtGrp = persons[0].NTrtGrp.split(",");
    console.log('概率:' + highProb)

    var ntrts = [];
    for (var i = 0 ; i < highProb.length ; i++){
        var aa = highProb[0] * 100;
        for (var j = 0 ; j < aa ; j++) {
            ntrts.push(ntrtGrp[i])
        }
    }
    var id = 0;
    var jj = 1;
    while(jj){
        var suijisu = Math.random();
        id = Math.ceil(suijisu*100);
        if (id <= ntrts.length){
            console.log("随机数是:" + suijisu)
            jj = 0
        }
    }
    return ntrts[id]
}

//比例法
exports.bilifa = function (bupinghen,nTrtGrpArray) {
    //取出总数
    var daoshuZ = 0;
    for (var  i = 0 ; i < bupinghen.length ; i++) {
        daoshuZ = bupinghen[i] + daoshuZ;
    }
    //计算各个分组的比例
    var props = [];
    console.log('使用比例方法,的比例是')
    for (var i = 0 ; i < nTrtGrpArray.length ; i++){
        var prop = (1 - (bupinghen[i]/daoshuZ)) * 100
        // id = Math.ceil();
        var id = Math.ceil(prop);
        for (var j = 0 ; j < id ; j++){
            props.push(nTrtGrpArray[i])
        }
        console.log("比例:")
        console.log(1 - (bupinghen[i]/daoshuZ))
    }
    var fenpeiStr = ''
    var jj = 1;
    while(jj){
        var ss = rd(0,props.length - 1)
        if (ss <= props.length){
            fenpeiStr = props[ss]
            jj = 0
        }
    }
    return fenpeiStr
}

//完全随机法
exports.wangquansuiji = function (persons) {
    var ntrtGrp = persons[0].NTrtGrp.split(",");
    var alloRatio = persons[0].AlloRatio.split(",");
    var glArray = [];
    for (var i = 0 ; i < alloRatio.length ; i++){
        for (var j = 0 ; j < alloRatio[i] ; j++){
            glArray.push(i)
        }
    }
    //随机取数组中的元素
    var id = 0;
    var jj = 1;
    var ntrtInt = alloRatio[id];
    var str = null
    while(jj){
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
    return str;
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