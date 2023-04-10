versions = {
    current:'1.1.2'
}
urls = {
    origin:'https://www.medforest.cn/',
    url:'https://www.medforest.cn/medf',
    apibase:'https://www.medforest.cn/medf/api.php',
    apiSync:'https://www.medforest.cn/tikuSync'
}
// urls = {
//     origin:'http://dav.medforest.cn/',
//     url:'http://dav.medforest.cn/medf',
//     apibase:'http://dav.medforest.cn/medf/api.php',
//     apiSync:'http://dav.medforest.cn/tikuSync'
// }

colors = {
    error:'#ff9e98',
    warn:'#ff8f88',
    caution:'#fdf8d3',
    info:'#adedff',
    success:'#88F888'
}

loggerTimes = {
    error:'10000',
    warn:'8000',
    caution:'6000',
    info:'5000',
    success:'3000'
}

loggerIcons = {
    upload:'<i class="bi bi-cloud-upload"></i>',
    download:'<i class="bi bi-cloud-download"></i>',
}

loggerTranslates = {
    error:'错误',
    warn:'警告',
    caution:'注意',
    info:'信息',
    success:'成功'
}

dataStructure = {
    'medforest_tiku_settings':{version:versions.current,exercise:{random:false,},sync:{auto:true,},interface:{font:'',fontsize:30,}},//用于记录用户设置和版本信息
    'medforest_tiku_info':{id:0,title:'初始化',revID:'','isSaved':false,randomOrder:false,order:{},pageID:''},//用于保存当前的题目标题和是否保存
    'medforest_tiku_progress':{type:'A',pos:0,absPos:0},//用于保存指针位置
    'medforest_tiku_list':{},//用于保存当前的题目信息
    'medforest_tiku_list_new':{},//用于保存打开新页面时下载的题目信息
    'medforest_tiku_results':{},//用于保存做题的结果
    typesDic: '{"A":[],"A2":[],"A3":[],"B":[],"C":[],"X":[],"PD":[],"TK":[],"MJ":[],"JD":[]}',
    typesList: ['A', 'A2', 'A3', 'B', 'C', 'X', 'PD', 'TK', 'MJ', 'JD'],
}