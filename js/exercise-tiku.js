function Tiku() {
    let log = new Logger()
    Tiku.prototype.innitiate =async function (revid, flash) {
        let params = gurlParam()
        let isWeb = params.title !== undefined
        let isJSON = params.filepath !== undefined
        if(isWeb){
            let title = revid === undefined ? params.title:undefined
            await loadFromWeb({title:title,revid:revid})
        }else if(isJSON){
            await loadFromJSON(params.filepath)
        }
        if(revid===undefined&&!flash){
            await inniTimuInfo()
            await inniTimuResultList()
            isLastExerciseSaved()
        }else {
            let list = gList()
            list.content = gNewList().content
            sList(list)
        }
        // log.inni_timu_s()
    }
}
//检查上次同名的题库做题情况，如果为提交，则提示是否继续上次
function isLastExerciseSaved() {
    let title = gurlParam().title
    let archive = gRecorder().archive
    let result = false
    for (let i in archive) {
        if (archive[i].list.title === title&&!archive[i].info.isSaved) {
            console.log('>>isLastExerciseSaved()-->检测到上次未保存的答题记录')
            result = i
        }
    }
    if(result!==false){
        $('#haveUnSavedExerciseModal').modal('show')
        $('#continueLastBtn').bind('click',function () {
            let e = new Exercise()
            e.loadArchive(result)
        })
    }
    return result
}
//获取解析的页面并从中提取题目存到localstore中
async function loadFromWeb({title=undefined,revid=undefined}={}) {
    let log = new Logger()
    let api = new Api()
    console.log(title,revid)
    let r = {status: false, result: {}}
    let results = await api.get(urls.apibase,{
        "action": "parse",
        "format": "json",
        "page": title,
        'oldid':revid,
        "utf8": 1,
        "prop": "text|revid",
        'origin': '*',
    }, false).catch(e=>{
        log.download_timu_e(e)
        return r
    })
    r.result = JSON.parse(dataStructure.typesDic)
    let parsedData = results.result.parse
    let parsedObj = $(results.result.parse.text["*"])
    if (isParserMobileFormat(parsedObj)){
        parsedObj = extractContentInMobileFormat(parsedObj)
    }
    parsedObj.children('.data').each(
        function (index,ele) {
            //将题目中的HTML节点转换为文本
            let singleData = $(ele).html()
            console.log(singleData)
            if ($(this).children().length > 0) {
                $(this).children().each(
                    function (n, v) {
                        var innerHTML = entityToString(v)
                        var escape = ''
                        escape = innerHTML.replace(/"/g, '\\"')
                        //修正：如果有math则提示不可显示
                        var mathReg = new RegExp('\[math\]','g')
                        if(mathReg.test(innerHTML)){
                            escape = '<b>暂不支持显示公式</b>'
                        }
                        singleData = singleData.replace(innerHTML, escape)
                    }
                )
            }
            singleData = singleData.replace(/\n/g,'\\n')
            let content = $.parseJSON(singleData)
            content.defaultOrder = index
            r.result[content.type].push(content)
        }
    )
    r.status = true
    sNewList({title: title
        ,pageid:parsedData.pageid
        ,revid:parsedData.revid
        ,time: getFormatTime()
        ,content: r.result})
    return r
}
//修正函数：用于判断是否为手机版输出
function isParserMobileFormat(obj) {
    return obj.children('.mf-section-0').length > 0
}
//修正函数：当运行为手机版时，从section中提取题目内容
function extractContentInMobileFormat(obj) {
    let result = $('<div></div>')
    obj.children('section').each(
        function (index,ele) {
            result.append($(ele).html())
        }
    )
    return result
}
async function loadFromJSON(f) {
    let log = new Logger()
    let api = new Api()
    let r = {status: false, result: {}}
    let results = await api.get(urls.apibase,{
        "action": "parse",
        "format": "json",
        "page": title,
        "utf8": 1,
        'origin': '*',
    }, false).catch(e=>{
        log.download_timu_e(e)
        return false
    })
    r.result = JSON.parse(dataStructure.typesDic)
    results.result = $.getJSON(url,'',
        function (d) {
            for(let i in d){
                r.result[i.type].push(i)
            }
        }
    )
    r.status = true
    sNewList({title: title, time: getFormatTime(), content: r.result})
    return r
}
async function inniTimuResultList(){
    let info = gInfo()
    //生成答题情况列表
    let answer = JSON.parse(dataStructure.typesDic)
    for (let key in info['len']) {
        for (let i = 0; i < info['len'][key]; i++) {
            answer[key][i] = {'isDone': false, 'isRight': false, 'choice': []}
        }
    }
    sResults(answer)
}
async function inniTimuInfo() {
    const newList = gNewList()
    console.log(newList)
    let info = {id:gRecorder().counter,len:{},total:0,order:{},favorite:{}}
    for (let key in newList['content']) {
        info['len'][key] = newList["content"][key].length
        info['total'] += newList["content"][key].length
    }
    //生成题目顺序
    info.order = orderSortTimu(info,newList)
    info.isRandom = false
    info.isSaved = false
    sList(newList)
    sInfo(info)
    console.log(gInfo())
}

//随机题目
function toggleRandom() {
    let info = gInfo()
    let btn = $('#setRandom')
    let pro = gProgress()
    let display = new Display()
    let sync = new Sync()
    let storager = new Storager()
    let log = new Logger()
    if(!info.isRandom){
        btn.html('<i class="bi bi-arrow-repeat"></i>当前:顺序')
        info.order = randomSortTimu(gList())
    }else {
        btn.html('<i class="bi bi-shuffle"></i>当前:乱序')
        info.order = orderSortTimu(info,gList())
    }
    info.isRandom = !info.isRandom
    storager.reset()
    sInfo(info)
    //重置显示
    setTimeout(function () {
        showTimu()
    },200)
    display.innitiate()
    log.toggleRandom(info.isRandom)
    storager.save()
    sync.upload()
}
function orderSortTimu(info,newList) {
    let r = {}
    for (let key in info['len']) {
        for (let i = 0; i < info['len'][key]; i++) {
            let defOrder = newList.content[key][i].defaultOrder
            r[defOrder] = key+'-'+i
        }
    }
    return r
}
function randomSortTimu(timu) {
    var result = {}
    var types = []
    var total = 0
    for(var t in timu.content){
        if(timu.content[t].length>0) types.push(t)
    }
    for (let key in timu.content) {
        total += timu.content[key].length
    }
    for(var i=0;i<total;i++){
        let randType = types[Math.floor(Math.random()*types.length)]
        let randTimuID = Math.floor(Math.random()*timu.content[randType].length)
        if(isInDic(result,randType+'-'+randTimuID)){
            i -= 1
        }else {
            result[i] = randType+'-'+randTimuID
        }
    }
    return result
}
