import { DEFAULT_ADJUSTMENTS } from './presets.js'

export const makePhotoProject = () => ({
  version:'2.3.0',mode:'photo',name:'새 사진 프로젝트',createdAt:Date.now(),updatedAt:Date.now(),
  canvas:{width:1200,height:1200,zoom:1,circularPreview:false,viewMode:'final'},
  adjustments:{...DEFAULT_ADJUSTMENTS},preset:{id:'original-plus',intensity:60},layers:[],selectedLayerId:null,
  maskDataUrl:null,manualPath:{mode:'polygon',points:[],closed:false,edgeSnap:true,snapRadius:14,smooth:2},
  maskSettings:{tolerance:38,feather:1,expand:4,contract:0,smooth:2,contiguous:true,brushSize:34,brushHardness:75},
  lighting:{
    enabled:false,preset:'내추럴 역광',angle:225,range:92,focus:1.7,
    rimColor:'#ffffff',rimWidth:2,rimSoftness:.55,rimOpacity:48,
    haloColor:'#dffaff',haloWidth:7,haloSoftness:7,haloOpacity:9,
    sparkleColor:'#ffffff',sparkleCount:0,sparkleSize:2,sparkleSeed:19,breakup:.12
  },
  brush:{tool:'select',size:28,opacity:35,color:'#ffffff'},drawing:{strokes:[]}
})

export const makeGifProject = () => ({
  version:'2.3.0',mode:'gif',name:'새 움짤 프로젝트',createdAt:Date.now(),updatedAt:Date.now(),
  output:{size:180,fps:10,colors:128,maxBytes:1900000,background:'#efeaff',circle:true,lockSize:true},
  scenes:[],selectedSceneId:null,selectedLayerId:null,playhead:0,loop:true,
  border:{type:'sparkle-cluster',width:6,size:100,offset:0,colorA:'#ffffff',colorB:'#9b8cff',speed:1},
  decoration:{type:'sparkles',amount:18,color:'#ffffff',color2:'#d7c7ff',speed:1},
  text:{
    content:'PROFILE',fontFamily:'sans-serif',fontSize:26,color:'#ffffff',stroke:'#7b70c8',strokeWidth:3,stroke2:'#ffffff',strokeWidth2:0,
    animationIn:'fade',animationOut:'fade',inDuration:.35,outDuration:.35,start:.3,end:1.4,delayPerLetter:.06,x:90,y:132,rotation:0,letterSpacing:1,chars:[]
  },
  background:{type:'gradient',gradientType:'linear',colorA:'#cbc3ff',colorB:'#ffd4e6',colorC:'#fff3fa',angle:135,stopA:0,stopB:52,stopC:100,hue:0,pattern:'gingham',size:28,gap:4,opacity:100,preset:'custom'},overlayLibrary:[],timelineZoom:1,
  drawing:{strokes:[]},brush:{size:4,opacity:75,color:'#ffffff',glow:false}
})
