import React, { useEffect, useRef, useState } from "react";
import {BY_ID,CATALOG,SLOTS,money} from './catalog.js';
import {inspect,PARTS,cost} from './engine.js';
import Scene from './Scene.jsx';
import './App.css';

const KEY='pc-lab-real-v2';
const initial={ids:{},prices:{},name:'Mi próxima PC',budget:7000000,extras:0,example:false,saved:[]};
function cleanIds(ids){return Object.fromEntries(Object.entries(PARTS(ids||{})).map(([s,p])=>[s,p.id]));}
function cleanPrices(prices){return Object.fromEntries(Object.entries(prices||{}).filter(([id,n])=>BY_ID[id]&&Number.isFinite(n)&&n>=0&&n<=1000000000));}
function readStore(){try{const value=JSON.parse(localStorage.getItem(KEY));if(!value||typeof value!=='object')return initial;return {...initial,ids:cleanIds(value.ids),prices:cleanPrices(value.prices),name:typeof value.name==='string'?value.name.slice(0,50):initial.name,budget:Number.isFinite(value.budget)?Math.max(0,value.budget):7000000,extras:Number.isFinite(value.extras)?Math.max(0,value.extras):0,example:!!value.example,saved:Array.isArray(value.saved)?value.saved.filter(x=>x&&typeof x.id==='string'&&typeof x.name==='string').slice(0,20):[]};}catch{return initial;}}
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function Modal({title,onClose,children}) {
  const ref=useRef(null);
  useEffect(()=>{const d=ref.current;d.showModal();return()=>d.close();},[]);
  return <dialog ref={ref} onCancel={onClose} onClick={e=>{if(e.target===ref.current)onClose();}}>
    <div className="modal-head"><h2>{title}</h2><button onClick={onClose} aria-label="Cerrar ventana">×</button></div>{children}
  </dialog>;
}
function Numeric({label,value,onChange,placeholder='Sin cotizar'}){
  return <label className="field">{label}<input type="number" min="0" max="1000000000" step="1000" value={value??''} placeholder={placeholder} onChange={e=>onChange(e.target.value===''?null:Math.min(1000000000,Math.max(0,Number(e.target.value)||0)))}/></label>;
}
export default function App(){
  const [data,setData]=useState(readStore),[slot,setSlot]=useState('case'),[selectedId,setSelectedId]=useState('4000d');
  const [query,setQuery]=useState(''),[compatibleOnly,setCompatibleOnly]=useState(false),[sort,setSort]=useState('name');
  const [mode,setMode]=useState('build'),[modal,setModal]=useState(null),[compare,setCompare]=useState([]),[toast,setToast]=useState(''),[storageError,setStorageError]=useState(false);
  const selected=BY_ID[selectedId],currentSlot=SLOTS.find(s=>s.id===slot),check=inspect(data.ids),pricing=cost(data.ids,data.prices,data.extras);
  const candidate=inspect({...data.ids,[slot]:selectedId});
  const allProducts=CATALOG.filter(p=>p.type===currentSlot.type);
  const products=allProducts.filter(p=>(`${p.brand} ${p.name}`).toLowerCase().includes(query.toLowerCase())&&(!compatibleOnly||!inspect({...data.ids,[slot]:p.id}).errors.length)).sort((a,b)=>sort==='price'?(data.prices[a.id]??Infinity)-(data.prices[b.id]??Infinity):a.name.localeCompare(b.name));
  const added=data.ids[slot]===selectedId,progress=8-check.missing.length;
  const totalText=pricing.unknown?`${money(pricing.total)} + pendientes`:money(pricing.total);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(data));setStorageError(false);}catch{setStorageError(true);}},[data]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),4200);return()=>clearTimeout(t);},[toast]);
  function selectSlot(id){const s=SLOTS.find(x=>x.id===id);setSlot(id);setSelectedId(data.ids[id]||CATALOG.find(p=>p.type===s.type).id);setCompare([]);setQuery('');}
  function add(){const next={...data.ids,[slot]:selectedId};const result=inspect(next);if(result.errors.length){setToast(result.errors[0]);return;}setData(d=>({...d,ids:next}));setToast(`${selected.name} agregado${candidate.warnings.length?' · revisa las verificaciones pendientes':''}.`);}
  function remove(id){setData(d=>{const ids={...d.ids};delete ids[id];return {...d,ids};});}
  function changePrice(id,value){setData(d=>{const prices={...d.prices};if(value===null)delete prices[id];else prices[id]=value;return {...d,prices};});}
  function toggleCompare(id){setCompare(c=>c.includes(id)?c.filter(x=>x!==id):c.length<2?[...c,id]:[c[1],id]);}
  function saveBuild(e){e.preventDefault();const form=new FormData(e.currentTarget),name=String(form.get('name')).trim();if(!name)return;
    const snapshot={id:crypto.randomUUID(),name,ids:{...data.ids},prices:{...data.prices},budget:data.budget,extras:data.extras,example:data.example,date:new Date().toISOString()};
    setData(d=>({...d,name,saved:[snapshot,...d.saved].slice(0,20)}));setToast('Configuración guardada.');setModal(null);
  }
  function restoreBuild(s){if(!window.confirm('¿Cargar esta configuración y reemplazar el borrador actual?'))return;setData(d=>({...d,ids:cleanIds(s.ids),prices:cleanPrices(s.prices),name:s.name,budget:Number.isFinite(s.budget)?s.budget:7000000,extras:Number.isFinite(s.extras)?s.extras:0,example:!!s.example}));setModal(null);setToast('Configuración cargada.');}
  function sample(){
    // Escenario didáctico explícito, no precios de mercado ni ofertas comerciales.
    if(Object.keys(data.ids).length&&!window.confirm('¿Reemplazar el borrador por el ejemplo de armado?'))return;
    setData(d=>({...d,name:'Ejemplo · AM5 equilibrada',ids:{cpu:'7600',board:'b650m',ram:'corsair32',gpu:'4070',ssd:'nv3-1000',psu:'a750',case:'4000d'},prices:{'7600':850000,b650m:750000,corsair32:500000,'4070':2500000,'nv3-1000':300000,a750:380000,'4000d':550000},extras:150000,example:true}));
    setToast('Ejemplo cargado. Los valores son ficticios: reemplázalos por cotizaciones.');
  }
  function exportText(){
    const lines=['PC LAB / NEON FORGE',data.name,`Fecha: ${new Date().toLocaleDateString('es-CO')}`,data.example?'IMPORTANTE: puede contener precios ficticios del ejemplo.':'Precios ingresados por el usuario; no verificados por la app.','',...SLOTS.map(s=>{const p=check.b[s.id];return `${s.name}: ${p?`${p.brand} ${p.name} — ${data.prices[p.id]===undefined?'SIN COTIZAR':money(data.prices[p.id])}`:'No seleccionado'}`;}),check.stock?'Refrigeración: Wraith Stealth incluido en CPU retail':'',`Subtotal conocido: ${money(pricing.subtotal)}`,`Otros costos: ${money(data.extras)}`,`Total conocido: ${money(pricing.total)}`,`Piezas sin precio: ${pricing.unknown}`,`Fuente mínima de referencia: ${check.power} W`,'','FALTANTES',...check.missing,'','CONFLICTOS',...check.errors,'','POR VERIFICAR',...check.warnings,'','FUENTES',...[...new Set(Object.values(check.b).map(p=>p.source))]];
    download('PC-Lab-presupuesto.txt',lines.join('\n'),'text/plain;charset=utf-8');
  }
  return <div className="lab">
    <header className="top-header"><a href="#main" className="brand"><span>▧</span> PC<span>LAB</span><small>NEON FORGE / 02</small></a><div className="header-actions"><button onClick={()=>setModal('saved')}>Mis builds <b>{data.saved.length}</b></button><button className="accent-button" onClick={()=>{const guide=document.querySelector('footer details');guide.open=true;guide.scrollIntoView({behavior:'smooth'});}}>Guía de armado ↓</button></div></header>
    <main id="main">
      <section className="hero"><div><p className="eyebrow">HARDWARE REAL. TU PROPIO CRITERIO.</p><h1>No compres piezas.<br/><span>Construye tu próxima PC.</span></h1><p>Explora el hardware, compara alternativas y revisa cómo encajan.</p></div><div className="hero-count"><small>SISTEMAS SELECCIONADOS</small><strong>{String(progress).padStart(2,'0')}<span>/08</span></strong><div>{Array.from({length:8},(_,i)=><i key={i} className={i<progress?'on':''}/>)}</div></div></section>
      <div className="context-bar"><span><i className="dot"/> {CATALOG.length} referencias · {new Set(CATALOG.map(p=>p.brand)).size} marcas</span><span>Fuentes oficiales en cada ficha</span><button onClick={sample}>Cargar ejemplo de armado ↗</button></div>
      {storageError&&<p className="notice danger" role="alert">No se pudo guardar el borrador en este navegador. Exporta la configuración antes de cerrar.</p>}
      <nav className="category-bar" aria-label="Categorías">{SLOTS.map(s=><button key={s.id} onClick={()=>selectSlot(s.id)} className={slot===s.id?'active':''} aria-pressed={slot===s.id}><span>{s.icon}</span>{s.short}{data.ids[s.id]&&<i className="dot"/>}</button>)}</nav>
      <div className="workspace">
        <aside className="catalog panel"><div className="section-head"><div><p className="eyebrow">01 / EXPLORAR</p><h2>{currentSlot.name}</h2></div><span className="badge">{products.length}</span></div>
          <label className="sr-only" htmlFor="search">Buscar componente</label><input id="search" placeholder="Marca o modelo…" value={query} onChange={e=>setQuery(e.target.value)}/>
          <div className="filters"><label><input type="checkbox" checked={compatibleOnly} onChange={e=>setCompatibleOnly(e.target.checked)}/> Sin conflictos</label><select aria-label="Ordenar" value={sort} onChange={e=>setSort(e.target.value)}><option value="name">Nombre</option><option value="price">Precio</option></select></div>
          <div className="product-list">{products.map(p=>{const state=inspect({...data.ids,[slot]:p.id});return <article key={p.id} className={`product ${selectedId===p.id?'selected':''}`}>
            <button className="product-main" onClick={()=>{setSelectedId(p.id);setMode('piece');}}><div className="product-top"><span className="mini-hardware" data-type={p.type}>{currentSlot.icon}</span><span className={state.errors.length?'bad':'good'}>{data.ids[slot]===p.id?'AGREGADO':state.errors.length?'CONFLICTO':'EXPLORAR'}</span></div><small>{p.brand.toUpperCase()}</small><h3>{p.name}</h3><span className="price">{data.prices[p.id]===undefined?'Por cotizar':money(data.prices[p.id])}</span></button>
            <button className="compare-pick" aria-pressed={compare.includes(p.id)} onClick={()=>toggleCompare(p.id)}>{compare.includes(p.id)?'✓ En comparación':'+ Comparar'}</button>
          </article>;})}{!products.length&&<p className="muted">No hay resultados. Prueba otro modelo o desactiva el filtro.</p>}</div>
          {compare.length>0&&<button className="outline-button compare-launch" disabled={compare.length!==2} onClick={()=>setModal('compare')}>Comparar {compare.length}/2 →</button>}
        </aside>
        <section className="center-column"><div className="view-switch"><button className={mode==='piece'?'active':''} onClick={()=>setMode('piece')}>Pieza seleccionada</button><button className={mode==='build'?'active':''} onClick={()=>setMode('build')}>Mi PC ensamblada</button><span className="badge">3D</span></div>
          <Scene part={selected} ids={data.ids} mode={mode}/>
          <article className="panel details"><div className="section-head"><div><p className="eyebrow">{selected.brand.toUpperCase()} / {currentSlot.short}</p><h2>{selected.name}</h2></div><a className="source-link" href={selected.source} target="_blank" rel="noreferrer">Ficha oficial ↗</a></div>
            <p className="muted">{selected.notes}</p><dl className="specs">{Object.entries(selected.specs).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
            <Numeric label={`Precio para ${selected.name} · COP`} value={data.prices[selected.id]} onChange={value=>changePrice(selected.id,value)}/>
            <p className="micro">Introduce tu cotización. {data.example?'El borrador contiene valores de ejemplo sin verificar.':'La app no consulta precios de tiendas automáticamente.'}</p>
            <div className={`notice ${candidate.errors.length?'danger':'success'}`}><strong>{candidate.errors.length?'No se puede agregar':'Sin conflicto confirmado con tu selección'}</strong>{candidate.errors.length?<ul>{candidate.errors.map(e=><li key={e}>{e}</li>)}</ul>:<p>La revisión cubre las piezas elegidas. Los requisitos pendientes aparecen en el diagnóstico.</p>}</div>
            <button className="primary-button" disabled={!!candidate.errors.length||added} onClick={add}>{added?'✓ Ya está en tu PC':data.ids[slot]?'Reemplazar esta pieza ↗':'Agregar a mi PC +'}</button>
          </article>
        </section>
        <aside className="panel summary"><div className="section-head"><div><p className="eyebrow">02 / BUILD STATION</p><h2>{data.name}</h2></div></div>
          <button className={`diagnose ${check.errors.length?'danger':''}`} onClick={()=>setModal('diagnosis')}><span>{check.errors.length?'Conflictos detectados':check.missing.length?`${check.missing.length} sistemas pendientes`:'Selección completa · revisar montaje'}</span><strong>Diagnóstico ↗</strong></button>
          <div className="slots">{SLOTS.map(s=>{const p=check.b[s.id];return <div className={`slot ${p?'filled':''}`} key={s.id}><button className="slot-info" onClick={()=>selectSlot(s.id)}><span>{s.icon}</span><div><small>{s.name}</small><strong>{p?.name||(s.id==='cooler'&&check.stock?'Wraith Stealth incluido':['ssd2','fan','monitor','keyboard','mouse','headset'].includes(s.id)?'Opcional':'Seleccionar')}</strong>{p&&<em>{data.prices[p.id]===undefined?'Sin cotizar':money(data.prices[p.id])}</em>}</div></button>{p&&<button className="remove" onClick={()=>remove(s.id)} aria-label={`Quitar ${p.name}`}>×</button>}</div>;})}</div>
          <div className="power"><div><span>Fuente mín. de referencia</span><strong>{check.power} W</strong></div><div><span>Modelo de consumo*</span><b>{check.watts} W</b></div><div className="power-track"><i style={{width:`${Math.min(100,check.b.psu?check.watts/check.b.psu.power*100:0)}%`}}/></div><small>*Estimación educativa: TDP no es consumo máximo. Incluye margen del 30% y recomendación de GPU.</small></div>
          <Numeric label="Mi presupuesto · COP" value={data.budget} onChange={n=>setData(d=>({...d,budget:n??0}))}/><Numeric label="Armado, envío u otros · COP" value={data.extras} onChange={n=>setData(d=>({...d,extras:n??0}))}/>
          <div className="total"><small>{pricing.unknown?'SUBTOTAL CONOCIDO':'TOTAL INGRESADO'}</small><div className="cost-split"><span>PC: {money(pricing.pc)}</span><span>Periféricos: {money(pricing.accessories)}</span><span>Otros: {money(data.extras)}</span></div><strong>{money(pricing.total)}</strong><span>COP · {pricing.unknown?`${pricing.unknown} piezas sin precio`:'según tus valores'}</span><p className={pricing.total>data.budget?'bad':'good'}>{pricing.total>data.budget?`${money(pricing.total-data.budget)} por encima`:`${money(data.budget-pricing.total)} disponibles${pricing.unknown?' antes de cotizar lo pendiente':''}`}</p></div>
          <button className="outline-button" disabled={!Object.keys(data.ids).length} onClick={exportText}>Exportar presupuesto ↓</button>
          <div className="summary-bottom"><button onClick={()=>setModal('save')}>Guardar configuración</button><button onClick={()=>{if(window.confirm('¿Vaciar el borrador? Tus builds guardadas se conservan.'))setData(d=>({...d,ids:{},example:false,name:initial.name}));}}>Vaciar borrador</button></div>
          <p className="micro">{data.example?'Precios del ejemplo: ficticios, no ofertas comerciales.':'Sin consulta automática de disponibilidad ni precios.'} Periféricos seleccionados incluidos. Agrega licencias y servicios en “otros”.</p>
        </aside>
      </div>
      <section className="learning-grid"><article className="panel"><p className="eyebrow">COMPATIBILIDAD CON EXPLICACIÓN</p><h2>Que encaje es solo el principio.</h2><p className="muted">Socket, memoria, medidas, alimentación y puertos se revisan al agregar o reemplazar. BIOS, perfiles y adaptadores quedan señalados para verificar.</p><div className="rule-pills"><span>Socket</span><span>Memoria</span><span>Espacio</span><span>Alimentación</span></div></article><article className="panel build-tip"><span>↗</span><div><p className="eyebrow">APRENDE PROBANDO</p><h2>¿160 mm caben en 159 mm?</h2><p className="muted">Combina DeepCool AK620 y Cooler Master Q300L. El simulador explicará por qué no permite agregarlos juntos.</p></div></article></section>
      <footer><div className="footer-brand"><strong>PC<span>LAB</span></strong><p>Tu próxima máquina empieza aquí.</p></div><div className="footer-content">
        <details><summary>Guía de armado</summary><ol><li>Confirma manuales, socket, BIOS y espacio del gabinete.</li><li>Con el equipo desconectado, prepara CPU, RAM y SSD en la placa.</li><li>Instala los separadores correctos y fija la placa al gabinete.</li><li>Monta fuente y refrigeración según sus manuales.</li><li>Instala GPU y conecta alimentación, ventiladores y panel frontal.</li><li>Revisa el montaje antes del primer encendido.</li></ol></details>
        <details><summary>Diccionario gamer</summary><dl><dt>Socket</dt><dd>Interfaz física del procesador; coincidir no garantiza por sí solo soporte de BIOS.</dd><dt>VRAM</dt><dd>Memoria dedicada de la GPU; su capacidad no resume todo el rendimiento.</dd><dt>NVMe</dt><dd>Protocolo de almacenamiento; M.2 es un formato físico.</dd><dt>TDP</dt><dd>Referencia térmica, no una medición del consumo total de la PC.</dd><dt>QVL</dt><dd>Lista de memorias que el fabricante ha probado.</dd></dl></details>
        <details><summary>Acerca del proyecto</summary><p>PC Lab es un laboratorio interactivo de hardware creado por Andrés Felipe. Los nombres comerciales identifican los productos y no implican afiliación. Cada ficha enlaza al fabricante. El visor utiliza modelos originales interpretativos, no archivos CAD oficiales.</p></details>
      </div></footer>
    </main>
    {modal==='diagnosis'&&<Modal title="Diagnóstico de tu configuración" onClose={()=>setModal(null)}><div className="diagnostic-metrics"><span>{progress}/8 sistemas</span><span>{check.power} W de referencia</span><span>{totalText}</span></div>{[['Faltan por seleccionar',check.missing,'warning'],['Conflictos que bloquean',check.errors,'danger'],['Verificaciones antes de comprar',check.warnings,'warning']].map(([title,items,style])=><section className={`notice ${items.length?style:'success'}`} key={title}><h3>{title}</h3>{items.length?<ul>{items.map(x=><li key={x}>{x}</li>)}</ul>:<p>Ninguno detectado.</p>}</section>)}<p className="micro">El visor no mide interferencias geométricas. Las reglas utilizan las fichas y criterios conservadores explicados; no sustituyen los manuales ni una revisión de montaje.</p></Modal>}
    {modal==='compare'&&<Modal title="Comparar componentes" onClose={()=>setModal(null)}><div className="table-scroll"><table><thead><tr><th>Especificación</th>{compare.map(id=><th key={id}>{BY_ID[id].brand}<br/>{BY_ID[id].name}</th>)}</tr></thead><tbody><tr><th>Tu precio</th>{compare.map(id=><td key={id}>{data.prices[id]===undefined?'Sin cotizar':money(data.prices[id])}</td>)}</tr>{[...new Set(compare.flatMap(id=>Object.keys(BY_ID[id].specs)))].map(key=><tr key={key}><th>{key}</th>{compare.map(id=><td key={id}>{BY_ID[id].specs[key]||'—'}</td>)}</tr>)}<tr><th>Conflictos actuales</th>{compare.map(id=><td key={id}>{inspect({...data.ids,[slot]:id}).errors.join(' ')||'Ninguno confirmado'}</td>)}</tr></tbody></table></div></Modal>}
    {modal==='save'&&<Modal title="Guardar una configuración" onClose={()=>setModal(null)}><form onSubmit={saveBuild}><label className="field">Nombre<input name="name" defaultValue={data.name} required maxLength="50" autoFocus/></label><p className="muted">Se conservan las piezas, precios y presupuesto. Hasta 20 configuraciones en este navegador.</p><button className="primary-button" type="submit">Guardar build</button></form></Modal>}
    {modal==='saved'&&<Modal title="Mis configuraciones" onClose={()=>setModal(null)}>{!data.saved.length&&<p className="muted">Aún no tienes builds guardadas.</p>}{data.saved.map(s=><article className="saved-row" key={s.id}><div><h3>{s.name}</h3><small>{Object.keys(cleanIds(s.ids)).length} piezas</small></div><button onClick={()=>restoreBuild(s)}>Cargar</button><button aria-label={`Eliminar ${s.name}`} onClick={()=>{if(window.confirm(`¿Eliminar “${s.name}”?`))setData(d=>({...d,saved:d.saved.filter(x=>x.id!==s.id)}));}}>×</button></article>)}<button className="outline-button" onClick={()=>download('PC-Lab-respaldo.json',JSON.stringify(data,null,2),'application/json')}>Descargar respaldo JSON</button><p className="micro">Respaldo de consulta. La importación aún no está incluida.</p></Modal>}
    {toast&&<div className="toast" role="status">{toast}</div>}
  </div>;
}
