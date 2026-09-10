import React, { useEffect, useRef, useState } from "react";
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {PARTS} from './engine.js';

// Geometría original e interpretativa. Milímetros convertidos a unidades de escena.
const U=.01;
function material(color,metal=.45,opacity=1) {
  return new T.MeshStandardMaterial({color,metalness:metal,roughness:.42,transparent:opacity<1,opacity,depthWrite:opacity===1,side:T.DoubleSide});
}
function box(g,size,pos=[0,0,0],color='#222b37',opacity=1) {
  const m=new T.Mesh(new T.BoxGeometry(...size.map(v=>v*U)),material(color,.45,opacity));
  m.position.set(...pos.map(v=>v*U));g.add(m);return m;
}
function cylinder(g,radius,depth,pos,color) {
  const m=new T.Mesh(new T.CylinderGeometry(radius*U,radius*U,depth*U,28),material(color));
  m.rotation.x=Math.PI/2;m.position.set(...pos.map(v=>v*U));g.add(m);return m;
}
function tube(g,points,color,radius=3) {
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p.map(v=>v*U))));
  const mesh=new T.Mesh(new T.TubeGeometry(curve,24,radius*U,8,false),material(color));g.add(mesh);
}
function textPlate(g,text,w,h,pos,color='#dce8ec') {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#141d28';ctx.fillRect(0,0,512,128);
  ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 35px monospace';
  ctx.fillText(text,256,64,490);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const mesh=new T.Mesh(new T.PlaneGeometry(w*U,h*U),new T.MeshBasicMaterial({map:texture}));
  mesh.position.set(...pos.map(v=>v*U));g.add(mesh);
}
function fan(g,size,pos,rgb,spinners,rotation=[0,0,0]) {
  const f=new T.Group();f.position.set(...pos.map(v=>v*U));f.rotation.set(...rotation);g.add(f);
  box(f,[size,size,18],[0,0,0],'#171d27');
  const ring=new T.Mesh(new T.TorusGeometry(size*.42*U,2.2*U,8,40),new T.MeshStandardMaterial({color:rgb,emissive:rgb,emissiveIntensity:1.3}));
  ring.position.z=12*U;f.add(ring);
  const rotor=new T.Group();rotor.position.z=11*U;f.add(rotor);spinners.push(rotor);
  cylinder(rotor,size*.1,8,[0,0,0],'#455160');
  for(let i=0;i<7;i++) {
    const blade=box(rotor,[size*.13,size*.29,2],[0,0,0],'#667786');
    const a=i*Math.PI*2/7;blade.position.set(Math.sin(a)*size*.23*U,Math.cos(a)*size*.23*U,0);blade.rotation.z=-a+.4;
  }
  return f;
}
function makePart(p,{open=false,rgb='#57efcf',spinners=[]}={}) {
  const g=new T.Group();const c=p.color||rgb;
  if(p.type==='cpu') {
    box(g,[40,40,2],[0,0,0],'#205b4b');box(g,[33,33,3],[0,0,2],'#aab2b8');
    textPlate(g,p.name.replace('Ryzen ','R'),28,7,[0,0,4]);
    for(let i=-15;i<=15;i+=3)for(let j=-15;j<=15;j+=3)box(g,[1,1,.3],[i,j,-1.4],'#bfa867');
  } else if(p.type==='board') {
    const h=p.form==='ATX'?305:244;
    box(g,[244,h,3],[0,0,0],'#151c21');
    box(g,[60,60,8],[-22,50,5],'#8c959c');box(g,[48,48,9],[-22,50,6],'#20252c');
    for(let i=0;i<4;i++)box(g,[7,137,9],[48+i*12,40,7],'#454b51');
    for(let i=0;i<3;i++)box(g,[95,9,9],[-12,-35-i*32,7],i?'#484f58':'#a9b6bf');
    box(g,[25,145,34],[-106,h/2-80,20],'#48515c');
    for(let i=0;i<10;i++){box(g,[5,5,6],[-80+i*13,-h/2+14,5],'#b7a77c');box(g,[6,18,8],[-60+i*13,h/2-12,6],'#4d5963');}
    for(let i=0;i<8;i++){const a=i*22;box(g,[70,1,.5],[-40,-a+80,2],'#35413e');}
    textPlate(g,p.brand,50,15,[-55,-h/2+40,8]);
  } else if(p.type==='ram') {
    for(let i=0;i<2;i++){
      const x=i?17:-17;box(g,[135,34,5],[0,x,0],p.memory==='DDR4'?'#243044':'#343b47');
      for(let j=0;j<28;j++)box(g,[3,5,1],[-62+j*4.5,x-18,0],'#c6aa62');
      for(let j=0;j<8;j++)box(g,[8,18,3],[-48+j*14,x,3],'#111720');
      textPlate(g,p.brand,45,8,[0,x+7,5]);
    }
  } else if(p.type==='gpu') {
    const [w,h,d]=p.dim;box(g,[w,h,d],[0,0,0],'#303944');
    for(let i=0;i<p.fans;i++)fan(g,Math.min(90,w/p.fans-12),[-w/2+(i+.5)*w/p.fans,0,d/2],rgb,spinners);
    box(g,[8,h+15,d],[-w/2-5,0,0],'#8d99a6');box(g,[72,7,3],[-30,-h/2-4,-d/2+3],'#c5a15c');
    for(let i=0;i<14;i++)box(g,[w-18,2,d-8],[0,-h/2+5+i*7,0],'#606b77');
    textPlate(g,p.id==='4070super'?'GEFORCE RTX · GAMING X':'GEFORCE RTX · VENTUS',w*.8,11,[0,-h/2+11,d/2+2]);
  } else if(p.type==='ssd') {
    box(g,[80,22,1.5],[0,0,0],'#184378');
    for(let i=0;i<4;i++)box(g,[12,14,2],[-25+i*15,0,1.8],'#1b2026');
    box(g,[6,18,1],[42,0,0],'#c1a657');textPlate(g,`KINGSTON · ${p.capacity} GB`,65,10,[0,0,3]);
  } else if(p.type==='psu') {
    box(g,[150,86,140],[0,0,0],'#1c222a');fan(g,76,[0,0,71],'#738594',spinners);
    textPlate(g,`${p.brand} ${p.power}W`,100,16,[0,-30,72]);
    for(let i=0;i<4;i++)tube(g,[[65,i*5,65],[110,i*9,95],[130,50+i*7,125]],'#161b25',2);
  } else if(p.type==='case') {
    const [depth,h,width]=[p.dim[2],p.dim[1],p.dim[0]];
    box(g,[depth,9,width],[0,-h/2,0]);box(g,[depth,9,width],[0,h/2,0]);
    box(g,[depth,h,5],[0,0,-width/2]);
    for(const x of [-depth/2,depth/2])for(const z of [-width/2,width/2])box(g,[8,h,8],[x,0,z],'#424d5a');
    box(g,[depth,h*.17,width-8],[0,-h*.39,0],'#151d27');
    // Ventilated front at +X. Compact model has perforated filter and side I/O.
    for(let j=0;j<16;j++)box(g,[7,4,width-8],[depth/2,j*(h-30)/16-h/2+20,0],p.style==='compact'?'#667585':'#414e60');
    if(p.style==='compact')box(g,[35,h*.45,12],[depth/2-25,0,width/2+4],'#414b57');
    else for(let j=0;j<3;j++){
      const stripe=box(g,[9,h-20,2],[depth/2+2,0,-width/2+40+j*70],'#57efcf');stripe.material.emissive=new T.Color(rgb);stripe.material.emissiveIntensity=.4;
    }
    // Glass opens without making the metal chassis disappear.
    box(g,[depth-16,h-15,3],[open?-depth*.5:0,0,open?width*1.05:width/2+2],'#88b5c3',open?.1:.2);
    for(let i=0;i<p.includedFans;i++)fan(g,100,[-depth/2+12,h/2-90-i*115,0],rgb,spinners,[0,Math.PI/2,0]);
    for(const x of [-depth*.35,depth*.35])for(const z of [-width*.32,width*.32])box(g,[30,15,30],[x,-h/2-10,z],'#111620');
  } else if(p.type==='cooler') {
    if(p.kind==='aio') {
      box(g,[277,120,27],[0,70,0],'#333d49');
      fan(g,110,[-65,70,28],rgb,spinners);fan(g,110,[65,70,28],rgb,spinners);
      cylinder(g,30,25,[0,-95,25],'#444d5e');textPlate(g,'CORSAIR',43,9,[0,-95,39]);
      tube(g,[[-20,-95,10],[-135,-110,15],[-150,30,8],[-110,55,0]],'#242c38',6);
      tube(g,[[20,-95,10],[130,-110,15],[160,10,8],[110,55,0]],'#242c38',6);
    } else {
      for(let t=0;t<p.towers;t++)for(let j=0;j<23;j++)box(g,[115,3,44],[0,j*5-55,t*60],'#7b8792');
      fan(g,120,[0,0,-26],rgb,spinners);if(p.towers===2)fan(g,120,[0,0,35],rgb,spinners);
      for(let i=0;i<4;i++)tube(g,[[-35+i*23,-75,0],[-35+i*23,-65,0],[-35+i*23,65,10]],'#b79c75',3);
    }
  } else if(p.type==='fan')fan(g,120,[0,0,0],rgb,spinners);
  else if(p.type==='monitor') {
    const w=p.dim[0],h=w*9/16;box(g,[w,h,25],[0,45,0],'#222c37');
    box(g,[35,110,30],[0,-h/2,0]);box(g,[220,12,150],[0,-h/2-60,40]);
    const screen=box(g,[w-15,h-15,2],[0,45,14],'#173f50');screen.material.emissive=new T.Color('#16465a');screen.material.emissiveIntensity=.7;
    for(let i=0;i<5;i++)box(g,[w*.6-i*28,3,2],[0,65-i*24,17],rgb);
    textPlate(g,`${p.name} / ${p.id==='g244'?'1080p':'1440p'}`,w*.5,35,[0,-35,18]);
  } else if(p.type==='keyboard') {
    box(g,[450,180,18],[0,0,0],'#252d39');box(g,[450,50,12],[0,-105,-3],'#171f2a');
    for(let y=0;y<5;y++)for(let x=0;x<20;x++){box(g,[18,23,12],[-208+x*22,66-y*29,12],'#3c4654');box(g,[8,1,1],[-208+x*22,66-y*29,19],rgb);}
  } else if(p.type==='mouse') {
    const m=new T.Mesh(new T.SphereGeometry(1,28,18),material('#334052'));m.scale.set(31*U,57*U,20*U);g.add(m);
    box(g,[2,50,2],[0,24,19],rgb);box(g,[7,15,5],[0,19,21],'#778a9b');
    tube(g,[[0,55,0],[15,100,0],[-10,150,0]],'#282e39',2);
  } else if(p.type==='headset') {
    const band=new T.Mesh(new T.TorusGeometry(73*U,8*U,10,36,Math.PI),material('#465366'));g.add(band);
    for(const x of [-74,74]){box(g,[40,80,65],[x,-18,0],'#25303f');box(g,[10,70,52],[x+(x<0?23:-23),-18,0],'#101721');}
    tube(g,[[-75,-40,15],[-65,-80,30],[-30,-85,45]],'#506579',3);
  }
  return g;
}
function makeBuild(ids,options) {
  const b=PARTS(ids),g=new T.Group();
  const positions={case:[0,0,0],board:[-50,30,-70],cpu:[-72,80,-52],ram:[25,80,-46],gpu:[-10,-60,0],ssd:[-80,-12,-48],ssd2:[-65,-55,-48],psu:[-90,-170,0],cooler:[-70,80,25],fan:[115,-100,0]};
  const spread={case:[0,0,-280],board:[-280,160,-100],cpu:[-250,350,30],ram:[0,320,80],gpu:[230,-40,150],ssd:[-280,-100,100],ssd2:[-280,-185,100],psu:[-190,-320,0],cooler:[200,240,80],fan:[320,-250,50]};
  for(const [slot,p] of Object.entries(b)){
    const externalPositions={monitor:[-650,10,-40],keyboard:[-650,-290,200],mouse:[-280,-290,240],headset:[320,-160,30]};
    const model=makePart(p,options);const position=p.external?externalPositions[slot]:options.exploded?spread[slot]:positions[slot];
    model.position.set(...position.map(v=>v*U));
    if(!options.exploded){if(slot==='gpu')model.rotation.x=-Math.PI/2;if(slot==='ram')model.rotation.z=Math.PI/2;if(slot==='psu')model.scale.setScalar(.85);if(slot==='cooler')model.scale.setScalar(.65);}
    g.add(model);
  }
  if(b.cpu?.stock&&!b.cooler){const stock=new T.Group();fan(stock,75,[-72,80,-5],options.rgb,options.spinners);g.add(stock);}
  if(!Object.keys(b).length){const frame=new T.Box3Helper(new T.Box3(new T.Vector3(-1.8,-2,-1),new T.Vector3(1.8,2,1)),0x57efcf);g.add(frame);}
  return g;
}
export default function Scene({part,ids,mode}) {
  const host=useRef(null),api=useRef(null),motion=useRef({auto:false});
  const [auto,setAuto]=useState(false),[open,setOpen]=useState(true),[exploded,setExploded]=useState(false),[measure,setMeasure]=useState(false),[rgb,setRgb]=useState('#57efcf'),[error,setError]=useState('');
  const idsKey=JSON.stringify(ids);
  useEffect(()=>{motion.current.auto=auto;},[auto]);
  useEffect(()=>{
    const element=host.current;let renderer,controls,resizeObserver,root,scene,lost,dead=false;const spinners=[];
    try {
      renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));renderer.setClearColor('#0a101b');
      renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
      element.replaceChildren(renderer.domElement);renderer.domElement.setAttribute('aria-label','Modelo 3D interactivo');renderer.domElement.tabIndex=0;
      scene=new T.Scene();scene.add(new T.HemisphereLight(0xc4e7ff,0x171629,3));
      const light=new T.DirectionalLight(0xffffff,4);light.position.set(3,5,6);scene.add(light);
      const accent=new T.PointLight(rgb,35,20);accent.position.set(-3,1,4);scene.add(accent);
      const options={open,rgb,spinners,exploded:mode==='build'&&exploded};
      root=mode==='build'?makeBuild(JSON.parse(idsKey),options):makePart(part,options);
      const bounds=new T.Box3().setFromObject(root),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
      root.position.sub(center);const max=Math.max(size.x,size.y,size.z,.5);scene.add(root);
      if(measure)scene.add(new T.Box3Helper(new T.Box3().setFromObject(root),0xb899ff));
      const grid=new T.GridHelper(max*3,24,0x3c6f74,0x172934);grid.position.y=-size.y/2-.15;scene.add(grid);
      const camera=new T.PerspectiveCamera(40,1,.01,1000);
      controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;controls.autoRotateSpeed=.7;
      controls.minDistance=max*.6;controls.maxDistance=max*6;controls.listenToKeyEvents(renderer.domElement);
      const home=()=>{const factor=element.clientWidth<500?2.2:1.7;camera.position.set(max*.6,max*.3,max*factor);controls.target.set(0,0,0);controls.update();};
      home();api.current={home};
      resizeObserver=new ResizeObserver(()=>{const w=element.clientWidth,h=element.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});resizeObserver.observe(element);
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let last=0;
      renderer.setAnimationLoop(time=>{if(dead||document.hidden)return;const delta=Math.min(.04,(time-last)/1000);last=time;controls.autoRotate=motion.current.auto&&!reduced;controls.update();if(!reduced)spinners.forEach(f=>f.rotation.z-=delta*1.2);renderer.render(scene,camera);});
      lost=event=>{event.preventDefault();setError('El visor perdió el contexto gráfico. Recarga la página; tu configuración está guardada.');};
      renderer.domElement.addEventListener('webglcontextlost',lost);
      setError('');
    } catch {setError('Este navegador no pudo iniciar WebGL. La selección, comparación y presupuesto siguen disponibles.');}
    return ()=>{
      dead=true;api.current=null;resizeObserver?.disconnect();controls?.dispose();renderer?.setAnimationLoop(null);
      const geometries=new Set(),materials=new Set(),textures=new Set();scene?.traverse(obj=>{if(obj.geometry)geometries.add(obj.geometry);if(obj.material)(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>{materials.add(m);if(m.map)textures.add(m.map);});});
      textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());if(lost)renderer?.domElement.removeEventListener('webglcontextlost',lost);renderer?.dispose();renderer?.forceContextLoss();element.replaceChildren();
    };
  },[part,idsKey,mode,open,exploded,measure,rgb]);
  const canOpen=mode==='build'||part.type==='case';
  return <section className="viewport-panel">
    <div className="view-caption"><span><i className="dot"/> HARDWARE STUDIO</span><span>WEBGL / 360°</span></div>
    <div className="render-host" ref={host}/>
    {error&&<p className="notice warning">{error}</p>}
    <div className="view-hint">Arrastra para girar · rueda o pellizca para acercar</div>
    {measure&&<div className="measure-readout">{mode==='piece'&&part.specs.Dimensiones?`Dimensiones del fabricante: ${part.specs.Dimensiones}`:'Contorno visual aproximado. Consulta las medidas verificadas en la ficha del componente.'}</div>}
    <div className="view-tools">
      <button onClick={()=>setAuto(!auto)} aria-pressed={auto}>{auto?'Ⅱ Pausar':'↻ Girar'}</button>
      <button onClick={()=>api.current?.home()}>⌖ Centrar</button>
      <button onClick={()=>setMeasure(!measure)} aria-pressed={measure}>↔ Medidas</button>
      {canOpen&&<button onClick={()=>setOpen(!open)} aria-pressed={open}>{open?'Cerrar lateral':'Abrir lateral'}</button>}
      {mode==='build'&&<button onClick={()=>setExploded(!exploded)} aria-pressed={exploded}>{exploded?'Ensamblar':'Vista desarmada'}</button>}
    </div>
    <div className="rgb-controls"><span>LUZ DE ESTUDIO</span>{['#57efcf','#b899ff','#ed81c8','#eab45d'].map(c=><button key={c} onClick={()=>setRgb(c)} style={{background:c}} aria-label={`Luz ${c}`} aria-pressed={rgb===c}/>)}<small>Modelos interpretativos · no réplicas CAD</small></div>
  </section>;
}
