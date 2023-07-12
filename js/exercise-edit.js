function newInlineEditor(id, json, hideButton, addHr, parent) {
    parent = parent !== undefined ? parent : ''
    //将choice 统一为Array的转换
    if(typeOfObj(json.choices)==='[object Array]'&&json.choices.length===1&&type!=='A3'){
        json.choices = json.choices[0]
    }
    if (addHr === undefined) {
        addHr = true
    }
    if (hideButton === undefined) {
        hideButton = false
    }
    var type = json.type
    var o = new Object()
    o.temp = {
        main: $('<form name="edit-' + id + '" id="edit-' + id + '" class="type' + type + ' timuEditContainer">' +
            '<div class="alert alert-danger" role="alert">' +
            '<p style="color: red" class="editorTipsItem"><b>编辑器Tips</b><br></p>' +
            '<p class="editorTipsItem"><b>-->请勿同时编辑多个题目</b></p>' +
            '<p class="editorTipsItem"><b>-->本功能处于实验阶段，如果多次出现错误请使用手动编辑</b></p>' +
            '<p class="editorTipsItem"><b>-->本编辑器目前仅可编辑A1/A2, B, C, X型题</b></p>'+
            '</div>' +
           '</form>'),
        subject: $('<div class="subject"></div>'),
        range: $('<div class="sourceRange"></div>'),
        info: $('<textarea name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=info" class="info"></textarea>'),
        titleCon: $('<div class="titleContainer input-group"></div>'),
        source: $('<div class="input-group-prepend"><span class="input-group-text"></span></div>'),
        title: $('<textarea style="min-height: 80px" class="title-edit form-control" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=title"></textarea>'),
        options: $('<div class="options"></div>'),
        btn: $('<div class="edit-button-set"><button class="btn button-primary confirm-edit-btn" data-toggle="modal" data-target="#confirmEdit">确认更改</button>' +
            '<button style="margin-left: 5px" class="btn button-caution cancel-edit-btn">取   消</button></div>'),
        ansCon: $('<div style="max-width: 95%;" class="titleContainer"></div>'),
        correct: $('<div class="input-group mb-2">' +
            '<div class="input-group-prepend"><span class="input-group-text"><b>答案</b></span></div>' +
            '<textarea style="min-height: 80px" class="form-control" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=answer"></textarea>' +
            '</div>'),
        explain: $('<div class="input-group">' +
            '<div class="input-group-prepend"><span class="input-group-text"><b>解析</b></span></div>' +
            '<textarea style="min-height: 80px" class="form-control" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=explain"></textarea>' +
            '</div>'),
        select: $('<select class="button-small button-rounded button"></select>'),
        subTitle: $('<div id="" style="width: 100%"></div>')
    }
    o.hideButton = hideButton
    o.parent = parent
    o.temp.btn.children('.confirm-edit-btn').bind("click", function () {
        confirmEdit(id)
    })
    o.temp.btn.children('.cancel-edit-btn').bind("click", function () {
        $(this).text('确认关闭？已作的编辑不会保存！')
        $(this).unbind()
        $(this).bind('click',function () {
            $('.edit-button-set').remove()
            $('#edit-' + id).remove()
            showTimu()
        })
    })
    o.A = function () {
        this.temp.source.children('.input-group-text').text('题号'+json.source)
        this.temp.title.html(json.title)
        this.temp.correct.children('textarea').html(json.answer)
        this.temp.explain.children('textarea').html(json.explain)
        var options = formatAnsOrder(json.choices)
        for (var k in options) {
            let label = '<div class="input-group mb-2">' +
                '  <div class="input-group-prepend">' +
                '    <span class="input-group-text"><b>选项 ' + k + '</b></span>' +
                '  </div>' +
                '  <input type="text" class="form-control" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=choices&value=' + k + '" value="' + options[k] + '">' +
                '</div>'
            this.temp.options.append(label)
        }
        this.temp.titleCon.append(this.temp.source, this.temp.title)
        this.temp.ansCon.append(this.temp.correct, this.temp.explain)
        this.temp.subject.append(this.temp.titleCon, this.temp.options)
        this.temp.main.append(this.temp.subject, this.temp.ansCon)

        if (addHr) {
            this.temp.btn.append('<hr>')
        }
        this.temp.main = $('<div></div>').append(this.temp.main, this.temp.btn)
        console.log(this.temp.main)
        return this.temp.main
    }
    o.A2 = function () {
        this.temp.source.children('.input-group-text').text('题号'+json.source)
        this.temp.title.html(json.title)
        this.temp.correct.children('textarea').html(json.answer)
        this.temp.explain.children('textarea').html(json.explain)
        var options = formatAnsOrder(json.choices)
        for (var k in options) {
            let label = '<div class="input-group mb-2">' +
                '  <div class="input-group-prepend">' +
                '    <span class="input-group-text"><b>选项 ' + k + '</b></span>' +
                '  </div>' +
                '  <input type="text" class="form-control" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=choices&value=' + k + '" value="' + options[k] + '">' +
                '</div>'
            this.temp.options.append(label)
        }
        this.temp.titleCon.append(this.temp.source, this.temp.title)
        this.temp.ansCon.append(this.temp.correct, this.temp.explain)
        this.temp.subject.append(this.temp.titleCon, this.temp.options)
        this.temp.main.append(this.temp.subject, this.temp.ansCon)

        if (addHr) {
            this.temp.btn.append('<hr>')
        }
        this.temp.main = $('<div></div>').append(this.temp.main, this.temp.btn)
        console.log(this.temp.main)
        return this.temp.main
    }
    o.A3 = function () {
        var subIDs = []
        var s = json.source * 1;
        var e = json.source * 1 + json.sourceRange * 1 - 1
        this.temp.range.text('第 ' + s + ' 到 ' + e + ' 题')
        for (var i = 0; i < json.title.length; i++) {
            subIDs.push(id + '-' + i)
            if (json.explain[i] == undefined) {
                json.explain[i] = '暂无解析'
            }
            var data = {
                "type": "A",
                "source": json.source + '-' + (i + 1),
                "title": json.title[i],
                "answer": json.answer[i],
                "explain": json.explain[i],
                "choices": json.choices[i],
            }
            var newA = newTimu(id + '-' + i, data, true, false).A()
            render(id + '-' + i, 'A', newA, this.temp.titleCon)
        }
        o.temp.btn.bind("click", function () {
            showChoiceAnswer(subIDs, type, json.answer)
        })
        this.temp.info.text(json.info)
        this.temp.subject.append(this.temp.range, this.temp.info, this.temp.titleCon)
        if (!hideButton) {
            this.temp.main.append(this.temp.btn)
        }
        this.temp.main.append(this.temp.subject)

        if (addHr) {
            this.temp.btn.append('<hr>')
        }
        return this.temp.main
    }
    o.B = function () {
        var s = json.source * 1;
        var e = json.source * 1 + json.sourceRange * 1 - 1
        this.temp.range.text('第 ' + s + ' 到 ' + e + ' 题')

        var options = formatAnsOrder(json.choices)
        for (let k in options) {
            // let label = '<li id="' + k + '">' + k + ':<input class="oo-ui-inputWidget-input" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=choices&value=' + k + '"  class="options-edit" type="text" value="' + options[k] + '" /></li>'
            let label = '<div class="input-group mb-2">' +
                '  <div class="input-group-prepend">' +
                '    <span class="input-group-text"><b>选项 ' + k + '</b></span>' +
                '  </div>' +
                '  <input type="text" class="form-control" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=choices&value=' + k + '" value="' + options[k] + '">' +
                '</div>'
            this.temp.options.append(label)
            this.temp.select.append('<option value="' + k + '">' + k + '</option>')
        }
        for (let i = 0; i < json.title.length; i++) {
            var text = '<div class="titleContainer input-group">' +
                '<div class="input-group-prepend"><span class="input-group-text"><b>题目'+(s + i)+'</b></span></div>' +
                '<textarea class="form-control" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=title&value=' + i + '">' + json.title[i] + '</textarea>' +
                '</div>'
            this.temp.subTitle.attr('id', id + '-' + i)
            this.temp.subTitle.html(text)
            this.temp.titleCon.append(this.temp.subTitle.prop("outerHTML"))
        }
        var correctAnsEditor = $('<div class="correctAnsEditor"><p><b>编辑答案</b></p></div>')
        for (let i = 0; i < json.answer.length; i++) {
            correctAnsEditor.append('<div class="input-group mb-2">' +
                '<div class="input-group-prepend">' +
                '<span  class="input-group-text">答案' + (s + i) + '</span></div>' +
                '<input class="form-control" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=answer&value=' + i + '" value="' +json.answer[i]+'">'+
                '</div>')
        }
        this.temp.correct = correctAnsEditor
        var explain = $('<div class="correctExpEditor"><p><b>编辑解释</b></p></div>')
        for (let i = 0; i < json.explain.length; i++) {
            explain.append('<div class="input-group mb-2">' +
                '<div class="input-group-prepend">' +
                '<span  class="input-group-text">解析' + (s + i) + '</span></div>' +
                '<textarea class="form-control" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=explain&value=' + i + '">' + json.explain[i] + '</textarea>' +
                '</div>')
        }
        this.temp.explain = explain

        this.temp.subject.append(this.temp.range, this.temp.options, this.temp.titleCon)

        this.temp.ansCon.append(this.temp.correct, this.temp.explain)
        this.temp.main.append(this.temp.subject, this.temp.ansCon)
        if (addHr) {
            this.temp.btn.append('<hr>')
        }
        this.temp.main = $('<div></div>').append(this.temp.main, this.temp.btn)
        return this.temp.main
    }
    o.C = function () {
        var s = json.source * 1;
        var e = json.source * 1 + json.sourceRange * 1 - 1
        this.temp.range.text('第 ' + s + ' 到 ' + e + ' 题')

        var options = formatAnsOrder(json.choices)
        for (var k in options) {
            var label = '<div class="input-group mb-2">' +
                '  <div class="input-group-prepend">' +
                '    <span class="input-group-text"><b>选项 ' + k + '</b></span>' +
                '  </div>' +
                '  <input type="text" class="form-control" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=choices&value=' + k + '" value="' + options[k] + '">' +
                '</div>'
            this.temp.options.append(label)
            this.temp.select.append('<option value="' + k + '">' + k + '</option>')
        }
        for (var i = 0; i < json.title.length; i++) {
            var reg1 = /\(\)/g
            var text = '<div class="titleContainer input-group">' +
                '<div class="input-group-prepend"><span class="input-group-text"><b>题目'+(s + i)+'</b></span></div>' +
                '<textarea class="form-control" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=title&value=' + i + '">' + json.title[i] + '</textarea>' +
                '</div>'
            this.temp.subTitle.attr('id', id + '-' + i)
            this.temp.subTitle.html(this.temp.source.prop("outerHTML") + text)
            this.temp.titleCon.append(this.temp.subTitle.prop("outerHTML"))
        }
        var correctAnsEditor = $('<div class="correctAnsEditor"><p><b>编辑答案</b></p></div>')
        for (var i = 0; i < json.answer.length; i++) {
            correctAnsEditor.append('<div class="input-group mb-2">' +
                '<div class="input-group-prepend">' +
                '<span  class="input-group-text">答案' + (s + i) + '</span></div>' +
                '<textarea class="form-control" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=answer&value=' + i + '">' +json.answer[i]+'</textarea>'+
                '</div>')
        }
        this.temp.correct = correctAnsEditor
        var explain = $('<div class="correctExpEditor"><p><b>编辑解释</b></p></div>')
        for (var i = 0; i < json.explain.length; i++) {
            explain.append('<span>' + (s + i) + '：' + '<textarea class="title-edit oo-ui-inputWidget-input" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=explain&value=' + i + '">' + json.explain[i] + '</textarea></span><br>')
        }
        this.temp.explain = explain
        this.temp.subject.append(this.temp.range, this.temp.titleCon, this.temp.options)
        this.temp.ansCon.append(this.temp.correct, this.temp.explain)
        this.temp.main.append(this.temp.subject, this.temp.ansCon)
        if (addHr) {
            this.temp.btn.append('<hr>')
        }
        this.temp.main = $('<div></div>').append(this.temp.main, this.temp.btn)
        return this.temp.main
    }
    o.X = function () {
        this.temp.source.text(json.source)
        this.temp.title.text(json.title)
        this.temp.correct.children('textarea').html(json.answer)
        this.temp.explain.children('textarea').html(json.explain)
        var options = formatAnsOrder(json.choices)
        for (var k in options) {
            let label = '<div class="input-group mb-2">' +
                '  <div class="input-group-prepend">' +
                '    <span class="input-group-text"><b>选项 ' + k + '</b></span>' +
                '  </div>' +
                '  <input type="text" class="form-control" name="id=' + id + '&source=' + json.source + '&type=' + type + '&key=choices&value=' + k + '" value="' + options[k] + '">' +
                '</div>'
            this.temp.options.append(label)
        }

        this.temp.titleCon.append(this.temp.source, this.temp.title)
        this.temp.ansCon.append(this.temp.correct, this.temp.explain)
        this.temp.subject.append(this.temp.titleCon, this.temp.options)
        this.temp.main.append(this.temp.subject, this.temp.ansCon)
        if (addHr) {
            this.temp.btn.append('<hr>')
        }
        this.temp.main = $('<div></div>').append(this.temp.main, this.temp.btn)
        return this.temp.main
    }
    o.PD = function () {
        this.temp.source.text(json.source)
        this.temp.title.text(json.title)
        this.temp.explain.nextAll('.correctAnswer').text(json.explain)
        var ans = ''
        if (json.answer == 'T' || json.answer == '正确' || json.answer == '1' || json.answer == '√') {
            ans = '正确'
        } else if (json.answer == 'F' || json.answer == '错误' || json.answer == '0' || json.answer == '×') {
            ans = '错误'
        }
        this.temp.correct.nextAll('.correctAnswer').text(ans)
        o.temp.btn.bind("click", function () {
            showChoiceAnswer(id, 'A', ans)
        })
        this.temp.options.append('<label id="正确" style="display: inline;"><input name="singelChoice-' + id + '" type="radio" value="正确" />正确</label>' +
            '<label id="错误" style="display: inline;"><input name="singelChoice-' + id + '" type="radio" value="错误" />错误</label>')
        this.temp.titleCon.append(this.temp.source, this.temp.title)
        this.temp.ansCon.append(this.temp.correct, this.temp.explain)
        this.temp.subject.append(this.temp.titleCon, this.temp.options)
        if (!hideButton) {
            this.temp.main.append(this.temp.btn)
        }
        this.temp.main.append(this.temp.subject, this.temp.ansCon)

        if (addHr) {
            this.temp.main.append('<hr>')
        }
        return this.temp.main
    }
    o.TK = function () {
        this.temp.source.text(json.source)
        var form = $('<form id="form-' + id + '" class="title"></form>')
        var pos = json.pos
        var posReg = new RegExp(pos, 'g')
        var posCount = json.title.match(posReg).length
        for (var i = 0; i < posCount; i++) {
            json.title = json.title.replace(pos, '<input name="' + id + '-' + i + '" id="' + id + '-' + i + '" type="text" form="form-' + id + '"/>')
        }
        form.html(json.title)
        this.temp.title.text(json.title)
        this.temp.correct.nextAll('.correctAnswer').text(json.answer)
        this.temp.explain.nextAll('.correctAnswer').text(json.explain)

        this.temp.titleCon.append(this.temp.source, form)
        this.temp.ansCon.append(this.temp.correct, this.temp.explain)
        this.temp.subject.append(this.temp.titleCon, this.temp.options)
        if (!hideButton) {
            this.temp.main.append(this.temp.btn)
        }
        this.temp.main.append(this.temp.subject, this.temp.ansCon)

        if (addHr) {
            this.temp.main.append('<hr>')
        }
        return this.temp.main
    }
    o.MJ = function () {
        this.temp.source.text(json.source)
        this.temp.title.html(json.title + '：<span class="blur" tabindex="0" style="display:inline;outline=0;" onclick="">' + json.answer + '</span>')
        this.temp.titleCon.append(this.temp.source, this.temp.title)
        this.temp.subject.append(this.temp.titleCon, this.temp.options)
        this.temp.main.append(this.temp.subject)

        if (addHr) {
            this.temp.main.append('<hr>')
        }
        return this.temp.main
    }
    return o
}

function editThis(id) {
    $('#edit-before').html('')
    $('#edit-after').html('')
    var progress = store.get('medforest_tiku_progress')
    var info = store.get('medforest_tiku_info')
    var type = progress.type
    var pos = progress.pos
    var content = store.get('medforest_tiku_list').content
    var jsonData = content[type][pos]
    var i = type + '-' + pos
    $('#' + i).remove()
    console.log(jsonData.type)
    console.log(i)
    var o = eval('newInlineEditor("' + i + '",' + JSON.stringify(jsonData) + ',false,true).' + jsonData.type + '()')
    flushContent('.subjectContainer',o,100)
    console.log('加载题目：' + i)
}

async function confirmEdit(id) {
    var title = gList().title
    var data = formToJSON('#edit-' + id, true, 's')
    console.log(data)
    var formatedData = formatEditText(data)
    var template = JSONtoTemplate(formatedData)
    console.log(template)
    // try {
        inlineEditorPageText =await getOriginalText(title, formatedData, template)
    // } catch (e) {
    //     alert('获取本页内容失败，请检查网络并重试！\n如反复故障请先手动编辑并联系管理员。\n错误内容：' + e)
    // }

    if (inlineEditorPageText !== false) {
        $('#edit-before').html(inlineEditorPageText.inner)
        $('#edit-after').html(template)
        $('.edit-submit').bind('click',function () {
            submitChanges(id)
            $(this).unbind()
        })
    }

}
function formatEditText(json) {
    var result = {}
    var choices = {}
    var title = {}
    var answer = {}
    var explain = {}
    for (var i in json) {
        var data = formToJSON(i, true, 't')
        if ((result.id && result.type) === undefined) {
            result.id = data.id
            result.type = data.type
            result.source = data.source
        }
    }
    console.log(result)
    var transor = {
        A: function () {
            for (var i in json) {
                var data = formToJSON(i, true, 't')
                if (data.key === 'choices') {
                    choices[data.value] = json[i]
                } else {
                    result[data.key] = json[i].replace(/\\/g, '\\' + '\\').replace(/"/g, '\\' + '"')
                }
                console.log(data)
            }
            JSON.stringify(choices).match(/(?<=\{)([^}]*)(?=\})/g)
            result.choices = RegExp.$1
            console.log(result)
        },
        X: function () {
            transor.A()
        },
        B: function () {
            for (var i in json) {
                var data = formToJSON(i, true, 't')
                eval(data.key + '[data.value] = json[i]')
                console.log(data)
            }
            JSON.stringify(choices).match(/(?<=\{)([^}]*)(?=\})/g)
            result.choices = RegExp.$1
            result.title = arrayToString(dicValueToList(title))
            result.sourceRange = dicValueToList(title).length
            result.answer = arrayToString(dicValueToList(answer))
            result.explain = arrayToString(dicValueToList(explain))
            console.log(result)
        },
        C: function () {
            transor.B()
        }
    }
    transor[result.type]()

    return result
}
async function getOriginalText(pageTitle, timuData, editedText) {
    var latestPageData =await getLatestPageRevision(pageTitle)
    console.log(latestPageData)
    var regMatchInner = new RegExp('(?<=\\{\\{' + timuData.type + '型题\\n\\|source=' + timuData.source + '\\n)[^}}]*(?=\\}\\}?)', 'g')
    var regMatchFull = new RegExp('(\\{\\{' + timuData.type + '型题\\n\\|source=' + timuData.source + '\\n)[^}}]*(\\}\\})', 'g')
    if (timuData.type === 'B' || timuData.type === 'C') {
        regMatchInner = new RegExp('(?<=\\{\\{' + timuData.type + '型题\\n\\|source=' + timuData.source + '\\n\\|sourceRange=' + timuData.sourceRange + '\n)[^}}]*(?=\\}\\}?)', 'g')
        regMatchFull = new RegExp('(\\{\\{' + timuData.type + '型题\\n\\|source=' + timuData.source + '\\n\\|sourceRange=' + timuData.sourceRange + '\n)[^}}]*(\\}\\})', 'g')
    }
    console.log(regMatchInner)
    var inner = latestPageData.match(regMatchInner)
    var full = latestPageData.match(regMatchFull)
    console.log(inner)
    console.log(full)
    if (inner.length === 1 && full.length === 1) {
        latestPageData = latestPageData.replace(regMatchInner, editedText)
        return {full: full[0], inner: inner[0], replacedText: latestPageData}
    } else {
        var warnText = '匹配到重复内容，请点击确认转为手动编辑（已作的编辑会丢失，请注意保存！）'
        for(var i=0;i<full.length;i++){
            warnText += '\n===匹配数据：'+i+'===\n'+full[i]
        }
        var editSource = confirm(warnText)
        if (editSource){
            var confirmFresh = confirm('已作的编辑会丢失，如未保存请返回！')
            if(confirmFresh){
                $('#ca-edit').children('a')[0].click()
            }
        }
        return false
    }
}
function JSONtoTemplate(json, templateName) {
    var order = ['inputbox', 'title', 'choices', 'answer', 'explain', 'info']
    // var result = '{{'+templateName +'\n'
    var result = ''
    for (var i = 0; i < order.length; i++) {
        if (json[order[i]] !== undefined) {
            result += '|' + order[i] + '=' + json[order[i]].replace('\n','') + '\n'
        }
    }
    // result += '}}\n\n'
    return result
}

async function submitChanges(id) {
    var title = gList().title
    var data = formToJSON('#edit-' + id, true, 's')
    console.log(data)
    var formatedData = formatEditText(data)
    var template = JSONtoTemplate(formatedData)
    console.log(template)
    var pageData = inlineEditorPageText
    if (pageData !== false) {
        var confirmEdit = confirm('即将开始上传编辑，您的编辑会对所有题库用户产生影响，请再次确认您的编辑是否有误。\n感谢您对医林拾薪题库建设的贡献！')
        if (confirmEdit) {
            try {
                var token = store.get('medforest_user_info').token
                if(token.length<5){
                    console.log(token)
                    alert('获取用户TOKEN失败，请检查是否注册并登录或网络状态！\n如反复故障请先手动编辑并联系管理员。\n错误内容：')
                    $('#confirmEdit').modal('hide')
                    return false
                }
            } catch (e) {
                alert('获取用户TOKEN失败，请检查是否注册并登录或网络状态！\n如反复故障请先手动编辑并联系管理员。\n错误内容：' + e)
                $('#confirmEdit').modal('hide')
                return false
            }
            try {
                var edit = await editpage(
                    token
                    ,title
                    ,pageData.replacedText
                    ,'wikitext'
                    ,'tiku-edit|tiku-inline-editor'
                    ,'来自网页内题目的题目编辑，题目类型：' + formatedData.type + '；题号：' + formatedData.source + '；题目：' + formatedData.title
                )
                if (!edit.status){
                    alert('上传编辑失败，请检查是否注册并登录或网络状态！\n如反复故障请先手动编辑并联系管理员。\n错误类型：' + edit.result.error.code+'\n错误内容'+edit.result.error.info)
                    $('#confirmEdit').modal('hide')
                    return false
                }
            } catch (e) {
                alert('上传编辑失败，请检查是否注册并登录或网络状态！\n如反复故障请先手动编辑并联系管理员。\n错误内容：' + e)
                $('#confirmEdit').modal('hide')
                return false
            }

            if (edit.status) {
                let tiku = new Tiku()
                await tiku.innitiate(undefined,true)
                showTimu()
            }
        }
    }
}