function Display() {
    Display.prototype.innitiate =async function () {
        progress()
        updateProgress()
        loadAnscardOptions()
        inniRandomBtn()
        //读取设置判断是否自动打开答题卡
        if(gSdefaultOpenAnscard()){
            $('#answerCard').collapse('show')
        }
    }
}
//localhistory 的折叠动画
function fold(selector,openSpeed,closeSpeed) {
    openSpeed = openSpeed !== undefined ? openSpeed : 'fast'
    closeSpeed = closeSpeed !== undefined ? closeSpeed : 'fast'
    var defaultHeight = $('.data-folded').height()
    if(defaultHeight===undefined){
        defaultHeight = selector.attr('defHeight')
    }else {
        selector.attr('defHeight',defaultHeight)
    }

    var paddingHeight = 10
    var targetHeight = defaultHeight + paddingHeight + selector.children('.folded-content').height()
    var currentHeight = selector.height()
    if(defaultHeight === currentHeight){
        selector.animate({
            height: targetHeight
        }, openSpeed,function () {
            selector.removeClass('data-folded')
            selector.css('height','auto')
        });

    }else {
        selector.animate({
            height: defaultHeight
        }, closeSpeed);
        selector.css('height','unset')
        selector.addClass('data-folded')
    }
}
//界面
function right(target) {
    target.addClass('correct')
}
function wrong(target) {
    target.addClass('wrong')
}
function notChoose(target) {
    target.addClass('notChoose')
}
function syncUploadInfoOn(message=''){
    let template = $('<div id="processing" style="z-index: 2000" class="mb-5 ml-4 fixed-bottom">' +
        '<div  class="text-success spinner-grow spinner-grow-sm" role="status">' +
        '  <span class="sr-only">Loading...</span>' +
        '</div>' +
        '<p class="d-inline ml-1 font-weight-lighter font-italic">'+message+'</p>' +
        '</div>'
    )
    if(!$('#processing').length>0){
        template.appendTo($('body'))
    }
}
function syncUploadInfoOff(){
    $('#processing').fadeOut(400)
    setTimeout(function () {
        $('#processing').remove()
    },600)
}

//进度条
function progress(){
    NProgress.configure({ showSpinner: false });
    NProgress.configure({ trickle: false });
    NProgress.configure({ parent: '.immerse_progress' });
    NProgress.start();
}
function updateProgress(){
    let results = gResults()
    let i = 0
    for(let key in results){
        let type = results[key]
        for(let typeKey in type){
            if(type[typeKey].isDone){
                i+=1
            }
        }
    }
    NProgress.set(i/gInfo().total)
    // NProgress.set(i/lenAll)
}
function progressBar() {
    var o = new Object()
    o.bar = function (title,percentage,data,colorBorder,color,parent) {

        var container = $('<div class="progress-bar-container"></div>')
        var titleText = $('<div class="progress-bar-title">'+title+'</div><br>')
        var progressbar = $('<div class="progress flex-grow-1" ></div>')

        var progressbarContent = $('<div class="progress-bar" role="progressbar" aria-valuenow="" aria-valuemin="0" aria-valuemax="100">'+percentage+'%</div>')
        var dataText = $('<div class="progress-bar-data">'+data+'</div>')
        progressbarContent.css({
            'background-color':color,
            'width':percentage+'%'
        })
        progressbarContent.attr('aria-valuenow',percentage)
        progressbar.append(progressbarContent)
        container.append(titleText,progressbar,dataText)
        return container
    }
    return o
}
//=================================
//==========加载答题卡===============
//=================================
function loadAnscardOptions(){
    let info = gInfo()
    let results= gResults()
    let order = info.order
    let total = info.total
    let select = $('#jumpSelect')
    // select.append('<div><h4>答题卡</h4><div id="ansCard" class="d-flex justify-content-start flex-wrap"></div></div><hr>')
    let content = $('<div id="ansCard"></div>')
    for(let i=0;i<total;i++){
        let type = order[i].split('-')[0]
        let pos = order[i].split('-')[1]*1
        let button = $(
            '<button class="button button-circle m-1 font-weight-bold" style="position: relative;width:40px;height:40px;font-size: 16px" id="jump-'+i+'" onclick="jumpAnsCard('+i+')">' +
            '<span>'+(i+1)+'</span><span class="anscard-type">'+type +'</span></button>')
        content.append(button)

    }
    flushContent('#jumpSelect',content,100)
    setTimeout(function () {
        for(let i=0;i<total;i++){
            setTimeout(function () {
                updateAnscardStatus(i)
            },i*12)
        }
    },300)

}
function updateAnscardStatus(absPos){
    let only = formToJSON('#anscardFilter',false,'s')
    let info = gInfo()
    let results= gResults()
    let order = info.order
    let type = order[absPos].split('-')[0]
    let pos = order[absPos].split('-')[1]*1
    let button = $('#jump-'+absPos)
    const isDone = results[type][pos]['isDone']
    const isRight = results[type][pos]['isRight']
    if(isDone){
        if(isRight){
            button.addClass('button-action')
        }else {
            button.addClass('button-caution')
        }
    }
    if(only.f==='true'||only.w==='true'){
        console.log('11111')
        button.attr('disabled','disabled')
        // button.fadeOut(300)
        button.removeClass('font-weight-bold')
        button.addClass('text-light')
        if(((!isRight&&isDone)&&only.w==='true')||(only.f==='true'&&info.favorite.hasOwnProperty(absPos))){
            // button.fadeIn(100)
            button.removeAttr('disabled')
            button.addClass('font-weight-bold')
            button.addClass('button-glow')
            button.removeClass('text-light')
        }
    }
}
//判断某个题目是否被筛出
function isFilter(absPos){
    let only = formToJSON('#anscardFilter',false,'s')
    let info = gInfo()
    let results= gResults()
    let order = info.order
    let type = order[absPos].split('-')[0]
    let pos = order[absPos].split('-')[1]*1
    const isDone = results[type][pos]['isDone']
    const isRight = results[type][pos]['isRight']
    return ((!isRight && isDone) && only.w === 'true') || (only.f === 'true' && info.favorite.hasOwnProperty(absPos));
}
function jumpAnsCard(id) {
    let info = gInfo()
    let pro = gProgress()
    pro.type = info.order[id].split('-')[0]
    pro.pos = info.order[id].split('-')[1]
    pro.absPos = id
    sProgress(pro)
    currentJumpSelection(id)
    showTimu()
}
function currentJumpSelection(absPos){
    let target = $('#ansCard')
    let progress = gProgress()
    absPos = progress.absPos
    //首先清除之前的显示
    target.each(function () {
        $(this).children('.button-glow').each(function () {
            $(this).removeClass('button-glow')
        })
    })
    //添加当前的位置
    $('#jump-'+absPos).addClass('button-glow')
}
function inniRandomBtn() {
    let btn = $('#setRandom')
    if(!gInfo().isRandom){
        btn.html('<i class="bi bi-arrow-repeat"></i>当前:顺序')
    }else {
        btn.html('<i class="bi bi-shuffle"></i>当前:乱序')
    }
}
//=================================
//==========Modal操控===============
//=================================
function noTikuPath() {
    let params = gurlParam()
    let isWeb = params.title === undefined
    let isJSON = params.filepath === undefined
    if(isWeb&&isJSON){
        $('#noTikuPath').modal('show')
        let arc = gRecorder().archive
        let d = {}
        for(let i in arc){
            d[arc[i].list.title] = arc[i].time
        }
        let sortd = Object.keys(d).sort(function (a, b){return d[b]-d[a]})
        let c = 0
        for(let i in sortd){
            if(c===3){break}
            c+=1
            $('#suggestPath').append('<a href="'+urls.origin+'tools/tiku/index.html?title='+sortd[i]+'">'+sortd[i]+'</a><br>')
        }
        return true
    }else {
        return false
    }

}
//题目模板
function newTimu(id,json,editButton, hideButton,addHr,parent=''){
    parent = parent !== undefined ? parent : ''
    addHr = addHr !== undefined ? addHr :　true
    hideButton = hideButton !== undefined ? hideButton : false
    let type = json.type
    let o = {}
    o.temp = {
        main:$('<div id="'+id+'" class="type'+type+' timu"></div>'),
        subject:$('<div class="subject"></div>'),
        range:$('<div class="sourceRange"></div>'),
        info:$('<div class="info"></div>'),
        titleCon:$('<div class="titleContainer"></div>'),
        type:$('<p class="type">'+type+'</p>'),
        source:$('<p class="source"></p>'),
        title:$('<p class="title"></p>'),
        options:$('<div class="options"></div>'),
        btn:$('<button class="button button-caution showAnswer" id="showAnsBtn-' + id + '" class="showSingleBtn">提交</button>'),
        editBtn:$('<br><a class="editThisButton" style="font-size: 14px;margin-left: 10px" href="javascript:void(0)"><span class="" id="editThis-' + id + '">' +
            '编辑本题或添加解析</span></a>'),
        favoriteBtn:$('<button class="favorite-btn button button-square"></button>'),
        ansCon:$('<div id="ansContainer" class="ansContainer noDisplay"></div>'),
        correct:$('<p style="display:inline;"><b>正确答案：</b></p><p class="correctAnswer"></p><br>'),
        explain:$('<p style="display:inline;"><b>解析： </b></p><p class="explain"></p>'),
        select:$('<select class="button-small button-rounded button"></select>'),
        subTitle:$('<div id="" class="subTitle"></div>'),
        next:$('<button class="button" id="nextSmall"> 下一题 </button>'),
        last:$('<button class="button" id="lastSmall"> 上一题 </button>'),
        btns:$('<div id="btn-set"></div>')
    }
    o.hideButton = hideButton
    o.parent = parent
    o.temp.next.bind('click',function () {
        next()
    })
    o.temp.last.bind('click',function () {
        last()
    })
    if(id in gInfo().favorite){
        o.temp.favoriteBtn.addClass('button-action')
        o.temp.favoriteBtn.html('<i class="bi-star-fill m-0"></i>')
    }else {
        o.temp.favoriteBtn.addClass('button-highlight')
        o.temp.favoriteBtn.html('<i class="bi-star m-0"></i>')
    }
    o.temp.favoriteBtn.bind('click',function () {
        toggleFavorate(id)
    })
    if(type!=='A3'){
        o.temp.btn.bind("click",function (){
            let sync = new Sync()
            let storager = new Storager()
            updateProgress()
            showAns(id,type,json.answer)
            updateAnscardStatus(id)
            $(this).fadeOut(1)
            storager.save()
            //新增判断是否自动上传设置
            if(gSautoSync()){
                sync.upload()
            }
        })
    }
    if(type!=='A3'&&type!=='PD'){
        o.temp.editBtn.bind("click",function (){
            editThis(id)
            $(this).fadeOut(1)
        })
    }
    o.temp.btns.append(o.temp.btn,o.temp.favoriteBtn,o.temp.next,o.temp.last,o.temp.editBtn)
    o.A = function () {
        this.temp.source.text(json.source)
        this.temp.title.html(json.title.replace(/\\n/g,'\n'))
        console.log(json.title)
        this.temp.correct.nextAll('.correctAnswer').text(json.answer)
        this.temp.explain.nextAll('.explain').html(json.explain)
        let options = formatAnsOrder(json.choices)
        for(let k in options) {
            let label = '<label class="' + k + '"><input name="option-' + id + '" type="radio" value="' + k + '" />' + k + '：' + options[k] + '</label>'
            this.temp.options.append(label)
        }
        this.temp.titleCon.append(this.temp.type,this.temp.source,this.temp.title)
        this.temp.ansCon.append(this.temp.correct,this.temp.explain)
        this.temp.subject.append(this.temp.titleCon,this.temp.options)
        if(!hideButton){this.temp.subject.append(this.temp.btns)}
        this.temp.main.append(this.temp.subject,this.temp.ansCon)

        if(addHr){this.temp.main.append('<hr>')}
        return this.temp.main
    }
    o.A2 = function () {
        this.temp.source.text(json.source)
        this.temp.title.html(json.title)
        this.temp.correct.nextAll('.correctAnswer').text(json.answer)
        this.temp.explain.nextAll('.explain').html(json.explain)
        let options = formatAnsOrder(json.choices)
        for(let k in options) {
            let label = '<label class="' + k + '"><input name="option-' + id + '" type="radio" value="' + k + '" />' + k + '：' + options[k] + '</label>'
            this.temp.options.append(label)
        }
        this.temp.titleCon.append(this.temp.type,this.temp.source,this.temp.title)
        this.temp.ansCon.append(this.temp.correct,this.temp.explain)
        this.temp.subject.append(this.temp.titleCon,this.temp.options)
        if(!hideButton){this.temp.subject.append(this.temp.btns)}
        this.temp.main.append(this.temp.subject,this.temp.ansCon)

        if(addHr){this.temp.main.append('<hr>')}
        return this.temp.main
    }
    o.A3 = function () {
        let subIDs = []
        let s = json.source*1;let e = json.source*1+json.sourceRange*1 -1
        this.temp.range.text('第 '+s+' 到 '+e+' 题')
        for(let i=0;i<json.title.length;i++){
            subIDs.push(id+'-'+i)
            if(json.explain[i]===undefined){
                json.explain[i] = '暂无解析'
            }
            let data = {
                "type":"A3",
                "source":json.source*1 + i,
                "title":json.title[i],
                "answer":json.answer[i],
                "explain":json.explain[i],
                "choices":json.choices[i],
            }
            this.temp.titleCon.append(
                newTimu(id+'-'+i,data,false,true,false).A()
            )
        }
        o.temp.btn.bind("click",function (){
            let sync = new Sync()
            let storager = new Storager()
            updateProgress()
            showAns(subIDs,type,json.answer)
            updateAnscardStatus(id)
            $(this).fadeOut(1)
            storager.save()
            //新增判断是否自动上传设置
            if(gSautoSync()){
                sync.upload()
            }
        })
        this.temp.info.text(json.info)
        this.temp.subject.append(this.temp.range,this.temp.info,this.temp.titleCon)
        if(!hideButton){this.temp.subject.append(this.temp.btns)}
        this.temp.main.append(this.temp.subject)

        if(addHr){this.temp.main.append('<hr>')}
        return this.temp.main
    }
    o.B = function () {
        let s = json.source*1;let e = json.source*1+json.sourceRange*1 -1
        this.temp.range.text('第 '+s+' 到 '+e+' 题')

        let options = formatAnsOrder(json.choices)
        let i = 0
        let row = $('<div class="row"></div>')
        for(let k in options){
            if(json.choices[k].length>0){
                let label = '<div class="col" id="' + k + '">' + k+':'  + json.choices[k] + '</div>'
                row.append($(label))
                if((i+1) % 2 === 0){
                    this.temp.options.append(row)
                    row = $('<div class="row"></div>')
                }
                i+=1
            }
            this.temp.select.append('<option value="'+k+'">'+k+'</option>')
        }
        this.temp.options.addClass('bcOptions')
        this.temp.options.append(row)
        for(let i=0;i<json.title.length;i++){
            let title = $('<p class="titleBC">'+json.title[i]+'</p>').append(this.temp.select)
            console.log(this.temp.subTitle.text())
            this.temp.subTitle.attr('id',id+'-'+i)
            this.temp.source.text(s+i)
            this.temp.subTitle.empty()
            this.temp.subTitle.append(this.temp.type,this.temp.source,title)
            this.temp.titleCon.append(this.temp.subTitle.prop("outerHTML"))
        }
        for(let i=0;i<json.answer.length;i++){
            this.temp.correct.nextAll('.correctAnswer').append('<p id="ans-'+id +'-'+i+'">'+(s+i)+'：'+json.answer[i]+'</p>')
        }
        for(let i=0;i<json.explain.length;i++){
            this.temp.explain.nextAll('.explain').append('<p id="exp-'+id +'-'+i+'">'+(s+i)+'：'+json.explain[i]+'</p>')
        }

        this.temp.subject.append(this.temp.range,this.temp.options,this.temp.titleCon)
        if(!hideButton){this.temp.subject.append(this.temp.btns)}
        this.temp.ansCon.append(this.temp.explain)
        this.temp.main.append(this.temp.subject,this.temp.ansCon)

        if(addHr){this.temp.main.append('<hr>')}
        return this.temp.main
    }
    o.C = function () {
        let s = json.source*1;let e = json.source*1+json.sourceRange*1 -1
        this.temp.range.text('第 '+s+' 到 '+e+' 题')

        let options = formatAnsOrder(json.choices)
        let i = 0
        let row = $('<div class="row"></div>')
        for(let k in options){
            if(json.choices[k].length>0){
                let label = '<div class="col" id="' + k + '">' + k+':' + json.choices[k] + '</div>'
                row.append($(label))
                if((i+1) % 2 === 0){
                    this.temp.options.append(row)
                    row = $('<div class="row"></div>')
                }
                i+=1
            }
            this.temp.select.append('<option value="'+k+'">'+k+'</option>')
        }
        this.temp.options.addClass('bcOptions')
        this.temp.options.append(row)
        for(let i=0;i<json.title.length;i++){
            let title = $('<p class="titleBC">'+json.title[i]+'</p>').append(this.temp.select)
            console.log(this.temp.subTitle.text())
            this.temp.subTitle.attr('id',id+'-'+i)
            this.temp.source.text(s+i)
            this.temp.subTitle.empty()
            this.temp.subTitle.append(this.temp.type,this.temp.source,title)
            this.temp.titleCon.append(this.temp.subTitle.prop("outerHTML"))
        }
        for(let i=0;i<json.answer.length;i++){
            this.temp.correct.nextAll('.correctAnswer').append('<p id="ans-'+id +'-'+i+'">'+(s+i)+'：'+json.answer[i]+'</p>')
        }
        for(let i=0;i<json.explain.length;i++){
            this.temp.explain.nextAll('.explain').append('<p id="exp-'+id +'-'+i+'">'+(s+i)+'：'+json.explain[i]+'</p>')
        }

        this.temp.subject.append(this.temp.range,this.temp.titleCon,this.temp.options)
        if(!hideButton){this.temp.subject.append(this.temp.btns)}
        this.temp.ansCon.append(this.temp.explain)
        this.temp.main.append(this.temp.subject,this.temp.ansCon)

        if(addHr){this.temp.main.append('<hr>')}
        return this.temp.main
    }
    o.X = function () {
        this.temp.source.text(json.source)
        this.temp.title.html(json.title)
        this.temp.correct.nextAll('.correctAnswer').text(json.answer)
        this.temp.explain.nextAll('.explain').html(json.explain)
        let options = formatAnsOrder(json.choices)
        for(let k in options){
            let label = '<label class="'+k+'"><input name="option-'+id+'" type="checkbox" value="'+k+'" />'+k+'：'+options[k]+'</label>'
            this.temp.options.append(label)
        }

        this.temp.titleCon.append(this.temp.type,this.temp.source,this.temp.title)
        this.temp.ansCon.append(this.temp.correct,this.temp.explain)
        this.temp.subject.append(this.temp.titleCon,this.temp.options)
        if(!hideButton){this.temp.subject.append(this.temp.btns)}
        this.temp.main.append(this.temp.subject,this.temp.ansCon)

        if(addHr){this.temp.main.append('<hr>')}
        return this.temp.main
    }
    o.PD = function () {
        this.temp.type.text('判断')
        this.temp.source.text(json.source)
        this.temp.title.html(json.title)
        this.temp.explain.nextAll('.explain').html(json.explain)
        let ans = ''
        if(json.answer=='T' || json.answer=='正确' || json.answer=='1' || json.answer=='√'){
            ans = '正确'
        }else if(json.answer=='F' || json.answer=='错误' || json.answer=='0' || json.answer=='×'){
            ans = '错误'
        }
        this.temp.correct.nextAll('.correctAnswer').text(ans)

        this.temp.options.append('<label class="正确" style="display: inline;"><input name="option-'+id+'" type="radio" value="正确" />正确</label>' +
            '<label class="错误" style="display: inline;"><input name="option-'+id+'" type="radio" value="错误" />错误</label>')
        this.temp.titleCon.append(this.temp.type,this.temp.source,this.temp.title)
        this.temp.ansCon.append(this.temp.correct,this.temp.explain)
        this.temp.subject.append(this.temp.titleCon,this.temp.options)
        if(!hideButton){this.temp.subject.append(this.temp.btns)}
        this.temp.main.append(this.temp.subject,this.temp.ansCon)

        if(addHr){this.temp.main.append('<hr>')}
        return this.temp.main
    }
    o.TK = function () {
        this.temp.type.text('填空')
        this.temp.source.text(json.source)
        let form = $('<form id="form-'+id+'" class="title"></form>')
        let pos = json.pos
        let posReg = new RegExp(pos,'g')
        let posCount = json.title.match(posReg).length
        for(let i=0;i<posCount;i++){
            json.title = json.title.replace(pos,'<input name="'+id+'-'+i+'" id="'+id+'-'+i+'" type="text" form="form-'+id+'"/>')
        }
        form.html(json.title)
        this.temp.title.html(json.title)
        this.temp.correct.nextAll('.correctAnswer').text(json.answer)
        this.temp.explain.nextAll('.explain').html(json.explain)

        this.temp.titleCon.append(this.temp.type,this.temp.source,form)
        this.temp.ansCon.append(this.temp.correct,this.temp.explain)
        this.temp.subject.append(this.temp.titleCon,this.temp.options)
        if(!hideButton){this.temp.subject.append(this.temp.btns)}
        this.temp.main.append(this.temp.subject,this.temp.ansCon)

        if(addHr){this.temp.main.append('<hr>')}
        return this.temp.main
    }
    o.MJ = function () {
        this.temp.type.text('名解')
        this.temp.source.text(json.source)
        this.temp.title.html(json.title + '：<span class="blur" tabindex="0" style="display:inline;outline=0;" onclick="">' + json.answer +'</span>')
        this.temp.titleCon.append(this.temp.type,this.temp.source,this.temp.title)
        this.temp.subject.append(this.temp.titleCon,this.temp.options)
        this.temp.main.append(this.temp.subject)

        if(addHr){this.temp.main.append('<hr>')}
        return this.temp.main
    }
    return o
}