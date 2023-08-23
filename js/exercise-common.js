//获取格式化时间
function getFormatTime(timestamp,clean=false){
    var nowDate
    if(timestamp===undefined){
        nowDate= new Date();
    }else {
        nowDate = new Date(timestamp);
    }
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1) : nowDate.getMonth() + 1;
    var date = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
    var hour = nowDate.getHours()< 10 ? "0" + nowDate.getHours() : nowDate.getHours();
    var minute = nowDate.getMinutes()< 10 ? "0" + nowDate.getMinutes() : nowDate.getMinutes();
    var second = nowDate.getSeconds()< 10 ? "0" + nowDate.getSeconds() : nowDate.getSeconds();
    var time = ''
    if(clean){
        time =  year + "-" + month + "-" + date+" "+hour+":"+minute+":"+second;
    }else {
        time =  year + "-" + month + "-" + date+"T"+hour+":"+minute+":"+second+'Z'
    }
    return time
}
function getLocalTime(nS) {
    return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/,' ');
}
//将题目答案按选项顺序重新排列
function formatAnsOrder(d) {
    var c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var dic = {}
    for(var i=0;i<c.length;i++){
        if(d?.[c[i]]||''.length>0){
            dic[c[i]] = d[c[i]]
        }
    }
    return dic
}

// 计算字符串大小
function getStrLength(str) {
    var len=0,code=0;
    for(var i=0;i<str.length;i++) {
        code=str.charCodeAt(i)
        if (code>=0&&code<=127) {
            len+=1;
        }else{
            len+=2;
        }
    }
    return len
}

//检查列表中是否含有某元素
function isInList(item,list) {
    let index = list.indexOf(item)
    if(index === -1){
        return false
    }else {
        return index
    }
}
function isInArray(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (value === arr[i]) {
            return true;
        }
    }
    return false;
}
function isInDic(dic,val) {
    for(var k in dic){
        if(dic[k]===val){
            return true
        }
    }
    return false
}

function typeOfObj(object){
    return Object.prototype.toString.call(object);
}

//字典是否为空
function isEmptyObject(obj) {
    for (var key in obj) {
        return false;
    }
    return true;
}
//将字典的值转换为列表
function dicItemsToList(obj){
    var result = []
    for(var i in obj){
        result.push(obj[i])
    }
    return result
}
function formToJSON(selector, decode, mode) {
    var result = {}
    var data = ''
    if (mode === 's') {
        data = $(selector).serialize()
    } else if (mode === 't') {
        data = selector
    }
    var dataSplitted = data.split('&')
    for (var i = 0; i < dataSplitted.length; i++) {
        var value = dataSplitted[i].split('=')[1]
        var key = dataSplitted[i].split('=')[0]
        if (decode === true) {
            key = decodeURIComponent(key)
            value = decodeURIComponent(value)
        }
        result[key] = value
    }
    return result
}
//四舍五入
function round(number,digit) {
    var result
    var dig = 1
    for(var i=0;i<digit;i++){
        dig = dig * 10
    }
    result = Math.round(number * dig) / dig
    result = result.toString()
    return result
}

function entityToString(entity){
    var div=$('<div></div>');
    div.html(entity)
    var res=div.html();
    console.log(entity,'->',res);
    return res;
}
//秒转时间长度
function secondsToFormated(time) {
    console.log(time)
    const d = parseInt(time/(3600*24))
    time = time%(3600*24)
    console.log(time)
    const h = parseInt(time / 3600)
    time = time%(3600)
    const minute = parseInt(time / 60 )
    time = time%(60)
    const second = Math.ceil(time % 60)

    return d+'d'+h+'h'+minute+'m'+second+'s'
}
// HTML反转义
function html_entity_decode(str) {
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': '\'',
        '&#x2F;': '/',
    };
    while (new RegExp('&[a-z]+;', 'g').test(str)) {
        str = str.replace(/&[a-z]+;/g, entity => {
            return entities[entity] || entity;
        });
    }
    return str;
}