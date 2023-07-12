function Storager() {
    let log = new Logger()
    let structure = {
        'medforest_tiku_settings':{version:versions.current,exercise:{random:false,},sync:{auto:true,},interface:{font:'',fontsize:30,}},//用于记录用户设置和版本信息
        'medforest_tiku_info':{id:0,title:'初始化',revID:'','isSaved':false,randomOrder:false,order:{},displayOrder:{},pageID:''},//用于保存当前的题目标题和是否保存
        'medforest_tiku_progress':{type:'A',pos:0,absPos:0},//用于保存指针位置
        'medforest_tiku_recorder':{counter:0}
    }
    Storager.prototype.innitiate = function () {
        sProgress(structure.medforest_tiku_progress)
        sList({})
        sNewList({})
        sResults({})
        cleanNullInRecord()
        let recorder = gRecorder()
        if((recorder !== undefined)&&gUInfo().id!==0&&recorder!=={}){
            recorder.counter += 1
        }else {
            recorder = {counter:0,archive:{},settings:{}}
        }
        sRecorder(recorder)
    }
    Storager.prototype.load = function (id) {
        let data = gRecorder()['archive'][id]
        console.log(id)
        for(let key in data) {
            console.log(data[key])
            store.set('medforest_tiku_' + key, data[key])
        }
        let revid = data.list.revid
        //已覆盖完毕
        log.store_load_s(id)
        console.info(`>>Storager.load(${id})`,gInfo())
    }
    Storager.prototype.save = function () {
        //验证数据完整性
        // verifyIntegrality(false)
        let recorder = gRecorder()
        let r = {
            time:Date.now(),
            info:gInfo(),
            progress:gProgress(),
            results:gResults(),
        }
        let list = gList()
        list.content = {}
        r.list = list
        recorder.settings = gSettings()
        recorder.archive[gInfo().id] = r
        console.log('saved')
        sRecorder(recorder)
    }
    Storager.prototype.reset = function () {
        let pro = gProgress()
        let info = gInfo()
        info.favorite = {}
        inniTimuResultList()
        pro.absPos = 0
        sProgress(pro)
        sInfo(info)
    }
}
function clearArchive() {
    let r = gRecorder()
    r.counter = 0
    r.archive = {}
    sRecorder(r)
}
function updateResults(id,isRight,uOpt) {
    let r  = gResults()
    let o = gInfo().order
    let type = o[id].split('-')[0]
    let pos = o[id].split('-')[1]
    let done = r[type][pos]['isDone']
    console.log(r[type][pos]['choice'])
    if(!done){
        r[type][pos]['isDone'] = true
        r[type][pos]['isRight'] = isRight
        r[type][pos]['choice'] = uOpt.slice(0)
    }
    sResults(r)
    return {isDone:done,isRight:isRight}
}
function readResult(data) {
    var result = {all:0, notdone:0, right:0, wrong:0}
    for(var i in data){
        if(typeof(data[i])=='object'){
            data[i] = dicItemsToList(data[i])
        }
        if(data[i].length>0) {
            for (var n = 0; n < data[i].length; n++) {
                result.all += 1
                if(data[i][n].isDone && data[i][n].isRight){
                    result.right += 1
                }else if(!data[i][n].isDone){
                    result.notdone += 1
                }else {
                    result.wrong += 1
                }
            }
        }
    }
    result.done = result.all-result.notdone
    return result
}
function getSameData(fullData, searchTitle, order) {
    let container = $('<div class="folded-content single-data-container"></div>');
    let counter = 1
    let latestTime = ''

    for(let i in fullData){
        let data = fullData[i]
        let title = data.list.title
        if(title===undefined){

            let smallDel = $('<a class="btn btn-sm btn-danger ml-1">' +
                '<span><i class="bi bi-trash-fill m-0"></i>删除undefined数据</span>' +
                '</a>')
            smallDel.bind('click',function (e) {
                e.stopPropagation()//防止父元素触发
                $(this).text('确认删除？删除后无法恢复！')
                $(this).unbind()
                $(this).bind('click',function (e) {
                    e.stopPropagation()//防止父元素触发
                    delThisHistory(i)
                    $(this).text('记录已删除！')
                    $(this).removeClass('btn-danger')
                    $(this).addClass('btn-warning')
                    $(this).unbind()
                })
            })
            container.append(smallDel)
            continue
        }
        if(searchTitle === title){
            latestTime = data.list.time
            let singleData = $('<div class="single-data  data-folded" defheight="40"></div>')
            let header = $('<div class="single-header" ></div>')
            let content = $('<div class="folded-content single-content"></div>')
            let ending = $('<div class="single-ending"></div>')
            let headerText = ''
            let result = readResult(data.results)
            //一些计算的参数
            let calCorrect = (round(result.right/(result.all-result.notdone),4)*100).toFixed(2)
            let calFinish = (round((result.all-result.notdone)/result.all,4)*100).toFixed(2)

            headerText = '<p class="single-header-title-counter">第 ' + counter + ' 次</p>' +
                '<p class="single-header-title-time">'+data.list.time.replace('T',' ').replace('Z','')+'</p>'

            header.bind('click', function () {
                fold($(this).parent(),0)
            })
            header.html(headerText)
            let smallDel = $('<a class="btn btn-sm btn-danger ml-1">' +
                '<span><i class="bi bi-trash-fill m-0"></i></span>' +
                '</a>')
            smallDel.bind('click',function (e) {
                e.stopPropagation()//防止父元素触发
                $(this).text('确认删除？删除后无法恢复！')
                $(this).unbind()
                $(this).bind('click',function (e) {
                    e.stopPropagation()//防止父元素触发
                    delThisHistory(i)
                    $(this).text('记录已删除！')
                    $(this).removeClass('btn-danger')
                    $(this).addClass('btn-warning')
                    $(this).unbind()
                })
            })
            let smallLoad = $('<a class="btn btn-sm btn-primary ml-2"  data-dismiss="modal">' +
                '<span><i class="bi bi-download m-0"></i></span>' +
                '</a>')
            smallLoad.bind('click',function (e) {
                e.stopPropagation()//防止父元素触发
                $('#localHistory').modal('hide')//防止触发后要手动关闭
                new Exercise().loadArchive(i)
            })
            header.append(smallLoad,smallDel)
            //生成内容
            let functionModule = $('<div class="function-module"></div>')
            let graphs = $('<div class="graph-module"></div>')

            let bar = new progressBar()
            let finish = bar.bar('完成度',calFinish,(result.all-result.notdone)+'/'+result.all,'black','#36c')
            let correct = bar.bar('正确率',calCorrect,result.right+'/'+(result.all-result.notdone),'black','#36c')
            graphs.append(finish,correct)
            let bind = bindBtnData(data,searchTitle,i)
            functionModule.append(bind.del,bind.load,bind.all,bind.wrong,'<hr>',graphs,'<hr>')
            content.append(functionModule)
            singleData.append(header,content,ending)
            if(order){
                container.append(singleData)
            }else {
                container.prepend(singleData)
            }
            counter += 1
        }
    }
    return {container:container,counter:counter-1,latestTime:latestTime}
}
function bindBtnData(data,title,id) {
    let load = $(
        '<a class="loadThisArchive btn btn-sm btn-primary ml-1"  data-dismiss="modal">' +
        '<span>加载本记录</span>' +
        '</a>')
    let downloadWrongBtn = $(
        '<a class="btn btn-sm btn-primary ml-1" disabled>' +
        '<span>下载错题(开发中)</span>' +
        '</a>')
    let downloadAllBtn = $(
        '<a class="btn btn-sm btn-primary ml-1" disabled>' +
        '<span>下载本题库(开发中)</span>' +
        '</a>')
    let del = $(
        '<button class="delThisArchive btn btn-sm btn-danger ml-1">' +
        '<span>删除本记录</span>' +
        '</button>')
    load.bind('click',function () {
        new Exercise().loadArchive(id)
    })
    del.bind('click',function () {
        $(this).text('确认删除？删除后无法恢复！')
        $(this).unbind()
        $(this).bind('click',function () {
            delThisHistory(id)
            $(this).text('记录已删除！')
            $(this).removeClass('btn-danger')
            $(this).addClass('btn-warning')
            $(this).unbind()
        })
    })
    return {del:del,load:load,all:downloadAllBtn,wrong:downloadWrongBtn}
}
function mainFrame(fullData) {
    let mainFrame = $('<div class="main-data-container"></div>')
    let titlesSet = []
    console.log(fullData)
    for(let i in fullData){
        let data = fullData[i]
        let title = data.list.title
        console.log(titlesSet.indexOf(title))
        if(titlesSet.indexOf(title)!==-1){continue}else {titlesSet.push(title)}
        let singleDataSet = $('<div id="dataset-'+i+'" class="single-data-set data-folded"></div>')
        let dataContainers = getSameData(fullData,title,true)
        let header = $('<div class="list-title">' +
            '<p class="title-id">'+i+'</p>' +
            '<span class="title-content">' +
            '<p class="title-content-counter">['+dataContainers.counter+']</p>' +
            '<a href="https://www.medforest.cn/dic/'+title+'">'+title+'</a>' +
            '<p class="title-content-time">最近一次答题:'+dataContainers.latestTime+'</p>' +
            '</span></div>')
        //设置折叠时的高度
        header.bind('click', function () {
            fold($(this).parent())
        })
        singleDataSet.append(header,dataContainers.container)
        singleDataSet.prependTo(mainFrame)
    }

    return mainFrame
}
function toggleFavorate(id){
    let sync = new Sync()
    let storager = new Storager()
    let info = gInfo()
    let b = $('.favorite-btn')
    if(id in info.favorite){
        delete info.favorite[id]
        b.removeClass('button-action')
        b.addClass('button-highlight')
        b.html('<i class="bi-star m-0"></i>')
    }else {
        info.favorite[id] = info.order[id]
        b.removeClass('button-highlight')
        b.addClass('button-action')
        b.html('<i class="bi-star-fill m-0"></i>')
    }
    sInfo(info)
    storager.save()
    sync.upload()
}
function getLocalHistory() {
    let data = mainFrame(gRecorder().archive)
    $('#localHistoryContent').html(data)
    $('#localHistory').modal('show')
}
function delThisHistory(id) {
    let sync = new Sync()
    let r = gRecorder()
    delete r.archive[id]
    console.log(r.archive)
    sRecorder(r)
    sync.upload()
}
//专门用来清理counter=null的情况
function cleanNullInRecord(){
    let record = gRecorder()
    if(gRecorder().counter===null){
        if(gRecorder().archive !== {}){
            //排序获得最大值
            let maxKey = 0
            for(let i in record.archive){
                maxKey = i*1>maxKey ? i*1:maxKey
            }
            record.counter = maxKey
            console.log(maxKey)
            sRecorder(record)
        }else {
            sRecorder({counter:0,archive:{},settings:{}})
        }
    }
}
function verifyIntegrality(modal = true) {
    let modalContent = $('#localIntegralityVerifyResult')
    let start = Date.now()
    modalContent.html('')
    $('#verifiedDone').text(0)
    $('#verifiedMiss').text(0)
    $('#verifiedIncorrect').text(0)
    let wrong = 0

    if(modal){
        $('#localIntegralityVerify').modal('show')
    }

    let verify = function (checkObj,standardObj, key, parentID = 'localIntegralityVerifyResult') {
        var parent = $('#'+parentID)
        $('#verifiedDone').text($('#verifiedDone').text()*1 + 1)
        console.log(checkObj)
        // console.log(key)
        console.log(typeof(checkObj))
        // console.log(standardObj)
        console.log(parentID)
        console.log()
        let status = typeof(checkObj)===standardObj.type

        let target = parentID+'-'+key
        if( parent.children('.localIntegralityVerifyChildren').length>0){
            parent.children('.localIntegralityVerifyChildren').append('<div id="'+target+'" style="display:none"></div>')
        }else {
            parent.append('<div id="'+target+'"></div>')
        }
        if(status){
            $('#'+target).append('<div><p class="text-success">数据名：'+key+' 的类型为 '+typeof(checkObj)+' 符合默认设置</p></div><div class="localIntegralityVerifyChildren"></div>')
            let i = 0
            for (let childrenKey in standardObj.children){
                console.log(childrenKey)
                verify(checkObj[childrenKey],standardObj.children[childrenKey], childrenKey,target)
                i += 1
            }
        }else {
            wrong += 1
            $('#'+target).append('<div><p class="text-danger">数据名：'+key+' 的类型为 '+typeof(checkObj)+' 不符合默认设置，值：'+checkObj+'</p></div><div class="localIntegralityVerifyChildren"></div>')
            if(typeof(checkObj)==='undefined'){
                $('#verifiedMiss').text( $('#verifiedMiss').text()*1 + 1)
            }else {
                $('#verifiedIncorrect').text( $('#verifiedIncorrect').text()*1 + 1)
            }

        }
        $('#'+target).fadeIn(150)
        return status
    }
    let i  = 0
    for(let key in dataType){
        console.log(key)
        verify(store.get(key), dataType[key], key)
        i += 1
    }
    $('#verifiedTime').text(Date.now()-start+'ms')
    return wrong === 0
}

function gRecorder() {
    console.log(store.get('medforest_tiku_recorder'))
    return store.get('medforest_tiku_recorder')
}
function sRecorder(content) {
    console.log('sRecorder',content)
    store.set('medforest_tiku_recorder',content)
}
function gInfo() {
    return store.get('medforest_tiku_info')
}
function sInfo(content) {
    store.set('medforest_tiku_info',content)
}
function gUInfo() {
    return store.get('medforest_user_info')
}
function sUInfo(content) {
    store.set('medforest_user_info',content)
}
function gSettings() {
    return store.get('medforest_tiku_settings')
}
function sSettings(content) {
    store.set('medforest_tiku_settings',content)
}
function gProgress() {
    return  store.get('medforest_tiku_progress')
}
function sProgress(content) {
    store.set('medforest_tiku_progress',content)
}
function gResults() {
    return store.get('medforest_tiku_results')
}
function sResults(content) {
    store.set('medforest_tiku_results',content)
}
function gNewList() {
    return store.get('medforest_tiku_list_new')
}
function sNewList(content) {
    store.set('medforest_tiku_list_new',content)
}
function gList() {
    return store.get('medforest_tiku_list')
}
function sList(content) {
    store.set('medforest_tiku_list',content)
}
function gurlParam() {
    return store.get('medforest_tiku_urlParamsSetting')
}
function surlParam(content) {
    store.set('medforest_tiku_urlParamsSetting',content)
}