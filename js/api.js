function Api() {
    let log = new Logger()
    Api.prototype.post = function (url,params,async,headers,beforeSend,error) {
        var r = {status: false}
        return new Promise((resolve, reject) => {
                $.ajax({
                    headers:headers,
                    url: url,
                    method: "post",
                    async: true,
                    data: params,
                    timeout: 5000,
                    beforeSend: beforeSend,
                    success: function (results) {
                        if('error' in results){
                            r.status = false
                            r.result = results
                            r.code = 'server error'
                            // log.server_return_e(results.error)
                            reject(r)
                        }else {
                            r = {status:true,result:results}
                            resolve(r)
                        }
                    },
                    error: [error, function (e) {
                        r.status = false
                        r.result = e
                        r.code = 'connection error'
                        // log.network_e()
                        reject(r)
                    }]
                })
            }
        )
    }
    Api.prototype.get = function (url,params,async,headers,beforeSend,error) {
        var r = {status: false}
        return new Promise((resolve, reject) => {
                $.ajax({
                    headers:headers,
                    url: url,
                    method: "get",
                    async: true,
                    data: params,
                    timeout: 5000,
                    beforeSend: beforeSend,
                    success: function (results) {
                        if('error' in results){
                            r.status = false
                            r.result = results.error
                            r.code = 'server error'
                            // log.server_return_e(results.error)
                            reject(r)
                        }else {
                            r = {status:true,result:results}
                            resolve(r)
                        }
                    },
                    error: function (e) {
                        r.status = false
                        r.code = 'connection error'
                        r.result = e
                        // log.network_e()
                        reject(r)
                    }
                })
            }
        )
    }
}
async function logout(){
    var api = new Api()
    var log = new Logger()
    let token = await getToken()
    if(token.status){token = token.result}else {
        logout.logout_e()
        return false
    }
    await api.post(urls.apibase,{
        "action": "logout",
        "format": "json",
        "token": token
    })
    sRecorder({})
    sUInfo({id: 0, name: 0, token: 0, login: false, syncToken:0, syncTokenExpiredTime:0})
    sResults({})
    new Settings().settingsInterface()
    log.logout_s()
}

async function login(name,pw){
    var api = new Api()
    var log = new Logger()
    let token = await getToken('login')
    if(token.status){token = token.result}else {log.login_token_e();return false}
    let results = await api.post(urls.apibase,{
        "action": "clientlogin",
        "format": "json",
        "logintoken": token,
        "username":decodeURI(name),
        'password':pw,
        'loginreturnurl':window.location.href
    })
    console.log(results)
    if(results.result.clientlogin.status==='PASS'){
        log.login_s(results.result.clientlogin.username)
        return true
    }else {
        log.login_e(results.result.clientlogin.message)
        return results.result.clientlogin.message
    }

}
async function syncLogin(name,pwd) {
    var r = {status: false}
    console.log(urls.apiSync)
    await $.ajax({
        url: urls.apiSync+'/users/login',
        method: "get",
        async: true,
        data: {
            name:decodeURIComponent(name),
            pwd:pwd,
            expire:120,
        },
        timeout: 5000,
        success: function (results) {
            if(results.result.status===false){
                r.status = false
                r.code = 'connection error'
                r.result = results.result.msg
            }else {
                r.status = true
                r.result = results.result
                //如果成功直接设置到Uinfo内
                let u= gUInfo()
                u.syncToken = results.result.token
                u.syncTokenExpiredTime = results.result.expiredAt
                sUInfo(u)
            }
        },
        error: function (e) {
            r.status = false
            r.code = 'connection error'
            r.result = e
            // log.network_e()
        }
    })
    return r
}
async function editpage(token, title, content, model = 'wikitext', tags = '', summary = '', minor = '0') {
    var api = new Api()
    var log = new Logger()
    var isSuccess = {status: false, result: '0'}
    var results = await api.post(urls.apibase,{
        "action": "edit",
        "format": "json",
        "title": title,
        "text": content,
        "token": token,
        'contentmodel' : model,
        "summary": summary,
        "tags": tags,
        "minor": minor,
    })
    isSuccess.status = results.status
    isSuccess.result = results.result
    return isSuccess
}
//获取token
async function getToken(type='csrf') {
    var api = new Api()
    var r = {status: false, result: '0'}
    var a = await api.get(urls.apibase, {
        "action": "query",
        "format": "json",
        'meta': 'tokens',
        "type": type
        // 'origin':'*',
    }, false).then((s)=>{
        let token = s.result.query.tokens[type+'token']
        if (token.length >= 5) {
            r.status = true
            r.result = token
        }else {
            r.code = 'no token'
            r.result = s
        }
    },(err)=>{
        r.code = err.code
        r.result = err.result
    })
    return r
}
//获取用户数据
async function getUserInfo() {
    var api = new Api()
    var r = {status: false, result: {}}
    await api.get(urls.apibase,{
        "action": "query",
        "format": "json",
        "meta": "userinfo",
    }, false).then((s)=>{
        r.status = true
        r.result.id = s.result.query.userinfo.id === 0||undefined ? 0 : s.result.query.userinfo.id
        r.result.name = s.result.query.userinfo.name === undefined ? '' : s.result.query.userinfo.name
    },(err)=>{
        r.code = err.code
        r.result = err.result
    })

    return r
}
//获取同步相关用户数据
function getSyncUserInfo() {
    let uInfo = gUInfo() === undefined ? {}: gUInfo()
    if(uInfo.syncToken===undefined){
        return false
    }else if(uInfo.syncTokenExpiredTime<Date.now()){
        return 'expired'
    }else {
        return {token:uInfo.syncToken,time:parseInt((uInfo.syncTokenExpiredTime-Date.now())/1000)}
    }
}
//获取某个页面的历史版本
async function getPageRevision(title, pageCount=1,rvprop='content'){
    var api = new Api()
    var r = {status:false, result:'0'}
    await api.get(urls.apibase,{
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "utf8": 1,
        "rvprop": rvprop,
        "titles": title,
        "rvlimit": pageCount,
        "rvdir": "older",
        // 'origin':origin,
    },false).then((s)=>{
        if('-1' in s.result.query.pages){
            console.log('===无此页面===')
            r.code = 'no page'
        }else {
            r.status = true
        }
        r.result = s.result
    },(err)=>{
        r.code = err.code
        r.result = err.result
    })
    // console.log(results)
    // if(results.status){
    //     if('-1' in results.result.query.pages){
    //         console.log('===无此页面===')
    //         r = {status:false, result:results.result}
    //     }else {
    //         r = {status:true, result:results.result}
    //     }
    // }
    return r
}
//获取最新页面
async function getLatestPageRevision(title) {
    var pages = await getPageRevision(title, 1)
    console.log(111)
    console.log(pages)
    if (pages.status) {
        pages = pages.result.query.pages
        for (var key in pages) {
            var page = pages[key].revisions[0]['*']
        }
        return page
    } else {
        return false
    }
}
//获取提供时间戳之前的最新页面
async function getLatestPageRevisionAsTime(title, timestamp) {
    var api = new Api()
    var r = {status: false, result: {}}
    var results = await api.get(urls.apibase,{
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "titles": title,
        "utf8": 1,
        "rvprop": "ids|timestamp|content",
        "rvlimit": "1",
        "rvstart": timestamp,
        "rvdir": "older",
        // 'origin':origin,
    }, false)
    if (results.status) {
        if ('-1' in results.result.query.pages) {
            console.log('===无此页面===')
            r = false
        } else {
            var pages = results.result.query.pages
            console.log(pages)
            for (var key in pages) {
                r.result.page = pages[key].revisions[0]['*']
                r.result.revID = pages[key].revisions[0].revid
                r.result.pageID = key
                r.status = true
                console.log(r)
            }
        }
    }
    return r
}
//获取经过解析的页面
async function getParsedPageByRevid(revid) {
    var api = new Api()
    var r = {status: false, result: {}}
    var results = await api.get(urls.apibase,{
        "action": "parse",
        "format": "json",
        "oldid": revid,
        "utf8": 1,
        'origin': '*'
    }, false)
    console.log(revid)
    r.result = results.result.parse.text["*"]
    return r
}

//基于原始api对其数据进行操作的函数
//按照时间获取最新的题库
async function getTimuAsTime(url,title,revid){
    var r = {status: false, result: {}}
    var results = await getParsedPageByRevid(revid)
    console.log(results)

    store.set('medforest_tiku_list_new', {})
    r.result = JSON.parse(cons.typesDic)
    var i = 0
    results.result = $(results.result).children('.data').each(
        function () {
            var singleData = $(this).html()
            if ($(this).children().length > 0) {
                $(this).children().each(
                    function (n, v) {
                        var innerHTML = entityToString(v)
                        var escape = ''
                        escape = innerHTML.replace(/"/g, '\\"')
                        singleData = singleData.replace(innerHTML, escape)
                    }
                )
            }
            var content = $.parseJSON(singleData)
            var type = content.type
            console.log(type)
            i += 1
            r.result[type].push(content)
        }
    )
    r.status = true
    store.set('medforest_tiku_list_new', {title: title, time: getFormatTime(), content: r.result})
    console.log(r)

    return r
}
//获取题库id
async function getTikuIDs(title) {
    var tikuInfo = await getPageRevision(title, 1, 'ids')
    if(tikuInfo.status){
        var ids = tikuInfo.result.query.pages[Object.keys(tikuInfo.result.query.pages)[0]].revisions[0]
        ids.pageID = Object.keys(tikuInfo.result.query.pages)[0]
        return Promise.resolve({status:true,result:ids})
    }else {
        return Promise.reject('111')
    }
}
async function getTikuIDsByTime(title,timestamp){
    var tikuInfo = await getLatestPageRevisionAsTime(title, timestamp)
    if(tikuInfo.status){
        var ids = {revID:tikuInfo.result.revID,pageID:tikuInfo.result.pageID}
        return Promise.resolve({status:true,result:ids})
    }else {
        return Promise.reject('111')
    }
}

async function checkToken(token) {
    var api = new Api()
    var r = {status:false, result:'0'}
    await api.get(urls.apibase,{
        "action": "checktoken",
        "format": "json",
        "type": "csrf",
        "token": '30f0949c39bf28823859eb6701166c1c6414692e+\\'
    },false).then((s)=>{
        if(s.result.code!==200){
            console.log('===无此页面===')
            r.code = 'no page'
        }else {
            r.status = true
        }
        r.result = s.result
    },(err)=>{
        r.code = err.code
        r.result = err.result
    })
    return r
}


//获取数据库存档信息
async function downloadArchive(token) {
    var r = {status:false,result:''}
    await $.ajax({
        headers:{
            Authorization:'Bearer '+token
        },
        url: urls.apiSync+'/sync/getArchive',
        method: "get",
        async: true,
        data: {
            token:gUInfo().syncToken
        },
        timeout: 5000,
        success: function (results) {
            if(results.result.status===false){
            }else {
                r.status = true
                r.result = results.result.data
            }
        },
        error: function (e) {
            r.status=false
            r.result = 'networkError'
        }
    })
    return r
}
//更新数据库存档信息
async function updateArchive(data,token,online) {
    var r = {status:false,result:{}}
    const statics = readResult(gResults())
    await $.ajax({
        headers:{
            Authorization:'Bearer '+token
        },
        url: urls.apiSync+'/sync/updateArchive',
        method: "post",
        async: true,
        data: {
            token:gUInfo().syncToken,
            'exercise_savedata':data,
            title:gList().title,
            pos:'abs:'+gProgress().absPos+'|type:'+gProgress().type+'|pos:'+gProgress().pos,
            done:statics.all-statics.notdone,
            right:statics.right,
            online:online
        },
        timeout: 5000,
        success: function (results) {
            r.status = results.result.status
            r.result = results.result
        },
        error: function (e) {
        }
    })
    console.log(r)
    return r
}
//更新数据库存档信息
async function createArchive(id,data,token) {
    var r = {status:false,result:{}}
    const statics = readResult(gResults())
    await $.ajax({
        headers:{
            Authorization:'Bearer '+token
        },
        url: urls.apiSync+'/sync/insertArchive',
        method: "post",
        async: true,
        data: {
            user_id:id,
            token:gUInfo().syncToken,
            'exercise_savedata':data,
        },
        timeout: 5000,
        success: function (results) {
            r.status = results.result.status
            r.result = results.result
        },
        error: function (e) {
        }
    })
    console.log(r)
    return r
}