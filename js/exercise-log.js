function Logger() {
    let time = getFormatTime()
    let icon = loggerIcons
    let formatedTime = getFormatTime(undefined,true)
    Logger.prototype.urlparams = store.get('medforest_tiku_urlParamsSetting')
    Logger.prototype.network_e = function () {
        newToast({
            level:'error',
            title:'网络错误',
            subTitle:formatedTime,
            content:'与服务器通信超时，请检查网络',
            time:4000,
            icon:icon.upload
        })
    }
    Logger.prototype.server_return_e = function (e) {
        newToast({
            level:'error',
            title:'服务端返回错误',
            subTitle:formatedTime,
            content:'失败:服务端返回错误' +
                '<br>错误代码：' + e.code +
                '<br>错误提示：' + e.info,
            time:4000,
            icon:icon.upload
        })
    }
    Logger.prototype.login_s = function (n) {
        newToast({
            level:'success',
            title:'账号',
            subTitle:formatedTime,
            content:'用户：'+n+'，登入成功，三秒后将刷新页面',
            icon:icon.download
        })
    }
    Logger.prototype.login_token_e = function () {
        newToast({
            level:'error',
            title:'账号',
            subTitle:formatedTime,
            content:'<b>登入错误，token获取失败</b>',
            icon:icon.download
        })
    }
    Logger.prototype.login_e = function (e) {
        newToast({
            level:'error',
            title:'账号',
            subTitle:formatedTime,
            content:'<b>登入错误，提示：</b>' +
                '<br>'+e,
            icon:icon.download
        })
    }
    Logger.prototype.logout_s = function () {
        newToast({
            level:'success',
            title:'账号',
            subTitle:formatedTime,
            content:'退出成功',
            icon:icon.download
        })
    }
    Logger.prototype.logout_e = function () {
        newToast({
            level:'error',
            title:'账号',
            subTitle:formatedTime,
            content:'<b>登出错误，token获取失败</b>',
            icon:icon.download
        })
    }
    Logger.prototype.sync_inni_e = function (t,u) {
        newToast({
            level:'error',
            title:'用户信息获取错误！',
            subTitle:formatedTime,
            content:'<b>警告，用户信息获取错误！加载结束！</b>' +
                '<br>获取TOKEN:'+t +
                '<br>获取UserInfo:'+u,
            icon:icon.download
        })
    }
    Logger.prototype.syncserver_info_e = function (t,u) {
        newToast({
            level:'error',
            title:'同步服务token错误！',
            subTitle:formatedTime,
            content:'<b>同步服务器token获取错误！无法使用同步功能，请重新登陆获取密钥！</b>' +
                '<a href="javasvript:viod(0)" data-toggle="modal" data-target="#syncLogin">点击登录同步服务器</a>',
            icon:icon.download,
            clickToClose:false
        })
    }
    Logger.prototype.sync_no_login_w = function () {
        newToast({
            level:'warn',
            title:'未登录状态警告！',
            subTitle:formatedTime,
            content:'<b>警告，本工具需要登陆后才能使用，未登录状态下只能预览题目，但不能做题！！</b>' +
                '<a href="javasvript:viod(0)" data-toggle="modal" data-target="#login">>>点击注册或登录<<</a>',
            icon:icon.download,
            clickToClose:false
        })
    }
    Logger.prototype.sync_download_record_parse_e = function (e='') {
        newToast({
            level:'error',
            title:'云同步',
            subTitle:formatedTime,
            content:'<b>云端记录初始化失败！请检查数据是否被手动编辑或者损坏！</b>' +
                '<br>错误信息：'+e,
            icon:icon.download
        })
    }
    Logger.prototype.sync_download_network_e = function () {
        newToast({
            level:'error',
            title:'云同步',
            subTitle:formatedTime,
            content:'<b>云同步网络错误</b>',
            icon:icon.download
        })
    }
    Logger.prototype.sync_download_s = function () {
        newToast({
            level:'success',
            title:'云同步',
            subTitle:formatedTime,
            content:'已同步云数据',
            icon:icon.download
        })
    }
    Logger.prototype.sync_download_c = function () {
        newToast({
            level:'caution',
            title:'云同步',
            subTitle:formatedTime,
            content:'同步失败，您可能没有云端数据',
            icon:icon.download
        })
    }
    Logger.prototype.sync_upload_s = function () {
        newToast({
            level:'success',
            title:'云同步上传',
            subTitle:formatedTime,
            content:'已同步云数据',
            icon:icon.upload
        })
    }
    Logger.prototype.sync_upload_c = function (e) {
        newToast({
            level:'caution',
            title:'云同步上传',
            subTitle:formatedTime,
            content:'数据上传失败' +
                '<br>错误代码：' + e.code +
                '<br>错误提示：' + e.msg,
            icon:icon.upload
        })
    }
    Logger.prototype.handin_s = function () {
        newToast({
            level:'success',
            title:'交卷',
            subTitle:formatedTime,
            content:'交卷成功!本次答题记录已标记为完成，云同步成功' +
                '<button type="button" class="undoHandInBtn btn btn-warning" onclick="undoHandin()">手滑了，撤销交卷</button>',
            icon:icon.upload,
            time:10000,
            clickToClose:false
        })
    }
    Logger.prototype.handin_c = function () {
        newToast({
            level:'caution',
            title:'交卷',
            subTitle:formatedTime,
            content:'交卷失败，请至少完成一道题目后再交卷',
            icon:icon.upload
        })
    }
    Logger.prototype.download_timu_e = function (e) {
        newToast({
            level:'error',
            title:'用户信息获取错误！',
            subTitle:formatedTime,
            content:'失败:下载题目失败，请检查题库标题是否正确' +
                '<br>错误代码：' + e.code +
                '<br>错误提示：' + e.info,
            icon:icon.download
        })
    }
    Logger.prototype.inni_timu_s = function () {
        newToast({
            level:'success',
            title:'题目初始化成功',
            subTitle:formatedTime,
            content:'获取题目成功，题目初始化完成',
            icon:icon.download
        })
    }
    Logger.prototype.edit_server_return_e = function (e) {
        newToast({
            level:'error',
            title:'上传页面',
            subTitle:formatedTime,
            content:'失败:上传失败（服务端返回错误）' +
                '<br>错误代码：' + e.code +
                '<br>错误提示：' + e.info,
            time:4000,
            icon:icon.upload
        })
    }
    Logger.prototype.exercise_no_last_i = function () {
        newToast({
            level:'info',
            title:'转跳',
            subTitle:formatedTime,
            content:'没有上一题了',
            time:4000,
            icon:icon.upload
        })
    }
    Logger.prototype.store_load_s = function (id) {
        newToast({
            level:'success',
            title:'本地数据',
            subTitle:formatedTime,
            content:`成功读取第 ${id} 条做题记录
            <br>上次做到第 ${gRecorder().archive[id].progress.absPos} 题`,
            icon:icon.download
        })
    }
    Logger.prototype.store_load_s = function (id) {
        newToast({
            level:'success',
            title:'本地数据',
            subTitle:formatedTime,
            content:`成功读取第 ${id} 条做题记录
            <br>上次做到第 ${gRecorder().archive[id].progress.absPos} 题`,
            icon:icon.download
        })
    }
    Logger.prototype.toggleRandom= function(isRandom){
        isRandom = isRandom === true ? '乱序':'顺序'
        newToast({
            level:'success',
            title:'答题顺序切换',
            subTitle:formatedTime,
            content:'已切换为 '+isRandom+'，本次答题记录已重置',
            icon:icon.download
        })
    }
}

//消息框
function newToast({title= '',subTitle = '',content = '',time = ''
                  ,icon = '',bc = '',level = '',clickToClose=true}={}){
    time = time === '' ? loggerTimes[level] : time
    bc = bc === '' ? colors[level] : bc
    var levelMessage = loggerTranslates[level]
    var mes = $('#messages')
    var id = Date.now()
    var template = $(' <div id="toast-'+id+'" class="toast hide" role="alert"' +
        'aria-live="assertive" aria-atomic="true" data-delay="'+time+'">' +
        '    <div class="toast-header" style="background-color: '+bc+'"> ' + icon +
        '      <strong class="mr-auto">['+levelMessage+'] ' + title + '</strong>' +
        '      <small>'+subTitle+'</small>' +
        '    </div>' +
        '    <div class="toast-body">' + content+
        '    </div>' +
        '  </div>')
    if(clickToClose){
        template.bind('click',function () {
            $(this).toast('hide')
        })
    }
    template.appendTo(mes)
    $('#toast-'+id).toast('show')
    setTimeout(function () {
        $('#toast-'+id).remove()
    },time+1000)

}