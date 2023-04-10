function Settings() {
    let defaultSettings = {
        version:versions.current
        ,autoNext:{value: false,type:'boolean'}
        ,autoShowAnswer:{value: false,type:'boolean'}
        ,shortcut:{value: false,type:'boolean'}
        ,autoSync:{value: true,type:'boolean'}
        ,account:{type:'account'}
        ,syncAccount:{type:'syncAccount'}
        ,defaultOpenAnscard:{value:true,type:'boolean'}
        // ,advanced:{level:1,parent:'settingsContent'}
        // ,interface:{level:2,parent:'advanced'}
        // ,fontsize:{level:3,value:30,type:'integer',parent:'interface'}
    }
    let chinese = {
        vresion:'版本',
        basic:'基础设置',
        exercise:'做题设置',
        autoNext:'自动下一题',
        autoShowAnswer:'自动显示答案',
        shortcut:'快捷键',
        sync:'同步设置',
        autoSync:'自动同步',
        account:'账号管理',
        advanced:'高级设置',
        interface:'界面设置',
        font:'字体',
        fontsize:'字体大小',
        defaultOpenAnscard:'默认启动答题卡',
    }
    Settings.prototype.innitiate = function () {
        //如果设置是空的并且本地储存中没有设置保存则加载默认设置
        if($.isEmptyObject(gSettings())||$.isEmptyObject(gRecorder().settings)){
            sSettings(defaultSettings)
        }else {
            sSettings(gRecorder().settings)
            for(let i in defaultSettings){
                if(!(i in gSettings())){
                    let s = gSettings()
                    s[i] = defaultSettings[i]
                    sSettings(s)
                }
            }
        }
    }
    Settings.prototype.urlparams = function () {
        let result = {}
        const url = window.location.search.substr(1);
        if (url !== '') {
            let paramsArr = url.split('&');
            for (let i = 0; i < paramsArr.length; i++) {
                let c = paramsArr[i].split("=");
                result[c[0]] = decodeURIComponent(c[1])
            }
        }
        surlParam(result)
        return {status: true, result: result};
    }
    Settings.prototype.settingsInterface = function () {
        let settings = gSettings()
        console.log(settings)
        for(let i in settings){
            //获取设置当前状态
            let content = {
                boolean: function () {
                    let s = $('#'+i)
                    if(settings[i].value){
                        s.prop('checked',true)
                    }else {
                        s.prop('checked',false)
                    }
                    return s
                }
                ,account:function () {
                    setTimeout(async function () {
                        let sync = new Sync()
                        await sync.innitiate()
                        let userInfo = gUInfo()
                        $('#settingUserInfo').html('当前用户：'+userInfo.name+'[id：'+userInfo.id+']')
                        if(userInfo.id===0){
                            $('#settingUserInfo').append(' 请<a href="javascript:void(0);" data-dismiss="modal" data-toggle="modal" ' +
                                'data-target="#login">登录</a>或' +
                                '<a  target="_blank" href="https://www.medforest.cn/medf/index.php?title=%E7%89%B9%E6%AE%8A:%E5%88%9B%E5%BB%BA%E8%B4%A6%E6%88%B7&returnto=%E7%89%B9%E6%AE%8A%3AApiSandbox"">注册</a>')
                        }else{
                            $('#settingUserInfo').append('<a href="javascript:void(0);" onclick="logout()">注销</a>')
                        }
                    })
                }
                ,syncAccount:function () {
                    let userInfo = gUInfo()
                    let haveSyncInfo = getSyncUserInfo()
                    if(haveSyncInfo===false){
                        $('#settingSyncUserInfo').html('未登陆')
                    }else if(haveSyncInfo==='expired'){
                        $('#settingSyncUserInfo').html('已过期')
                    }else {
                        $('#settingSyncUserInfo').html(haveSyncInfo.token.substr(0,5)+'...('+secondsToFormated(haveSyncInfo.time)+' 后过期)')
                    }
                    if(haveSyncInfo === 'expired'&&gUInfo().id!==0){
                        $('#settingSyncUserInfo').append(' <a href="javascript:void(0);" data-dismiss="modal" data-toggle="modal" ' +
                            'data-target="#syncLogin">重新登录</a>')
                    }
                }
            }
            if(content.hasOwnProperty(settings[i].type)){
                content[settings[i].type]()
            }
        }
    }
}
function updateSattings() {
    let sync = new Sync()
    let storager = new Storager()
    let settings = gSettings()
    let newSetting = getModifiedSettings()
    for(let i in newSetting){
        console.log(settings[i].value)
        console.log(newSetting[i])
        if(settings[i].value !== newSetting[i]){
            settings[i].value = newSetting[i]
        }
    }
    sSettings(settings)
    storager.save()
    sync.upload()
    $('#applySettingsBtn').text('设置已保存')
    $('#applySettingsBtn').removeClass('btn-info')
    $('#applySettingsBtn').addClass('btn-success')
    setTimeout(function () {
        $('#applySettingsBtn').text('应用')
        $('#applySettingsBtn').addClass('btn-info')
        $('#applySettingsBtn').removeClass('btn-success')
    },3000)
}
function getModifiedSettings() {
    let json = formToJSON('#settingsContent',false,'s')
    for(let i in json){
        if(json[i]==='T'){
            json[i]=true
        }else if(json[i]==='F'){
            json[i]=false
        }
    }
    return json
}
function sSetting(s,v) {
    let settings = gSettings()
    settings[s] = v
    sSettings(settings)
}
function gSautoShowAnswer() {
    return gSettings().autoShowAnswer.value
}
function gSautoNext() {
    return gSettings().autoNext.value
}
function gSautoSync(){
    return gSettings().autoSync.value
}
function gSdefaultOpenAnscard() {
    return gSettings().defaultOpenAnscard.value
}

function gSshortcut() {
    return gSettings().shortcut.value
}