function updateDataStructure(id) {
    let o = {
        '0.4.5.0to1.0.0.0': async function () {
            let success = true
            let r = gRecorder()
            let oldArc = gRecorder().archive
            let total = 0
            for (let i in oldArc) {
                if (!('favorite' in oldArc[i].info) || !('pageid') in oldArc[i].list) {
                    total += 1
                }
            }
            $('#updateStatus').append('<p>共 ' + total + ' 个脚本需要更新</p>')
            $('updateProgressBar').attr('aria-valuemax', total)
            for (let i in oldArc) {
                console.log(i)
                if (!('favorite' in oldArc[i].info) || !('pageid') in oldArc[i].list) {
                    //处理info
                    try {
                        delete oldArc[i].info.title
                        oldArc[i].info.favorite = {}
                        oldArc[i].info.isRandom = false
                        let total = 0
                        let order = {}
                        let c = 0
                        for (let n in oldArc[i].info.len) {
                            total += oldArc[i].info.len[n]
                            for (let m = 0; m < oldArc[i].info.len[n]; m++) {
                                order[c] = n + '-' + m
                                c += 1
                            }
                        }
                        oldArc[i].info.total = total
                        oldArc[i].info.order = order
                    }catch (e) {
                        success = false
                        $('#updateStatus').append('<div class="alert alert-danger" role="alert">id:'+i+'的 info属性处理失败'+e+'</div>')
                        progressAddWrong(total)
                        continue
                    }
                    //progress 全部重置为0
                    oldArc[i].progress = {absPos: 1, pos: "1", type: "A"}
                    //处理list
                    try {
                        let oldtime = oldArc[i].list.time.split(' ')
                        console.log(oldtime)
                        oldArc[i].list.time = oldtime[0] + 'T' + oldtime[1] + 'Z'
                    }catch (e) {
                        $('#updateStatus').append('<div class="alert alert-warning" role="alert">id:'+i+'的 list.time 属性处理失败'+e+'</div>')
                        progressAddWrong(total)
                        continue
                    }
                    oldArc[i].list.content = {}
                    try {
                        let title = oldArc[i].list.title
                        let log = new Logger()
                        let api = new Api()
                        let results = await api.get(urls.apibase,{
                            "action": "parse",
                            "format": "json",
                            "page": title,
                            "utf8": 1,
                            "prop": "text|revid",
                            'origin': '*',
                        }, false).catch(e => {
                            log.download_timu_e(e)
                        })
                        let parsedData = results.result.parse
                        console.log(parsedData)
                        oldArc[i].list.pageid = parsedData.pageid
                        oldArc[i].list.revid = parsedData.revid
                    }catch (e) {
                        success = false
                        $('#updateStatus').append('<div class="alert alert-danger" role="alert">id:'+i+'的 list.revid 和 list.pageid 属性处理失败'+e+'</div>')
                        progressAddWrong(total)
                        continue
                    }
                    r.archive = oldArc
                    console.log(oldArc)
                    sRecorder(r)
                    progressAddSuccess(total)
                }
            }
            sProgress({})
            sUInfo({})
            sInfo({})
            sSettings({version:'1.0.0.0'})
            sList({})
            sNewList({})
            surlParam({})

            let sync = new Sync()
            if(total>0){
                await sync.innitiate()
                if(gUInfo().id!==0){
                    await sync.upload()
                }else {
                    alert('未登录！如果您以前使用过本工具，请登录后再升级！否则会导致升级无法生效！')
                }
            }else {
                window.location.reload(true)
            }
            if(success){
                if(confirm('数据结构升级完成，请点击确认刷新后体验新版')){
                    window.location.reload(true)
                }
            }else {
                if(confirm('数据结构升级完成，其中存在部分错误，但可能不影响正常使用，您可以在"设置->底部关于->重新运行升级脚本"重新升级，请点击确认刷新后体验新版')){
                    window.location.reload(true)
                }
            }
        }
        ,'1.0.0.0to1.1.0.0': async function () {
            let sync = new Sync()
            await sync.innitiate()
            if (gUInfo().id !== 0) {
                let sList = ['exercise-common.js','exercise-config.js'
                    ,'exercise-display.js','exercise-edit.js'
                    ,'exercise-log.js','exercise-main.js'
                    ,'exercise-settings.js','exercise-store.js'
                    ,'exercise-sync.js','exercise-tiku.js'
                    ,'exercise-update.js','api.js'
                ]
                for(let i=0;i<sList.length;i++){
                    $("script[src='./js/"+sList[i]+"']").remove();
                    await $.getScript('./js/'+sList[i]+'?v='+Date.now())
                    console.log('reloadScript')
                }

                alert('升级完成！接下来会弹出一个登陆窗口和一个迁移数据窗口，请依次完成后手动刷新页面开始使用新版本！')
                // $('#updateModal').modal('hide')
                $('#syncLogin').modal('show')
                $('#updateBtn').unbind()
                $('#updateBtn').text('完成登陆和迁移后点击完成更新')
                $('#updateBtn').bind('click',async function () {

                    if (getSyncUserInfo().expired) {
                        sSettings({version: '1.1.0.0'})
                        new Storager().save()
                        await sync.upload()
                        $('#updateBtn').text('升级完成！')
                        setTimeout(function () {
                            window.location.reload(true)
                        },300)
                    } else {
                        alert('数据迁移失败，请重试')
                        window.location.reload(true)
                    }
                })
            }else {
                alert('未登录！如果您以前使用过本工具，请登录后再升级！否则会导致升级无法生效！')
                window.open(urls.url+'/index.php?title=特殊:用户登录')
            }


        }
        ,'1.1.0.0to1.1.1.0': async function () {
            await new Sync().innitiate()
            if (gUInfo().id !== 0 && gUInfo().syncToken !== '0') {
                await updateScript()
                alert('升级完成！点击确认刷新页面')
                sSettings({version: '1.1.1.0'})
                new Storager().save()
                await new Sync().upload()
                window.location.reload(true)
            } else {
                alert('未登录！如果您以前使用过本工具，请登录后再升级！否则会导致升级无法生效！')
                $('#login').modal('show')
                $('#updateBtn').text('重试')
                $('#updateBtn').prop('disabled',false)
            }
        }
        ,'1.1.1.0to1.1.2': async function () {
            await new Sync().innitiate()
            if (gUInfo().id !== 0 && gUInfo().syncToken !== '0') {
                await updateScript()
                alert('升级完成！点击确认刷新页面')
                sSettings({version: '1.1.2'})
                new Storager().save()
                await new Sync().upload()
                window.location.reload(true)
            } else {
                alert('未登录！如果您以前使用过本工具，请登录后再升级！否则会导致升级无法生效！')
                $('#login').modal('show')
                $('#updateBtn').text('重试')
                $('#updateBtn').prop('disabled',false)
            }
        }
    }
    o[id]()
}

function progressAddWrong(total){
    $("#updateProgressBar").append('<div class="progress-bar bg-danger" role="progressbar" style="width: '+1/total*100+'%"></div>')
}
function progressAddSuccess(total) {
    $("#updateProgressBar").append('<div class="progress-bar bg-success" role="progressbar" style="width: '+1/total*100+'%"></div>')
}

function checkAndShowUpdate(version=undefined) {
    version = version===undefined ? versions.current:version
    console.log(version)
    //如果不是第一次使用则检查是否有更新
    if(gSettings()!==undefined){
        if(version!==gSettings().version){
            $('#updateModal').modal('show')
            if(version === '1.0.0.0'){
                $('#1000').fadeIn('fast')
                $('#updateBtn').unbind()
                $('#updateBtn').bind('click',function () {
                    updateDataStructure('0.4.5.0to1.0.0.0')
                })
            }else if(version === '1.1.0.0'){
                $('#1100').fadeIn('fast')
                $('#updateBtn').unbind()
                $('#updateBtn').bind('click',function () {
                    updateDataStructure('1.0.0.0to1.1.0.0')
                })
            }else if(version === '1.1.1.0'){
                console.log(version)
                $('#1110').fadeIn('fast')
                $('#updateBtn').unbind()
                $('#updateBtn').bind('click',function () {
                    updateDataStructure('1.1.0.0to1.1.1.0')
                })
                $('#updateBtn').attr('disabled','disabled')
                $('#updateBtn').text('自动升级中...')
                $('#updateBtn').click()
            }
            else if(version === '1.1.2'){
                console.log(version)
                $('#112').fadeIn('fast')
                $('#updateBtn').unbind()
                $('#updateBtn').bind('click',function () {
                    updateDataStructure('1.1.1.0to1.1.2')
                })
                $('#updateBtn').attr('disabled','disabled')
                $('#updateBtn').text('自动升级中...')
                $('#updateBtn').click()
            }
            return true
        }
    }
    return false
}

async function updateScript(slected) {
    let sList = ['exercise-common.js','exercise-config.js'
        ,'exercise-display.js','exercise-edit.js'
        ,'exercise-log.js','exercise-main.js'
        ,'exercise-settings.js','exercise-store.js'
        ,'exercise-sync.js','exercise-tiku.js'
        ,'exercise-update.js','api.js'
    ]
    for(let i=0;i<sList.length;i++){
        $("script[src='./js/"+sList[i]+"']").remove();
        await $.getScript('./js/'+sList[i]+'?v='+Date.now())
        console.log('reloadScript')
    }
}