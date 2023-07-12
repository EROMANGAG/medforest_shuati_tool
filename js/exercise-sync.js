function Sync() {
    let log = new Logger()
    Sync.prototype.innitiate = async function () {
        let haveSyncInfo = getSyncUserInfo() //检查云同步的用户信息是否存在
        console.log(haveSyncInfo)
        let [token,userInfo] =await Promise.all([getToken(),getUserInfo()]) //获取医林拾薪的token和用户数据
        if(token.status&&userInfo.status){ //如果医林拾薪token和用户信息获取成功
            console.info('>>Sync.innitiate()',token,userInfo)
            if(!haveSyncInfo){//则判断云同步信息是否存在，如果不存在，则设置syncToken为0
                sUInfo({
                    id:userInfo.result.id
                    ,name:userInfo.result.name
                    ,token:token.result
                    ,login:userInfo.result.id !== 0
                    ,syncToken:'0'
                    ,syncTokenExpiredTime:0
                })
            }else {
                sUInfo({
                    id:userInfo.result.id
                    ,name:userInfo.result.name
                    ,token:token.result
                    ,login:userInfo.result.id !== 0
                    ,syncToken:gUInfo().syncToken
                    ,syncTokenExpiredTime:gUInfo().syncTokenExpiredTime})
            }
        }else {
            console.error('>>Sync.innitiate()',token,userInfo)
            sUInfo({id:0,name:0,token:0,login:false})
            log.sync_inni_e(token.status,userInfo.status)
        }
    }
    Sync.prototype.createArchive = async function(){
        var log = new Logger()
        var user = store.get('medforest_user_info')
        if (user.id === 0) {
            log.sync_no_login_w()
            return false
        }
        //用户的答题记录
        var records = JSON.stringify(gRecorder())
        var zipped = zip(records)
        console.log('===上传答题数据===')
        var compressRate = (getStrLength(zipped) / getStrLength(records) * 100).toFixed(2) + '%'
        syncUploadInfoOn('压缩性能:(' + compressRate + ')')
        let editResult = await createArchive(user.id,zipped, user.syncToken)
        if (editResult.status){
            log.sync_upload_s()
        }else {
            log.sync_upload_c(editResult.result)
        }
        syncUploadInfoOff()
        location.reload(true)
    }
    Sync.prototype.download =async function () {
        let hasSyncUserInfo =getSyncUserInfo()
        console.log(gUInfo())
        //按设置判断是否继续同步
        if((hasSyncUserInfo===false || hasSyncUserInfo==='expired')&&gUInfo().id!==0){
            log.syncserver_info_e()
            return false
        }else if(gUInfo().id===0){
            log.sync_no_login_w()
        }
        //获取同步页面，使用的是后端的/sync/getArchive api
        // var returnSaveData =await getLatestPageRevision('题库:records/' + id)
        var returnSaveData =await downloadArchive(gUInfo().syncToken)
        console.log(returnSaveData)
        if(returnSaveData.status){
            //如返回成功，则等于result
            returnSaveData = returnSaveData.result
        }else{
            //如果不是网络错误，说明没有云端数据，显示生成云端数据接口
            if(returnSaveData.result !== 'networkError'){
                $('#mergeToSyncServerModal').modal('show')
            }else {
                log.sync_download_network_e()
            }
        }
        //如果存在或者含有内容则转换为JSON格式
        if (returnSaveData!==false&&returnSaveData.length>0) {
            returnSaveData = unzip(returnSaveData)
            try {
                var parsedSaveData = JSON.parse(returnSaveData)
            } catch (e) {
                log.sync_download_record_parse_e(e)
                return false
            }
            console.log(parsedSaveData)
            sRecorder(parsedSaveData)
            log.sync_download_s()
            console.info('>>Sync.prototype.download()',parsedSaveData)
            // if (load&&confirm('已下载数据,是否继续作答?')) loadLatest()
        } else {
            log.sync_download_c()
            console.warn('>>Sync.prototype.download()','失败')
        }
    }
    Sync.prototype.upload = async function(online=1){
        var log = new Logger()
        var user = store.get('medforest_user_info')
        if (user.id === 0) {
            log.sync_no_login_w()
            return false
        }

        //用户的答题记录
        var records = JSON.stringify(gRecorder())
        console.log(isEmptyObject(records))

        var zipped = zip(records)
        console.log('===上传答题数据===')
        var compressRate = (getStrLength(zipped) / getStrLength(records) * 100).toFixed(2) + '%'
        syncUploadInfoOn('压缩性能:(' + compressRate + ')')
        let editResult = await updateArchive(zipped, gUInfo().syncToken, online)
        if (editResult.status){
            log.sync_upload_s()
        }else {
            log.sync_upload_c(editResult.result)
        }
        syncUploadInfoOff()
    }
}
async function syncLoginProcess() {
    let data = formToJSON('#syncLoginForm',true,'s')
    console.log(data)
    let btn = $('#syncLoginBtn')
    btn.attr('disabled','disabled')
    btn.html(' <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>登入中...')
    let result = await syncLogin(data.name,data.password)

    if(result.status===true){
            $('#syncLoginResult').html('<p class="text-success">登录成功，等待页面刷新</p>')
            btn.html('登入成功')
            btn.removeClass('btn-primary')
            btn.addClass('btn-success')
            setTimeout(function () {
                $('#syncLogin').modal('hide')
                new Sync().download()
            },800)
    }else {
        $('#syncLoginResult').html('<p class="text-danger">登陆失败</p>')
        btn.html('登入')
        btn.prop('disabled',false)
    }
}
async function loginProcess() {
    let data = formToJSON('#loginForm',true,'s')
    console.log(data)
    let btn = $('#loginBtn')
    btn.attr('disabled','disabled')
    btn.html(' <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>登入中...')
    let result = await login(data.name,data.password)

    if(result===true){
        let sync = new Sync()
        await sync.innitiate()//重新加载一边用户数据以获得ID
        //获取sync的token
        let syncLoginRet = await syncLogin(data.name,data.password)
        if(syncLoginRet.status){
            $('#loginResult').html('<p class="text-success">登录成功，等待页面刷新</p>')
            btn.html('登入成功')
            btn.removeClass('btn-primary')
            btn.addClass('btn-success')
            setTimeout(function () {
                window.location.reload()
            },350)
        }else {
            $('#loginResult').html('<p class="text-danger">医林拾薪登陆成功，但云同步服务器登陆失败，请重试</p>')
            btn.html('登入')
            btn.prop('disabled',false)
        }
    }else {
        $('#loginResult').html('<p class="text-danger">医林拾薪登陆失败：'+result+'</p>')
        btn.html('登入')
        btn.prop('disabled',false)
    }
}
function handin() {
    let sync = new Sync()
    let storager = new Storager()
    let log = new Logger()
    if(readResult(gResults()).done!==0){
        let info = gInfo()
        info.isSaved = true
        sInfo(info)
        storager.save()
        sync.upload()
        log.handin_s()
    }else {
        log.handin_c()
    }
}
function undoHandin() {
    let btn = $('.undoHandInBtn')
    btn.removeClass('btn-warning')
    btn.addClass('btn-danger')
    btn.text('已撤销')
    btn.attr('onclick', '')
    let info = gInfo()
    let recorder = gRecorder()
    let sync = new Sync()
    let storager = new Storager()
    recorder.archive[info.id].info.isSaved = false
    info.isSaved = false
    sInfo(info)
    sRecorder(recorder)
    storager.save()
    sync.upload()
}
// 解压
function unzip(b64Data) {
    let strData = atob(b64Data);
    try{
        strData = pako.ungzip(strData,{to: 'string'})
    }catch (e){
        strData = false
    }

    return decodeURIComponent(strData);
}
// 压缩
function zip(str) {
    const binaryString = pako.gzip(encodeURIComponent(str), {to: 'string'})
    return btoa(binaryString);
}

//创建云存档
async function createArchiveBtn() {
    let sync = new Sync()
    sRecorder({
        counter:0,
        settings:{},
        archive:{
            0:{
                time:Date.now(),
                info: {},
                progress:{},
                results:{},
                list:{}
            }
        }
    })
    sync.createArchive()
}
//向云同步服务器迁移
async function toSyncServer(local) {
    let synced = false
    if(!local){
        synced = await downloadFromMedforest()
    }
    if(!synced){
        confirm('未发现云端数据，如果你不是第一次使用，请点取消后重试,如果你是第一次使用，请取消后选择第一次使用选项')
    }
}
//老的云同步下载
async function downloadFromMedforest() {
    var log = new Logger()
    let id = gUInfo().id === 0 ? false : gUInfo().id
    //按设置判断是否继续同步
    if(!id){
        log.sync_no_login_w()
        return false
    }
    //获取同步页面
    var page =await getLatestPageRevision('题库:records/' + id)
    console.log(page.length>0)
    //如果不存在或者无内容
    if (page!==false&&page.length>0) {
        page = unzip(page)
        try {
            var pJSON = JSON.parse(page)
        } catch (e) {
            log.sync_download_record_parse_e(e)
            return false
        }
        sRecorder(pJSON)
        log.sync_download_s()
        console.info('>>Sync.prototype.download()',pJSON)
        return true
        // if (load&&confirm('已下载数据,是否继续作答?')) loadLatest()
    } else {
        log.sync_download_c()
        console.warn('>>Sync.prototype.download()','失败')
        return false
    }
}