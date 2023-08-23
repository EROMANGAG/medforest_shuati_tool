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
    let list = gList()
    let results= gResults()
    let order = info.order
    let total = info.total
    let select = $('#jumpSelect')
    // select.append('<div><h4>答题卡</h4><div id="ansCard" class="d-flex justify-content-start flex-wrap"></div></div><hr>')
    let content = $('<div id="ansCard"></div>')
    let displayText;
    let displayId = 1;
    let sourceRange;
    let button;
    for(let i=0;i<total;i++){
        let type = order[i].split('-')[0]
        let id = order[i].split('-')[1]
        if(type === 'B'||type==='C'||type==='A3'){
            sourceRange = list.content[type][id].sourceRange * 1
            displayText = displayId +'-'+(displayId+sourceRange-1)
            displayId += sourceRange
            button = $(
                '<button class="button m-1 font-weight-bold" ' +
                'style="position: relative;border-radius: 40px;height:40px;font-size: 16px;width: auto;white-space: nowrap;" id="jump-'+i+'" onclick="jumpAnsCard('+i+')">' +
                '<span>'+displayText+'</span><span class="anscard-type">'+type +'</span></button>')
        }else {
            displayText = displayId
            displayId += 1
            button = $(
                '<button class="button button-circle m-1 font-weight-bold" ' +
                'style="position: relative;height:40px;font-size: 16px;width: 40px;white-space: nowrap;" id="jump-'+i+'" onclick="jumpAnsCard('+i+')">' +
                '<span>'+displayText+'</span><span class="anscard-type">'+type +'</span></button>')
        }

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
        // console.log('11111')
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

function replaceWikitextUNITToHTML(json) {
    let wikitextList = json.dataWikitext
    let dataHTMLTags = json.dataHTMLTags
    json = JSON.stringify(json);
    // console.log(wikitextList);
    for (let i in wikitextList) {
        let reg = new RegExp(i.replace(/\^\$\.\*\+\?\|\\\/\(\)\[\]\{\}\=\!\:\-\,/g, (key) => `\\${key}`), 'g');
        let parsed = wikitextList[i]['parse'];
        parsed = JSON.stringify(parsed);
        parsed = parsed.substr(1, parsed.length - 2);
        json = json.replace(reg, parsed);
    }
    for (let i in dataHTMLTags) {
        let reg = new RegExp(i.replace(/\^\$\.\*\+\?\|\\\/\(\)\[\]\{\}\=\!\:\-\,/g, (key) => `\\${key}`), 'g');
        let parsed = dataHTMLTags[i]['parse'];
        parsed = JSON.stringify(parsed);
        parsed = parsed.substr(1, parsed.length - 2);
        json = json.replace(reg, parsed);
    }
    // console.log(json);
    return JSON.parse(json);
}
//题目渲染函数
function ParseTimu(id, data) {
    //基础信息
    this.id = id;
    this.type = data.type === undefined ? 'A' : data.type;// String，默认是A
    this.pos = data.pos === undefined ? '（）' : data.pos;// String 默认为（）
    this.inputBox = data.inputBox === undefined ? '1' : data.inputBox;// String 默认为 0
    this.originalSource = data.source === undefined ? '0000' : data.source;// String
    this.source = getRealSource(this.originalSource).source;
    this.sourcePrefix = getRealSource(this.originalSource).prefix;
    this.sourceSuffix = getRealSource(this.originalSource).suffix;
    this.sourceRange = data.sourceRange === undefined ? 1 : data.sourceRange * 1;// String 需要转换为数字使用
    this.info = data.info === undefined ? '未填写信息' : data.info;// String
    this.title = data.title === undefined ? ['未填写题目'] : data.title;// Array
    this.options = data.choices === undefined ? [{ A: '未填写选项' }] : data.choices;// Array
    this.answer = data.answer === undefined ? ['未填写答案'] : data.answer;// Array
    this.explain = data.explain === undefined ? ['未填写解释'] : data.explain;// Array
    //如果是判断题，需要对答案进行转换
    if (this.type === 'PD') {
        // console.log(this.answer);
        if (isInArray(['对', '正确', 't', 'T', '✓', '√', '1', 'true', 'right'], this.answer[0])) {
            this.answer[0] = 'A';
        } else if (isInArray(['错', '错误', '×', 'x', 'f', 'F', 'false', 'wrong', '0'], this.answer[0])) {
            this.answer[0] = 'B';
        } else {
            this.answer[0] = '系统提示: 该判断题答案不符合标准格式';
        }
    }


    this.typesChinese = {
        A: 'A',
        A2: 'A2',
        A3: 'A3',
        B: 'B',
        C: 'C',
        X: 'X',
        TK: '填空',
        PD: '判断',
        MJ: '名解',
        WD: '问答'
    };

    this.prefixDic = {
        formId: 'timuForm-',
        titleInlineId: 'title-',
        radioName: 'radio-',
        radioId: 'radio-input-',
        checkboxName: 'checkbox-',
        checkboxId: 'checkbox-input-',
        selectId: 'select-',
        selectName: 'select-',
        textInputName: 'text-',
        textInputId: 'text-',
        textareaInputId: 'textarea-',
        textareaInputName: 'textarea-',
    };
    prefixDic = this.prefixDic;

    this.componentsHTML = {
        main: '<div name="timu-' + (id + 1) + '" id="' + id + '" class="type' + this.type + ' timuContainer"><p class="timuID">' + id + '</p></div>',
        form: '<form id="' + this.prefixDic.formId + id + '" class="subjectForm"></form>',
        type: '<p class="type"></p>',
        source: '<p class="source"></p>',
        title: '<p class="title"></p>',
        titleInline: '<div class="titleInline"></div>',
        titlesGroup: '<div class="titlesGroup"></div>',
        select: '<select class="dropdown" ></select>',
        option: '<option class="dropdown-option"></option>',
        optionsInline: '<div class="optionInline"></div>',
        optionsGroup: '<div class="optionsGroup"></div>',
        optionsInlineBC: '<div class="optionInlineBC"></div>',
        optionsGroupBC: '<div class="optionsGroupBC"></div>',
        input: '<input />',
        textarea: '<textarea class="textarea-input" rows="5"></textarea>',
        moasic: '<span class="blur" tabindex="0" style="display:inline;outline=0;" onclick=""></span>',
        label: '<label></label>',
        sourceRange: '<div class="sourceRange"></div>',
        buttonsGroup: '<div class="buttonGroup"></div>',
        resultGroup: '<div class="resultGroup"></div>',
        answer: '<div class="answerInline"><label>正确答案：</label></div>',
        explain: '<div class="explainInline"><label>解析：</label></div>',
        info: '<div class="info"></div>',
    };

    let isInFavorate = id in gInfo().favorite
    // console.log('isInFavorate',isInFavorate)
    let favoriteClass = isInFavorate?'button-action':'button-highlight'
    let favoriteBi = isInFavorate?'<i class="bi-star-fill m-0"></i>':'<i class="bi-star m-0"></i>'
    this.buttons = {
        submit: {
            btn: $('<button class="button button-caution showAnswer" id="showAnsBtn-' + id + '" class="showSingleBtn">提交</button>'),
            callback: {
                click: ({ id = this.id, timuType = this.type, correctAnswer = this.answer } = {}) => {
                    let sync = new Sync()
                    let storager = new Storager()
                    let choosedAnswer = this.getThisChooseAnswer();
                    let checkResult = this.showThisAnswer({ choosedAnswer: choosedAnswer, correctAnswer: correctAnswer });
                    updateResults(id,checkResult,choosedAnswer.array)
                    updateAnscardStatus(id)
                    storager.save()
                    if(gSautoSync()){
                        sync.upload()
                    }
                }
            }
        },
        favorate:{
            btn:$('<button class="favorite-btn button button-square '+favoriteClass+'">' +favoriteBi+'</button>'),
            callback: {
                click:()=>{
                    toggleFavorate(id)
                }
            }
        },
        next:{
            btn:$('<button class="button" id="nextSmall"> 下一题 </button>'),
            callback: {
                click:()=>{
                    next()
                }
            }
        },
        last:{
            btn:$('<button class="button" id="lastSmall"> 上一题 </button>'),
            callback: {
                click:()=>{
                    last()
                }
            }
        }
    };
    //存储结果
    this.parsedObj = {};
    //Map
    this.parsedParams = new Map();
}
/*
* 小组件部分
 */
//生成form组件，并绑定事件
ParseTimu.prototype.form = function ({ id = this.id, type = this.type, bind = true } = {}) {
    let form = $(this.componentsHTML.form);
    return form;
};
//生成info
ParseTimu.prototype.infoInline = function ({ info = this.info } = {}) {
    let infoObj = $(this.componentsHTML.info).append(info);
    this.parsedParams.set('info', infoObj);
    return infoObj;
};

//生成titleGroup
ParseTimu.prototype.titlesGroup = function (
    {
        id = this.id,
        type = this.type,
        sourcePrefix = this.sourcePrefix,
        sourceSuffix = this.sourceSuffix,
        beginningSource = this.source,
        titles = this.title
    } = {}) {
    let group = $(this.componentsHTML.titlesGroup);
    let typeObj;
    let sourceObj;
    let titleObj;
    let titleInline;
    // console.log([id, type, sourcePrefix, beginningSource, titles]);
    typeObj = $(this.componentsHTML.type).append(type);
    sourceObj = $(this.componentsHTML.source).append(sourcePrefix + beginningSource + sourceSuffix);
    titleObj = $(this.componentsHTML.title).append(titles[0]);
    titleInline = $(this.componentsHTML.titleInline).append(typeObj, sourceObj, titleObj);
    titleInline.attr('id', 'title-' + id);
    group.append(titleInline);
    return group;
};

ParseTimu.prototype.titlesGroupBC = function (
    {
        id = this.id,
        type = this.type,
        sourcePrefix = this.sourcePrefix,
        sourceSuffix = this.sourceSuffix,
        beginningSource = this.source,
        sourceRange = this.sourceRange,
        titles = this.title,
        options = this.options,
    } = {}) {
    let group = $(this.componentsHTML.titlesGroup);
    // BC 的options是列表外包裹字典的形式，因此先转为字典再提取keys
    let optionKeys = Object.keys(options);
    let optionLen = Object.keys(options).length;
    let typeObj;
    let sourceObj;
    let titleObj;
    let titleInline;
    let select;
    let option;
    // console.log(titles);

    for (let i = 0; i < sourceRange; i++) {
        //生成select
        select = $(this.componentsHTML.select);
        select.attr({
            id: prefixDic.selectId + id + '-' + i,
            name: prefixDic.selectName + id + '-' + i
        });
        for (let n = 0; n < optionLen; n++) {
            option = $(this.componentsHTML.option);
            option.attr('value', optionKeys[n]);
            option.append(optionKeys[n]);
            select.append(option);
        }
        //因为是和A和BC混合处理，因此source显示用和，后台的id 任然用id+'-'+subid
        typeObj = $(this.componentsHTML.type).append(type);
        sourceObj = $(this.componentsHTML.source).append(sourcePrefix + (beginningSource * 1 + i) + sourceSuffix);
        titleObj = $(this.componentsHTML.title).append(titles[i]);
        titleInline = $(this.componentsHTML.titleInline).append(typeObj, sourceObj, titleObj, select);
        titleInline.attr('id', 'title-' + id + '-' + i);

        group.append(titleInline);
    }

    return group;
};

//生成options(options 是 Map对象)
ParseTimu.prototype.optionsGroup = function (
    {
        id = this.id,
        inputType = this.type === 'X' ? 'checkbox' : 'radio',
        hideInput = false,
        options = this.options,
        classes
    } = {}) {
    let optionsGroupObj = $(this.componentsHTML.optionsGroup);
    optionsGroupObj = optionsGroupObj.addClass(classes);

    let idPrefix = this.prefixDic[inputType + 'Id'];
    let namePrefix = this.prefixDic[inputType + 'Name'];
    let optionInline; // 一行选项的 jquery Obj：将包含 input，optionLable和contentLabel
    let input; //input的 jquery Obj
    let inputId; //input 标签的id
    let optionLabel; // 选项的label obj
    let contentLabel; // 选项的内容的label obj


    for (let i in options) {
        //初始化各个参数
        inputId = idPrefix + id + '-' + i;
        optionInline = $(this.componentsHTML.optionsInline);
        input = $(this.componentsHTML.input);
        optionLabel = $(this.componentsHTML.label);
        contentLabel = $(this.componentsHTML.label);
        //设置input
        optionInline.attr('id', namePrefix + id + '-' + i);
        input.attr({
            id: inputId,
            name: namePrefix + id,
            type: inputType,
            value: i
        });
        input.css({
            display: hideInput ? 'none' : ''
        });
        //设置optionLabel
        optionLabel.attr({
            for: inputId
        });
        optionLabel.append(i + '.');
        //设置contentLabel
        contentLabel.attr({
            for: inputId
        });
        contentLabel.append(options[i]);
        //设置optionInline
        optionInline.append(input, optionLabel, contentLabel);
        //添加到group
        optionsGroupObj.append(optionInline);
    }
    // console.log(optionsGroupObj);
    return optionsGroupObj;
};

//生成BC的options
ParseTimu.prototype.optionsGroupBC = function ({
                                                   id = this.id,
                                                   type = this.type,
                                                   options = this.options,
                                                   classes
                                               } = {}) {
    let optionsGroupObj = $(this.componentsHTML.optionsGroupBC);
    optionsGroupObj = optionsGroupObj.addClass(classes);

    let optionInline; // 一行选项的 jquery Obj：将包含 input，optionLable和contentLabel
    let optionLabel; // 选项的label obj
    let contentLabel; // 选项的内容的label obj

    for (let i in options) {
        //初始化各个参数
        optionInline = $(this.componentsHTML.optionsInlineBC);
        optionLabel = $(this.componentsHTML.label).append(i + '.');
        contentLabel = $(this.componentsHTML.label).append(options[i]);
        optionInline.append(optionLabel, contentLabel);
        optionsGroupObj.append(optionInline);
    }
    return optionsGroupObj;
};
//生成buttonGroup
ParseTimu.prototype.buttonsGroup = function () {
    let buttonsGroup = $(this.componentsHTML.buttonsGroup);
    let btn;
    let callback;
    for (let i in this.buttons) {
        btn = this.buttons[i].btn;
        for (let n in this.buttons[i].callback) {
            // hover 用于处理悬停时的显示和不显示
            if (n === 'hover') {
                let parent = this.buttons[i].callback[n].parent;// 获取parent的名称
                parent = this.parsedObj[parent]; //获取parent的对象
                let fadeInTime = this.buttons[i].callback[n].in;
                let fadeOutTime = this.buttons[i].callback[n].out;
                parent.hover(function () {
                    btn.fadeIn(fadeInTime);
                }, function () {
                    btn.fadeOut(fadeOutTime);
                });
            }
            else
                //绑定别的事件
            {
                btn.on(n, this.buttons[i].callback[n]);
            }
        }
        buttonsGroup.append(btn);
    }
    return buttonsGroup;
};

//生成resultGroup
ParseTimu.prototype.resultsGroup = function ({ id = this.id, answerList = this.answer, explainList = this.explain } = {}) {
    let lenAnswerList = answerList.length;
    let lenExplainList = explainList.length;
    let max = lenAnswerList >= lenExplainList ? lenAnswerList : lenExplainList;
    let answer;
    let answerText;
    let explain;
    let explainText;
    let explainDiv;
    let resultGroup = $(this.componentsHTML.resultGroup);
    resultGroup.attr('id', 'resultGroup-' + id);
    for (let i = 0; i < max; i++) {
        answerText = answerList[i] === undefined ? '暂无答案，欢迎补充' : answerList[i];
        explainText = explainList[i] === undefined ? '暂无解析，欢迎补充' : explainList[i];
        explainDiv = $('<div></div>').append(explainText);
        answer = $(this.componentsHTML.answer).append(answerText);
        explain = $(this.componentsHTML.explain).append(explainDiv);
        resultGroup.append(answer, explain);
    }
    return resultGroup;
};

//生成题目范围
ParseTimu.prototype.rangeInline = function ({
                                                type = this.type,
                                                source = this.source,
                                                sourceRange = this.sourceRange
                                            } = {}) {
    let end = source * 1 + sourceRange * 1 - 1;
    let text = type === 'B' ? '共用备选答案' : '共用题干';
    let rangeText = '第 ' + source + ' 到 ' + end + ' 题';
    let sourceRangeObj = $(this.componentsHTML.sourceRange);
    return sourceRangeObj.append(rangeText + text);
};

//生成input文本输入框
ParseTimu.prototype.inputTitleInline = function ({
                                                     id = this.id,
                                                     pos = this.pos,
                                                     title = this.title[0],
                                                 } = {}) {
    let posReg = new RegExp(pos, 'g');
    let newTitle = $('<p class="title"></p>');
    let splitedTitle = title.split(posReg).filter(text => text !== '');
    let input;

    for (let i = 0; i < splitedTitle.length; i++) {
        newTitle.append('<span>' + splitedTitle[i] + '</span>');
        if (i < splitedTitle.length - 1) {
            input = $(this.componentsHTML.input);
            input.attr({
                id: prefixDic.textInputId + id + '-' + i,
                name: prefixDic.textInputName + id + '-' + i,
            });
            input.addClass('text-input-tk');
            newTitle.append(input);
        }
    }
    return newTitle;
};

ParseTimu.prototype.textareaTitle = function (
    {
        id = this.id,
        classes
    } = {}
) {
    let textareaObj = $(this.componentsHTML.textarea);
    textareaObj.attr({
        id: prefixDic.textareaInputId + id,
        name: prefixDic.textareaInputName + id
    });
    return textareaObj;

};
/*
* 各个题目分别处理部分
 */
ParseTimu.prototype.A = function () {
    let main = $(this.componentsHTML.main); this.parsedObj['main'] = main;
    let form = this.form();
    let titlesGroup = this.titlesGroup();
    let optionsGroup = this.optionsGroup({ options: this.options[0] });
    let buttonsGroup = this.buttonsGroup();
    let resultsGroup = this.resultsGroup();
    form.append(titlesGroup, optionsGroup, resultsGroup);

    main.append(form, buttonsGroup);
    return main;
};
ParseTimu.prototype.A2 = function () {
    return this.A();
};
ParseTimu.prototype.X = function () {
    return this.A();
};
ParseTimu.prototype.PD = function () {
    let main = $(this.componentsHTML.main); this.parsedObj['main'] = main;
    let form = this.form();
    let titlesGroup = this.titlesGroup();
    let optionsGroup = this.optionsGroup({ options: { A: '正确', B: '错误' } });
    let buttonsGroup = this.buttonsGroup();
    let resultsGroup = this.resultsGroup();
    form.append(titlesGroup, optionsGroup, resultsGroup);

    main.append(form, buttonsGroup);
    return main;
};
ParseTimu.prototype.B = function () {
    let main = $(this.componentsHTML.main); this.parsedObj['main'] = main;
    let form = this.form();
    let sourceRangeObj = this.rangeInline();
    let titlesGroup = this.titlesGroupBC();
    let optionsGroup = this.optionsGroupBC({ options: this.options[0] });
    let buttonsGroup = this.buttonsGroup();
    let resultsGroup = this.resultsGroup();

    form.append(optionsGroup, titlesGroup, resultsGroup);
    main.append(sourceRangeObj, form, buttonsGroup);
    return main;
};
ParseTimu.prototype.C = function () {
    let main = $(this.componentsHTML.main); this.parsedObj['main'] = main;
    let form = this.form();
    let sourceRangeObj = this.rangeInline();
    let titlesGroup = this.titlesGroupBC();
    let optionsGroup = this.optionsGroupBC({ options: this.options[0] });
    let buttonsGroup = this.buttonsGroup();
    let resultsGroup = this.resultsGroup();

    form.append(titlesGroup, optionsGroup, resultsGroup);
    main.append(sourceRangeObj, form, buttonsGroup);
    return main;
};
ParseTimu.prototype.A3 = function () {
    let main = $(this.componentsHTML.main); this.parsedObj['main'] = main;
    let form = this.form({ bind: false });
    let sourceRangeObj = this.rangeInline();
    let infoInline = this.infoInline();
    let buttonsGroup = this.buttonsGroup();
    let titleLen = this.title.length;
    let optionsLen = this.options.length;
    let sourceRange = this.sourceRange;
    let max = sourceRange > titleLen || sourceRange > optionsLen ? sourceRange : titleLen > optionsLen ? titleLen : optionsLen;

    //处理子题目，并添加到主容器
    let subFrom;
    let subTitlesGroup;
    let subOptionsGroup;
    let subResultGroup;
    let subTitle;
    for (let i = 0; i < max; i++) {
        subTitle = this.title[i] === undefined ? ['无题目信息'] : [this.title[i]];
        subFrom = this.form({ id: this.id + '-' + i });
        subFrom.attr('id', this.prefixDic.formId + this.id + '-' + i);
        subTitlesGroup = this.titlesGroup(
            {
                id: this.id + '-' + i,
                type: this.type,
                beginningSource: this.source * 1 + i,
                titles: subTitle
            }
        );
        subOptionsGroup = this.optionsGroup({
            id: this.id + '-' + i,
            options: this.options[i]
        });
        subResultGroup = this.resultsGroup({
            id: this.id + '-' + i,
            answerList: [this.answer[i]],
            explainList: [this.explain[i]],
        });

        subFrom.append(subTitlesGroup, subOptionsGroup);
        form.append(subFrom, subResultGroup);
        // form.after();
    }

    main.append(sourceRangeObj, infoInline, form, buttonsGroup);
    return main;
};
ParseTimu.prototype.TK = function () {
    let main = $(this.componentsHTML.main); this.parsedObj['main'] = main;
    let form = this.form();
    let inputTitleInlineObj = this.inputTitleInline();
    let titlesGroup = this.titlesGroup({
        titles: [inputTitleInlineObj.html()]
    });
    let resultsGroup = this.resultsGroup();
    let buttonsGroup = this.buttonsGroup();
    form.append(titlesGroup, resultsGroup);
    main.append(form, buttonsGroup);
    return main;
};
ParseTimu.prototype.MJ = function () {
    let main = $(this.componentsHTML.main); this.parsedObj['main'] = main;
    let form = this.form();
    let moasic = $(this.componentsHTML.moasic);
    let textarea = this.textareaTitle();
    let title = this.title[0];
    let titleHTML = '';
    let titlesGroup;
    if (this.inputBox === '0') {
        titleHTML = title + '：' + moasic.append(this.answer[0]).prop('outerHTML');
        titlesGroup = this.titlesGroup({
            titles: [titleHTML]
        });
    } else {
        titleHTML = title + '：<br>' + textarea.prop('outerHTML');
        titlesGroup = this.titlesGroup({
            titles: [titleHTML]
        });
    }
    let buttonsGroup = this.buttonsGroup();
    form.append(titlesGroup);
    main.append(form, buttonsGroup);
    return main;
};
ParseTimu.prototype.WD = function () {
    let main = $(this.componentsHTML.main); this.parsedObj['main'] = main;
    let form = this.form();
    let moasic = $(this.componentsHTML.moasic);
    let textarea = this.textareaTitle();
    let title = this.title[0];
    let titleHTML = '';
    let titlesGroup;
    if (this.inputBox === '0') {
        titleHTML = title + '<br>答案：<br>' + moasic.append(this.answer[0]).prop('outerHTML');
        titlesGroup = this.titlesGroup({
            titles: [titleHTML]
        });
    } else {
        titleHTML = title + '<br>' + textarea.prop('outerHTML');
        titlesGroup = this.titlesGroup({
            titles: [titleHTML]
        });
    }
    let buttonsGroup = this.buttonsGroup();
    form.append(titlesGroup);
    main.append(form, buttonsGroup);
    return main;
};




//从有中文的source中提取最后一个连续数字作为真实的source
function getRealSource(source) {
    // console.log(source)
    let getSuffix = source.match(/\D$/g) === null ? ['']:source.match(/\D$/g);
    let getContinueNumber = source.match(/[0-9]+/g);
    let getPrefix = source.split(new RegExp(getContinueNumber.slice(-1),'g'));

    if(getPrefix.length>1){
        let prefixTemp = ''
        for(let i=0;i<getPrefix.length-1;i++){
            prefixTemp += getPrefix[i]
            if(i<getPrefix.length-2){
                prefixTemp += getContinueNumber.slice(-1)
            }
        }
        getPrefix = [prefixTemp]
    }

    let realSource = getContinueNumber[getContinueNumber.length - 1] * 1;

    console.log({ prefix: getPrefix[0], suffix:getSuffix[0], source: realSource })
    return { prefix: getPrefix[0], suffix:getSuffix[0], source: realSource };
}

// // 获取select的选项
function getSelectedAnswer(id) {
    return formToJSON('#' + prefixDic.formId + id, true, 's');
}

// // 获取checkbox值
function getCheckBoxValue(name) {
    var ids = $('input:checkbox[name="' + name + '"]:checked');
    var data = [];
    for (var i = 0; i < ids.length; i++) {
        data.push(ids[i].value);
    }
    // console.log(data);
    return data;
}

ParseTimu.prototype.getThisChooseAnswer = function ({ id = this.id, type = this.type, sourceRange = this.sourceRange } = {}) {
    // console.log(id,type)
    let result = { array: [], obj: {} };
    let usersChoice;
    let counter = 0;
    if (type === "A" || type === 'A2' || type === 'PD') {
        let optionGroupName = prefixDic.radioName + id;
        usersChoice = getSelectedAnswer(id)[optionGroupName];
        // console.log(usersChoice)
        result.array.push(usersChoice);
        result.obj[id] = usersChoice;
    } else if (type === 'A3') {
        for (let i = 0; i < sourceRange; i++) {
            let subId = id + '-' + i;
            let optionGroupName = prefixDic.radioName + subId;
            usersChoice = getSelectedAnswer(subId)[optionGroupName];
            usersChoice = usersChoice === undefined ? '' : usersChoice;
            result.array.push(usersChoice);
            result.obj[subId] = usersChoice;
        }
    } else if (type === 'B' || type === 'C') {
        let usersChoice = getSelectedAnswer(id);
        let answerTemp;
        for (let i in usersChoice) {
            answerTemp = usersChoice[i] === undefined ? '' : usersChoice[i];
            result.array.push(answerTemp);
            result.obj[id + '-' + counter] = answerTemp;
            counter += 1;
        }
    } else if (type === "X") {
        let optionGroupName = prefixDic.checkboxName + id;
        let usersChoice = getCheckBoxValue(optionGroupName).sort();
        for (let i = 0; i < usersChoice.length; i++) {
            result.array.push(usersChoice[i]);
            result.obj[i] = usersChoice[i];
        }
    } else if (type === "TK") {
        let usersChoice = getSelectedAnswer(id);
        let answerTemp;
        for (let i in usersChoice) {
            answerTemp = usersChoice[i] === undefined ? '' : usersChoice[i];
            result.array.push(answerTemp);
            result.obj[i] = answerTemp;
        }
    } else if (type === "WD" || type === 'MJ') {
        let textareaId = prefixDic.textareaInputId + id;
        let usersChoice = getSelectedAnswer(id)[textareaId];
        result.array.push(usersChoice);
        result.obj[id] = usersChoice;
    }
    // console.log(result);
    return result;
};

ParseTimu.prototype.showThisAnswer = function ({ id = this.id, type = this.type, correctAnswer = this.answer, choosedAnswer } = {}) {
    let isRight = true;
    let isDone = true;
    let usersChoiceList = choosedAnswer.array;
    let usersChoiceObj = choosedAnswer.obj;
    let correctAnswerTemp;
    let usersChoice;
    let counter = 0;

    if (type === "A" || type === 'A2' || type === 'PD' || type === 'A3') {
        // console.log(choosedAnswer);
        for (let i in choosedAnswer.obj) {
            $('#resultGroup-' + i).fadeIn(100);
            $('#showThisAnswer-' + i).fadeOut(1);
            usersChoice = usersChoiceObj[i];
            correctAnswerTemp = correctAnswer[counter];
            let correctDivObj = $('#' + prefixDic.radioName + i + '-' + correctAnswerTemp);
            let usersChoiceDivObj = $('#' + prefixDic.radioName + i + '-' + usersChoice);
            if (usersChoice === correctAnswerTemp) {
                correctDivObj.addClass('correct');
            } else {
                isRight = false;
                correctDivObj.addClass('correct');
                usersChoiceDivObj.addClass('wrong');
            }
            counter += 1;
        }
    } else if (type === 'B' || type === 'C') {
        for (let i in choosedAnswer.obj) {
            // console.log('#' + prefixDic.titleInlineId + i);
            usersChoice = usersChoiceObj[i];
            correctAnswerTemp = correctAnswer[counter];
            let targetTitleInline = $('#' + prefixDic.titleInlineId + i);
            if (usersChoice === correctAnswerTemp) {
                targetTitleInline.addClass('correct');
            } else {
                isRight = false;
                targetTitleInline.addClass('wrong');
                targetTitleInline.append('<label class="answerTip">正确答案：' + correctAnswerTemp + '</label>');
            }
            counter += 1;
        }
    } else if (type === "X") {
        //x型题的答案是连着的字符串，需要转换成列表再处理
        correctAnswer = correctAnswer.toString().match(/[A-Z]/g).sort();
        let lenCorrect = correctAnswer.length;
        let lenUsersChoose = usersChoiceList.length;

        for (let i = 0; i < lenUsersChoose; i++) {
            // console.log(usersChoiceList[i]);
            if (!isInArray(correctAnswer, usersChoiceList[i])) {
                isRight = false;
                $('#' + prefixDic.checkboxName + id + '-' + usersChoiceList[i]).addClass('wrong');
            }
        }
        for (let i = 0; i < lenCorrect; i++) {
            if (!isInArray(usersChoiceList, correctAnswer[i])) {
                isRight = false;
                $('#' + prefixDic.checkboxName + id + '-' + correctAnswer[i]).addClass('notChoiced');
            } else {
                $('#' + prefixDic.checkboxName + id + '-' + correctAnswer[i]).addClass('correct');
            }
        }

    } else if (type === "TK") {
        for (let i in choosedAnswer.obj) {
            usersChoice = usersChoiceObj[i];
            correctAnswerTemp = correctAnswer[counter];
            correctAnswerTemp = correctAnswerTemp === undefined ? '暂无答案' : correctAnswerTemp;
            if (usersChoice === correctAnswerTemp) {
                $('#' + i).replaceWith('<label class="answerTip correct">' + correctAnswerTemp + '</label>');
            } else {
                isRight = false;
                $('#' + i).after('<label class="answerTip wrong">' + correctAnswerTemp + '</label>');
            }
            counter += 1;
        }
    } else if (type === "WD" || type === 'MJ') {
        let textareaId = prefixDic.textareaInputId + id;
        let usersChoice = getSelectedAnswer(id)[textareaId];
        usersChoice = usersChoice === '' ? '您没有填写回答' : usersChoice;
        let correctAnswerText = correctAnswer[0] === undefined ? '暂无答案' : correctAnswer[0];
        let result = '<b>您的回答：</b>';
        if (usersChoice === correctAnswerText) {
            result += '<span class="correct">正确</span><br>';
        } else {
            isRight = false;
            result += '<span class="wrong">错误</span><br>';
        }
        result += usersChoice + '<br>' + '<b>正确答案：</b><br>' + correctAnswerText;
        $('#' + textareaId).replaceWith(result);

    }
    $('#resultGroup-' + id).fadeIn(100);
    $('#showAnsBtn-' + id).fadeOut(1);

    return isRight;
};