//删除字典中相同元素
exports.unique = function (arr) {
    var len = arr.length;
    var result = []
    for(var i=0;i<len;i++){
        var flag = true;
        for(var j = i;j<arr.length-1;j++){
            if(arr[i]==arr[j+1]){
                flag = false;
                break;
            }
        }
        if(flag){
            result.push(arr[i])
        }
    }
    return result;

}
//code from http://caibaojian.com/js-splice-element.html
exports.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};