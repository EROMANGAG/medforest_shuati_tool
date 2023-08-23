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
    console.log(title,revid)
    let r = {status: false, result: {}}
    //获取对应题库页面内容
    let results = await getParsedTikuText(title,revid)
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
            let dataJSON
            let dataWikitext;
            let dataHTMLTags;
            try{
                //1.把获取的文本转为json
                dataJSON = $.parseJSON(singleData)
                //2.
                dataWikitext = dataJSON.wikitext;
                for (let i in dataWikitext) {
                    let parsedText = html_entity_decode(dataWikitext[i]['parse']);
                    let outerHTML = $($(parsedText).children().prop('outerHTML'));
                    // 检测是否有table的标签,table需要用table-inline 的 css
                    let hasTableTag = new RegExp('<table[\\s\\S]*?>').test(outerHTML.prop('outerHTML'));
                    outerHTML.css('display', hasTableTag ? 'inline-table' : 'inline');
                    dataWikitext[i]['parse'] = outerHTML.prop('outerHTML');
                }
                dataJSON.dataWikitext = dataWikitext
                dataHTMLTags = dataJSON.htmlTags;
                for (let i in dataHTMLTags) {
                    // 获取的html中可能有多个并列的node，需要筛选有内容的并全部提取储存
                    let nonEmptyElement = [];
                    // 检测是否有table的标签,table需要用table-inline 的 css
                    let hasTableTag = false;
                    let parsedText = html_entity_decode(dataHTMLTags[i]['parse']);
                    let parsedTextObjChildren = $(parsedText).children();
                    parsedTextObjChildren.each(function (index, element) {
                        hasTableTag = new RegExp('<table[\\s\\S]*?>').test(element);
                        if (!$(element).is(":empty")) {
                            nonEmptyElement.push($(element).prop('outerHTML'));
                        }
                    });
                    let outerHTML = $(nonEmptyElement.join(''));
                    outerHTML.css('display', hasTableTag ? 'inline-table' : 'inline');
                    dataHTMLTags[i]['parse'] = outerHTML.prop('outerHTML');
                }
                dataJSON.dataHTMLTags = dataHTMLTags;
            }catch (e) {
                dataJSON= {type:'A',title:'本题加载出错'}
            }

            dataJSON.defaultOrder = index
            r.result[dataJSON.type].push(dataJSON)
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
