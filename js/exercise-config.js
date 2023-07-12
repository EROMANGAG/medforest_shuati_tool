versions = {
    current:'1.1.2',
    branch:'1',
    type:'hotfix'
}
// urls = {
//     origin:'https://www.medforest.cn/',
//     url:'https://www.medforest.cn/medf',
//     apibase:'https://www.medforest.cn/medf/api.php',
//     apiSync:'https://www.medforest.cn/tikuSync'
// }
urls = {
    origin:'http://dav.medforest.cn/',
    url:'http://dav.medforest.cn/medf',
    apibase:'http://dav.medforest.cn/medf/api.php',
    apiSync:'http://dav.medforest.cn/tikuSync'
}

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

dataType = {
    'medforest_tiku_info' : {
        type:'object'
        ,children:{
            id:{type:'number',children:{}}
            ,len:{type:'object',children:{
                A:{type:'number',children:{}}
                ,A2:{type:'number',children:{}}
                ,A3:{type:'number',children:{}}
                ,B:{type:'number',children:{}}
                ,C:{type:'number',children:{}}
                ,X:{type:'number',children:{}}
                ,PD:{type:'number',children:{}}
                ,TK:{type:'number',children:{}}
                ,MJ:{type:'number',children:{}}
                ,JD:{type:'number',children:{}}
                }}
            ,total:{type:'number',children:{}}
            ,order:{type:'object',children:{}}
            ,favorite:{type:'object',children:{}}
            ,isRandom:{type:'boolean',children:{}}
            ,isSaved:{type:'boolean',children:{}}
        }
    }
    ,'medforest_tiku_list':{
        type:'object'
        ,children:{
            title:{type:'string',children:{}}
            ,pageid:{type:'number',children:{}}
            ,revid:{type:'number',children:{}}
            ,time:{type:'string',children:{}}
            ,content:{type:'object',children:{
                A:{type:'object',children:{}}
                ,A2:{type:'object',children:{}}
                ,A3:{type:'object',children:{}}
                ,B:{type:'object',children:{}}
                ,C:{type:'object',children:{}}
                ,X:{type:'object',children:{}}
                ,PD:{type:'object',children:{}}
                ,TK:{type:'object',children:{}}
                ,MJ:{type:'object',children:{}}
                ,JD:{type:'object',children:{}}
                }
            }
        }
    }
    ,'medforest_tiku_list_new':{
        type:'object'
        ,children:{
            title:{type:'string',children:{}}
            ,pageid:{type:'number',children:{}}
            ,revid:{type:'number',children:{}}
            ,time:{type:'string',children:{}}
            ,content:{type:'object',children:{
                    A:{type:'object',children:{}}
                    ,A2:{type:'object',children:{}}
                    ,A3:{type:'object',children:{}}
                    ,B:{type:'object',children:{}}
                    ,C:{type:'object',children:{}}
                    ,X:{type:'object',children:{}}
                    ,PD:{type:'object',children:{}}
                    ,TK:{type:'object',children:{}}
                    ,MJ:{type:'object',children:{}}
                    ,JD:{type:'object',children:{}}
                }
            }
        }
    }
    ,'medforest_tiku_progress':{
        type:'object'
        ,children:{
            type:{type:'string',children:{}}
            ,pos:{type:'number',children:{}}
            ,absPos:{type:'number',children:{}}
        }
    }
    ,'medforest_tiku_recorder':{
        type:'object'
        ,children:{
            counter:{type:'number',children:{}}
            ,archive:{type:'object',children:{}}
            ,settings:{type:'object',children:{
                version:{type:'number',children:{}}
                ,autoNext:{type:'object',children:{}}
                ,autoShowAnswer:{type:'object',children:{}}
                ,shortcut:{type:'object',children:{}}
                ,autoSync:{type:'object',children:{}}
                ,account:{type:'object',children:{}}
                ,syncAccount:{type:'object',children:{}}
                ,defaultOpenAnscard:{type:'object',children:{}}
                }
            }
        }
    }
    ,'medforest_tiku_results':{
        type:'object'
        ,children:{
            A:{type:'object',children:{}}
            ,A2:{type:'object',children:{}}
            ,A3:{type:'object',children:{}}
            ,B:{type:'object',children:{}}
            ,C:{type:'object',children:{}}
            ,X:{type:'object',children:{}}
            ,PD:{type:'object',children:{}}
            ,TK:{type:'object',children:{}}
            ,MJ:{type:'object',children:{}}
            ,JD:{type:'object',children:{}}
        }
    }
    ,'medforest_tiku_settings':{
        type:'object'
        ,children:{
            version:{type:'string',children:{}}
            ,autoNext:{type:'object',children:{}}
            ,autoShowAnswer:{type:'object',children:{}}
            ,shortcut:{type:'object',children:{}}
            ,autoSync:{type:'object',children:{}}
            ,account:{type:'object',children:{}}
            ,syncAccount:{type:'object',children:{}}
            ,defaultOpenAnscard:{type:'object',children:{}}
        }
    }
}