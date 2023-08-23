function Exercise() {
    let api = new Api()
    let log = new Logger()
    let tiku = new Tiku()
    let sync = new Sync()
    let storager = new Storager()
    let settings = new Settings()
    let display = new Display()
    Exercise.prototype.innitiate = async function () {
        //1. 检查更新 -> 2. 获取url中的题库名称 -> 3. 同步初始化，获取用户信息
        if(checkAndShowUpdate()){return false}
        await settings.urlparams() // 获取url 参数并且储存
        await sync.innitiate() //初始化 medforest_user_info 的本地储存
        await sync.download()
        storager.innitiate()
        settings.innitiate()
        if(noTikuPath()){return false}
        await tiku.innitiate()
        await showTimu()
        await display.innitiate()
    }
    Exercise.prototype.loadArchive = async function (id) {
        console.log(id)
        await storager.load(id)
        await tiku.innitiate(gList().revid)
        await showTimu()
        display.innitiate()
    }

}
function next() {
    let info = gInfo()
    let pro = gProgress()
    let log = new Logger()
    let only = formToJSON('#anscardFilter',false,'s')
    if((pro.absPos+1)>=info.total){
        $('#confirmHandInModal').modal('show')
        return false
    }else {
        //在不是最后一题和筛选功能开启的情况下，读取下一个被筛选的题目
        if(!isFilter(pro.absPos+1)&&(only.w === 'true'||only.f === 'true')){
            for(var i=pro.absPos+1;i<info.total;i++){
                if(isFilter(i)){
                    pro.absPos = i-1
                    break
                }
                if((i+1)===info.total){
                    alert('没有更多题目了')
                    return false
                }
            }
        }
        pro.absPos += 1
        pro.type = info.order[pro.absPos].split('-')[0]
        pro.pos = info.order[pro.absPos].split('-')[1]
        sProgress(pro)
        showTimu()
        currentJumpSelection(pro.absPos)
    }
}
function last() {
    let info = gInfo()
    let pro = gProgress()
    let log = new Logger()
    let only = formToJSON('#anscardFilter',false,'s')
    if((pro.absPos-1)<0){
        log.exercise_no_last_i()
    }else {
        //在不是最开始一题和筛选功能开启的情况下，读取上一个被筛选的题目
        if(!isFilter(pro.absPos-1)&&(only.w === 'true'||only.f === 'true')){
            for(var i=pro.absPos-1;i>=0;i--){
                if(isFilter(i)){
                    pro.absPos = i+1
                    break
                }
                if(i===0){
                    alert('没有更多题目了')
                    return false
                }
            }
        }
        pro.absPos -= 1
        pro.type = info.order[pro.absPos].split('-')[0]
        pro.pos = info.order[pro.absPos].split('-')[1]
        sProgress(pro)
        showTimu()
        currentJumpSelection(pro.absPos)
    }
}
async function showAns(id,type,key) {
    let subjectCon = $('#'+id)
    let titleCon = subjectCon.children('.subject').children('.titleContainer')
    let ansCon = subjectCon.children('.ansContainer').fadeIn(200)
    let options = subjectCon.children('.subject').children('.options')
    let correctAns= ansCon.children('.correctAnswer')
    let operate = {
        A:function (A3 = false,subid,subkey) {
            if(!A3){subid=id;subkey = key}
            options = $('#'+subid).children('.subject').children('.options')
            let userchoices = $('input[name="option-'+subid+'"]:checked').val();
            let cOpt = options.children('.'+subkey)
            let uOpt = options.children('.'+userchoices)
            let isRight = true
            right(cOpt)
            if(subkey !== userchoices){
                wrong(uOpt)
                isRight = false
            }
            if(!A3){return updateResults(subid,isRight,[userchoices])}
            else {
                return [subid,isRight,[userchoices]]
            }
        },
        A2:function () {
            return operate.A()
        },
        A3:function () {
            let parentid = id[0].split('-')[0]
            let isRight = true
            let userchoices = []
            for(let i=0;i<id.length;i++){
                console.log(id[i])
                let r = operate.A(true,id[i],key[i])
                //A3需要显示所有的解释
                $('#'+id[i]).children('.ansContainer').fadeIn(200)
                console.log(r)
                userchoices.push(r[2][0])
                console.log(userchoices)
                if(!r[1]){
                    isRight = false
                }
            }
            return updateResults(parentid,isRight,userchoices)
        },
        B:function () {
            let isRight = true
            let userchoices = []
            titleCon.children('div').each(function (index,i){
                let ans = key[index]
                let title = $(i).children('.titleBC')
                let userchoice = $(i).find("option:selected").text()
                userchoices.push(userchoice)
                if(userchoice===ans){right(title)}else {
                    wrong(title)
                    $('<p class="answerTip">正确答案：'+ans+'</p>').appendTo($(i))
                    isRight = false
                }
            })
            return updateResults(id,isRight,userchoices)
        },
        C:function () {
            return operate.B()
        },
        X:function () {
            let userchoices = []
            key = key.match(/[A-Z]/g)//X型题传入的答案是字符串型的，先转换为单个字符的列表
            let isRight = true
            $('input[name="option-'+id+'"]:checked').each(function (index,item){
                console.log(isInList($(item).val(),key))
                userchoices.push($(item).val())
                if (isInList($(item).val(),key)===false){
                    wrong(options.children('.'+$(item).val()))
                    isRight = false
                }
            })
            console.log(userchoices)
            for(let i=0;i<key.length;i++){
                if(isInList(key[i],userchoices)===false){
                    notChoose(options.children('.'+key[i]))
                    isRight = false
                }else {
                    right(options.children('.'+key[i]))
                }
            }
            return updateResults(id,isRight,userchoices)
        },
        PD:function () {
            key = key === 'F' ? '错误':'正确'
            let userchoices = $('input[name="option-'+id+'"]:checked').val();
            console.log(userchoices)
            let cOpt = options.children('.'+key)
            console.log(key)
            let uOpt = options.children('.'+userchoices)
            let isRight = true
            right(cOpt)
            if(key !== userchoices){
                wrong(uOpt)
                isRight = false
            }
            return updateResults(id,isRight,[userchoices])
        },

    }
    //引入设置功能，autoNext，答对自动下一题
    let status = operate[type]()
    console.log(status)
    if((!status.isDone)&&status.isRight&&gSautoNext()){
        next()
    }
}
async function showTimu() {
    // currentJumpSelection() //更新答题卡的位置
    $('.commentContainer').html('')
    let progress = gProgress()
    let info = gInfo()
    let type = info.order[progress.absPos].split('-')[0]
    let pos = info.order[progress.absPos].split('-')[1]
    let jsonData = gList().content[type][pos]
    jsonData = replaceWikitextUNITToHTML(jsonData)
    let id = progress.absPos
    let result = gResults()
    let isDone = result[type][pos]['isDone']
    let choice = result[type][pos]['choice']
    // console.log(JSON.stringify(jsonData))
    // let o = eval('newTimu("' + id + '",' + JSON.stringify(jsonData) + ',true).' + jsonData.type + '()')
    let parseTimu = new ParseTimu(id,jsonData)
    let o =  parseTimu[jsonData.type]();
    flushContent('.subjectContainer',o,100)
    setTimeout(function () {
        if (isDone||gSautoShowAnswer()) {
            $('#showAnsBtn-'+id).fadeOut(1)
            let targetID = fillUserChoice(id,type,choice,jsonData)
            targetID = targetID === undefined ? id:targetID
            let choosedAnswer = parseTimu.getThisChooseAnswer();
            let checkResult = parseTimu.showThisAnswer({ choosedAnswer: choosedAnswer, correctAnswer: parseTimu.answer });
        }
    },300)
    $.getScript("//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-MML-AM_CHTML", function() {
        MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
        // entry-content是文章页的内容div的class
        var math = document.getElementsByClassName("entry-content")[0];
        MathJax.Hub.Queue(["Typeset",MathJax.Hub,math]);
    });
}
function flushContent(i,c,t) {
    $(i).animate({ opacity: 0 }, t/2)

    setTimeout(function () {
        $(i).html(c)
        $(i).animate({ opacity: 1 }, t)
    },t+180)

}
function fillUserChoice(id,type,choice,json) {
    if (type === 'A' ||type === 'A2'|| type === 'PD') {
        fillRadio(id, choice);
    } else if (type === 'X') {
        fillCheckbox(id, choice);
    } else if (type === 'B' || type === 'C') {
        fillSelect(id, choice);
    } else if (type === 'A3') {
        let len = json['sourceRange'] * 1
        for (let n = 0; n < len; n++) {
            fillRadio(id+'-'+n, choice[n]);
        }
    }else if (type === 'TK' ) {
        fillText(id, choice);
    } else if (type === 'WD'|| type === 'MJ') {
        console.log(id,choice)
        fillTextarea(id, choice);
    }
}

// // value 是 string
function fillRadio(id, value) {
    let target = $('#' + prefixDic.radioId + id + '-' + value);
    target.attr('checked', 'checked');
}
// // 填入checkbox
// value 是 array
function fillCheckbox(id, value) {
    for (var i = 0; i < value.length; i++) {
        $('#' + prefixDic.checkboxId + id + '-' + value[i]).attr('checked', 'checked');
    }
}
// // 填入Select
// value 是 array
function fillSelect(id, value) {
    for (var i = 0; i < value.length; i++) {
        $('#' + prefixDic.selectId + id + '-' + i).val(value[i]);
    }
}
// // 填入text
function fillText(id, value) {
    for (var i = 0; i < value.length; i++) {
        // $('#' + prefixDic.textInputId + id + '-' + i).children('input').val(value[i]);
        $('#' + prefixDic.textInputId + id + '-' + i).val(value[i]);
    }
}
// // 填入textarea
function fillTextarea(id, value) {
    console.log(id, value);
    $('#' + prefixDic.textareaInputId + id).html(value);
}